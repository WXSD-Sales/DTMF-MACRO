/*********************************************************
 * 
 * Author:           William Mills
 *                   Technical Solutions Specialist 
 *                   wimills@cisco.com
 *                   Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 10/30/21
 * 
 * This Webex Device Macro automatically answers a call from
 * specific callers and then sends DTMF tones to the far end.
 * This is useful for situations where you want to add a
 * Webex device to a conferance and it is required to
 * send a DTMF verification to join.
 * 
 * Full Readme and source code available on Github:
 * https://github.com/wxsd-sales/dtmf-macro
 * 
 ********************************************************/

import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  dtmfString: '1',    // The DTMF string which is send when the call is answered
  expressions: [/^12345.*@example.com$/, // Array of regular express in which to auto answer for
    /^43523.*@example.com$/,
    /^.*1231232/,
    /^03a0e04b/],
  rejectOtherCalls: true // Reject any unmatched calls if set to true
}

/*********************************************************
 * Below are the functions of this macro which process
 * call and user interface events.
**********************************************************/

// Subscribe incoming call events and call status changes
xapi.Event.IncomingCallIndication.on(processIncomingCall);
xapi.Status.Call.on(processCall);

// Variable for storing the call Id which this macro has answered
let callId;

// This fuction will remove the SIP and Spark etc prefixes
function normaliseRemoteURI(number) {
  var regex = /^(sip:|h323:|spark:|h320:|webex:|locus:)/gi;
  number = number.replace(regex, '');
  console.log('Normalised Remote URI to: ' + number);
  return number;
}

// Handles all incoming call events
async function processIncomingCall(event) {

  console.log(`Incoming Call Event - CallId [${event.CallId}]`);

  const remoteURI = normaliseRemoteURI(event.RemoteURI)

  if (config.expressions.some(rx => rx.test(remoteURI))) {
    console.log(`CallId [${event.CallId}] - Remote URI [${remoteURI}] is valid, answering`)
    callId = event.CallId
    xapi.Command.Call.Accept({ CallId: callId })
      .catch(error => console.log('Unable to answer call: ' + error));
  } else {
    if (config.rejectOtherCalls) {
      console.log(`CallId [${event.CallId}] - Remote URI [${remoteURI}] is invalid, rejecting`)
      xapi.Command.Call.Reject({ CallId: event.CallId });
    } else {
      console.log(`CallId [${event.CallId}] - Remote URI [${remoteURI}] is invalid, ignoring`)
    }
  }
}

function processCall(event) {
  // Only process calls which this macro answered
  if (!event.hasOwnProperty('AnswerState')) return;
  if (event.AnswerState != 'Answered') return;
  if (event.id != callId) return;

  console.log(`CallId [${callId}] answered, sending DTMF string [${config.dtmfString}]`)
  xapi.Command.Call.DTMFSend({ CallId: callId, DTMFString: config.dtmfString })
    .catch((error) => console.log(`Unable to send DTMF string to CallId [${callId}] - Error: ${error}`));
}
