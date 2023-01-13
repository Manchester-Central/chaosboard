import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import 'bootstrap/dist/css/bootstrap.css';

interface NTUpdate {
  key: string;
  value: any;
  valueType: string;
  type: string;
  id: number;
  flags: number;
}

interface NTUpdateMessage {
  networkTableUpdate: NTUpdate;
}

class NetworkTableTree {
  
  values: NTUpdate[] = [];
  latestValue?: NTUpdate;
  children: Map<string, NetworkTableTree> = new Map();

  constructor(public key: string, public keyPath: string) {}

  addValue(ntUpdate: NTUpdate, keyParts = ntUpdate.key.split('/'), keyPathSoFar = '') {
    let keyPartBase = keyParts[0];
    if(keyPartBase.length === 0) {
      this.addValue(ntUpdate, keyParts.slice(1));
    }
    else if(keyParts.length === 1) {
      const valueNode = new NetworkTableTree(keyPartBase, `${keyPathSoFar}/${keyPartBase}`)
      valueNode.values.push(ntUpdate);
      valueNode.latestValue = ntUpdate;
      this.children.set('keyPartBase', valueNode);
    } else {
      if (!this.children.has(keyPartBase)) {
        this.children.set(keyPartBase, new NetworkTableTree(keyPartBase, `${keyPathSoFar}/${keyPartBase}`));
      }
      let child = this.children.get(keyPartBase);
      child?.addValue(ntUpdate, keyParts.slice(1), child.keyPath);
    }
  }
}

const RichObjectTreeView = (data: Map<string, NetworkTableTree>): any => {
  const renderTree = (nodes: Map<string, NetworkTableTree>, level = 0) => (
    Array.from(nodes.values()).map(node => renderNode(node, level))
  );

  const renderNode = (node: NetworkTableTree, level: number): any => (
    <>
    <tr>
      <td style={{paddingLeft: level * 20 + 'px'}}>{node.key}</td>
      <td>{node.latestValue ? node.latestValue.value : ''}</td>
    </tr>
    {node.children.size > 0 ? renderTree(node.children, level + 1): null}
    </>
  );

  return (
    <table className='table Value-Table'>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {renderTree(data)}
      </tbody>
    </table>
  );
}

const rootTree = new NetworkTableTree('/', '');

function App() {
  const [ntTree, setNtTree] = useState<NetworkTableTree>(rootTree);
  const [entries, setEntries] = useState<Map<string, NTUpdate>>(new Map());

  const {sendMessage, getWebSocket} = useWebSocket('ws://localhost:13102', {
    onOpen: (event) => {
      console.log('opened', event);
    },
    onMessage: (event) => {
      let data: NTUpdateMessage;
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
      ntTree.addValue(update);
      setNtTree(ntTree);
    },
    shouldReconnect: (closeEvent) => true,
  });

  return (
    <div className="App">
      <header className="App-header">
        <img src="/ChaosLogo.png" className='App-logo'></img> Board
      </header>
      {RichObjectTreeView(ntTree.children)}
    </div>
  );
}

export default App;
