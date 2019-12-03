'use strict';

import './popup.css';
import { Script } from 'vm';

(function() {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

  const userStorage = {
    get: user => {
      chrome.storage.sync.get(['user'], result => {
        user(result.user);
      });
    },
    set: (value) => {
      chrome.storage.sync.set(
        {
          user: value,
        }
      );
    },
  };

  function attachJoinMeetingListener() {
    getUserInfo();
    document.getElementById('bbb-create-meeting').addEventListener('click', () => {

      console_msg("------------------------Try to join meeting--------------------");

      let greenlightAuthURL = "https://amy.blindside-dev.com/b/auth/google";

      window.open(greenlightAuthURL, '_blank');

    });
  }

  function getUserInfo() {
    chrome.identity.getAuthToken({
      interactive: true
    }, function(token) {

      var xhr = new XMLHttpRequest();
      var url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + token;
      xhr.open("GET", url);

      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.onload = function() {
        if (this.status === 401) {

        } else {
          console_msg(this.response);
          userStorage.set(JSON.parse(this.response));
          fillInPopup(JSON.parse(this.response));
        }
      }
      xhr.send();
    });
  }

  function fillInPopup(user) {
    document.getElementById('bbb-google-avatar').src = user.picture;
    document.getElementById('bbb-google-email').innerHTML = user.email;
  }

  function console_msg(msg) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'TEST_DEBUG',
            payload: {
              message: msg,
            }
          },
          response => {
            console.log('Current count value passed to contentScript file');
          }
        );
    });
}
  document.addEventListener('DOMContentLoaded', attachJoinMeetingListener);

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    response => {
      console.log(response.message);
    }
  );
})();
