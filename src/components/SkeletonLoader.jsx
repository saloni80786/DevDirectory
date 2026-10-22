/* Non-blocking placeholders that keep the layout stable while requests are pending. */
export default function SkeletonLoader({ variant = 'cards', count = 6 }) {
  if (variant === 'profile') {
    return (
      <div className="profile-layout" aria-busy="true" aria-label="Loading profile">
        <div className="skeleton skeleton--panel" />
        <div className="stack">
          <div className="skeleton skeleton--line skeleton--wide" />
          <div className="skeleton skeleton--block" />
          <div className="skeleton skeleton--block" />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className="stack" aria-busy="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton skeleton--line" style={{ width: `${90 - i * 12}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton--circle" />
          <div className="skeleton skeleton--line" style={{ width: '60%' }} />
          <div className="skeleton skeleton--line" style={{ width: '40%' }} />
          <div className="skeleton skeleton--line skeleton--thin" />
        </div>
      ))}
    </div>
  );
}
