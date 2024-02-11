// urlSelector.js
document.addEventListener('keydown', function(event) {
    console.log("Key pressed: " + event.key);
    const key = event.key; // '1', '2', '3', '4', '5'
    if (key >= '1' && key <= '5') {
        chrome.storage.sync.get(["urls"], function(result) {
            const urls = result.urls || [];
            const urlIndex = parseInt(key, 10) - 1; // Convert key to index (0-based)
            if (urls[urlIndex]) {
                console.log("Opening URL: " + urls[urlIndex]);
            }
        });
    }
});

