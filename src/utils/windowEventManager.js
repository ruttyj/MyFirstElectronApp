const axios = require('axios');
var linkPreview = require("linkpreview-for-node");


global.btoa = str => Buffer.from(str).toString('base64');
global.atob = str => Buffer.from(str, 'base64').toString();


class WindowEventManager {
    constructor({window, ipcMain, isDev}){
        this.window = window;
        this.ipcMain = ipcMain;
        this.isMaximized = false;
        this.isDev = isDev;
    }
  
    attachListeners(){
        const self = this;
        //----------------------------------------------
    
        //           Standard Window Controls
    
        //----------------------------------------------
  
        self.ipcMain.handle('toggle-minimize', (event, i) => {
            if(self.window.isMinimized()){
                self.window.restore();
            } else {
                self.window.minimize();
            }
            return true
        })
        
        self.isMaximized = false;
        self.ipcMain.handle('toggle-maximize', (event, i) => {
            //self.window.isMaximized() // if window is transparent will always return false
            if(self.isMaximized){
                self.window.unmaximize();
                self.isMaximized = false;
            } else {
                self.window.maximize();
                self.isMaximized = true;
            }
            return true
        })
        
        self.ipcMain.handle('close', (event, i) => {
            self.window.close();
            return true
        })
        //----------------------------------------------
    
    
    
    
    
        
        //----------------------------------------------
    
        //                  Dev Tools
    
        //----------------------------------------------
        //self.isDevToolsOpen = self.isDev;
        self.isDevToolsOpen = false;
    
    
        self.window.webContents.on('devtools-opened', () => {
            self.isDevToolsOpen = true;
        })
        
        self.window.webContents.on('devtools-closed', () => {
            self.isDevToolsOpen = false;
        })
    
        self.ipcMain.handle('open-devtools', (event) => {
            self.window.webContents.openDevTools();
            return true
        })
    
        self.ipcMain.handle('close-devtools', (event) => {
            self.window.webContents.closeDevTools();
            return true
        })
    
        self.ipcMain.handle('toggle-devtools', (event) => {
            let initialState = self.isDevToolsOpen;
            if(self.isDevToolsOpen){
                self.window.webContents.closeDevTools();
            } else {
                self.window.webContents.openDevTools();
            }
            return !initialState;
        })
    
        if(self.isDevToolsOpen){
        }
        //self.window.webContents.openDevTools();

        //----------------------------------------------
    
    
    


    
        //----------------------------------------------
    
        //             Generic API Fetch
    
        //----------------------------------------------
        self.ipcMain.handle('api-fetch', async (event, propsStr) => {
            let props = JSON.parse(propsStr);
        
            let fetched = null;
            try {
                fetched = await axios(props);
            } catch (e){}
        
            let encoded = null;
            if(fetched !== null){
                encoded = JSON.stringify({
                    status: fetched.status,
                    data:   fetched.data,
                });
            }
            return encoded;
        })
        //----------------------------------------------
    
  
        //----------------------------------------------
    
        //                Link Preview
    
        //----------------------------------------------
        self.ipcMain.handle('link-preview-fetch', async (event, url) => {
            let fetched = null;
            try {
                fetched = await new Promise((resolve, reject) => {
                    linkPreview(url)
                        .then(response => {
                            console.log(response);
                            resolve(response);
                        })
                        .catch(err => {
                            reject(err);
                        })
                }) 
            } catch (e){}


            let encoded = null;
            if(fetched !== null){
                encoded = JSON.stringify(fetched);
            }

            return encoded;
        })
        //----------------------------------------------



        


        //----------------------------------------------
    
        //                Link Preview
    
        //----------------------------------------------
        self.ipcMain.handle('resize-image', async (event, {img, opts}) => {
            
            const sharp = require('sharp')
            let config = (typeof(opts) === 'string') ? JSON.parse(opts) : opts;
            let fetched = null;
            try {
                fetched = await new Promise((resolve, reject) => {
                    sharp(img)
                        .resize(config)
                        .toBuffer()
                        .then(data => {
                            resolve(data);
                        })
                        .catch(err => {
                            reject(err);
                        });
                }) 
            } catch (e){
                //console.log('error', e);
            }
            

            return fetched;
        })
        //----------------------------------------------
  
    }
  
  }

module.exports = WindowEventManager

  