import { BehaviorSubject, Subject } from 'rxjs';

export interface NTUpdate {
  key: string;
  value: any;
  valueType: string;
  type: string;
  id: number;
  flags: number;
}

export interface NTUpdateMessage {
  networkTableUpdate: NTUpdate;
}

export class NTEntry {
  private onUpdatedSubject = new BehaviorSubject<NTUpdate | undefined>(undefined);
  onUpdated = this.onUpdatedSubject.asObservable();

  constructor(
    public readonly key: string,
    public latestValue?: NTUpdate,
    public readonly values: NTUpdate[] = []
  ) { }

  updateValue(update: NTUpdate) {
    this.latestValue = update.value;
    //this.values.push(update); // TODO: Implement size limit so memory doesn't keep growing
    this.onUpdatedSubject.next(update);
  }
}

export class NetworkTableTree {
  children: Map<string, NetworkTableTree> = new Map();

  constructor(public key: string, public keyPath: string, public entry?: NTEntry) { }

  addValue(currentEntry: NTEntry, ntUpdate: NTUpdate, keyParts = ntUpdate.key.split('/'), keyPathSoFar = '') {
    let keyPartBase = keyParts[0];
    if (keyPartBase.length === 0) {
      this.addValue(currentEntry, ntUpdate, keyParts.slice(1));
    }
    else if (keyParts.length === 1) {
      const valueNode = new NetworkTableTree(keyPartBase, `${keyPathSoFar}/${keyPartBase}`, currentEntry);
      this.children.set(keyPartBase, valueNode);
    } else {
      if (!this.children.has(keyPartBase)) {
        this.children.set(keyPartBase, new NetworkTableTree(keyPartBase, `${keyPathSoFar}/${keyPartBase}`));
      }
      let child = this.children.get(keyPartBase);
      child?.addValue(currentEntry, ntUpdate, keyParts.slice(1), child.keyPath);
    }
  }
}

export default class NTManager {
  tree = new NetworkTableTree('/', '');
  private entries = new Map<string, NTEntry>();
  private onNewValueSubject = new Subject<NTEntry>();
  onNewValue = this.onNewValueSubject.asObservable();

  constructor() {
    this.connect();
  }

  getState() {
    return {
      tree: this.tree,
      entries: this.entries,
    }
  }

  getEntry(key: string) {
    if (!this.entries.has(key)) {
      this.entries.set(key, new NTEntry(key));
    }
    return this.entries.get(key);
  }

  connect() {
    var ws = new WebSocket('ws://localhost:13102');
    ws.onopen = (e) => {
      // subscribe to some channels
      ws.send(JSON.stringify({
        //.... some message the I must send when I connect ....
      }));
    };

    ws.onmessage = (event) => {
      let data: NTUpdateMessage;
      try {
        data = JSON.parse(event.data);
        if (!data.networkTableUpdate) {
          throw 'socket data does not have networkTableUpdate property';
        }
      } catch (error) {
        console.warn(`can't parse socket data:`, event, error);
        return;
      }
      let update = data.networkTableUpdate;
      let isNewEntry = false;
      let entry = this.entries.get(update.key) ?? (() => {
        let newEntry = new NTEntry(update.key);
        this.entries.set(update.key, newEntry);
        isNewEntry = true;
        return newEntry;
      })();
      isNewEntry ||= !entry.latestValue;
      entry.updateValue(update);
      this.entries.set(update.key, entry);
      this.tree.addValue(entry, update);
      if (isNewEntry) {
        this.onNewValueSubject.next(entry);
      }
      //console.log(update);
    };

    ws.onclose = (e) => {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(() => {
        this.connect();
      }, 1000);
    };

    ws.onerror = (e) => {
      console.error('Socket encountered error: ', e, 'Closing socket');
      ws.close();
    };
  }
}
