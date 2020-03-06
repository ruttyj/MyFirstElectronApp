// Global imports
import Vue from 'vue';
import axios from 'axios';
import VueRouter from 'vue-router';
import vuetify from '@/plugins/vuetify';
import Vuex from 'vuex';
import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);
Vue.use(Vuex)

// Local imports
import App from '@/App.vue';
import routes from '@/router';
import store from '@/store';


// Prototyping
Vue.prototype.$http = axios;
Vue.prototype.$db = Container.db;
Vue.prototype.$electron = Container.electron;


Vue.use(VueRouter);
let router = new VueRouter(routes);

new Vue({
    vuetify,
    router,
    //store,
    render(h) {
        return h(App);
    }
}).$mount('#app')