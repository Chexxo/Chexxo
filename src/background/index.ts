// eslint-disable-next-line @typescript-eslint/no-explicit-any
browser.runtime.onMessage.addListener((message: any) => {
  if (message.data) {
    console.log(message.data);
  } else {
    console.log("Request did not contain any message!");
  }
});
