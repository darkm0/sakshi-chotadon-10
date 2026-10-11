const express = require("express");
const db = require("../db/database");
const router = express.Router();

router.post("/",(req,res)=>{
  const {userId,courseId} = req.body;
  if (!userId || !courseId) return res.status(400).json({error:"userId and courseId are required"});
  try {
    const result = db.prepare("INSERT INTO enrollments(user_id,course_id,progress) VALUES(?,?,0)").run(userId,courseId);
    res.status(201).json({id:result.lastInsertRowid,message:"Enrollment created"});
  } catch {
    res.status(409).json({error:"User is already enrolled or the referenced record does not exist"});
  }
});

router.post("/progress",(req,res)=>{
  const {userId,courseId,progress} = req.body;
  const value = Math.max(0,Math.min(100,Number(progress)||0));
  const result = db.prepare("UPDATE enrollments SET progress=? WHERE user_id=? AND course_id=?").run(value,userId,courseId);
  if (!result.changes) return res.status(404).json({error:"Enrollment not found"});
  res.json({message:"Progress updated",progress:value});
});

module.exports = router;
