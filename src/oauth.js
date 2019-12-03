(function() {

    function refreshPopup() {
        chrome.identity.getAuthToken({
            interactive: true
        }, function(token) {
            console_msg("refreshed popup");
            if(! token) {
                console_msg("Changed popup to be login.html");
                chrome.browserAction.setPopup({popup: 'login.html'});
            } else { 
                console_msg("Changed popup to be popup.html");
                chrome.browserAction.setPopup({popup: 'popup.html'});
            }
        });
    }

    function getAuthUrl() {
        let redirect_uri = chrome.identity.getRedirectURL();
        let manifest = chrome.runtime.getManifest();
        let authURL = 'https://accounts.google.com/o/oauth2/auth'
        authURL += `?response_type=token`
        authURL += `&client_id=${manifest.oauth2.client_id}`
        authURL += `&redirect_uri=${encodeURIComponent(redirect_uri)}`
        authURL += `&scope=${encodeURIComponent(manifest.oauth2.scopes.join(' '))}`
        return authURL;
    }

    function launchAuthentication() {
        chrome.identity.launchWebAuthFlow({
            url: getAuthUrl(),
            interactive: true
        }, function(responseUrl) {
            refreshPopup();
        });
    }

    function attachAuthListeners() {
        console_msg("attach auth listeners");
        addSignInListener();
    }

    function addSignInListener() {
        if (document.getElementById('bbb-google-sign-in')) {
            document.getElementById('bbb-google-sign-in').addEventListener('click', () => {
                console_msg("authorize extension");
                launchAuthentication();
                
            });
        }
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

    document.addEventListener('DOMContentLoaded', refreshPopup);
    document.addEventListener('DOMContentLoaded', attachAuthListeners);

})();
