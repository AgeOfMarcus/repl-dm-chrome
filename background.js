// execute script as soon as extension is installed or refreshed

chrome.tabs.onActivated.addListener(tab => {
    addScripts(tab);
})

chrome.tabs.onUpdated.addListener(tab => {
    addScripts(tab);
})

function addScripts(tab) {
    chrome.tabs.get(tab.tabId, currentTabInfo => {
        if (/^https:\/\/repl\.it/.test(currentTabInfo.url)) {
            chrome.tabs.insertCSS(null, {file: './repldm.css'});
            chrome.tabs.executeScript(null, {file: './jquery.min.js'}, () => {
                chrome.tabs.executeScript(null, {file: './foreground.js'}, () => console.log('i injected'));  
            })
        }
    })
}