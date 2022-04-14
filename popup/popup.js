// Selects the api key input box in the popup
const api_input = document.getElementById("api-key");

// Function that stores the api key input box value in local storage
function storeSettings() {
    chrome.storage.local.set({key: api_input.value});
}

// Function that loads the api key input box value from local storage
chrome.storage.local.get('key', (value) => {
    // Sets the api key input box value to the stored value or to an empty string
    api_input.value = value.key || "";
});

// Runs store settings when the api key input box loses focus
api_input.addEventListener("blur", storeSettings);