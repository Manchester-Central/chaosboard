import React from 'react';
import logo from './logo.svg';
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';

function App() {

  const {sendMessage, getWebSocket} = useWebSocket('ws://localhost:13102', {
    onOpen: (event) => {
      console.log('opened', event);
    },
    onMessage: (event) => {
      console.log(JSON.parse(event.data));
    },
    shouldReconnect: (closeEvent) => true,
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
