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
      joinDirectly();
    });
  }

  // use oauth token to get greenlight user's home room and launch into it
  function joinDirectly() {
    chrome.storage.sync.get(['bigbluebutton_settings', 'access_token'], result => {
      // chrome.identity.getAuthToken({
      //   interactive: true
      // }, function(token) {
      const token = result.access_token;
      const greenlightURL = result.bigbluebutton_settings.gl_url + '/external_application/start';
      var xhr = new XMLHttpRequest();
      xhr.open("POST", greenlightURL);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify({
        oauth_token: token
      }));
      xhr.onreadystatechange = function() {
        try {
          console_msg('try');
          let json = JSON.parse(xhr.responseText)
          window.open(json.server_url, '_blank');
        } catch (e) {
          console_msg('catch');
          console_msg(e);
          let error_msg = document.createElement('p');
          error_msg.innerHTML = "Unable to reach the greenlight server. Are you sure your settings are correct and the server is running?"
          let error_div = document.createElement('div');
          error_div.className = "app";
          error_div.appendChild(error_msg);
          document.getElementById('bbb-create-meeting-div').insertAdjacentElement('afterend', error_div);
        }
      }
      // });
    });
  }

  // get user info to display in popup
  function getUserInfo() {
    console_msg('get user info');
    // chrome.identity.getAuthToken({
    //   interactive: true
    // }, function(token) {
    chrome.storage.sync.get(['user', 'access_token'], result => {
      if (! result.user) {
        const token = result.access_token;
        console_msg('get user info token callback');
        var xhr = new XMLHttpRequest();
        var url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + token;
        xhr.open("GET", url);

        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.onload = function() {
          if (this.status === 401) {
            wipe_data();
          } else {
            console_msg(this.response);
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
    console_msg("attach sign out listener func");
    if (document.getElementById('bbb-google-sign-out')) {
      console_msg("attach sign out listener now");
      document.getElementById('bbb-google-sign-out').addEventListener('click', () => {

        wipe_data();
      });
    }
  }

  function wipe_data() {
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
