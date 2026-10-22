// JSONPlaceholder ships Western names. DevDirectory maps every API user to an Indian engineer profile
// by id, so the portal feels local while still using the required API. The original API name and company
// are kept (apiName / apiCompany) so searching "Leanne" still finds the right card.
const PROFILES = {
  1: { name: 'Aarav Sharma', username: 'aarav.sharma', role: 'Senior Frontend Engineer', company: 'Nirmaan Labs', city: 'Bengaluru', state: 'Karnataka', since: 2018, skills: ['React', 'TypeScript', 'Accessibility', 'Vite'], bio: 'Leads the design system and mentors new frontend hires. Cares a lot about keyboard navigation and fast first paint.' },
  2: { name: 'Priya Iyer', username: 'priya.iyer', role: 'Backend Engineer', company: 'Vayu Systems', city: 'Chennai', state: 'Tamil Nadu', since: 2019, skills: ['Node.js', 'PostgreSQL', 'REST', 'Redis'], bio: 'Builds the services behind the billing and reporting products. Writes the runbooks everyone actually reads.' },
  3: { name: 'Rohan Mehta', username: 'rohan.mehta', role: 'DevOps Lead', company: 'Kaveri Cloud', city: 'Pune', state: 'Maharashtra', since: 2016, skills: ['Kubernetes', 'Terraform', 'CI/CD', 'Observability'], bio: 'Owns the deployment pipeline and on-call rotation. Cut release time from two hours to eleven minutes.' },
  4: { name: 'Ananya Reddy', username: 'ananya.reddy', role: 'Data Engineer', company: 'Sutra Digital', city: 'Hyderabad', state: 'Telangana', since: 2020, skills: ['Python', 'Airflow', 'dbt', 'BigQuery'], bio: 'Designs the pipelines that feed analytics across the company and keeps the data catalogue honest.' },
  5: { name: 'Vikram Singh Rathore', username: 'vikram.rathore', role: 'Engineering Manager', company: 'Chakra Works', city: 'Jaipur', state: 'Rajasthan', since: 2014, skills: ['Architecture', 'Hiring', 'Roadmapping', 'Java'], bio: 'Manages three squads across web and platform. Runs the monthly engineering review.' },
  6: { name: 'Kavya Nair', username: 'kavya.nair', role: 'UI Engineer', company: 'Nirmaan Labs', city: 'Kochi', state: 'Kerala', since: 2021, skills: ['CSS', 'Figma', 'Motion', 'React'], bio: 'Turns design files into components that behave. Maintains the shared icon and token packages.' },
  7: { name: 'Arjun Kapoor', username: 'arjun.kapoor', role: 'Mobile Engineer', company: 'Vayu Systems', city: 'Mumbai', state: 'Maharashtra', since: 2017, skills: ['React Native', 'Kotlin', 'Swift', 'Offline sync'], bio: 'Ships the field-agent app used on patchy networks across tier-2 cities.' },
  8: { name: 'Sneha Patil', username: 'sneha.patil', role: 'QA Automation Lead', company: 'Kaveri Cloud', city: 'Nashik', state: 'Maharashtra', since: 2018, skills: ['Playwright', 'Cypress', 'Test strategy', 'k6'], bio: 'Builds the end-to-end suite that gates every release and teaches teams to write testable code.' },
  9: { name: 'Ishaan Banerjee', username: 'ishaan.banerjee', role: 'Security Engineer', company: 'Sutra Digital', city: 'Kolkata', state: 'West Bengal', since: 2019, skills: ['AppSec', 'OAuth', 'Threat modelling', 'Go'], bio: 'Reviews every new service for auth and data-handling risks and runs the quarterly security drills.' },
  10: { name: 'Diya Gupta', username: 'diya.gupta', role: 'Cloud Architect', company: 'Chakra Works', city: 'Gurugram', state: 'Haryana', since: 2015, skills: ['AWS', 'Serverless', 'Cost control', 'Networking'], bio: 'Designs multi-region platforms and keeps the cloud bill predictable.' },
};

export function enrichUser(raw) {
  const p = PROFILES[raw.id];
  const apiName = raw.name;
  const apiCompany = raw.company?.name ?? '';

  if (!p) {
    return { id: raw.id, name: raw.name, apiName, username: raw.username, email: raw.email, phone: raw.phone, company: apiCompany, apiCompany, role: 'Software Engineer', city: raw.address?.city ?? '', state: '', since: 2020, experience: 5, skills: [], bio: '' };
  }

  const first = p.name.split(' ')[0].toLowerCase();
  const domain = `${p.company.toLowerCase().replace(/\s+/g, '')}.in`;
  return {
    id: raw.id,
    ...p,
    apiName,
    apiCompany,
    email: `${first}@${domain}`,
    phone: `+91 90000 ${10000 + raw.id}`,
    experience: new Date().getFullYear() - p.since,
  };
}

export const initialsOf = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
