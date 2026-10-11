const router=require('express').Router();
const db=require('../db/database');

router.get('/',(req,res)=>res.json(db.prepare('SELECT * FROM resources ORDER BY class_level,subject,title').all()));

router.get('/:classLevel',(req,res)=>{
  const classLevel=Number(req.params.classLevel);
  if(!Number.isInteger(classLevel)||classLevel<1||classLevel>9){
    return res.status(400).json({message:'Class must be a number from 1 to 9.'});
  }
  const rows=db.prepare('SELECT * FROM resources WHERE class_level=? ORDER BY subject,title').all(classLevel);
  res.json(rows);
});

module.exports=router;
