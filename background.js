let is_popup_open = false;
let active_tab_id = null;
let interval = null;

chrome.runtime.onConnect.addListener((port) => {
    console.log('port:connected', port);

    if (port.name === 'popup') {
        is_popup_open = true;

        port.onDisconnect.addListener(() => {
            console.log('port:disconnected', port);
            is_popup_open = false;
            if (interval) {
                clearInterval(interval)
            }
        });
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    if (interval) {
        clearInterval(interval)
    }
    monitor_memory_usage(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        if (interval) {
            clearInterval(interval)
        }
        monitor_memory_usage(tabId);
    }
});

function monitor_memory_usage() {
    interval = setInterval(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            active_tab_id = tab && tab.id || null;
            console.log('tabs', tabs, active_tab_id);

            if (active_tab_id && tab && tab.url && !tab.url.startsWith("chrome://")) {
                chrome.scripting.executeScript({
                    target: { tabId: active_tab_id },
                    func: get_memory_info
                }, (result) => {
                    if (result && result[0]) {
                        const memory_usage = result[0].result;
                        // console.log('Memory Usage:', memoryUsage);

                        if (is_popup_open) {
                            chrome.runtime.sendMessage({ memoryUsage: memory_usage });
                        }
                    }
                });
            } else {
                console.warn("Can not monitor chrome:// URL");
            }
        });
    }, 1_000);
}

function get_memory_info() {
    if (performance.memory) {
        return {
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            usedJSHeapSize: performance.memory.usedJSHeapSize
        };
    } else {
        return { error: "Memory API not supported" };
    }
}
