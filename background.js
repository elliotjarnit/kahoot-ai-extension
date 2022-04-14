// If the key value does not exist in the storage, it will be created.
// This only happens the first time the extension is installed.
chrome.storage.local.get('key', value => {
    if (typeof value.key === undefined) {
        chrome.storage.local.set({key: ""});
    }
});

// This will handle messages send from the content script
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        // Logs that it received a message
        console.log("Message received\nMessage Type: " + message.type);

        // Possible types:
        // - "google_search"

        // If the message is a Google search
        if (message.type === "google_search") {
            // Creates the url to fetch
            const url = "https://serpapi.com/search.json?engine=google"
                + "&q=" + message.question
                + "&api_key=" + message.api_key
            // Makes the request
            fetch(url).then((response) => {
                // Gets the json from the response
                return response.json();
            }).then((data) => {
                // Sends the response json back to the content script
                sendResponse(data);
            });
        }

        // This will make sure the response has time to be sent back to the content script
        return true;
    });