const express = require("express");
const db = require("../db/database");
const router = express.Router();

router.get("/",(req,res)=>{
  res.json(db.prepare("SELECT * FROM announcements ORDER BY created_at DESC, id DESC").all());
});

router.post("/",(req,res)=>{
  const {title,message,audience="all"} = req.body;
  if (!title || !message) return res.status(400).json({error:"Title and message are required"});
  const result = db.prepare("INSERT INTO announcements(title,message,audience) VALUES(?,?,?)").run(title,message,audience);
  res.status(201).json(db.prepare("SELECT * FROM announcements WHERE id=?").get(result.lastInsertRowid));
});

module.exports = router;
