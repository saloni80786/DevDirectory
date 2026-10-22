export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty">
      {Icon && <Icon size={32} aria-hidden="true" />}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
