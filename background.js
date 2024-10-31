chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        appVersion: '2.0',
        firstInstallDate: new Date().toISOString()
    });
});

// Optional: Add future background service logic
chrome.webNavigation.onCompleted.addListener((details) => {
    // You can implement additional tracking or initialization logic here
    console.log('Page load completed:', details.url);
});