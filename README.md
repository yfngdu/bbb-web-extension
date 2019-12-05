# <img src="public/icons/icon_48.png" width="45" align="left"> Bbb Web Extension

A simple web extension to enter a BigBlueButton meeting.

## Features

- Log in using your Google account.
- Enter meetings from your browser.

## Install

[**Chrome** extension]() <!-- TODO: Add chrome extension link inside parenthesis -->

## Development
Turn developer mode on for chrome extensions (at chrome://extensions) and load the build/ directory unpacked into the extensions.

Run `npm install` to install packages.

Run `cp public/manifest.json.example public/manifest.json` to create a manifest file.

Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) to create a new application. Zip the build/ directory and upload to your new app. Save the draft and return to your dashboard. From the app, get the item ID and public key. Paste the public key in the manifest.json file. 

Go to [Google Cloud Platform API Credentials](https://console.cloud.google.com/apis/credentials) and create a new OAuth Client Credential for a web application. Use the item ID and add `https://<item_id>.chromiumapp.org/` to the authorized redirect URIs. Save and copy the Client ID into the manifest.json file.

Run `npm run build` to create a production build.
Run `npm run watch` to update the build files for the extension live.

Update the extension settings with your GreenLight server URL.

## Contribution

Suggestions and pull requests are welcomed!.

