let myWindowId;
const api_input = document.getElementById("api-key");

function storeSettings() {
    browser.storage.local.set({api: {key: api_input.value}});
}

function updateUI(restoredSettings) {
    api_input.value = restoredSettings.api.key || "";
}

function onError(e) {
    console.error(e);
}

const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(updateUI, onError);

api_input.addEventListener("blur", storeSettings);