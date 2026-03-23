// ============================================================
//  Attendance Tracker — app.js
// ============================================================

const API = '';   // same origin

// ── State ─────────────────────────────────────────────────────
let students   = [];
let attRecord  = {};  // { studentId: 'present'|'absent' }

// ── Date init ─────────────────────────────────────────────────
const dateInput = document.getElementById('dateInput');
dateInput.value = today();
dateInput.addEventListener('change', () => {
  loadAttendance();
});

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── API helpers ───────────────────────────────────────────────
async function apiFetch(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

// ── Tabs ──────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'report') populateReportDropdown();
  });
});

// ── Load students ─────────────────────────────────────────────
async function loadStudents() {
  const data = await apiFetch('/api/students');
  students = data.data || [];
  renderStudentManageList();
  renderAttendanceList();
}

// ── Load attendance for selected date ─────────────────────────
async function loadAttendance() {
  const date = dateInput.value;
  const data = await apiFetch(`/api/attendance/${date}`);
  attRecord  = data.data || {};
  renderAttendanceList();
}

// ── Render attendance marking tab ────────────────────────────
function renderAttendanceList() {
  const container = document.getElementById('attendanceList');
  if (!students.length) {
    container.innerHTML = '<p class="empty">No students yet. Add some in the Students tab.</p>';
    updateSummary(); return;
  }

  container.innerHTML = students.map(s => `
    <div class="student-row" data-id="${s.id}">
      <span class="roll-badge">${s.rollNo}</span>
      <span class="student-name">${esc(s.name)}</span>
      <div class="att-toggle">
        <button class="att-btn present ${attRecord[s.id] === 'present' ? 'active' : ''}"
          onclick="mark(${s.id},'present')">✓ Present</button>
        <button class="att-btn absent  ${attRecord[s.id] === 'absent'  ? 'active' : ''}"
          onclick="mark(${s.id},'absent')">✗ Absent</button>
      </div>
    </div>
  `).join('');

  updateSummary();
}

function mark(id, status) {
  attRecord[id] = status;
  renderAttendanceList();
}

function updateSummary() {
  const present  = Object.values(attRecord).filter(v => v === 'present').length;
  const absent   = Object.values(attRecord).filter(v => v === 'absent').length;
  const unmarked = students.length - present - absent;

  document.getElementById('presentCount').textContent = present;
  document.getElementById('absentCount').textContent  = absent;
  document.getElementById('unmarkedCount').textContent = Math.max(0, unmarked);
}

// ── Mark all ──────────────────────────────────────────────────
document.getElementById('markAllPresent').addEventListener('click', () => {
  students.forEach(s => attRecord[s.id] = 'present');
  renderAttendanceList();
});

document.getElementById('markAllAbsent').addEventListener('click', () => {
  students.forEach(s => attRecord[s.id] = 'absent');
  renderAttendanceList();
});

// ── Save attendance ───────────────────────────────────────────
document.getElementById('saveAttendance').addEventListener('click', async () => {
  const date = dateInput.value;
  if (!Object.keys(attRecord).length) { showToast('Nothing to save!'); return; }
  await apiFetch(`/api/attendance/${date}`, 'POST', { records: attRecord });
  showToast('✅ Attendance saved for ' + date);
});

// ── Manage students tab ───────────────────────────────────────
function renderStudentManageList() {
  const container = document.getElementById('studentList');
  if (!students.length) {
    container.innerHTML = '<p class="empty">No students added yet.</p>';
    return;
  }
  container.innerHTML = students.map(s => `
    <div class="student-row">
      <span class="roll-badge">${s.rollNo}</span>
      <span class="student-name">${esc(s.name)}</span>
      <button class="delete-btn" onclick="deleteStudent(${s.id})" title="Remove">✕</button>
    </div>
  `).join('');
}

