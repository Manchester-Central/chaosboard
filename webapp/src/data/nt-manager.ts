import { BehaviorSubject, Subject } from 'rxjs';
import { AutoConfig, AutoManager } from './auto-config';

export interface NTUpdate {
  key: string;
  value: any;
  valueType: string;
}

export interface NTUpdateMessage {
  networkTableUpdate: NTUpdate;
}

export class NTEntry {
  private onUpdatedSubject = new BehaviorSubject<NTUpdate | undefined>(undefined);
  onUpdated = this.onUpdatedSubject.asObservable();
  title: string;
  parentTitle: string;

  constructor(
    private ntManager: NTManager,
    public readonly key: string,
    public latestValue?: NTUpdate,
    public readonly values: NTUpdate[] = [],
  ) {
    const splitKeys = key.split('/');
    this.title = splitKeys[splitKeys.length - 1];
    this.parentTitle = splitKeys[splitKeys.length - 2];
  }

  newValueFromNt(update: NTUpdate) {
    this.latestValue = update;
    //this.values.push(update); // TODO: Implement size limit so memory doesn't keep growing
    this.onUpdatedSubject.next(update);
  }

  publishNewValue(value: any) {
    this.ntManager.sendUpdateToNt({
      key: this.key,
      valueType: this.latestValue?.valueType ?? 'unknown',
      value
    })
  }

  getSibling(siblingTitle: string) {
    const parentKey = this.key.substring(0, this.key.lastIndexOf('/'));
    return this.ntManager.getEntry(`${parentKey}/${siblingTitle}`);
  }
}

export class NetworkTableTree {
  children: Map<string, NetworkTableTree> = new Map();

  constructor(public key: string, public keyPath: string, public entry?: NTEntry) {}

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

  shouldShow(filterText: string) {
    if (this.key.startsWith('.')) {
      return false;
    }
    if (this.keyPath.toLowerCase().includes(filterText.toLowerCase().trim())) {
      return true;
    }
    for(const child of this.children.values()) {
      if (child.shouldShow(filterText)) {
        return true;
      }
    }
    return false;
  }
}

export default class NTManager {
  tree = new NetworkTableTree('/', '');
  private entries = new Map<string, NTEntry>();
  private onNewValueSubject = new Subject<NTEntry>();
  onNewValue = this.onNewValueSubject.asObservable();
  private ws: WebSocket;
  private lastUpdateTime: Date | undefined;

  constructor() {
    this.ws = new WebSocket('ws://localhost:13102');
    this.connect();
  }

  getlastUpdatedTime() {
    return this.lastUpdateTime;
  }

  getState() {
    return {
      tree: this.tree,
      entries: this.entries,
    }
  }

  getEntry(key: string) {
    if (!this.entries.has(key)) {
      this.entries.set(key, new NTEntry(this, key));
    }
    return this.entries.get(key);
  }

  sendUpdateToNt(ntUpdate: NTUpdate) {
    this.ws.send(JSON.stringify(ntUpdate));
  }

  connect() {
    this.ws.onopen = (e) => {
      // subscribe to some channels
      // this.ws.send(JSON.stringify({
      //   //.... some message the I must send when I connect ....
      // }));
    };

    this.ws.onmessage = (event) => {
      let data: NTUpdateMessage;
      try {
        data = JSON.parse(event.data);
        if((data as any).autoConfigs) {
          console.log(data);
          AutoManager.cacheConfig((data as any).autoConfigs);
          return;
        }
        else if (!data.networkTableUpdate) {
          throw 'socket data does not have networkTableUpdate property';
        }
      } catch (error) {
        //console.warn(`can't parse socket data:`, event, error);
        return;
      }
      this.lastUpdateTime = new Date();
      let update = data.networkTableUpdate;
      let isNewEntry = false;
      let entry = this.entries.get(update.key) ?? (() => {
        let newEntry = new NTEntry(this, update.key);
        this.entries.set(update.key, newEntry);
        isNewEntry = true;
        return newEntry;
      })();
      isNewEntry ||= !entry.latestValue;
      entry.newValueFromNt(update);
      this.entries.set(update.key, entry);
      this.tree.addValue(entry, update);
      if (isNewEntry) {
        this.onNewValueSubject.next(entry);
      }
      //console.log(update);
    };

    this.ws.onclose = (e) => {
      console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
      setTimeout(() => {
        this.connect();
      }, 1000);
    };

    this.ws.onerror = (e) => {
      console.error('Socket encountered error: ', e, 'Closing socket');
      this.ws.close();
    };
  }
}
