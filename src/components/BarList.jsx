export default function BarList({ items, emptyText = 'No data yet.' }) {
  if (!items.length) return <p className="muted">{emptyText}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="bars">
      {items.map((item) => (
        <li key={item.label}>
          <span className="bars__label">{item.label}</span>
          <span className="bars__track">
            <span className="bars__fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </span>
          <span className="bars__value">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
