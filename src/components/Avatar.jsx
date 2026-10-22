import { initialsOf } from '../utils/indianProfiles';

export default function Avatar({ name, size = 'md', highlighted = false }) {
  return (
    <span className={`avatar avatar--${size} ${highlighted ? 'avatar--ring' : ''}`} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}
