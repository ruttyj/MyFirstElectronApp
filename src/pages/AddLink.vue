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
import navMixin from '@/mixins/navMixin';

export default {
    mixins: [ navMixin ],
    data() {
        return {
            link: {
                label: null,
                url: null,
            }
        };
    },
    methods: {
        done(){
            this.goToRoute('/links');
        },
        cancel(){
            this.done();
        },
        async save(){
            const self = this;

            try {
                let maxDisplayOrder = 0;
                let lastItem = await this.$db.Link.query().max('display_order', {as: 'max_display_order'}).first();
                if(lastItem !== null && typeof(lastItem.max_display_order) !== 'undefined'){
                    maxDisplayOrder = lastItem.max_display_order
                }
                console.log('lastItem', lastItem);


                let model = await this.$db.Link
                    .forge({
                        ...this.link,
                        display_order: maxDisplayOrder+1,
                    })
                    .save();

                console.log(model)
                self.done();

            } catch(err){
                console.log("An error occured", err);
            }
        }
    }
}
</script>

