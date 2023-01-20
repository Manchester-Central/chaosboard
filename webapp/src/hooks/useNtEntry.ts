import { useState, useEffect } from 'react';
import { NTEntry } from '../data/nt-manager';

function useNtEntry(entry: NTEntry | undefined) {
  const [value, setValue] = useState(entry?.latestValue?.value);

  useEffect(() => {
      const sub = entry?.onUpdated?.subscribe(update => {
          setValue(update?.value);
      });
      return () => sub?.unsubscribe();
  })

  return value;
}

export default useNtEntry;