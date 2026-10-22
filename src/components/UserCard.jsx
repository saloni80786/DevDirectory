import { Link } from 'react-router-dom';
import { Star, MapPin, Building2 } from 'lucide-react';
import Avatar from './Avatar';

/* Presentation only: data and handlers arrive through props. */
export default function UserCard({ user, isFavorite, onToggleFavorite, view = 'grid' }) {
  return (
    <article className={`card user-card user-card--${view}`}>
      <div className="user-card__head">
        <Avatar name={user.name} size="lg" highlighted={isFavorite} />
        <div className="user-card__id">
          <h3>{user.name}</h3>
          <p>{user.role}</p>
        </div>
        <button
          type="button"
          className={`icon-btn star ${isFavorite ? 'star--on' : ''}`}
          onClick={() => onToggleFavorite(user.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${user.name} from saved developers` : `Save ${user.name}`}
        >
          <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <ul className="meta-list">
        <li><Building2 size={15} aria-hidden="true" /> {user.company}</li>
        <li><MapPin size={15} aria-hidden="true" /> {user.city}{user.state ? `, ${user.state}` : ''}</li>
      </ul>

      {user.skills.length > 0 && (
        <ul className="chips">
          {user.skills.slice(0, 3).map((s) => <li key={s} className="chip">{s}</li>)}
        </ul>
      )}

      <Link to={`/users/${user.id}`} className="btn btn--ghost btn--block">View profile</Link>
    </article>
  );
}
