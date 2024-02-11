function openTabWithUrl(url, reopenClosedTabs) {
    chrome.tabs.query({}, function(tabs) {
        const existingTab = tabs.find(tab => tab.url === url);
        if (existingTab) {
            chrome.tabs.update(existingTab.id, { active: true });
        } else if (reopenClosedTabs) {
            chrome.tabs.create({ url });
        } else {
            removeUrlFromStorage(url);
        }
    });
}

function removeUrlFromStorage(urlToRemove) {
    chrome.storage.sync.get(["urls"], function(result) {
        const updatedUrls = (result.urls || []).filter(url => url !== urlToRemove);
        chrome.storage.sync.set({ "urls": updatedUrls });
    });
}

function handleCommand(command) {
    chrome.storage.sync.get(["urls", "reopenClosedTabs"], function(result) {
        const { urls = [], reopenClosedTabs = false } = result;
        if (urls.length === 0 && command !== "save-current-url") return;

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length === 0) return;

            const currentUrl = tabs[0].url;
            const currentIndex = urls.findIndex(url => url === currentUrl);

            switch (command) {
                case "cycle-forward":
                    cycleThroughTabs(urls, currentIndex + 1, reopenClosedTabs);
                    break;
                case "cycle-backward":
                    cycleThroughTabs(urls, currentIndex - 1, reopenClosedTabs);
                    break;
                case "delete-current-tab":
                    deleteCurrentTab(currentUrl);
                    break;
                case "save-current-url":
                    saveCurrentUrl(currentUrl);
                    break;
            }
        });
    });
}

function cycleThroughTabs(urls, newIndex, reopenClosedTabs) {
    if (urls.length === 0) {
        openTabWithUrl(urls[0], reopenClosedTabs);
    }
    const index = newIndex < 0 ? urls.length - 1 : newIndex % urls.length;
    openTabWithUrl(urls[index], reopenClosedTabs);
}

function deleteCurrentTab(currentUrl) {
    chrome.storage.sync.get(["urls"], function(result) {
        const urls = result.urls || [];
        const updatedUrls = urls.filter(url => url !== currentUrl);
        if (urls.length !== updatedUrls.length) {
            chrome.storage.sync.set({ "urls": updatedUrls });
        }
    });
}

function saveCurrentUrl(urlToSave) {
    chrome.storage.sync.get(["urls"], function(result) {
        const urls = result.urls || [];
        if (!urls.includes(urlToSave)) {
            urls.push(urlToSave);
            chrome.storage.sync.set({ "urls": urls });
        }
    });
}

chrome.commands.onCommand.addListener(handleCommand);

