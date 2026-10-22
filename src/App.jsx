
import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Route-level code splitting
const Home = lazy(() => import('./pages/Home'));
const UserDirectory = lazy(() => import('./pages/UserDirectory'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AddPost = lazy(() => import('./pages/AddPost'));
const Login = lazy(() => import('./pages/Login'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const AddProject = lazy(() => import('./pages/AddProject'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Track page visits only in development.
// Tracking failure must not prevent the app from rendering.
function useTracker() {
  const location = useLocation();

  useEffect(() => {
    // GitHub Pages does not provide the local development backend.
    if (import.meta.env.PROD) return;

    const controller = new AbortController();

    async function trackPageHit() {
      try {
        await fetch('http://localhost:5000/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: localStorage.getItem('userId') || 'guest_user',
            action: 'PAGE_VIEW',
            metadata: {
              path: location.pathname,
            },
          }),
          signal: controller.signal,
        });
      } catch (error) {
        // Ignore tracking errors; the website should remain usable.
        if (error.name !== 'AbortError') {
          console.warn('Page tracking unavailable:', error.message);
        }
      }
    }

    trackPageHit();

    return () => controller.abort();
  }, [location.pathname]);
}

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader-spinner" aria-hidden="true" />
      <p>Loading DevDirectory...</p>
    </div>
  );
}

export default function App() {
  useTracker();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<UserDirectory />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/add-post"
            element={
              <ProtectedRoute>
                <AddPost />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-project"
            element={
              <ProtectedRoute>
                <AddProject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id/edit"
            element={
              <ProtectedRoute>
                <AddProject />
              </ProtectedRoute>
            }
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
