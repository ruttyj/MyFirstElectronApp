<template>
    <v-list dark dense class="main-menu">
        <template v-for="item in items">
            <!-- Menu Heading -->
            <v-row
                v-if="item.heading"
                :key="item.heading"
                align="center"
            >
                <v-col cols="6">
                    <v-subheader v-if="item.heading">
                        {{ item.heading }}
                    </v-subheader>
                </v-col>
                <v-col cols="6" class="text-center" >
                    <a href="#!" class="body-2">
                        EDIT
                    </a>
                </v-col>
            </v-row>
            <!-- Item Group -->
            <v-list-group
                v-else-if="item.children"
                :key="item.text"
                v-model="item.model"
                :prepend-icon="item.model ? item.icon : item['icon-alt']"
                append-icon=""
            >
                <template v-slot:activator>
                    <!-- Parent Item -->
                    <v-list-item-content>
                        <v-list-item-title>
                        {{ item.text }}
                        </v-list-item-title>
                    </v-list-item-content>
                </template>
                <template v-for="(child, i) in item.children">
                    <!-- Nested Item -->
                    <v-list-item
                        :key="i"
                        link
                        @click="handleItemClick(child)"
                    >
                        <v-list-item-action v-if="child.icon">
                            <v-icon>{{ child.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>
                            {{ child.text }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                </template>
            </v-list-group>
            <!-- Item -->
            <v-list-item
                v-else
                :key="item.text"
                link
                @click="handleItemClick(item)"
            >
                <v-list-item-action>
                    <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>
                        {{ item.text }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>
    </v-list>
</template>


<script>
import navMixin from '@/mixins/navMixin';
import windowMixin from '@/mixins/windowMixin';

export default {
    mixins: [ navMixin, windowMixin ],
    data: function(){
        const self = this;
        return {
            items: [
                { 
                    icon: 'mdi-plus', 
                    text: 'Add Link',
                    click(){
                        console.log('click');
                        self.goToRoute('/addLink');
                    }
                },
                { 
                    icon: 'mdi-link', 
                    text: 'Link List',
                    click(){
                        console.log('click');
                        self.goToRoute('/');
                    }
                },
                {
                    icon: 'mdi-chevron-up',
                    'icon-alt': 'mdi-chevron-down',
                    text: 'Options',
                    model: false,
                    children: [
                        { 
                            icon: 'mdi-theme-light-dark', 
                            text: 'Toggle Mode',  
                            click(){ 
                                self.toggleDarkMode();
                            }
                        },
                        { 
                            icon: 'mdi-dev-to', 
                            text: 'Toggle DevTools',  
                            click(){ 
                                self.toggleDevTools();
                            }
                        },
                    ],
                },
            ],
        }
    },
    methods: {
        toggleDarkMode(){
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
        },
        handleItemClick(item){
            if(typeof(item.click) !== 'undefined'){
                item.click();
            }
        }
    }
}
</script>