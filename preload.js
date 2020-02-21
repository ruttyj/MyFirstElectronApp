const electron = require('electron');

// Expose node logic to front-end
window.ipcRenderer = electron.ipcRenderer