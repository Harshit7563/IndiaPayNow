import db, { initSchema } from './database.js';

initSchema();
const count = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (count === 0) {
  console.log('Empty database — seeding demo data…');
  await import('./seed.js');
} else {
  console.log(`Database ready (${count} users)`);
}
