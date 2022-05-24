// If the key value does not exist in the storage, it will be created.
// This only happens the first time the extension is installed.
chrome.storage.local.get('key', value => {
    if (typeof value.key === undefined) {
        chrome.storage.local.set({key: ""});
    }
});

// Check if the extension is installed
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        chrome.storage.local.set({key: ""});
    }
    // If this is just an update, change a local storage value so that the update popup is shown
    else if (details.reason === "update") {
        chrome.storage.local.set({"update": true});
    }
});


// This will handle messages send from the content script
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        // Logs that it received a message
        console.groupCollapsed("Message received")
        console.log("Message Type: " + message.type);
        console.log("Message Content:");
        console.log(message);

        // Possible types:
        // - "serpapi_search"
        // - "serpapi_test"
        // - "check_update
        // - "check_version

        // If the message is a Google search
        if (message.type === "serpapi_search") {
            // Url to fetch
            const url = "https://serpapi.com/search.json?engine=google"
                + "&q=" + message.question
                + "&api_key=" + message.api_key
            // Makes the request
            fetch(url).then((response) => {
                // Checks if the response is ok
                if (response.status !== 200) {
                    console.log("Error: " + response.text);
                    sendResponse({error: response.error(), valid: false})
                    return null
                } else {
                    return response.json();
                }}).then((json) => {
                    if (json !== null){
                        console.groupCollapsed("Sent response")
                        console.log(json)
                        console.groupEnd()
                        sendResponse({json: json, valid: true})
                    }
            })
        } else if (message.type === 'serpapi_test') {
            const url = "https://serpapi.com/search.json?engine=google&api_key=" + message.api_key;
            fetch(url).then((response) => {
                // Gets the json from the response
                return response.status;
            }).then((data) => {
                // Sends the response json back to the content script
                if (data === 401) {
                    sendResponse({valid: false});
                } else {
                    sendResponse({valid: true});
                }
            });
        } else if (message.type === 'check_update') {
            // Checks for the update key in local storage
            chrome.storage.local.get('update', value => {
                if (value.update) {
                    // Change the update key to false
                    chrome.storage.local.set({update: false});
                    sendResponse({valid: true});
                } else {
                    sendResponse({valid: false});
                }
            });
        } else if (message.type === 'check_version') {
            // Gets the current version of the extension
            sendResponse({version: chrome.runtime.getManifest().version, valid: true});
        }
        else {
            sendResponse({valid: false});
        }

        console.groupEnd()
        // This will make sure the response has time to be sent back to the content script
        return true;
    });