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
                            Add Link
                        </v-toolbar-title>

                        <v-spacer></v-spacer>
                    </template>
                </v-toolbar>



                <v-card-text>
                    <v-form>
                        <v-text-field
                            label="Label"
                            v-model="label"
                            outlined
                        ></v-text-field>
                        <v-text-field
                            label="Url"
                            v-model="url"
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
    mixins: [ navMixin ],
    data() {
        return {
            label: null,
            url: null,
        };
    },
    methods: {
        done(){
            this.goToRoute('/links');
        },
        cancel(){
            this.done();
        },
        save(){
            const self = this;
            this.$db.Link.forge({
                label: this.label,
                url: this.url,
            }).save().then(model => {
                console.log(model)
                self.done();
            })
        }
    }
}
</script>

