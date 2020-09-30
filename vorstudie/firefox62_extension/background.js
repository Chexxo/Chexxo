console.log(`\n\nTLS browser extension loaded`);

var ALL_SITES = { urls: ['<all_urls>'] };
var extraInfoSpec = ['blocking'];

browser.webRequest.onHeadersReceived.addListener(async function(details) {
  var { url, tabId, requestId, timeStamp } = details;

  console.log(`\n\nGot a request for ${url} with ID ${requestId}`);

  var securityInfo = await browser.webRequest.getSecurityInfo(requestId, {
    certificateChain: false,
    rawDER: false
  });

  console.log(`securityInfo: ${JSON.stringify(securityInfo, null, 2)}`);

  /*
  if (!tabStorage.hasOwnProperty(tabId)) {
    return;
  }

  tabStorage[tabId].requests[requestId] = {
    requestId,
    url,
    startTime: timeStamp
  };
  */
}, ALL_SITES, extraInfoSpec);

console.log('Added listener');

/*
browser.runtime.onMessage.addListener((message, sender, response) => {
  response(tabStorage[message.tabId]);
});
*/