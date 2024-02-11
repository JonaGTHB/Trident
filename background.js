function openTabWithUrl(url, reopenClosedTabs) {
    chrome.tabs.query({}, function(tabs) {
        const existingTab = tabs.find(tab => tab.url === url);
        if (existingTab) {
            chrome.tabs.update(existingTab.id, { active: true });
        } else if (reopenClosedTabs) {
            chrome.tabs.create({ url: url });
        } else {
            chrome.storage.sync.get(["urls"], function(result) {
                const updatedUrls = result.urls.filter(item => item !== url);
                chrome.storage.sync.set({ "urls": updatedUrls });
            });
        }
    });
}

chrome.commands.onCommand.addListener(function(command) {
    chrome.storage.sync.get(["urls", "reopenClosedTabs"], function(result) {
        const urls = result.urls || [];
        const reopenClosedTabs = result.reopenClosedTabs || false;
        if (urls.length === 0) return;

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length === 0) return;

            const currentTab = tabs[0];
            const currentIndex = urls.findIndex(url => url === currentTab.url);

            if (command === "cycle-forward") {
                let nextIndex = currentIndex + 1 === urls.length ? 0 : currentIndex + 1;
                openTabWithUrl(urls[nextIndex], reopenClosedTabs);
            } else if (command === "cycle-backward") {
                let prevIndex = currentIndex - 1 < 0 ? urls.length - 1 : currentIndex - 1;
                openTabWithUrl(urls[prevIndex], reopenClosedTabs);
            }
        });
    });

    if (command === "delete-current-tab") {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length > 0) {
                const currentUrl = tabs[0].url;
                chrome.storage.sync.get(["urls"], function(result) {
                    const urls = result.urls || [];
                    const updatedUrls = urls.filter(url => url !== currentUrl);

                    if (urls.length !== updatedUrls.length) {
                        chrome.storage.sync.set({ "urls": updatedUrls }, function() {
                            console.log("URL removed from the list:", currentUrl);
                        });
                    } else {
                        console.log("URL not found in the list:", currentUrl);
                    }
                });
            }
        });
    }

    if (command === "save-current-url") {
        console.log("Saving the current URL...");
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTab = tabs[0];
            if (!currentTab) return;

            const urlToSave = currentTab.url;
            console.log("URL to save:", urlToSave);
            chrome.storage.sync.get(["urls"], function(result) {
                const existingUrls = result.urls || [];
                console.log("Existing URLs:", existingUrls);
                if (!existingUrls.includes(urlToSave)) {
                    const updatedUrls = [...existingUrls, urlToSave];
                    chrome.storage.sync.set({ "urls": updatedUrls }, function() {
                        console.log("URL added to the list:", urlToSave);
                    });
                } else {
                    console.log("URL already exists in the list:", urlToSave);
                }
            });
        });
    }
});

