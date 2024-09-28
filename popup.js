const port = chrome.runtime.connect({ name: 'popup' });

const memoryUsageContainer = document.getElementById('memory-usage');

const stats = new MemoryStats();
stats.domElement.style.position = 'fixed';
stats.domElement.style.right = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

function updateStats(memoryUsage) {
    stats.update(memoryUsage);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.memoryUsage) {
        const memory = request.memoryUsage;
        memoryUsageContainer.innerHTML = `
            <p>JS Heap Size Limit: ${ bytesToSize(memory.jsHeapSizeLimit, 2) +" / "+ (memory.jsHeapSizeLimit / 1048576).toFixed(2) } MB</p>
            <p>Total JS Heap Size: ${bytesToSize(memory.totalJSHeapSize, 2)} MB</p>
            <p>Used JS Heap Size: ${bytesToSize(memory.usedJSHeapSize, 2)} MB</p>
        `;

        updateStats(memory.usedJSHeapSize);
    }
});


function bytesToSize(bytes, nFractDigit) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let precision;
    let i;

    if (bytes === 0) return 'n/a';
    nFractDigit = nFractDigit !== undefined ? nFractDigit : 0;
    precision = Math.pow(10, nFractDigit);
    i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes * precision / Math.pow(1024, i)) / precision + ' ' + sizes[i];
}
