// Selects the api key input box in the popup
const api_input = document.getElementById("api-key");
let error_timeout

// Function that stores the api key input box value in local storage
function storeSettings() {
    // Checks if there is anything but 64 characters in the api key input box
    if (api_input.value.length !== 64) {
        // Clears the api key input box and displays an error message
        api_input.value = "";
        document.getElementById("error-message-box").innerHTML = "Please enter a valid API key";
        document.getElementById("error-message-box").style.opacity = "1";
        if (error_timeout) {
            clearTimeout(error_timeout);
        }
        // After 5 seconds the error message is hidden
        error_timeout = setTimeout(function() {
            document.getElementById("error-message-box").style.opacity = "0";
        }, 5000);
    } else  {
        // Sends a message to the background script to send a test request to the api key
        chrome.runtime.sendMessage({
            "type": "serpapi_test",
            "api_key": api_input.value
        }, function (response) {
            if (!response.valid) {
                // Clears the api key input box and displays an error message
                api_input.value = "";
                document.getElementById("error-message-box").innerHTML = "Please enter a valid API key";
                document.getElementById("error-message-box").style.opacity = "1";
                if (error_timeout) {
                    clearTimeout(error_timeout);
                }
                // After 5 seconds the error message is hidden
                error_timeout = setTimeout(function() {
                    document.getElementById("error-message-box").style.opacity = "0";
                }, 5000);
            }
        })
    }
    chrome.storage.local.set({key: api_input.value});
}

// Function that loads the api key input box value from local storage
chrome.storage.local.get('key', (value) => {
    // Sets the api key input box value to the stored value or to an empty string
    api_input.value = value.key || "";
});

// Runs store settings when the api key input box loses focus
api_input.addEventListener("blur", storeSettings);

document.addEventListener('DOMContentLoaded', function () {
    let links = document.getElementsByTagName("a");
    for (let i = 0; i < links.length; i++) {
        (function () {
            let ln = links[i];
            let location = ln.href;
            ln.onclick = function () {
                chrome.tabs.create({active: true, url: location});
            };
        })();
    }
});