const { app, BrowserWindow, Menu, shell, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

let mainWindow;
let splashWindow;
let pythonProcess;
const isDev =
  process.env.NODE_ENV === "development" || process.argv.includes("--dev");

// Flask server configuration
const FLASK_PORT = 5000;
const FLASK_HOST = "127.0.0.1";

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: getIconPath(),
    show: false,
  });

  // Load splash screen from Flask server
  const splashUrl = `http://${FLASK_HOST}:${FLASK_PORT}/splash`;
  splashWindow.loadURL(splashUrl);

  splashWindow.once("ready-to-show", () => {
    splashWindow.show();

    // Center the splash window
    const { width, height } =
      require("electron").screen.getPrimaryDisplay().workAreaSize;
    const splashBounds = splashWindow.getBounds();
    splashWindow.setPosition(
      Math.round((width - splashBounds.width) / 2),
      Math.round((height - splashBounds.height) / 2)
    );
  });

  splashWindow.on("closed", () => {
    splashWindow = null;
  });

  return splashWindow;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
    },
    icon: getIconPath(),
    titleBarStyle: "default",
    show: false, // Don't show until ready
  });

  // Create application menu
  createMenu();

  // Load the main Flask app
  const flaskUrl = `http://${FLASK_HOST}:${FLASK_PORT}`;
  mainWindow.loadURL(flaskUrl);

  mainWindow.once("ready-to-show", () => {
    // Close splash window if it exists
    if (splashWindow) {
      splashWindow.close();
    }

    // Show main window
    mainWindow.show();
    mainWindow.focus();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (pythonProcess) {
      pythonProcess.kill();
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return mainWindow;
}

function getIconPath() {
  if (isDev) {
    // Development mode - icon in static/assets
    return path.join(__dirname, "src", "static", "assets", "icon.ico");
  } else {
    // Production mode - check multiple possible locations
    const possiblePaths = [
      path.join(process.resourcesPath, "assets", "icon.ico"),
      path.join(process.resourcesPath, "static", "assets", "icon.ico"),
      path.join(__dirname, "static", "assets", "icon.ico"),
      path.join(__dirname, "src", "static", "assets", "icon.ico"),
    ];

    for (const iconPath of possiblePaths) {
      if (fs.existsSync(iconPath)) {
        return iconPath;
      }
    }

    // Return default if not found
    return path.join(__dirname, "src", "static", "assets", "icon.ico");
  }
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Project",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.executeJavaScript(
              "if (window.app) window.app.createNewProject()"
            );
          },
        },
        {
          label: "Import Project",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            mainWindow.webContents.executeJavaScript(
              "if (window.app) window.app.showOpenProjectDialog()"
            );
          },
        },
        // HAPUS Save Project menu item
        { type: "separator" },
        {
          label: "Export Project",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            mainWindow.webContents.executeJavaScript(
              "if (window.app && app.currentProject && app.currentResults) app.showExportModal()"
            );
          },
        },
        { type: "separator" },
        {
          label: "Exit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Add Component",
          accelerator: "CmdOrCtrl+Plus",
          click: () => {
            mainWindow.webContents.executeJavaScript(
              "if (window.app && app.selectedComponentType) app.addComponent()"
            );
          },
        },
        { type: "separator" },
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectall" },
      ],
    },
    {
      label: "Calculate",
      submenu: [
        {
          label: "Run Calculation",
          accelerator: "CmdOrCtrl+Enter",
          click: () => {
            mainWindow.webContents.executeJavaScript(
              "if (window.app && app.selectedComponentType) app.calculate()"
            );
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About MIL-HDBK-217F",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About MIL-HDBK-217F",
              message: "MIL-HDBK-217F Reliability Prediction",
              detail:
                "Military Handbook for Reliability Prediction of Electronic Equipment\n\n" +
                "This standard provides methods for predicting the reliability of electronic equipment " +
                "and is widely used in the electronics industry for reliability analysis.\n\n" +
                "Current implementation covers capacitor components with accurate failure rate calculations.",
            });
          },
        },
        {
          label: "Keyboard Shortcuts",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Keyboard Shortcuts",
              message: "Available Keyboard Shortcuts",
              detail:
                "File Operations:\n" +
                "• Ctrl+N - New Project\n" +
                "• Ctrl+O - Open Project\n" +
                "• Ctrl+S - Save Project\n" +
                "• Ctrl+E - Export Project\n\n" +
                "Component Operations:\n" +
                "• Ctrl++ - Add Component\n" +
                "• Ctrl+Enter - Calculate Reliability\n\n" +
                "General:\n" +
                "• Escape - Close Modals\n" +
                "• F5 - Reload\n" +
                "• F12 - Toggle Developer Tools",
            });
          },
        },
        { type: "separator" },
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About",
              message: "Reliability Lambda Predict",
              detail:
                "Enhanced MIL-HDBK-217F Reliability Prediction Calculator\n\n" +
                "Version 1.1.0\n" +
                "Project-Based Reliability Analysis Tool\n\n" +
                "Features:\n" +
                "• Project management with Export/Import capabilities\n" +
                "• Enhanced component parameter tracking\n" +
                "• Accurate MIL-HDBK-217F calculations\n" +
                "Built with Flask, Electron, and modern web technologies.",
            });
          },
        },
      ],
    },
  ];

  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getPythonCommand() {
  const pythonCommands = ["python", "python3", "py"];

  for (const cmd of pythonCommands) {
    try {
      const { execSync } = require("child_process");
      const result = execSync(`${cmd} --version`, {
        stdio: "pipe",
        encoding: "utf8",
      });
      console.log(`Found Python: ${cmd} - ${result.trim()}`);
      return cmd;
    } catch (e) {
      console.log(`Python command '${cmd}' not found:`, e.message);
      continue;
    }
  }
  throw new Error(
    "Python not found. Please install Python 3.8+ and ensure it's in your system PATH."
  );
}

