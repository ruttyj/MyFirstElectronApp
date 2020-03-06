<template>
    
    <v-row
        align="center"
        justify="center"
    >
        <v-col cols="12">
            <v-card>
                <!-- Title -->
                <v-toolbar color="primary" dark flat>
                    <template>
                        <v-toolbar-title>
                            Edit Link 
                        </v-toolbar-title>

                        <v-spacer></v-spacer>
                    </template>
                </v-toolbar>
                <v-card-text>
                    <link-edit 
                        :label.sync="link.label"
                        :url.sync="link.url"
                    ></link-edit >
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                        <v-btn
                            text
                            secondary
                            @click.stop="cancel()"
                        >
                            cancel
                        </v-btn>
                        <v-btn
                            text
                            color="primary"
                            @click.stop="save()"
                        >
                            Save
                        </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import navMixin from '@/mixins/navMixin';
import LinkEdit from '@/components/LinkEdit';


export default {
    props: ['id'],
    mixins: [ navMixin ],
    components:{
        'link-edit': LinkEdit,
    },
    data() {
        return {
            link: {},
        };
    },
    mounted(){
        this.load();
    },
    methods: {
        async load(){
            const self = this;
            await this.$db.Link
                .forge({id: self.id})
                .fetch()
                .then(model => {
                    self.link = model.attributes;
                });
        },
        done(){
            this.goToRoute('/links');
        },
        cancel(){
            this.done();
        },
        async save(){
            const self = this;
            await this.$db.Link
                .forge({id: self.id})
                .save(self.link)
                .then(model => {
                    self.done();
                })
        }
    }
}
</script>