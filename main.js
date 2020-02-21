// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const fs = require('fs')
const path = require('path')
var isDev = false; //process.env.NODE_ENV !== 'production'
console.log('process.env.NODE_ENV', process.env.NODE_ENV);


const WindowEventManager = require('./src/utils/windowEventManager');




// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the database file rifht away
  let database = 'database.sqlite3'
  if (! fs.existsSync(app.getPath('userData') + '/' + database) || isDev) {
    fs.copyFileSync(path.join(__dirname, 'db', database), app.getPath('userData') + '/' + database)
  }


  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280, 
    'min-width': 400,
    height: 720, 
    allowRendererProcessReuse: true, // Electron v9 default will be true
    transparent: true,                // Warning: Transparency will not work if dev tools are open
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  })
  

  // Attach Window event listeners for window controles
  mainWindowEventManager = new WindowEventManager({
    window:   mainWindow,
    ipcMain:  ipcMain,
  });
  mainWindowEventManager.attachListeners();


  const MAIN_HTML = path.join('file://', __dirname, 'public/index.html');
  mainWindow.loadURL(MAIN_HTML);



  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}


function startMonit() {

  // Detect changes to the application and reload
  if (isDev) {
    const elemon = require('elemon')
    elemon({
      app: app,
      mainFile: 'main.js',
      bws: [
        { bw: mainWindow, res: [] }
      ]
    })

    console.log('Hot reloading...')
  }
}


app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow()

  startMonit()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})