let BASE = 'http://localhost:3000';

// ─── Config ───────────────────────────────────────────────
function setBase() {
  BASE = document.getElementById('baseUrl').value.replace(/\/$/, '');
  document.getElementById('baseUrlDisplay').textContent = 'Base URL: ' + BASE;
  showToast('Base URL updated', 'success');
}

// ─── Core request helper ───────────────────────────────────
async function request(method, path, body, btn) {
  if (btn) {
    btn.classList.add('loading');
    btn.dataset.orig = btn.innerHTML;
    btn.innerHTML = '';
  }

  const start = Date.now();

  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(BASE + path, opts);
    const elapsed = Date.now() - start;

    let data;
    try { data = await res.json(); } catch { data = {}; }

    renderResponse(res.status, data, elapsed);
    return { ok: res.ok, status: res.status, data };

  } catch (err) {
    renderResponse(0, {
      error: err.message + '\n\nMake sure your backend is running on ' + BASE
    }, Date.now() - start);
    return { ok: false, status: 0 };

  } finally {
    if (btn) {
      btn.classList.remove('loading');
      btn.innerHTML = btn.dataset.orig;
    }
  }
}

// ─── Render response panel ─────────────────────────────────
function renderResponse(status, data, ms) {
  const box  = document.getElementById('responseBox');
  const dot  = document.getElementById('statusDot');
  const code = document.getElementById('statusCode');
  const time = document.getElementById('responseTime');

  box.textContent = JSON.stringify(data, null, 2);
  time.textContent = ms + ' ms';

  const isOk = status >= 200 && status < 300;
  dot.className  = 'status-dot ' + (isOk ? 'success' : 'error');
  code.style.display = 'inline-block';
  code.textContent   = status || 'ERR';
  code.className = 'status-code ' + (isOk ? 'sc-2xx' : status >= 400 ? 'sc-4xx' : 'sc-5xx');
}

// ─── Render students table ─────────────────────────────────
function renderTable(students) {
  const tbody = document.getElementById('studentsTable');
  const badge = document.getElementById('countBadge');

  if (!Array.isArray(students) || students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">
      <div class="icon">😕</div>No students found
    </td></tr>`;
    badge.textContent = '0 students';
    return;
  }

  badge.textContent = students.length + ' student' + (students.length !== 1 ? 's' : '');
  tbody.innerHTML = students.map(s => {
    const g = s.grade || '?';
    return `<tr style="animation:fadeUp .3s ease both;">
      <td class="id-cell">#${s.id}</td>
      <td class="name-cell">${s.name || '—'}</td>
      <td>${s.age || '—'}</td>
      <td><span class="grade-pill grade-${g}">${g}</span></td>
    </tr>`;
  }).join('');
}

// ─── Refresh table silently ────────────────────────────────
async function refreshTable() {
  const res = await fetch(BASE + '/students').catch(() => null);
  if (res && res.ok) {
    const data = await res.json();
    renderTable(data);
  }
}

// ─── API actions ───────────────────────────────────────────
async function getAllStudents(btn) {
  const res = await request('GET', '/students', null, btn);
  if (res.ok && Array.isArray(res.data)) {
    renderTable(res.data);
    showToast(`Loaded ${res.data.length} students`, 'success');
  }
}

async function getStudentById(btn) {
  const id = document.getElementById('getById_id').value.trim();
  if (!id) { showToast('Please enter a student ID', 'error'); return; }

  const res = await request('GET', `/students/${id}`, null, btn);
  if (res.ok) {
    renderTable([res.data]);
    showToast(`Found: ${res.data.name}`, 'success');
  } else {
    renderTable([]);
    showToast('Student not found', 'error');
  }
}

async function createStudent(btn) {
  const name  = document.getElementById('post_name').value.trim();
  const age   = document.getElementById('post_age').value.trim();
  const grade = document.getElementById('post_grade').value;

  if (!name || !age || !grade) { showToast('Please fill in all fields', 'error'); return; }

  const res = await request('POST', '/students', { name, age: Number(age), grade }, btn);
  if (res.ok) {
    showToast('Student added! Refreshing list…', 'success');
    document.getElementById('post_name').value  = '';
    document.getElementById('post_age').value   = '';
    document.getElementById('post_grade').value = '';
    await refreshTable();
  } else {
    showToast('Failed to create student', 'error');
  }
}

async function updateStudent(btn) {
  const id    = document.getElementById('put_id').value.trim();
  const name  = document.getElementById('put_name').value.trim();
  const age   = document.getElementById('put_age').value.trim();
  const grade = document.getElementById('put_grade').value;

  if (!id || !name || !age || !grade) { showToast('Please fill in all fields', 'error'); return; }

  const res = await request('PUT', `/students/${id}`, { name, age: Number(age), grade }, btn);
  if (res.ok) {
    showToast('Student updated!', 'success');
    await refreshTable();
  } else {
    showToast('Update failed — student not found?', 'error');
  }
}

async function deleteStudent(btn) {
  const id = document.getElementById('delete_id').value.trim();
  if (!id) { showToast('Please enter a student ID', 'error'); return; }
  if (!confirm(`Delete student #${id}? This cannot be undone.`)) return;

  const res = await request('DELETE', `/students/${id}`, null, btn);
  if (res.ok) {
    showToast(`Student #${id} deleted`, 'success');
    await refreshTable();
  } else {
    showToast('Delete failed — student not found?', 'error');
  }
}

// ─── Toast ────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  t.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 2800);
}
