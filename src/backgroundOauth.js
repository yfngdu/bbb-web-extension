'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REFRESH_OAUTH_TOKEN') {

    const message = 'success';

    chrome.identity.getAuthToken({
        interactive: true
    }, function(token) {
        if(! token) {
            // message = "Changed popup to be login.html";
            chrome.browserAction.setPopup({popup: 'login.html'});
        } else { 
            // message = "Changed popup to be popup.html";
            chrome.browserAction.setPopup({popup: 'popup.html'});
        }
    });

    // Log message coming from the `request` parameter
    console.log(request.payload.message);

    // Send a response message
    sendResponse({
        message,
    });
  }
});
