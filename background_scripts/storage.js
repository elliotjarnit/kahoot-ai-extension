// If the key value does not exist in the storage, it will be created.
// This only happens the first time the extension is installed.
chrome.storage.local.get('key', value => {
    if (typeof value.key === undefined) {
        chrome.storage.local.set({key: ""});
    }
});