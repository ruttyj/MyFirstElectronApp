<template>
  <v-app id="sandbox">

    <!-- ############ SIDE BAR ############ -->
    <v-navigation-drawer
        
      v-model="primaryDrawer.model"
      :clipped="primaryDrawer.clipped"
      :floating="primaryDrawer.floating"
      :mini-variant="primaryDrawer.mini"
      :permanent="primaryDrawer.type === 'permanent'"
      :temporary="primaryDrawer.type === 'temporary'"
      app
      overflow
    >
        <div class="main-drawer">
            <v-toolbar
                v-if="!primaryDrawer.clipped"
                class="app-drag menu-app-tint"
                flat
            >
                <v-app-bar-nav-icon dark
                    class="app-no-drag"
                    @click.stop="toggleMenuMini()"
                />
            </v-toolbar>


            <sidebar-list/>

            <v-footer class="menu-app-tint" style="position: fixed; bottom: 0; min-height: 1em; width: 100%;">
                <span class="px-4" style="color: transparent;">.</span>
            </v-footer>
        </div>
        
    </v-navigation-drawer>



    <!-- ############ TITLE BAR ############ -->
    <v-app-bar
        class="app-drag"
        :clipped-left="primaryDrawer.clipped"
        flat
        app
    >
        <titlebar style="padding-right:32px;" class="v-center">
            <v-app-bar-nav-icon
                v-if="primaryDrawer.clipped"
                class="app-no-drag"
                @click.stop="toggleMenuMini()"
            />
            {{title}}
        </titlebar>
    </v-app-bar>



    <!-- ############ MAIN CONTENT ############ -->
    <v-content>
      <v-container fluid class="main-container">
        <router-view></router-view>

      </v-container>
    </v-content>

    <v-footer
      :inset="footer.inset"
      app
    >
      <span class="px-4">&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>



import Drawer from '@/models/Drawer'
import ComputedFactory from '@/utils/computedFactory';


const computedFactory = new ComputedFactory();

import navMixin from '@/mixins/navMixin';
let Titlebar = require('@/components/Titlebar').default;
let SidebarList = require('@/components/SidebarList').default;
export default {
    mixins: [ navMixin ],
    components: {
        Titlebar,
        SidebarList,
    },
    created(){
        this.$vuetify.theme.dark = false;
    },
    data: () => ({
        title: `My First App`,
        drawers: ['Default (no property)', 'Permanent', 'Temporary'],
        footer: {
            inset: true,
        },
    }),
    computed:{
      showAllDrawers(){
        return Drawer.all();
      },
      primaryDrawer: computedFactory.makeORMSync(Drawer, 'main'),
    },
    methods: {
        toggleMenu(){
            this.$set(this.primaryDrawer, 'model', !this.primaryDrawer.model);
        },
        toggleMenuMini(){
          this.primaryDrawer = {
            ...this.primaryDrawer,
            mini: !this.primaryDrawer.mini,
          }
        }
    }
  }
</script>


<style>

</style>