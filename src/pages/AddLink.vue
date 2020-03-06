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
                            Add Link
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
import { getNestedValue } from '@/utils/objectMethods';

export default {
    mixins: [ navMixin ],
    components:{
        'link-edit': LinkEdit,
    },
    data() {
        return {
            link: {
                label: '',
                url: '',
            },
        };
    },
    methods: {
        done(){
            this.goToRoute('/links');
        },
        cancel(){
            this.done();
        },
        async getHighestDisplayOrder(){
            let lastItem = await this.$db.Link
                                    .query()
                                    .max('display_order', {as: 'max_display_order'})
                                    .first();

            let defaultMaxDisplayOrder = 0;
            let maxDisplayOrder = getNestedValue(lastItem, 'max_display_order', defaultMaxDisplayOrder);
            
            return maxDisplayOrder;
        },
        async save(){
            const self = this;

            try {
                let highestDisplayOrder = await this.getHighestDisplayOrder();

                let model = await this.$db.Link
                                        .forge({
                                            ...this.link,
                                            display_order: highestDisplayOrder + 1,
                                        })
                                        .save();

                console.log(model)
                self.done();

            } catch(err){
                console.log("An error occured", err);
            }
        }
    },
}
</script>

