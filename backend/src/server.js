require('dotenv').config();if(process.env.NODE_ENV==='production'&&!process.env.JWT_SECRET)throw new Error('JWT_SECRET is required in production.');const express=require('express');const cors=require('cors');const path=require('path');const {initSchema}=require('./db/schema');const db=require('./db/database');
initSchema();

// Ensure every Class 1-9 always has learning resources available.
// This makes the learning pages resilient even if the database was created
// before the resource seed was added or only some classes were seeded.
const ensureResource = db.prepare(`
  INSERT INTO resources(class_level,subject,title,type,url,description)
  SELECT ?,?,?,?,?,?
  WHERE NOT EXISTS (
    SELECT 1 FROM resources
    WHERE class_level=? AND subject=? AND title=?
  )
`);
const defaultSubjects = [
  'Mathematics','Science','English','Marathi','Hindi','Social Science','Computer Basics'
];
for (let classLevel = 1; classLevel <= 9; classLevel++) {
  for (const subject of defaultSubjects) {
    const textbookTitle = `${subject} — Class ${classLevel} Textbook`;
    const videoTitle = `${subject} — Class ${classLevel} Video Lessons`;
    const textbookDescription = `Official textbook portal. Select Class ${classLevel} and the required subject.`;
    const videoDescription = `Free learning videos for Class ${classLevel}.`;
    const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} class ${classLevel} lessons for students`)}`;
    ensureResource.run(classLevel, subject, textbookTitle, 'textbook', 'https://ncert.nic.in/textbook.php', textbookDescription, classLevel, subject, textbookTitle);
    ensureResource.run(classLevel, subject, videoTitle, 'video', videoUrl, videoDescription, classLevel, subject, videoTitle);
  }
}

const app=express();app.use(cors());app.use(express.json());
app.get('/api/health',(req,res)=>res.json({ok:true,project:'AshaSetu',resources:db.prepare('SELECT COUNT(*) AS count FROM resources').get().count}));
app.use('/api/auth',require('./routes/auth'));app.use('/api/community',require('./routes/community'));app.use('/api/admin',require('./routes/admin'));app.use('/api/courses',require('./routes/courses'));app.use('/api/dashboard',require('./routes/dashboard'));
app.use(express.static(path.join(__dirname,'../../frontend')));app.use((req,res)=>res.sendFile(path.join(__dirname,'../../frontend/index.html')));
const port=Number(process.env.PORT)||3010;app.listen(port,()=>console.log(`AshaSetu running at http://localhost:${port}`));
