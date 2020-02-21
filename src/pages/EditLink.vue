<template>
    
    <v-row
        align="center"
        justify="center"
    >
        <v-col cols="10">
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
                    <v-form>
                        <v-text-field
                            label="Label"
                            v-model="link.label"
                            outlined
                        ></v-text-field>
                        <v-text-field
                            label="Url"
                            v-model="link.url"
                            outlined
                        ></v-text-field>
                        
                    </v-form>
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
import md5 from 'md5';
import navMixin from '@/mixins/navMixin';

export default {
    props: ['id'],
    mixins: [ navMixin ],
    data() {
        return {
            link: {},

            label: null,
            url: null,
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