function getPythonPath() {
  try {
    const cmd = getPythonCommand();
    const { execSync } = require("child_process");
    const result = execSync(`where ${cmd}`, {
      stdio: "pipe",
      encoding: "utf8",
    }).trim();
    return result;
  } catch (e) {
    return "Python path not found";
  }
}

function getFlaskAppPath() {
  if (isDev) {
    // Development mode
    return path.join(__dirname, "src", "app.py");
  } else {
    // Production mode - check multiple locations
    const possiblePaths = [
      path.join(process.resourcesPath, "app", "src", "app.py"),
      path.join(process.resourcesPath, "src", "app.py"),
      path.join(__dirname, "resources", "src", "app.py"),
      path.join(__dirname, "src", "app.py"),
    ];

    for (const appPath of possiblePaths) {
      if (fs.existsSync(appPath)) {
        console.log(`Found Flask app at: ${appPath}`);
        return appPath;
      }
    }

    throw new Error(
      `Flask app.py not found. Checked paths: ${possiblePaths.join(", ")}`
    );
  }
}

function startFlaskServer() {
  return new Promise((resolve, reject) => {
    try {
      const pythonCmd = getPythonCommand();
      const scriptPath = getFlaskAppPath();

      console.log(`Starting Flask server with: ${pythonCmd} ${scriptPath}`);
      console.log(`Working directory: ${path.dirname(scriptPath)}`);

      // Set environment variables for Flask
      const env = {
        ...process.env,
        PYTHONPATH: path.dirname(scriptPath),
        FLASK_ENV: isDev ? "development" : "production",
        PYTHONIOENCODING: "utf-8",
      };

      pythonProcess = spawn(pythonCmd, [scriptPath], {
        cwd: path.dirname(scriptPath),
        stdio: ["ignore", "pipe", "pipe"],
        env: env,
      });

      let serverStarted = false;
      let startupTimeout;

      pythonProcess.stdout.on("data", (data) => {
        const output = data.toString();
        console.log(`Flask stdout: ${output}`);
        if (
          (output.includes("Running on") ||
            output.includes("Serving Flask app")) &&
          !serverStarted
        ) {
          serverStarted = true;
          if (startupTimeout) {
            clearTimeout(startupTimeout);
          }
          setTimeout(resolve, 2000); // Wait for server to be fully ready
        }
      });

      pythonProcess.stderr.on("data", (data) => {
        const error = data.toString();
        console.error(`Flask stderr: ${error}`);

        // Don't reject on warnings, only on actual errors
        if (
          error.includes("Error") ||
          error.includes("Failed") ||
          error.includes("ImportError") ||
          error.includes("ModuleNotFoundError")
        ) {
          if (!serverStarted && startupTimeout) {
            clearTimeout(startupTimeout);
            reject(new Error(`Flask startup error: ${error}`));
          }
        }
      });

      pythonProcess.on("error", (err) => {
        console.error("Failed to start Flask server:", err);
        if (startupTimeout) {
          clearTimeout(startupTimeout);
        }
        reject(err);
      });

      pythonProcess.on("close", (code) => {
        console.log(`Flask server exited with code ${code}`);
        if (code !== 0 && code !== null && !serverStarted) {
          if (startupTimeout) {
            clearTimeout(startupTimeout);
          }
          reject(new Error(`Flask server exited with code ${code}`));
        }
      });

      // Timeout fallback - give Flask more time to start
      startupTimeout = setTimeout(() => {
        if (!serverStarted && !pythonProcess.killed) {
          console.log(
            "Flask server timeout, but process still running - assuming started"
          );
          serverStarted = true;
          resolve();
        }
      }, 10000); // Increased timeout to 10 seconds
    } catch (error) {
      console.error("Error in startFlaskServer:", error);
      reject(error);
    }
  });
}

