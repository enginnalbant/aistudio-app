const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const SERVER_PORT = 3000;

let mainWindow = null;
let serverProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Nexus OS - Üretim Takip',
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0a0a14',
    show: false,
    autoHideMenuBar: true,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function waitForServer(url, retries = 30, interval = 500) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    let attempts = 0;

    const check = () => {
      attempts++;
      const req = http.get(url, (res) => {
        resolve();
      });
      req.on('error', () => {
        if (attempts >= retries) {
          reject(new Error(`Server did not start after ${retries} attempts`));
        } else {
          setTimeout(check, interval);
        }
      });
      req.setTimeout(1000, () => {
        req.destroy();
        if (attempts >= retries) {
          reject(new Error(`Server did not start after ${retries} attempts`));
        } else {
          setTimeout(check, interval);
        }
      });
    };

    check();
  });
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, '..', 'server.ts');

    // In development, use tsx to run TypeScript server
    // In production, the server should be pre-compiled or use tsx
    const tsxPath = path.join(__dirname, '..', 'node_modules', '.bin', 'tsx');

    const { spawn } = require('child_process');

    const env = {
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      ELECTRON: 'true',
    };

    serverProcess = spawn(tsxPath, [serverPath], {
      cwd: path.join(__dirname, '..'),
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    serverProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      console.log('[Server]', msg);
      if (msg.includes('Server running on')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('[Server Error]', data.toString());
    });

    serverProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code ${code}`);
      if (code !== 0 && code !== null) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Fallback: resolve after timeout if stdout message was missed
    setTimeout(() => resolve(), 8000);
  });
}

app.whenReady().then(async () => {
  try {
    console.log('Starting backend server...');
    await startServer();
    console.log('Backend server started, waiting for it to be ready...');
    await waitForServer(`http://localhost:${SERVER_PORT}`);
    console.log('Server is ready, creating window...');

    createWindow();
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
  } catch (err) {
    console.error('Failed to start application:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});
