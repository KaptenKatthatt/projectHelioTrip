import { useEffect, useRef } from 'react';
import { Rocket } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import styles from './LoadingScreen.module.css';

type Props = {
  readonly dismiss: boolean;
  readonly onDismissed: () => void;
};

export const LoadingScreen = ({ dismiss, onDismissed }: Props) => {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (!dismiss || dismissedRef.current) return;

    const fallbackMs = 900;
    const timer = window.setTimeout(() => {
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      onDismissed();
    }, fallbackMs);

    const el = rootRef.current;
    const onEnd = (e: TransitionEvent): void => {
      if (e.propertyName !== 'opacity') return;
      if (dismissedRef.current) return;
      dismissedRef.current = true;
      window.clearTimeout(timer);
      onDismissed();
    };

    el?.addEventListener('transitionend', onEnd);
    return () => {
      window.clearTimeout(timer);
      el?.removeEventListener('transitionend', onEnd);
    };
  }, [dismiss, onDismissed]);

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-dismiss={dismiss ? 'true' : 'false'}
      role="status"
      aria-busy={!dismiss}
      aria-labelledby="loading-screen-title"
    >
      <span className={styles.visuallyHidden}>{t.ui.loading}</span>
      <h1 id="loading-screen-title" className={styles.title}>
        {t.loadingScreenTitle}
      </h1>
      <p className={styles.sub}>{t.ui.loading}</p>
      <div className={styles.track} aria-hidden>
        <div className={styles.shipWrap}>
          <Rocket
            className={styles.shipIcon}
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
};
