import Vue from 'vue'
import Vuex from 'vuex'
import VuexORM from '@vuex-orm/core'

// Models

import User from '@/models/User'
import Post from '@/models/Post'
import Drawer from '@/models/Drawer'
Vue.use(Vuex)

// Create a new instance of Database.
const database = new VuexORM.Database()
database.register(User)
database.register(Post)
database.register(Drawer)


// Register Models to Database.
//database.register(Drawer)
// Create Vuex Store and register database through Vuex ORM.
const store = new Vuex.Store({
  plugins: [VuexORM.install(database)]
})


// Populate initial data
Drawer.insert({data: Drawer.initialData});


export default store