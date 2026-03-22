const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // icon: path.join(__dirname, '../public/vite.svg') // Optional: Add your icon here
  });

  // Wait for the server to start (give it a few seconds)
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 3000);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Setup database path in user data directory for production
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'local.db');
  
  // Copy initial database if it doesn't exist in userData
  if (!isDev && !fs.existsSync(dbPath)) {
    const initialDbPath = path.join(process.resourcesPath, 'local.db');
    if (fs.existsSync(initialDbPath)) {
      fs.copyFileSync(initialDbPath, dbPath);
    }
  }
  
  if (isDev) {
    // In development, spawn the Vite+Express dev server
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      stdio: 'inherit'
    });
    // Wait longer for Vite to start in dev mode
    setTimeout(createWindow, 5000);
  } else {
    // In production, run the compiled server.js
    const serverPath = path.join(__dirname, '../dist-server/server.js');
    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: path.join(__dirname, '..'),
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        APP_PATH: path.join(__dirname, '..'), // Tell server.js where the root is
        DB_PATH: dbPath // Tell server.js where the database is
      },
      stdio: 'inherit'
    });
    createWindow();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
