# DTMF Macro


This Webex Device Macro automatically answers a call from specific callers and then sends DTMF tones to the far end. This is useful for situations where you want to add a Webex device to a conference and it is required to send a DTMF verification to join.

## Overview

Using regular expressions, this macro automatically answers calls for specific callers and once answered, it then sends a DTMF string to the call. 

## Setup

### Prerequisites & Dependencies: 

- Webex Device running RoomOS 9.15.x or above.
- Device Web Admin or Control Hub access to enable and upload the Macro.



### Installation Steps:
1. Download the ``dtmf.js`` file and upload it to your Webex Room device.
2. Configure the Macro by changing the initial values, there are comments explaining each one.
3. Enable the Macro.

## Validation

Validated Hardware:

* Webex Room Kit Pro
* Webex Desk Pro

This macro should work on other Webex Devices but has not been validated at this time.

## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).


## License
All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer
 Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.


## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=dtmf-macro) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
