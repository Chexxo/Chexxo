browser.tabs.query({
  active: true,
  currentWindow: true
}, (tabs) => {
  const currentTab = tabs[0];
  browser.runtime.sendMessage({ tabId: currentTab.id }, (response) => {
    console.log(response);
    if (response) {
      document.getElementById('certificate').innerText = JSON.stringify(response);
    }
  });
});
