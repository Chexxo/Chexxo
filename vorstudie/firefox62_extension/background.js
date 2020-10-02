(function() {
  const tabStorage = {};
  const ALL_SITES = { urls: ['<all_urls>'] };
  const extraInfoSpec = ['blocking'];
  
  browser.webRequest.onHeadersReceived.addListener(async function(details) {
    const { url, tabId, requestId, timeStamp } = details;
    if (!tabStorage.hasOwnProperty(tabId)) {
      tabStorage[tabId] = {};
    }

    const securityInfo = await browser.webRequest.getSecurityInfo(requestId, {
      certificateChain: false,
      rawDER: false
    });
    tabStorage[tabId][requestId] = securityInfo;
  }, ALL_SITES, extraInfoSpec);

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const currentTab = tabStorage[message.tabId];
    sendResponse(currentTab[Object.keys(currentTab)[0]]);
  });
})();