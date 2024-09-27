const port = chrome.runtime.connect({ name: 'popup' });

const memoryUsageContainer = document.getElementById('memory-usage');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.memoryUsage) {
        const memory = request.memoryUsage;
        memoryUsageContainer.innerHTML = `
            <p>JS Heap Size Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB</p>
            <p>Total JS Heap Size: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB</p>
            <p>Used JS Heap Size: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB</p>
        `;
    }
});
