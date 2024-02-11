document.addEventListener('DOMContentLoaded', function() {
    const urlsListElement = document.getElementById('urlsList');
    const reopenClosedTabsCheckbox = document.getElementById('reopenClosedTabs');

    let dragSrcEl = null;

    function handleDragStart(e) {
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (dragSrcEl !== this) {
            dragSrcEl.innerHTML = this.innerHTML;
            this.innerHTML = e.dataTransfer.getData('text/html');

            chrome.storage.sync.get(["urls"], function(result) {
                let urls = result.urls || [];
                let fromIndex = urls.indexOf(dragSrcEl.getAttribute('data-url'));
                let toIndex = urls.indexOf(this.getAttribute('data-url'));

                if (fromIndex >= 0 && toIndex >= 0) {
                    let temp = urls[fromIndex];
                    urls[fromIndex] = urls[toIndex];
                    urls[toIndex] = temp;
                    chrome.storage.sync.set({ "urls": urls });
                }
            }.bind(this));
        }
        return false;
    }

    function handleDragEnd(e) {
        [].forEach.call(urls, function(url) {
            url.classList.remove('over');
        });
    }

    function loadUrls() {
        chrome.storage.sync.get(["urls"], function(result) {
            const urls = result.urls || [];
            urlsListElement.innerHTML = '';
            urls.forEach((url, index) => {
                const liElement = document.createElement('li');
                liElement.setAttribute('draggable', true);
                liElement.setAttribute('data-url', url);


                const textNode = document.createTextNode(url);
                liElement.appendChild(textNode);


                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.setAttribute('class', 'delete-btn');
                deleteButton.onclick = function() {

                    const updatedUrls = urls.filter((_, i) => i !== index);
                    chrome.storage.sync.set({ "urls": updatedUrls }, function() {
                        loadUrls();
                    });
                };

                liElement.appendChild(deleteButton);

                liElement.addEventListener('dragstart', handleDragStart, false);
                liElement.addEventListener('dragover', handleDragOver, false);
                liElement.addEventListener('drop', handleDrop, false);
                liElement.addEventListener('dragend', handleDragEnd, false);

                urlsListElement.appendChild(liElement);
            });
        });
    }

    reopenClosedTabsCheckbox.addEventListener('change', function() {
        chrome.storage.sync.set({ 'reopenClosedTabs': reopenClosedTabsCheckbox.checked });
    });

    chrome.storage.sync.get(['reopenClosedTabs'], function(result) {
        reopenClosedTabsCheckbox.checked = result.reopenClosedTabs || false;
    });

    loadUrls();
});

