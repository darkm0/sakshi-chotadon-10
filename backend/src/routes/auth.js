const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'ashasetu-development-secret';

function cleanName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function validClass(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 9 ? n : null;
}

router.post('/register', async (req, res) => {
  try {
    const fullName = cleanName(req.body.fullName);
    const email = String(req.body.email || '').trim().toLowerCase() || null;
    const password = String(req.body.password || '');
    const classLevel = validClass(req.body.classLevel);

    if (!fullName || password.length < 6 || !classLevel) {
      return res.status(400).json({
        message: 'Enter a full name, a password of at least 6 characters, and a class from 1 to 9.'
      });
    }

    const duplicate = db.prepare(
      `SELECT id FROM users
       WHERE role='student' AND class_level=? AND lower(trim(full_name))=lower(?)`
    ).get(classLevel, fullName);

    if (duplicate) {
      return res.status(409).json({
        message: 'A student account with this name already exists in this class. Please use the existing account or choose a different name.'
      });
    }

    if (email) {
      const emailTaken = db.prepare('SELECT id FROM users WHERE lower(email)=lower(?)').get(email);
      if (emailTaken) return res.status(409).json({ message: 'That email address is already registered.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const info = db.prepare(
      `INSERT INTO users(full_name,email,password_hash,role,class_level,learner_type)
       VALUES(?,?,?,?,?,?)`
    ).run(fullName, email, hash, 'student', classLevel, 'student');

    res.status(201).json({
      id: info.lastInsertRowid,
      message: 'Account created successfully. You can now log in.'
    });
  } catch (e) {
    res.status(500).json({ message: 'Could not create the student account. ' + e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const loginName = cleanName(req.body.fullName);
    const password = String(req.body.password || '');
    const selectedClass = validClass(req.body.classLevel);

    if (!loginName || !password || !selectedClass) {
      return res.status(400).json({ message: 'Enter your full name, password and class.' });
    }

    const user = db.prepare(
      `SELECT id, full_name, email, password_hash, role, class_level, learner_type, active
       FROM users
       WHERE role='student' AND active=1
       AND lower(trim(full_name))=lower(trim(?))
       LIMIT 1`
    ).get(loginName);

    if (!user) return res.status(401).json({ message: 'No active student account was found for that full name.' });

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) return res.status(401).json({ message: 'Incorrect password.' });

    if (Number(user.class_level) !== selectedClass) {
      return res.status(401).json({
        message: `This account is registered for Class ${user.class_level}. Please select Class ${user.class_level}.`
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        classLevel: user.class_level,
        learnerType: user.learner_type
      }
    });
  } catch (e) {
    res.status(500).json({ message: 'Student login failed. ' + e.message });
  }
});

router.post('/admin-login', async (req, res) => {
  try {
    const adminId = cleanName(req.body.adminId).toLowerCase();
    const password = String(req.body.password || '');

    if (!adminId || !password) return res.status(400).json({ message: 'Enter the administrator ID and password.' });

    const admin = db.prepare(
      `SELECT * FROM users
       WHERE role='admin' AND active=1
       AND (lower(trim(email))=? OR lower(trim(full_name))=?)
       LIMIT 1`
    ).get(adminId, adminId);

    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ message: 'Invalid administrator credentials.' });
    }

    const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: admin.id, fullName: admin.full_name, role: 'admin' } });
  } catch (e) {
    res.status(500).json({ message: 'Administrator login failed. ' + e.message });
  }
});

module.exports = router;
