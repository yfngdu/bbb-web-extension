'use strict';

import './settings.css';
(function() {

    // get bigbluebutton urls from storage
    function fillInSettings() {
        chrome.storage.sync.get(['bigbluebutton_settings', 'settings_time'], result => {
            document.getElementById('gl-url').value = result.bigbluebutton_settings.gl_url;
        });
    }

    // attach listeners to save and cancel settings change
    function attachSettingListeners() {
        document.getElementById('bbb-web-extension-cancel').addEventListener('click', () => {
            window.close();
        });
        document.getElementById('bbb-web-extension-submit').addEventListener('click', () => {
            var gl_url = document.getElementById('gl-url').value.replace(/\/$/, '');

            chrome.storage.sync.set({
                bigbluebutton_settings: {
                    gl_url
                }
            })
            console.log("submit");
        });
    }

    document.addEventListener('DOMContentLoaded', fillInSettings);
    document.addEventListener('DOMContentLoaded', attachSettingListeners);
})();