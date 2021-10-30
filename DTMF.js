import xapi from 'xapi';

// This macro will auto answer any incoming call which matches
// predefined regular expressions. Once answered, the macro
// will send a DTFM tone of '1' to the connected call.
// Thanks to Isidro Fernandez for the initial code which
// this macro is built upon.

// Create your array of regular expressions
const AUTOANSWER_NUMBERS_REGEX = [/^12345.*@example.com$/, 
                                  /^43523.*@example.com$/,
                                  /^.*1231232/];

// Specify if you want this macro to automatically reject
// any additional calls while in a call
const REJECT_ADDITIONAL_CALLS = true;


///////////////////////////////////
// Do not change anything below
///////////////////////////////////

// This is our variable for storing the current call information 
var currentCall = {'CallId': '', 
            'RemoteURI':'',
};

// This fuction will remove the SIP and Spark etc prefixes
function normaliseRemoteURI(number){
  var regex = /^(sip:|h323:|spark:|h320:|webex:|locus:)/gi;
  number = number.replace(regex, '');
  console.log('Normalised Remote URI to: ' + number);
  return number;
}


// Handles all incoming call events
async function checkCall(event){

  console.log('Incoming call');
  console.log(event);

  // If there is no current call, record it and answer it
  if(currentCall['CallId'] == ''){
   
    // Check RemoteURI against regex numbers

    const normalisedURI = normaliseRemoteURI(event.RemoteURI);

    const isMatch = AUTOANSWER_NUMBERS_REGEX.some(rx => rx.test(normalisedURI));

    if(isMatch){
      answerCall(event);
    } else {
      console.log('Did not match Regex, call ignored');
    }
  
  } else {

    // Reject the call if that is our preference 
    if(REJECT_ADDITIONAL_CALLS){
      console.log('Additional Call Rejected');
      xapi.Command.Call.Reject(
        { CallId: event.CallId });
      return;
    }

    // Otherwise ingnore incoming call
    console.log('Ignoring this call')


    // We won't bother to answer this additional call and let the system handle
    // it with its default behaviour
  }


}

// We use this fuction to detect when the call has been fully answered
function processCallAnswer(event){

  // Log all Call Answerstate events
  console.log(event);

  console.log(currentCall);
  
  // Check that it is Answered is true, and also check
  // that we are only sending a DTMF tone to the number 
  // we auto answered
  if(event == 'Answered' & currentCall['CallId'] != ''){
    
    console.log('Call Answered')

    console.log('Sending DTMF to CallID: ' + currentCall['CallId'])

    xapi.Command.Call.DTMFSend(
    { CallId: currentCall['CallId'], DTMFString: '1'}).catch(
      (error) =>{
        console.error(error);
      }
    );

  } 
  
}


// This fuction will store the current call information and answer the call
function answerCall(event) {
  
  console.log('Answering call')
  
  // Store the call infomation for later processing
  currentCall['CallId'] = event.CallId;
  currentCall['RemoteURI'] = normaliseRemoteURI(event.RemoteURI);

  xapi.Command.Call.Accept(
    { CallId: event.CallId }).catch(
      (error) =>{
        console.error(error);
      });

}

// This fuction will clear the current call information only for the call
// which was auto answered by this macro
function processCallDisconnect(event){

  console.log('CallID: ' + event.CallId + ' Disconnected');

  console.log(currentCall);

  // If the current call is disconnecting, erase the cache
  if(event.CallId == currentCall.CallId){
  
    console.log('Resetting Current Call variable');

    currentCall.CallId = '';
    currentCall.RemoteURI = '';

  }

  console.log(currentCall);

}

// This function runs first time when this macro starts. It is necessary for
// the case where the macro was started when there was already an active call
// on the system.
async function checkForActiveCalls(){


  const calls = await xapi.Status.SystemUnit.State.NumberOfActiveCalls.get();
  console.log('Number of current calls: ' + calls);

  if(calls == 1){

    const value = await xapi.Status.Call.get();

    currentCall.CallId = value[0].id;
    currentCall.RemoteURI = normaliseRemoteURI(value[0].CallbackNumber);

    console.log(currentCall);
  }

}

// Run our async initial function
checkForActiveCalls();


// Subscribe our functions to the event and status changes
xapi.Event.IncomingCallIndication.on(checkCall);
xapi.Status.Call.AnswerState.on(processCallAnswer);
xapi.Event.CallDisconnect.on(processCallDisconnect);