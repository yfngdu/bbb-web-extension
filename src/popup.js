'use strict';

import './popup.css';
import { Script } from 'vm';

(function() {
  // We will make use of Storage API to get and store values
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

  // launch into greenlight if user clicks on launch meeting
  function attachJoinMeetingListener() {
    getUserInfo();
    document.getElementById('bbb-create-meeting').addEventListener('click', () => {
      makeJoinRequest();
    });
  }

  // use oauth token to get greenlight user's home room and launch into it
  function makeJoinRequest() {
    chrome.storage.sync.get(['bigbluebutton_settings', 'access_token'], result => {
      const token = result.access_token;
      const greenlightURL = result.bigbluebutton_settings.gl_url + '/external_application/start';
      var xhr = new XMLHttpRequest();
      xhr.open("POST", greenlightURL);
      let form_data = new FormData();
      form_data.append('oauth_token', token);

      xhr.onreadystatechange = function() {
        if (xhr.readyState === xhr.DONE) {
          processBbbServerResponse(xhr.responseText);
        }
      }
      xhr.send(form_data);
    });
  }

  // process server URL and response code
  function processBbbServerResponse(response) {
    try {
      let json = JSON.parse(response)
      if (json.code === 401) {
        wipeData();
      }
      enterMeeting(json.server_url);
      
    } catch (e) {
      console_msg(e);
      let error_msg = document.createElement('p');
      error_msg.innerHTML = "Unable to enter the meeting. Are you sure your settings are correct, the server is running, and the extension can open a new window?"
      var error_div;
      if (document.getElementById('bbb-error-div')) {
        error_div = document.getElementById('bbb-error-div');
      } else {
        error_div = document.createElement('div');
        error_div.id = 'bbb-error-div';
        error_div.className = "app";
      }
      error_div.innerHTML = '';
      error_div.appendChild(error_msg);
      document.getElementById('bbb-create-meeting-div').insertAdjacentElement('afterend', error_div);
    }
  }

  function enterMeeting(server_url) {
    try {
      browser.tabs.create({url: server_url}); // for firefox
    } catch (e) {
      window.open(server_url, '_blank'); // for chrome
    }
  }

  // get user info to display in popup
  function getUserInfo() {
    chrome.storage.sync.get(['user', 'access_token'], result => {
      if (! result.user) {
        const token = result.access_token;
        var xhr = new XMLHttpRequest();
        var url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + token;
        xhr.open("GET", url);

        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.onload = function() {
          if (this.status === 401) {
            wipeData();
          } else {
            userStorage.set(JSON.parse(this.response));
            fillInPopup(JSON.parse(this.response));
          }
        }
        xhr.send();
      } else {
        fillInPopup(result.user);
      }
    });
  }

  // fill in popup with user info
  function fillInPopup(user) {
    document.getElementById('bbb-google-avatar').src = user.picture;
    document.getElementById('bbb-google-email').innerHTML = user.email;
  }

  // for test logs in development- do not use in production
  function console_msg(msg, type = "TEST_DEBUG") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tab = tabs[0];

        chrome.tabs.sendMessage(
          tab.id,
          {
            type: type,
            payload: {
              message: msg,
            }
          },
          response => {
            console.log(response);
          }
        );
    });
  }

  // attach listener for when user clicks on logout
  function attachSignOutListener() {
    if (document.getElementById('bbb-google-sign-out')) {
      document.getElementById('bbb-google-sign-out').addEventListener('click', () => {
        wipeData();
      });
    }
  }

  // Wipe session relavent data, and remember it is initiated by the user 
  // so we do not try to access the token without explicit user action
  function wipeData() {
    chrome.storage.sync.set(
      {
        access_token: '',
        user: '',
        user_signed_out: true
      }
    );
    window.location.href = 'login.html';
    chrome.browserAction.setPopup({popup: 'login.html'});
  }

  document.addEventListener('DOMContentLoaded', attachJoinMeetingListener);
  document.addEventListener('DOMContentLoaded', attachSignOutListener);

  // part of template - delete later
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
