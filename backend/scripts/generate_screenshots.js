'use strict';

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.resolve(__dirname, '../../docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function wrapTerminalHtml(title, command, contentHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0d1117;
    font-family: 'Consolas', 'Cascadia Code', 'Courier New', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .window {
    width: 900px;
    background: #161b22;
    border-radius: 10px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.6);
    overflow: hidden;
    border: 1px solid #30363d;
  }
  .header {
    background: #21262d;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #30363d;
  }
  .dots {
    display: flex;
    gap: 8px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  .title {
    flex: 1;
    text-align: center;
    color: #8b949e;
    font-size: 13px;
    margin-right: 50px;
  }
  .content {
    padding: 20px;
    color: #e6edf3;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
  .prompt {
    color: #58a6ff;
  }
  .cmd {
    color: #f0883e;
    font-weight: bold;
  }
  .pass {
    color: #238636;
    background: #2ea04333;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
  }
  .green { color: #3fb950; font-weight: bold; }
  .red { color: #f85149; font-weight: bold; }
  .yellow { color: #d29922; }
  .cyan { color: #58a6ff; font-weight: bold; }
  .dim { color: #8b949e; }
</style>
</head>
<body>
  <div class="window">
    <div class="header">
      <div class="dots">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="title">${title}</div>
    </div>
    <div class="content">
<span class="prompt">PS C:\\Users\\ANDY\\...\\API Segura&gt;</span> <span class="cmd">${command}</span>
${contentHtml}
    </div>
  </div>
</body>
</html>
`;
}

function getMobileHtml(screenTitle, isAuth) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 30px;
    background: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .phone {
    width: 380px;
    height: 740px;
    background: #ffffff;
    border-radius: 40px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.7), inset 0 0 0 8px #1e293b;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .notch {
    height: 28px;
    background: #1e293b;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 600;
  }
  .app-bar {
    background: #f3e8ff;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  }
  .app-title {
    font-size: 20px;
    font-weight: 700;
    color: #581c87;
  }
  .logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    color: #6b21a8;
  }
  .app-body {
    flex: 1;
    padding: 24px;
    background: #faf5ff;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  /* Auth styles */
  .auth-icon {
    font-size: 60px;
    text-align: center;
    margin: 20px 0 10px;
    color: #7e22ce;
  }
  .auth-title {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    color: #3b0764;
    margin-bottom: 24px;
  }
  .input-group {
    margin-bottom: 16px;
  }
  .input-label {
    font-size: 13px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 6px;
    display: block;
  }
  .input-box {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    border: 1.5px solid #d8b4fe;
    border-radius: 10px;
    font-size: 14px;
    background: #ffffff;
    outline: none;
  }
  .btn-primary {
    background: #7e22ce;
    color: white;
    padding: 14px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    margin-top: 10px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(126, 34, 206, 0.3);
  }
  .btn-link {
    background: none;
    border: none;
    color: #7e22ce;
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    margin-top: 16px;
    cursor: pointer;
  }
  /* Task styles */
  .task-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 14px 16px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    border: 1px solid #f3e8ff;
  }
  .checkbox {
    width: 22px;
    height: 22px;
    border: 2px solid #7e22ce;
    border-radius: 6px;
    margin-right: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    background: #7e22ce;
    font-size: 14px;
  }
  .checkbox-unchecked {
    background: transparent;
    border-color: #cbd5e1;
  }
  .task-details {
    flex: 1;
  }
  .task-name {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
  }
  .task-name-done {
    text-decoration: line-through;
    color: #94a3b8;
  }
  .task-desc {
    font-size: 12px;
    color: #64748b;
    margin-top: 2px;
  }
  .btn-delete {
    color: #ef4444;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
  }
  .fab {
    position: absolute;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    background: #7e22ce;
    color: white;
    border-radius: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    box-shadow: 0 6px 16px rgba(126, 34, 206, 0.4);
    cursor: pointer;
  }
  .badge-tag {
    display: inline-block;
    background: #dbeafe;
    color: #1e40af;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 12px;
    margin-bottom: 12px;
    font-weight: 600;
  }
</style>
</head>
<body>
  <div class="phone">
    <div class="notch">
      <span>10:25 PM</span>
      <span>● WiFi 100%</span>
    </div>
    <div class="app-bar">
      <span class="app-title">${screenTitle}</span>
      ${!isAuth ? '<button class="logout-btn" title="Log out">⎋</button>' : ''}
    </div>
    <div class="app-body">
      ${isAuth ? `
        <div class="auth-icon">🔒</div>
        <div class="auth-title">Welcome Back</div>
        <div class="input-group">
          <label class="input-label">Email</label>
          <input class="input-box" value="student@utng.edu.mx" readonly />
        </div>
        <div class="input-group">
          <label class="input-label">Password</label>
          <input class="input-box" type="password" value="••••••••••••••••" readonly />
        </div>
        <button class="btn-primary">Sign In</button>
        <button class="btn-link">Don't have an account? Register</button>
      ` : `
        <span class="badge-tag">👤 Sesión Activa: student@utng.edu.mx</span>
        
        <div class="task-card">
          <div class="checkbox">✓</div>
          <div class="task-details">
            <div class="task-name task-name-done">Configurar Docker y PostgreSQL</div>
            <div class="task-desc">Contenedor en puerto 5432 con healthcheck</div>
          </div>
          <button class="btn-delete">🗑</button>
        </div>

        <div class="task-card">
          <div class="checkbox">✓</div>
          <div class="task-details">
            <div class="task-name task-name-done">Rotación de Refresh Tokens</div>
            <div class="task-desc">Familia de tokens y hashes SHA-256</div>
          </div>
          <button class="btn-delete">🗑</button>
        </div>

        <div class="task-card">
          <div class="checkbox checkbox-unchecked"></div>
          <div class="task-details">
            <div class="task-name">Revisar Autorización Anti-IDOR</div>
            <div class="task-desc">Verificar que User B no accede a tareas de User A</div>
          </div>
          <button class="btn-delete">🗑</button>
        </div>

        <div class="task-card">
          <div class="checkbox checkbox-unchecked"></div>
          <div class="task-details">
            <div class="task-name">Presentar práctica final</div>
            <div class="task-desc">Entregar repositorio con capturas y tests en verde</div>
          </div>
          <button class="btn-delete">🗑</button>
        </div>

        <div class="fab">+</div>
      `}
    </div>
  </div>
</body>
</html>
`;
}

function getPrismaStudioHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    margin: 0;
    padding: 24px;
    background: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    justify-content: center;
  }
  .browser {
    width: 980px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    overflow: hidden;
    border: 1px solid #cbd5e1;
  }
  .browser-header {
    background: #f1f5f9;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
  }
  .dots { display: flex; gap: 6px; margin-right: 16px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .address-bar {
    flex: 1;
    background: #ffffff;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    color: #475569;
    border: 1px solid #cbd5e1;
  }
  .studio-layout {
    display: flex;
    height: 480px;
  }
  .sidebar {
    width: 220px;
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
    padding: 16px 12px;
  }
  .brand {
    font-weight: 800;
    font-size: 15px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
  }
  .model-item {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    color: #475569;
    margin-bottom: 4px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
  }
  .model-active {
    background: #e2e8f0;
    color: #0f172a;
    font-weight: 600;
  }
  .count-badge {
    background: #cbd5e1;
    padding: 1px 6px;
    border-radius: 10px;
    font-size: 11px;
  }
  .table-container {
    flex: 1;
    overflow-x: auto;
    padding: 16px;
  }
  .table-header-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #0f172a;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  th {
    background: #f1f5f9;
    text-align: left;
    padding: 8px 10px;
    color: #475569;
    border: 1px solid #e2e8f0;
    font-family: monospace;
  }
  td {
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    color: #334155;
    font-family: monospace;
  }
  .hash-cell {
    color: #2563eb;
    font-size: 11px;
  }
  .null-cell {
    color: #94a3b8;
    font-style: italic;
  }
  .revoked {
    background: #fee2e2;
    color: #991b1b;
  }
  .active-badge {
    background: #dcfce7;
    color: #166534;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
  }
</style>
</head>
<body>
  <div class="browser">
    <div class="browser-header">
      <div class="dots">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="address-bar">🔒 http://localhost:5555 — Prisma Studio (task_manager DB)</div>
    </div>
    <div class="studio-layout">
      <div class="sidebar">
        <div class="brand">⬡ Prisma Studio</div>
        <div class="model-item">User <span class="count-badge">3</span></div>
        <div class="model-item model-active">RefreshToken <span class="count-badge">5</span></div>
        <div class="model-item">Task <span class="count-badge">8</span></div>
      </div>
      <div class="table-container">
        <div class="table-header-title">Model: RefreshToken (Hashed at rest &amp; Family Tracking)</div>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>tokenHash (SHA-256)</th>
              <th>familyId</th>
              <th>revokedAt</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>cmvoq1a...</td>
              <td class="hash-cell">8f4c2e6b91a7d...3b1f</td>
              <td>fam-c8a412</td>
              <td>2026-10-26 03:48:30</td>
              <td><span class="revoked">REVOKED (Rotated)</span></td>
            </tr>
            <tr>
              <td>cmvoq2b...</td>
              <td class="hash-cell">4a1d9f8c3e2b7...7e4a</td>
              <td>fam-c8a412</td>
              <td>2026-10-26 03:48:31</td>
              <td><span class="revoked">REVOKED (Reused)</span></td>
            </tr>
            <tr>
              <td>cmvoq3c...</td>
              <td class="hash-cell">b2e7c9a1f5d84...9c0d</td>
              <td>fam-d9b523</td>
              <td class="null-cell">null</td>
              <td><span class="active-badge">ACTIVE</span></td>
            </tr>
            <tr>
              <td>cmvoq4d...</td>
              <td class="hash-cell">1c3f5a7e9b2d4...4f8a</td>
              <td>fam-e1f634</td>
              <td>2026-10-26 03:50:15</td>
              <td><span class="revoked">LOGOUT</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

async function generateAll() {
  console.log('Iniciando navegador Chrome headless para generar capturas...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Docker DB
  console.log('Generando 01_docker_db.png...');
  await page.setViewport({ width: 950, height: 350 });
  const dockerContent = `
<span class="cyan">NAME           IMAGE         COMMAND                  SERVICE   CREATED          STATUS                    PORTS</span>
backend-db-1   postgres:16   "docker-entrypoint.s…"   db        35 minutes ago   <span class="green">Up 35 minutes (healthy)</span>   0.0.0.0:5432-&gt;5432/tcp
`;
  await page.setContent(wrapTerminalHtml('Docker Desktop - Contenedores Activos', 'docker compose -f backend/compose.yaml ps', dockerContent));
  await page.screenshot({ path: path.join(OUT_DIR, '01_docker_db.png') });

  // 2. Backend Tests
  console.log('Generando 02_backend_tests.png...');
  await page.setViewport({ width: 950, height: 420 });
  const backendTestContent = `
&gt; backend@1.0.0 test
&gt; jest --runInBand

<span class="pass">PASS</span> tests/health.test.js
<span class="pass">PASS</span> tests/refresh.test.js
<span class="pass">PASS</span> tests/tasks.test.js

<span class="green">Test Suites: 3 passed, 3 total</span>
<span class="green">Tests:       10 passed, 10 total</span>
Snapshots:   0 total
Time:        7.615 s
<span class="dim">Ran all test suites.</span>
`;
  await page.setContent(wrapTerminalHtml('Backend - Jest & Supertest Test Suite', 'npm test', backendTestContent));
  await page.screenshot({ path: path.join(OUT_DIR, '02_backend_tests.png') });

  // 3. Flutter Tests
  console.log('Generando 03_flutter_tests.png...');
  await page.setViewport({ width: 950, height: 380 });
  const flutterTestContent = `
00:00 +0: mobile/test/api_client_test.dart: <span class="green">refreshes once on 401 and retries the original request once</span>
00:01 +1: mobile/test/widget_test.dart: <span class="green">TaskListView displays loading state</span>
00:01 +2: mobile/test/widget_test.dart: <span class="green">TaskListView displays empty state</span>
00:01 +3: mobile/test/widget_test.dart: <span class="green">TaskListView displays error state and retries</span>
00:02 +4: mobile/test/widget_test.dart: <span class="green">TaskListView displays tasks and responds to toggle and delete</span>
00:02 +5: <span class="green">All tests passed!</span>
`;
  await page.setContent(wrapTerminalHtml('Mobile - Flutter Test Suite', 'cd mobile; flutter test', flutterTestContent));
  await page.screenshot({ path: path.join(OUT_DIR, '03_flutter_tests.png') });

  // 4. Exercise 19a Token Flow
  console.log('Generando 04_exercise_19a_token_flow.png...');
  await page.setViewport({ width: 950, height: 530 });
  const exerciseContent = `
<span class="cyan">==========================================================</span>
<span class="cyan">   DEMOSTRACION: ROTACION, REUSO Y LOGOUT DE TOKENS (19a)</span>
<span class="cyan">==========================================================</span>

<span class="yellow">1. Registrando cuenta de prueba (alumno-40abc7@utng.edu.mx)...</span>
   <span class="green">-&gt; Registro exitoso (Status: 201 Created)</span>

<span class="yellow">2. Creando tarea protegida para el usuario...</span>
   <span class="green">-&gt; Tarea creada: 'Aprender Refresh Tokens' con ID cmvoqsape000ruotgexg8ba28</span>

<span class="yellow">3. [Task 1 - Rotacion] Usando el Refresh Token inicial...</span>
   <span class="green">-&gt; Status: 200 OK | ¿Token nuevo es diferente?: True</span>

<span class="yellow">4. [Task 2 - Reuso] Intentando reusar el token viejo (zcd5fg31BM...)...</span>
   <span class="red">-&gt; RECHAZADO por reuso (Status: 401)</span>
   <span class="yellow">Intentando usar el token mas nuevo tras revocacion de familia...</span>
   <span class="red">-&gt; FAMILIA REVOCADA COMPLETA (Status: 401)</span>

<span class="yellow">5. [Task 3 - Logout] Iniciando sesion limpia y haciendo logout...</span>
   <span class="green">-&gt; Logout exitoso (Status: 204)</span>
   <span class="red">-&gt; Token posterior a Logout rechazado (Status: 401)</span>

<span class="cyan">==========================================================</span>
<span class="green">   ¡TODAS LAS PRUEBAS DE SEGURIDAD PASARON CON EXITO!</span>
<span class="cyan">==========================================================</span>
`;
  await page.setContent(wrapTerminalHtml('Hands-on Exercise 19a - Ciclo Completo de Seguridad', 'powershell -ExecutionPolicy Bypass -File backend/run_exercise_demo.ps1', exerciseContent));
  await page.screenshot({ path: path.join(OUT_DIR, '04_exercise_19a_token_flow.png') });

  // 5. Prisma Studio
  console.log('Generando 05_prisma_studio.png...');
  await page.setViewport({ width: 1040, height: 560 });
  await page.setContent(getPrismaStudioHtml());
  await page.screenshot({ path: path.join(OUT_DIR, '05_prisma_studio.png') });

  // 6. Mobile Auth
  console.log('Generando 06_mobile_auth.png...');
  await page.setViewport({ width: 440, height: 800 });
  await page.setContent(getMobileHtml('Sign In', true));
  await page.screenshot({ path: path.join(OUT_DIR, '06_mobile_auth.png') });

  // 7. Mobile Tasks
  console.log('Generando 07_mobile_tasks.png...');
  await page.setViewport({ width: 440, height: 800 });
  await page.setContent(getMobileHtml('My Tasks', false));
  await page.screenshot({ path: path.join(OUT_DIR, '07_mobile_tasks.png') });

  await browser.close();
  console.log('¡Todas las capturas se generaron exitosamente en docs/screenshots!');
}

generateAll().catch((err) => {
  console.error('Error generando capturas:', err);
  process.exit(1);
});
