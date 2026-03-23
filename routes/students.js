// routes/students.js

const express = require('express');

module.exports = function (students, getNextId) {
  const router = express.Router();

  // GET all students
  router.get('/', (req, res) => {
    res.json({ success: true, data: students });
  });

  // POST add student
  router.post('/', (req, res) => {
    const { name, rollNo } = req.body;
    if (!name || !rollNo)
      return res.status(400).json({ success: false, message: 'Name and Roll No required' });

    const exists = students.find(s => s.rollNo === rollNo.trim());
    if (exists)
      return res.status(400).json({ success: false, message: 'Roll No already exists' });

    const student = { id: getNextId(), name: name.trim(), rollNo: rollNo.trim() };
    students.push(student);
    res.status(201).json({ success: true, data: student });
  });

  // DELETE student
  router.delete('/:id', (req, res) => {
    const idx = students.findIndex(s => s.id === parseInt(req.params.id));
    if (idx === -1)
      return res.status(404).json({ success: false, message: 'Student not found' });

    const removed = students.splice(idx, 1)[0];
    res.json({ success: true, data: removed });
  });

  return router;
};