document.getElementById('openAddStudent').addEventListener('click', () => {
  document.getElementById('addStudentForm').style.display = 'block';
  document.getElementById('newName').focus();
});

document.getElementById('cancelAdd').addEventListener('click', () => {
  document.getElementById('addStudentForm').style.display = 'none';
  document.getElementById('formError').textContent = '';
});

document.getElementById('saveStudent').addEventListener('click', async () => {
  const name   = document.getElementById('newName').value.trim();
  const rollNo = document.getElementById('newRoll').value.trim();
  const errEl  = document.getElementById('formError');

  if (!name || !rollNo) { errEl.textContent = 'Both fields are required.'; return; }

  const data = await apiFetch('/api/students', 'POST', { name, rollNo });
  if (!data.success) { errEl.textContent = data.message; return; }

  document.getElementById('newName').value  = '';
  document.getElementById('newRoll').value  = '';
  document.getElementById('addStudentForm').style.display = 'none';
  errEl.textContent = '';
  await loadStudents();
  showToast('✅ Student added!');
});

async function deleteStudent(id) {
  if (!confirm('Remove this student?')) return;
  await apiFetch(`/api/students/${id}`, 'DELETE');
  await loadStudents();
  showToast('🗑️ Student removed');
}

// ── Report tab ────────────────────────────────────────────────
function populateReportDropdown() {
  const sel = document.getElementById('reportStudent');
  sel.innerHTML = '<option value="">— Select Student —</option>' +
    students.map(s => `<option value="${s.id}">${s.rollNo} · ${esc(s.name)}</option>`).join('');
}

document.getElementById('reportStudent').addEventListener('change', async function () {
  const id = this.value;
  if (!id) { document.getElementById('reportContent').innerHTML = '<div class="report-empty">Select a student to see their report.</div>'; return; }
  const data = await apiFetch(`/api/attendance/report/${id}`);
  renderReport(data);
});

function renderReport(data) {
  const el = document.getElementById('reportContent');
  if (!data.success) { el.innerHTML = '<div class="report-empty">Error loading report.</div>'; return; }

  const { stats, details } = data;
  const pct   = stats.percentage;
  const fill  = pct >= 75 ? '' : pct >= 50 ? 'warn' : 'danger';

  const rows = details.length
    ? details.map(d => `
        <div class="detail-row">
          <span class="detail-date">${d.date}</span>
          <span class="status-chip ${d.status}">${d.status}</span>
        </div>`).join('')
    : '<div class="report-empty">No attendance records yet.</div>';

  el.innerHTML = `
    <div class="report-stats">
      <div class="stat-box green"><span class="num">${stats.present}</span><small>Present</small></div>
      <div class="stat-box red">  <span class="num">${stats.absent}</span><small>Absent</small></div>
      <div class="stat-box blue"> <span class="num">${stats.total}</span><small>Total Days</small></div>
    </div>
    <div class="percent-bar-wrap">
      <div class="percent-label">Attendance: <strong>${pct}%</strong>
        ${pct < 75 ? '<span style="color:#ef4444;font-size:0.8rem;margin-left:0.5rem">⚠ Below 75%</span>' : ''}
      </div>
      <div class="percent-bar">
        <div class="percent-fill ${fill}" style="width:${pct}%"></div>
      </div>
    </div>
    <div class="report-detail-title">Day-wise Records</div>
    ${rows}
  `;
}

// ── Health check ──────────────────────────────────────────────
async function checkHealth() {
  try {
    const data = await apiFetch('/health');
    const dot  = document.getElementById('dot');
    const txt  = document.getElementById('statusText');
    if (data.status === 'OK') {
      dot.className = 'dot online';
      txt.textContent = 'Server online';
    }
  } catch {
    document.getElementById('dot').className = 'dot offline';
    document.getElementById('statusText').textContent = 'Server offline';
  }
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Init ──────────────────────────────────────────────────────
checkHealth();
loadStudents().then(() => loadAttendance());
