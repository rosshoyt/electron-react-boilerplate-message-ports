import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

const Hello = () => {
  const makeStreamingRequest = (
    element: any,
    callback: (data: any) => void
  ) => {
    // MessageChannels are lightweight--it's cheap to create a new one for each
    // request.
    const { port1, port2 } = new MessageChannel();

    // We send one end of the port to the main process ...
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // Subscribe to ipc messages from main
    window.electron.ipcRenderer.postMessage(
      'give-me-a-stream',
      { element, count: 10 },
      [port2]
    );

    // ... and we hang on to the other end. The main process will send messages
    // to its end of the port, and close it when it's finished.
    port1.onmessage = (event) => {
      callback(event.data);
    };

    // Disabled: (port does not have method onclose)
    // port1.onclose = () => {
    //   console.log('stream ended');
    // };
  };

  React.useEffect(() => {
    // // initiate test streaming request
    // makeStreamingRequest(42, (data: any) => {
    //   console.log('got response data:', data);
    // });
    window.onmessage = (event) => {
      // event.source === window means the message is coming from the preload
      // script, as opposed to from an <iframe> or other source.
      if (event.source === window && event.data === 'main-world-port') {
        const [port] = event.ports;
        // Once we have the port, we can communicate directly with the main
        // process.
        port.onmessage = (e) => {
          console.log('from main process:', e.data);
          port.postMessage(e.data * 2);
        };
      }
    };
  }, []);

  return (
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <div className="Hello">
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
