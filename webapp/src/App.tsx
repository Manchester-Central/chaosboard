import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface ntUpdate {
  key: string;
  value: any;
  valueType: string;
  type: string;
  id: number;
  flags: number;
}

interface ntUpdateMessage {
  networkTableUpdate: ntUpdate;
}

function App() {
  const [entries, setEntries] = useState<Map<string, ntUpdate>>(new Map());

  const {sendMessage, getWebSocket} = useWebSocket('ws://localhost:13102', {
    onOpen: (event) => {
      console.log('opened', event);
    },
    onMessage: (event) => {
      let data: ntUpdateMessage;
      try {
        data = JSON.parse(event.data);
        if(!data.networkTableUpdate) {
          throw 'socket data does not have networkTableUpdate property';
        }
      } catch(error) {
        console.warn(`can't parse socket data:`, event, error);
        return;
      }
      let update = data.networkTableUpdate;
      entries.set(update.key, update);
      setEntries(entries);
    },
    shouldReconnect: (closeEvent) => true,
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src="/ChaosLogo.png" className='App-logo'></img> Board
      </header>
      <ul>
        {Array.from(entries.values()).map(entry => <li>{entry.key} {entry.value}</li>)}
      </ul>
    </div>
  );
}

export default App;
