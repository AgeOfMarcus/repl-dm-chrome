// execute script as soon as extension is installed or refreshed

chrome.tabs.onActivated.addListener(tab => {
    addScripts();
})

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    addScripts();
});

function addScripts() {
    chrome.tabs.get(tab.tabId, currentTabInfo => {
        if (/^https:\/\/repl\.it/.test(currentTabInfo.url)) {
            chrome.tabs.insertCSS(null, {file: './repldm.css'});
            chrome.tabs.executeScript(null, {file: './jquery.min.js'}, () => {
                chrome.tabs.executeScript(null, {file: './foreground.js'}, () => console.log('i injected'));  
            })
        }
    })
}