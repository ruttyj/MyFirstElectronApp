const ipcRenderer  = window.ipcRenderer;
/*
const electron = window.require("electron")
const ipcRenderer  = electron.ipcRenderer;
*/

const windowMixin = {
    methods: {
      toggleMinimize(){
        console.log('toggleMinimize');
        ipcRenderer.invoke('toggle-minimize')
      },
      toggleMaximize(){
        console.log('toggleMaximize');
        ipcRenderer.invoke('toggle-maximize')
      },
      close(){
        console.log('close');
        console.log(window,ipcRenderer);

        ipcRenderer.invoke('close')
      },
      toggleDevTools(){
        console.log('toggleDevTools');
        ipcRenderer.invoke('toggle-devtools');
      },
    }
  }
export default windowMixin;