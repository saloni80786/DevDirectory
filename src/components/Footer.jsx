import { useEffect, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { getMode, pingBackend, subscribeMode } from '../services/projectService';

const LABELS = {
  online: 'Backend connected',
  offline: 'Offline mode: projects are saved in this browser',
  checking: 'Checking backend...',
};

export default function Footer() {
  const mode = useSyncExternalStore(subscribeMode, getMode);
  useEffect(() => { pingBackend(); }, []);

  return (
    <footer className="footer">
      <div className="footer__inner">
        <p>DevDirectory. Built for distributed engineering teams.</p>
        <nav aria-label="Footer">
          <Link to="/users">Developers</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/add-post">Publish</Link>
        </nav>
        <p className={`pulse pulse--${mode}`} role="status">
          <span className="pulse__dot" aria-hidden="true" /> {LABELS[mode]}
        </p>
      </div>
    </footer>
  );
}