// Application event handlers
app.whenReady().then(async () => {
  try {
    console.log("Electron app ready, starting Flask server...");

    // Create and show splash screen
    createSplashWindow();

    // Start Flask server
    await startFlaskServer();

    // Create main window (splash will be closed when main window is ready)
    createMainWindow();
  } catch (error) {
    console.error("Failed to start application:", error);

    // Close splash if it exists
    if (splashWindow) {
      splashWindow.close();
    }

    dialog.showErrorBox(
      "Startup Error",
      `Failed to start the application server.\n\nError: ${error.message}\n\n` +
        `Please check your Python installation and ensure all required packages are installed.\n\n` +
        `Python path: ${getPythonPath()}`
    );
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (pythonProcess) {
    console.log("Killing Python process...");
    pythonProcess.kill("SIGTERM");

    // Force kill after 3 seconds
    setTimeout(() => {
      if (pythonProcess && !pythonProcess.killed) {
        pythonProcess.kill("SIGKILL");
      }
    }, 3000);
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", (event) => {
  if (pythonProcess) {
    // Give Flask a moment to clean up
    pythonProcess.kill("SIGTERM");
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });

  // Prevent navigation to external URLs
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Allow navigation within the Flask app
    if (parsedUrl.host === FLASK_HOST + ":" + FLASK_PORT) {
      return;
    }

    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Enhanced error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);

  // Try to show error dialog if possible
  try {
    dialog.showErrorBox(
      "Unexpected Error",
      `An unexpected error occurred:\n\n${error.message}\n\nThe application will now exit.`
    );
  } catch (dialogError) {
    console.error("Could not show error dialog:", dialogError);
  }

  if (pythonProcess) {
    pythonProcess.kill();
  }

  // Exit after a short delay to allow error dialog to show
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);

  // Don't exit on unhandled rejections, but log them
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.executeJavaScript(
      `console.error("Unhandled promise rejection:", ${JSON.stringify(
        String(reason)
      )})`
    );
  }
});

// Additional utility functions for the enhanced app
function showNotification(title, body) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.executeJavaScript(
      `if (window.app) app.showSuccess("${body}")`
    );
  }
}

// Export for potential use in renderer process
module.exports = {
  showNotification,
};
