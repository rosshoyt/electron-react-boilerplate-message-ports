const { contextBridge, ipcRenderer } = require('electron');

// We need to wait until the main world is ready to receive the message before
// sending the port. We create this promise in the preload so it's guaranteed
// to register the onload listener before the load event is fired.
const windowLoaded = new Promise((resolve) => {
  window.onload = resolve;
});

ipcRenderer.on('main-world-port', async (event) => {
  await windowLoaded;
  // We use regular window.postMessage to transfer the port from the isolated
  // world to the main world.
  window.postMessage('main-world-port', '*', event.ports);
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send(message, payload) {
      ipcRenderer.send(message, payload);
    },
    postMessage(channel, element, port) {
      console.log('posting message', channel, element, port);
      ipcRenderer.postMessage(channel, element, port);
    },
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      const validChannels = ['ipc-example', 'main-world-port'];
      if (validChannels.includes(channel)) {
        // TODO was hoping to add the ipcRenderer code here:
        // if (channel === 'main-world-port') {
        // ipcRenderer.on('main-world-port', async (event) => {
        //   await windowLoaded;
        //   // We use regular window.postMessage to transfer the port from the isolated
        //   // world to the main world.
        //   console.log('in main-world-loaded');
        //   window.postMessage('main-world-port', '*', event.ports);
        // });
        // } else {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
        // }
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
