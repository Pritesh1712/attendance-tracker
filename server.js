// ============================================================
//  Student Attendance Tracker — server.js
// ============================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-Memory Data ────────────────────────────────────────────
let students = [
  { id: 1, name: 'Aarav Shah',    rollNo: '101' },
  { id: 2, name: 'Priya Mehta',   rollNo: '102' },
  { id: 3, name: 'Rohan Verma',   rollNo: '103' },
  { id: 4, name: 'Sneha Pillai',  rollNo: '104' },
];

// attendance: { [date]: { [studentId]: 'present' | 'absent' } }
let attendance = {};

let nextId = 5;

// ── Student Routes ────────────────────────────────────────────
const studentRoutes    = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');

app.use('/api/students',   studentRoutes(students,   () => nextId++));
app.use('/api/attendance', attendanceRoutes(students, attendance));

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime().toFixed(1) + 's' });
});

// ── Fallback ──────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║  📋 Attendance Tracker Running       ║
  ║  Port : ${PORT}                         ║
  ╚══════════════════════════════════════╝

  Endpoints:
    GET    /api/students
    POST   /api/students
    DELETE /api/students/:id

    GET    /api/attendance/:date
    POST   /api/attendance/:date
    GET    /api/attendance/report/:studentId
  `);
});
