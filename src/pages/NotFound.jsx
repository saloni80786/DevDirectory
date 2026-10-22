import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="notfound">
      <p className="notfound__code" aria-hidden="true">404</p>
      <h1>This page does not exist</h1>
      <p className="muted">The address may be mistyped or the page may have moved.</p>
      <Link to="/" className="btn btn--primary">Back to home</Link>
    </div>
  );
}
