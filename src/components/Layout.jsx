import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CommandPalette from './CommandPalette';
import ErrorBoundary from './ErrorBoundary';
import SkeletonLoader from './SkeletonLoader';

export default function Layout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <main id="main" className="page">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<SkeletonLoader variant="cards" count={3} />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
