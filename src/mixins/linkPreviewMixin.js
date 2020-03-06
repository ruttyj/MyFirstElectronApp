const ipcRenderer  = window.ipcRenderer;


const linkPreviewMixin = {
    methods: {
        async fetchLinkPreview(url){
            let response = await ipcRenderer.invoke('link-preview-fetch', url);
            return (response == null) ? null : JSON.parse(response);
        }
    }
}

export default linkPreviewMixin;