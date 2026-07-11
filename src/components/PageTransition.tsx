import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Re-mounts its children with an entrance animation whenever the route path
 * changes, giving a smooth cross-page transition. Falls back to a plain
 * render when reduced motion is on.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <div
      key={location.pathname}
      className={reduce ? '' : 'page-fade-enter'}
      style={{ minHeight: '100%' }}
    >
      {children}
    </div>
  );
}
