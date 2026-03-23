// routes/attendance.js

const express = require('express');

module.exports = function (students, attendance) {
  const router = express.Router();

  // GET attendance for a date  →  /api/attendance/2025-03-16
  router.get('/:date', (req, res) => {
    const { date } = req.params;
    const record = attendance[date] || {};
    res.json({ success: true, date, data: record });
  });

  // POST mark attendance for a date
  // body: { records: { studentId: 'present'|'absent', ... } }
  router.post('/:date', (req, res) => {
    const { date } = req.params;
    const { records } = req.body;
    if (!records)
      return res.status(400).json({ success: false, message: 'records object required' });

    attendance[date] = { ...(attendance[date] || {}), ...records };
    res.json({ success: true, date, data: attendance[date] });
  });

  // GET report for one student  →  /api/attendance/report/3
  router.get('/report/:studentId', (req, res) => {
    const id = parseInt(req.params.studentId);
    const student = students.find(s => s.id === id);
    if (!student)
      return res.status(404).json({ success: false, message: 'Student not found' });

    let present = 0, absent = 0;
    const details = [];

    Object.entries(attendance).forEach(([date, rec]) => {
      const status = rec[id];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      if (status) details.push({ date, status });
    });

    const total = present + absent;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    details.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      student,
      stats: { present, absent, total, percentage },
      details,
    });
  });

  return router;
};
