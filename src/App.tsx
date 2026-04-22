import { useEffect } from 'react';
import { Scene } from './scene/Scene';
import { useStore } from './store/useStore';

export const App = () => {
  const locale = useStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <Scene />;
};
