(function() {
  
  const accessToken = {
    get: access_token => {
      chrome.storage.sync.get(['access_token'], result => {
        access_token(result.access_token);
      });
    },
    set: (value) => {
      chrome.storage.sync.set(
        {
          access_token: value,
        }
      );
    },
  };

  const user_signed_out = {
    get: user_signed_out => {
      chrome.storage.sync.get(['user_signed_out'], result => {
        user_signed_out(result.user_signed_out);
      });
    },
    set: (value) => {
      chrome.storage.sync.set(
        {
          user_signed_out: value,
        }
      );
    },
  };

  // refresh popup with login screen or meeting screen
  function refreshPopup() {
    accessToken.get(token => {
      if (token) {
        window.location.href="popup.html";
        chrome.browserAction.setPopup({popup: 'popup.html'});
      } else {
        window.location.href="login.html";
        chrome.browserAction.setPopup({popup: 'login.html'});
      }
    });
    // chrome.identity.getAuthToken({
    //   interactive: true
    // }, function(token) {
    //     console_msg("refreshed popup");
    //     if(! token) {
    //         window.location.href="login.html";
    //         chrome.browserAction.setPopup({popup: 'login.html'});
    //     } else { 
    //         window.location.href="popup.html";
    //         chrome.browserAction.setPopup({popup: 'popup.html'});
    //     }
    // });
    console_msg("refreshed popup?");
  }

  // attach auth listener for signing in
  function attachAuthListeners() {
    console_msg("attach auth listeners");
    addSignInListener();
    // attachSignOutListener();
  }

  // attach listener for when user clicks on login
  function addSignInListener() {
    if (document.getElementById('bbb-google-sign-in')) {
      document.getElementById('bbb-google-sign-in').addEventListener('click', () => {
          console_msg("authorize extension");
          launchAuthentication();
      });
    }
  }

  // ask user to log into google and permissions for popup
  function launchAuthentication() {
    launchWebAuthFlow(true);
  }

  // only refresh token if user did not purposely sign out
  function getToken() {
    user_signed_out.get(signed_out => {
      console_msg('user signed out is ' + signed_out);
      if (! signed_out) {
        console_msg('get token');
        accessToken.get(token => {
          console_msg('is there a token?');
          console_msg(token);
          if (! token) {
            console_msg("launch web auth flow");
            launchWebAuthFlow(false);
          }
        });
      }
    });
  }

  // launch user sign into google
  // bug - sign in interactive doesn't call callback
  function launchWebAuthFlow(interactive) {
    if (interactive) {
      user_signed_out.set(false);
    }
    chrome.identity.launchWebAuthFlow({
      url: getAuthUrl(interactive),
      interactive: interactive
    }, function(responseUrl) {
      if (chrome.runtime.lastError) {
        console_msg('Chrome runtime last error: ');
        console_msg(chrome.runtime.lastError.message);
      }
      console_msg("finished launching auth");
      console_msg(responseUrl);

      let hash = new URL(responseUrl).hash;
      let url = chrome.identity.getRedirectURL() + '?' + hash.substr(1);
      let access_token = new URL(url).searchParams.get('access_token');
      
      accessToken.set(access_token);
      console_msg(access_token);
      refreshPopup();
    });
  }

  // get auth URL to for launchAuthentication
  // set prompt to consent if user wants to switch google accounts
  function getAuthUrl(interactive) {
    let redirect_uri = chrome.identity.getRedirectURL();
    let manifest = chrome.runtime.getManifest();
    let authURL = 'https://accounts.google.com/o/oauth2/auth'
    authURL += `?response_type=token`
    authURL += `&client_id=${manifest.oauth2.client_id}`
    authURL += `&redirect_uri=${encodeURIComponent(redirect_uri)}`
    authURL += `&scope=${encodeURIComponent(manifest.oauth2.scopes.join(' '))}`
    if (interactive) {
      authURL += `&prompt=consent`
    }
    console_msg(authURL);
    return authURL;
  }

  // for test logs in development- do not use in production
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
            console.log(response);
          }
        );
    });
  }

  // document.addEventListener('DOMContentLoaded', refreshPopup);
  document.addEventListener('DOMContentLoaded', attachAuthListeners);
  document.addEventListener('DOMContentLoaded', getToken);
})();
