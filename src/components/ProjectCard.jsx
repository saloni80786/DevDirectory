import { Link } from 'react-router-dom';
import { Star, ArrowUpRight } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const statusClass = (s) => `status status--${s.toLowerCase().replace(/\s+/g, '-')}`;

export default function ProjectCard({ project, isFavorite, onToggleFavorite }) {
  return (
    <article className="card project-card">
      <div className="project-card__top">
        <span className="project-card__category">{project.category}</span>
        <span className={statusClass(project.status)}>{project.status}</span>
        <button
          type="button"
          className={`icon-btn star ${isFavorite ? 'star--on' : ''}`}
          onClick={() => onToggleFavorite(project.id)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Unsave ${project.name}` : `Save ${project.name}`}
        >
          <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3>
        <Link to={`/projects/${project.id}`} className="project-card__link">
          {project.name} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </h3>
      <p className="project-card__tagline">{project.tagline}</p>

      <ul className="chips">
        {project.tech.slice(0, 4).map((t) => <li key={t} className="chip">{t}</li>)}
        {project.tech.length > 4 && <li className="chip chip--more">+{project.tech.length - 4}</li>}
      </ul>

      <p className="project-card__foot">
        {project.ownerName} <span aria-hidden="true">&middot;</span> updated {formatDate(project.updatedAt)}
      </p>
    </article>
  );
}
