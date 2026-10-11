const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/learnbridge.db');
for (const suffix of ['', '-wal', '-shm']) {
  const p = dbPath + suffix;
  if (fs.existsSync(p)) fs.rmSync(p, {force:true});
}
console.log('AshaSetu database reset. Run: npm run seed');
