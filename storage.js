let api = {key: ""}
function onError(e) {
    console.error(e);
}
function checkStoredSettings(storedSettings) {
    if (!storedSettings.api) {
        browser.storage.local.set({api});
    }
}
const gettingStoredSettings = browser.storage.local.get();
gettingStoredSettings.then(checkStoredSettings, onError);