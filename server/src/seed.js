// First-run data. The two starter projects mirror the author's own work: a news frontend and a todo app.
const now = new Date().toISOString();

export const seedProjects = [
  {
    id: 'seed-newslens',
    name: 'NewsLens',
    tagline: 'A fast news reader with category tabs, search and bookmarks.',
    description:
      'Frontend news application that pulls headlines from a public news API. Includes category tabs, instant search, a bookmarks list and a distraction-free reading mode. Edit this entry to add your own repository and live links.',
    category: 'Web App',
    status: 'Live',
    tech: ['React', 'Axios', 'REST API', 'CSS'],
    repoUrl: '',
    liveUrl: '',
    ownerId: 1,
    ownerName: 'Aarav Sharma',
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'seed-taskflow',
    name: 'TaskFlow',
    tagline: 'Todo manager with filters, priorities and saved state.',
    description:
      'A todo application with add, edit, complete and delete actions, filters for all, active and done, and persistence in localStorage. Edit this entry to add your own repository and live links.',
    category: 'Tool',
    status: 'Live',
    tech: ['React', 'Context API', 'localStorage'],
    repoUrl: '',
    liveUrl: '',
    ownerId: 2,
    ownerName: 'Priya Iyer',
    featured: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'seed-devdirectory',
    name: 'DevDirectory',
    tagline: 'The engineering portal you are looking at right now.',
    description:
      'Directory of engineers, bulletin publishing and this project vault. React 18 with React Router 6 on the front, an Express API with JWT auth and file storage behind it, and the JSONPlaceholder API for developer data.',
    category: 'Web App',
    status: 'In progress',
    tech: ['React', 'React Router', 'Axios', 'Express', 'JWT'],
    repoUrl: '',
    liveUrl: '',
    ownerId: 5,
    ownerName: 'Vikram Singh Rathore',
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
];
