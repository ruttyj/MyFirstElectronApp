import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

const opts = {
    theme: {
        themes: {
            light: {
                primary: '#0963ab',
            },
            dark: {
                primary: '#00559e',
                anchor: '#ffffff',
            },
        }
    }
}

export default new Vuetify(opts)