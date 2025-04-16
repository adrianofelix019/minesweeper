const { app, BrowserWindow } = require("electron");
const path = require("path");

console.log(path.join(__dirname, "preload.js"));
const preloadPath = "C:/Projects/javascript/minesweeper/preload.js";

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: preloadPath,
    },
  });

  window.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
