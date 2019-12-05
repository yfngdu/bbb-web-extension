'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  } else if (request.type === 'TEST_DEBUG') {
    console.log(request.payload.message);

    const message = request.payload.message;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});

// set bigbluebutton settings on first install
// TODO: change to demo
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['bigbluebutton_settings'], result => {

    if (!result.bigbluebutton_settings || !result.bigbluebutton_settings.gl_base_url) {
      chrome.storage.sync.set({
        bigbluebutton_settings: {
            gl_url: "http://127.0.0.1:5000"
        }
      })
    }
  });
});