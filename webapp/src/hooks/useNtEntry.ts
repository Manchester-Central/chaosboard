import { useState, useEffect } from 'react';
import { HistoryManager } from '../data/history-manager';
import { NTEntry } from '../data/nt-manager';

function useNtEntry(entry: NTEntry | undefined) {
  const [value, setValue] = useState(entry?.latestValue?.value);

  useEffect(() => {
      const sub = entry?.onUpdated?.subscribe(update => {
          setValue(update?.value);
      });
      return () => sub?.unsubscribe();
  })

  const update = (newValue: any, historyManager: HistoryManager) => {
    entry?.publishNewValue(newValue);
    historyManager.updateHistory(entry, newValue);
  }

  return [value, update] as [value: any, func: (newValue: any, history: HistoryManager) => void];
}

export default useNtEntry;