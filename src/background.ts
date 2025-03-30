chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed successfully!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "searchText"&& typeof message.text === "string") {
        chrome.storage.local.set({ lastSearch: message.text }).then(() => {
            console.log("🔍 Text of search saved:", message.text);
        }).catch((error) => {
            console.error("❌ Error saving in storage:", error);
        });
    }
});