import { lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ChatDrawer from './components/ChatDrawer';

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

// Track page visits only during local development.
function useTracker() {
  const location = useLocation();

  useEffect(() => {
    // GitHub Pages has no local backend.
    if (import.meta.env.PROD) return;

    const trackPageHit = async () => {
      try {
        await fetch('http://localhost:5000/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: localStorage.getItem('userId') || 'guest_user',
            action: 'PAGE_VIEW',
            metadata: { path: location.pathname },
          }),
        });
      } catch (err) {
        console.error('Tracking failed:', err);
      }
    };

    trackPageHit();
  }, [location.pathname]);
}

export default function App() {
  useTracker();

  const currentUserId = localStorage.getItem('userId') || 'user_123';
  const selectedDevId = 'dev_456';

  return (
    <>
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

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* Global Chat Drawer */}
      <ChatDrawer
        currentUserId={currentUserId}
        selectedDevId={selectedDevId}
        selectedDevName="Developer"
      />
    </>
  );
}