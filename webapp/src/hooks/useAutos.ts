import { useEffect, useState } from 'react';
import { AutoConfig, AutoManager } from '../data/auto-config';

function useAutos() {
  const [autos, setAutos] = useState<AutoConfig | undefined>();

  useEffect(() => {
      const sub = AutoManager.onUpdated.subscribe(config => {
        setAutos(config);
      });
      return () => sub?.unsubscribe();
  });

  return [autos] as [autos: any];
}

export default useAutos;