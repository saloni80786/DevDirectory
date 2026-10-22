const CATEGORIES = ['Web App', 'Mobile', 'API', 'Tool', 'Data', 'Design', 'Other'];
const STATUSES = ['Live', 'In progress', 'Prototype', 'Archived'];

const isUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export function validateProject(body = {}) {
  const errors = {};
  const str = (v) => (typeof v === 'string' ? v.trim() : '');

  const name = str(body.name);
  const tagline = str(body.tagline);
  const description = str(body.description);
  const repoUrl = str(body.repoUrl);
  const liveUrl = str(body.liveUrl);
  const tech = Array.isArray(body.tech)
    ? [...new Set(body.tech.map(str).filter(Boolean))].slice(0, 12)
    : [];

  if (name.length < 3 || name.length > 60) errors.name = 'Name must be 3 to 60 characters.';
  if (tagline.length < 10 || tagline.length > 120) errors.tagline = 'Tagline must be 10 to 120 characters.';
  if (description.length < 30 || description.length > 1000) errors.description = 'Description must be 30 to 1000 characters.';
  if (!CATEGORIES.includes(body.category)) errors.category = 'Pick a valid category.';
  if (!STATUSES.includes(body.status)) errors.status = 'Pick a valid status.';
  if (repoUrl && !isUrl(repoUrl)) errors.repoUrl = 'Repository link must start with http:// or https://';
  if (liveUrl && !isUrl(liveUrl)) errors.liveUrl = 'Live link must start with http:// or https://';
  if (tech.length === 0) errors.tech = 'Add at least one technology.';
  if (!Number(body.ownerId)) errors.ownerId = 'Choose an owner.';

  return {
    errors,
    value: {
      name, tagline, description, tech, repoUrl, liveUrl,
      category: body.category,
      status: body.status,
      ownerId: Number(body.ownerId),
      ownerName: str(body.ownerName),
      featured: Boolean(body.featured),
    },
  };
}
