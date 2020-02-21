<template>

    <v-row
        align="center"
        justify="center"
    >
        <v-col cols="10">
            <v-card>
                <!-- Title -->
                <v-toolbar color="primary" dark flat>

                    <template v-if="selectedRows.length">
                        <v-toolbar-title>
                            {{selectedRows.length}} {{selectedRows.length == 1 ? 'item' : 'items'}} selected
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn dark icon @click="promptDeleteItems(selectedRows)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </template>

                    <template v-else>
                        <v-toolbar-title>
                            Links
                        </v-toolbar-title>

                        <v-spacer></v-spacer>
                        <v-btn  dark icon @click="goToRoute('/addLink')" title="Add Book">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </template>
                    
                </v-toolbar>



                <v-card-text>
                    <v-simple-table
                        :style="{height}"
                        :dense="dense"
                        :fixed-header="fixedHeader"
                    >
                        <template v-slot:default>
                        <thead>
                            <tr>
                                <th class="text-left">
                                    <span @click="clickMasterCheck" >
                                        <v-checkbox readonly :input-value="c_allSelected" :indeterminate="c_someSelected && !c_allSelected"/>
                                    </span>
                                </th>
                                <th class="text-left">Label</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in links" :key="item.id">
                                <td class="check-column">
                                    <v-checkbox
                                        v-model="selectedRows"
                                        :value="item.id"
                                    />
                                </td>
                                <td>
                                    <template v-if="item.url">
                                        <a @click="openLinkExternal(item.url)">{{ item.label }}</a>
                                    </template>
                                    <template v-else>
                                        {{ item.label }}
                                    </template>
                                </td>
                                <td class="text-right">
                                    <v-btn icon @click="editItem(item.id)">
                                        <v-icon title="edit">
                                            mdi-pencil
                                        </v-icon>
                                    </v-btn>
                                    <v-btn icon @click="promptDeleteItems([item.id])">
                                        <v-icon title="delete">
                                            mdi-delete
                                        </v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                        </template>
                    </v-simple-table>
                    <!-- Confirm Delete Dialog -->
                    <v-dialog
                        v-model="showConfirmDeleteDialog"
                        width="500"
                    >
                        <v-card>
                            <v-card-title class="headline primary white--text" primary-title>
                                Confirm Delete
                            </v-card-title>

                            <template v-if="deleteProcessing">
                                <div class="pa-4 complete-center">
                                    <v-progress-circular indeterminate color="primary"/>
                                </div>
                            </template>
                            <template v-else>
                                <div class="pa-4">
                                    Are you sure you want to delete {{deleteItems.length}} {{deleteItems.length == 1 ? 'item' : 'items'}}?
                                </div>
                            </template>

                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="secondary" @click="cancelDeleteItems" :disabled="deleteProcessing">
                                    Cancel
                                </v-btn>
                                <v-btn color="primary" @click="confirmDeleteItems" :disabled="deleteProcessing">
                                    Confirm
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import md5 from 'md5';
import navMixin from '@/mixins/navMixin';


let makeMasterCheckbox = function(itemName) {
    const masterCheckboxMixin = {
        data() {
            return {
                selectedRows: [],
            };
        },
        computed: {
            c_allSelected(){
                let total = this[itemName].length;
                return this.selectedRows.length == total && total != 0;
            },
            c_someSelected(){
                return this.selectedRows.length != 0;
            },
        },
        methods: {
            clickMasterCheck(){
                if(this.c_allSelected || this.c_someSelected){
                    this.selectedRows = [];
                } else {
                    this.selectedRows = this[itemName].map(item => item.id);
                }
            },
            deselect(ids){
                let idArray = Array.isArray(ids) ? ids : [ids];
                // Remove from selected list
                this.selectedRows = this.selectedRows.filter((value) => {
                    return !idArray.includes(value);
                })
            }
        },
    }
    return masterCheckboxMixin;
}




export default {
    mixins: [ 
        navMixin,
        makeMasterCheckbox('links')
    ],
    data() {
        return {
            links: [],
            dense: false,
            fixedHeader: true,
            height: 300,
            deleteItemIds: [],
            deleteProcessing: false,
            showConfirmDeleteDialog: false,
            isPageLoaded: false,
        };
    },
    methods: {
        promptDeleteItems(items){
            this.deleteItemIds = items;
            this.showConfirmDeleteDialog = true;
        },
        cancelDeleteItems(){
            this.showConfirmDeleteDialog = false;
        },
        confirmDeleteItems(){
            this.deleteItems(this.deleteItemIds);
            this.showConfirmDeleteDialog = false;
        },
        async editItem(id){
            console.log(`/editLink/${id}`, id);
            this.goToRoute(`/editLink/${id}`);
        },
        async deleteItems(ids){
            this.deleteProcessing = true;
            
            // Delete data from db
            await this.$db.Link.query().whereIn('id', ids).delete();

            // Remove from selected list
            this.deselect(ids);

            // Reload data
            this.loadData();

            this.deleteProcessing = false;
        },
        loadData(){
            this.$db.Link.query().then(data => {
                console.log('data', data);
                this.links = data;
            });
        },
    },
    created() {
        this.loadData();
    }
}
</script>

