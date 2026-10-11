const bcrypt = require('bcryptjs');
const db = require('./database');
const { initSchema } = require('./schema');

initSchema();

// Create only the real administrator. No demo student accounts are created.
// Production credentials must be configured as ADMIN_ID and ADMIN_PASSWORD environment variables.
const isProduction = process.env.NODE_ENV === 'production';
const adminId = String(process.env.ADMIN_ID || (isProduction ? '' : 'sakshi')).trim();
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'sakshi123');
if (!adminId || !adminPassword) {
  throw new Error('Set ADMIN_ID and ADMIN_PASSWORD in the deployment environment before seeding production.');
}
if (isProduction && adminPassword.length < 12) {
  throw new Error('In production, ADMIN_PASSWORD must be at least 12 characters long.');
}
const adminHash = bcrypt.hashSync(adminPassword, 10);

db.prepare(`
  INSERT INTO users(id, full_name, email, password_hash, role, learner_type, active)
  VALUES(1, ?, ?, ?, 'admin', 'administrator', 1)
  ON CONFLICT(id) DO UPDATE SET
    full_name=excluded.full_name,
    email=excluded.email,
    password_hash=excluded.password_hash,
    role='admin',
    learner_type='administrator',
    active=1
`).run('Sakshi Nitin Bhoir', adminId, adminHash);

// No demo student is created. Students must register their own accounts.
const subjects = ['Mathematics','Science','English','Marathi','Hindi','Social Science','Computer Basics'];
const insert = db.prepare(`
  INSERT INTO resources(class_level,subject,title,type,url,description)
  SELECT ?,?,?,?,?,?
  WHERE NOT EXISTS (
    SELECT 1 FROM resources WHERE class_level=? AND subject=? AND title=?
  )
`);

for (let c = 1; c <= 9; c++) {
  for (const s of subjects) {
    const textbookTitle = `${s} — Class ${c} Textbook`;
    const videoTitle = `${s} — Class ${c} Video Lessons`;
    insert.run(c,s,textbookTitle,'textbook','https://ncert.nic.in/textbook.php',`Official textbook portal. Select Class ${c} and the required subject.`,c,s,textbookTitle);
    insert.run(c,s,videoTitle,'video',`https://www.youtube.com/results?search_query=${encodeURIComponent(`${s} class ${c} lessons for students`)}`,`Free learning videos for Class ${c}.`,c,s,videoTitle);
  }
}

console.log('');
console.log('==============================================');
console.log('AshaSetu database seeded successfully.');
console.log('==============================================');
console.log('Admin ID configured from environment/local defaults.');
console.log('Password not printed for safety.');
console.log('No demo student account was created.');
console.log('==============================================');
