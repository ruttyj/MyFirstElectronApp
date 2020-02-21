const navMixin = {
    methods: {
        openLinkExternal(url) {
            this.$electron.shell.openExternal(url);
        },
        goToRoute(path, params=null){
            var props = {
                path: path, 
                params: params,
            };
            this.$router.push(props).catch(err => {});
            return false;
        }
    }
}

export default navMixin;