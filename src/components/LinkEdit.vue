<template>
    <v-form>
        <v-text-field
            label="Label"
            v-model="c_label"
            outlined
        >
            <template v-slot:append>
                <v-menu
                    :close-on-click="true"
                    :close-on-content-click="true"
                    :offset-y="true"
                    :offset-x="false"
                >
                <template v-slot:activator="{ on }">
                    <v-icon v-on="on">mdi-format-letter-case</v-icon>
                </template>
                <v-list >
                    <v-list-item
                        v-for="(item, index) in items"
                        :key="index"
                        @click="c_label = item.transform(c_label)"
                    >
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
                </v-menu>
            </template>
        </v-text-field>
        <v-text-field
            label="Url"
            v-model="c_url"
            outlined
        ></v-text-field>
        <template v-if="meta && meta.image">
            <v-img contain :src="meta.image"/>
            <h3 v-if="meta.title">{{meta.title}}</h3>
            <h4 v-if="meta.siteName">{{meta.siteName}}</h4>
            <p v-if="meta.description">{{meta.description}}</p>
        </template> 
    </v-form>
</template>

<script>
var _ = require('lodash');

import linkPreviewMixin from '@/mixins/linkPreviewMixin';

import ComputedFactory from '@/utils/computedFactory';
const computedFactory = new ComputedFactory();


export default {
    mixins: [ linkPreviewMixin ],
    props: ['label', 'url'],
    computed: {
        c_label: computedFactory.makePropSync('label'),
        c_url:   computedFactory.makePropSync('url'),
    },
    watch: {
        async c_url(newVal, oldVal){
            if(newVal != oldVal){
                let val = await this.fetchLinkPreview(newVal);
                this.meta = val;
                console.log('val', val);
            }
        },
    },
    data(){
        return {
            items: [
                {   
                    title: 'Capitalize', 
                    transform: (val) => _.capitalize(val)
                },
                {   title: 'UPPER CASE',  
                    transform: (val) => _.upperCase(val)
                },
                {   title: 'Start CASE',  
                    transform: (val) => _.startCase(val)
                },
                {   title: 'snake_case',  
                    transform: (val) => _.snakeCase(val)
                },
                {   title: 'lower case',  
                    transform: (val) => _.lowerCase(val)
                },
                {   title: 'camelCase',  
                    transform: (val) => _.camelCase(val)
                },
            ],
            meta: null
        }
    },
}
</script>