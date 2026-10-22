import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error('Render error:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="empty">
        <h3>This page hit an unexpected problem</h3>
        <p>The rest of the portal still works. Reload the page or head back home.</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.assign('/')}>
          Back to home
        </button>
      </div>
    );
  }
}
