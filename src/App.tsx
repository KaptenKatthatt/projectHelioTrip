import { Suspense, lazy, useEffect } from 'react';
import { HUD } from './components/HUD';
import { useStore } from './store/useStore';

const LazyScene = lazy(async () => {
  const module = await import('./scene/Scene');
  return { default: module.Scene };
});

export const App = () => {
  const locale = useStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      <Suspense fallback={null}>
        <LazyScene />
      </Suspense>
      <HUD />
    </>
  );
};
