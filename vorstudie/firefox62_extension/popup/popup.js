var tabId = chrome.tabs.query({
  active: true,
  currentWindow: true
}, (tabs) => {
  browser.runtime.sendMessage({ tabId: tabs[0] }, (response) => {
    document.getElementById('certificate').innerText = response;
  });
})

