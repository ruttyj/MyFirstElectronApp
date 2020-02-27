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
                        <v-btn dark icon @click="toggleFilter" v-bind="{'input-value': activeFilter}" title="toggleFilter">
                            <v-icon>mdi-filter</v-icon>
                        </v-btn>

                        <v-btn  dark icon @click="goToRoute('/addLink')" title="Add Book">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </template>
                    
                </v-toolbar>


                <!-- Filter -->
                <v-card-text v-if="activeFilter"> 
                    <v-text-field 
                        v-model="filterText" 
                        label="Filter" 
                        outlined
                        hide-details
                        clearable
                        autofocus
                    ></v-text-field>
                </v-card-text>

                <!-- Links Table -->
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
                                    <th class="text-left" @click.exact="toggleSortOrder('label')" @click.shift.exact="toggleSortOrder('label', true)">
                                        Label
                                        <v-icon>{{getSortIcon('label')}}</v-icon>
                                    </th>
                                    <th class="text-left" @click.exact="toggleSortOrder('display_order')" @click.shift.exact="toggleSortOrder('display_order', true)">
                                        Order
                                        <v-icon>{{getSortIcon('display_order')}}</v-icon>
                                    </th>
                                    <th class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <draggable 
                                v-model="c_links" 
                                v-bind="dragOptions"
                                tag="tbody" 
                                handle=".handle" 
                                @start="drag = true" 
                                @end="drag = false"
                            >
                                <tr v-for="item in c_links" :key="item.id">
                                    <td class="check-column">
                                        <span @click.stop.exact="clickCheck(item.id)" @click.shift.exact="shiftClickCheck(item.id)">
                                            <v-checkbox readonly :input-value="selectedRows" :value="item.id"/>
                                        </span>
                                    </td>
                                    
                                    <td>
                                        <template v-if="item.url">
                                            <a @click="openLinkExternal(item.url)">{{ item.label }}</a>
                                        </template>
                                        <template v-else>
                                            {{ item.label }}
                                        </template>
                                    </td>

                                    <td>
                                        {{ item.display_order }}
                                    </td>


                                    <td class="text-right">
                                        <div class="action-wrapper">
                                            <v-btn icon>
                                                <v-icon :class="{handle: true, grabbing: drag}">mdi-drag-horizontal</v-icon>
                                            </v-btn>
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
                                        </div>
                                    </td>
                                </tr>
                            </draggable>
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
import draggable from 'vuedraggable'

import { getNestedValue } from '@/utils/objectMethods';

//=============================================

//              Checkbox Mixin

//=============================================
let makeMasterCheckbox = function(itemName) {
    const masterCheckboxMixin = {
        data() {
            return {
                selectedRows: [],
                lastClicked: null,
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
            
            clickCheck(id){
                let index = this.selectedRows.findIndex(item => item === id);
                let temp = [...this.selectedRows];
                if(index > -1){
                    this.selectedRows.splice(index, 1);
                } else {
                    this.selectedRows.push(id);
                }
                this.lastClicked = id;
            },
            shiftClickCheck(id){
                const self = this;

                let selectedValue = this.selectedRows.findIndex(item => item === id) === -1;

                let detected = 0;
                let detectedBoth = false;
                let idList = [];

                this.c_links.map(item => {
                    let isClickedItem = item.id == id;
                    
                    if(item.id == self.lastClicked || isClickedItem)
                        detected += 1;
                    
                    if(isClickedItem || (0 < detected && !detectedBoth && self.lastClicked !== null)){
                        idList.push(item.id);
                    }

                    if(detected == 2){
                        detectedBoth = true;
                    }
                })

                let temp = [...this.selectedRows];
                if(selectedValue){
                    idList.map(id => {
                        temp.push(id);
                    })
                } else {
                    temp = temp.filter(value => idList.indexOf(value) === -1);
                }

                this.selectedRows = temp.filter((value, index, self) => self.indexOf(value) === index);
                this.lastClicked = id;
            },
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


//=============================================

//            Sorting Comparitors

//=============================================
let makeIntegerSort = (dir='ASC') => (a, b) => {
    let isAsc = String(dir).toUpperCase() == 'ASC' ? true : false;
    let intA = parseInt(a)
    let intB = parseInt(b)
    let dir1 = isAsc ? 1 : -1;
    let dir2 = isAsc ? -1 : 1;
    return (intA == intB) ? 0 : (intA > intB) ? dir1 : dir2;
}

let makeNestedSort = (field='display_order', dir='ASC') => (a, b) => {
    let valA = getNestedValue(a, field, undefined);
    let valB = getNestedValue(b, field, undefined);
    if(typeof(valA) == 'number')
        valA = parseFloat(valA);
    if(typeof(valB) == 'number')
        valB = parseFloat(valB);
    let isAsc = String(dir).toUpperCase() == 'ASC' ? true : false;
    let dir1 = isAsc ? 1 : -1;
    let dir2 = isAsc ? -1 : 1;
    return (valA == valB) ? 0 : (valA > valB) ? dir1 : dir2;
}


//=============================================

//          Sorting & Filtering Mixin

//=============================================
const sortableMixin = {
    components: {
        draggable,
    },
    mounted(){
        window.addEventListener("keydown", this.bindSearchShortcut);
    },
    beforeDestroy(){
        window.removeEventListener("keydown", this.bindSearchShortcut)
    },
    data(){
        return {
            drag: false,
            dragOptions:{
                animation: 200,
                group: "description",
                disabled: false,
                ghostClass: "ghost"
            },
            filterText: '',
            activeFilter: false,
            sorts: [
                {
                    field: 'display_order',
                    dir:   'DESC',
                }
            ],
        }
    },
    methods: {
        bindSearchShortcut(e){
            if(e.keyCode == 70 && e.ctrlKey){
                //user pressed ctrl+f
                this.toggleFilter();
            }
        },
        toggleFilter(){
            this.activeFilter = !this.activeFilter;
            this.filterText = '';
        },
        toggleSortOrder(sortField, append=false){
            // Cycle = [ASC, DESC, NULL]
            var sortFieldFound = false;     // used to tell if item must be added to list
            var removeIndicies = [];        // used to tell if item(s) should be removed

            // For each sort item check the value
            let temp = this.sorts.map((item, i) => {
                let key = item.field;
                let dir = String(item.dir).toUpperCase();
                let itemClone = {...item};

                // If is the field being toggled, cycle it's value
                if(key === sortField){
                    if(dir === 'ASC'){
                        sortFieldFound = true;
                        itemClone.dir = 'DESC';
                    } else if(dir === 'DESC'){
                        sortFieldFound = true;
                        removeIndicies.push(i);
                    }
                } else if(!append) {
                    // If not shift clicking only have one sort field 
                    removeIndicies.push(i);
                }
                return itemClone;
            });

            // Remove from sort
            if(removeIndicies.length > 0){
                removeIndicies.reverse().map(i => {
                    temp.splice(i, 1);
                })
            }

            // Add to list of sorts
            if(!sortFieldFound){
                temp.push({
                    field:  sortField,
                    dir:    'ASC',
                });
            }

            // Update sorts
            this.sorts = temp;
        },
        sortArray(arr, sorts){
            const self = this;
            if(sorts.length > 0){

                // Apply sorts in reverse order
                var reverseSorts = [...sorts].reverse();

                // Shallow preform sorts on shallow copy
                var temp = [...arr];
                reverseSorts.map(sort => {
                    temp.sort(makeNestedSort(sort.field, sort.dir));
                })
                return temp;
            }
            return arr;
        },
        getSortIcon(sortField){
            let sortItem = this.sorts.find(sort => sort.field === sortField);
            if(typeof(sortItem) !== 'undefined'){
                if(sortItem.dir == 'ASC'){
                    return 'mdi-menu-up';
                } else if(sortItem.dir == 'DESC'){
                    return 'mdi-menu-down';
                }
            }
            return '';
        }
    },
    computed: {
        c_filterText(){
            if(typeof(this.filterText) !== 'string')
                return '';
            return String(this.filterText).toLowerCase();
        },
        c_links: {
            get(){
                let results = [...this.links];
                let filterText = this.c_filterText;

                if(filterText.length > 0 && this.activeFilter){
                    results = results.filter((item) => {
                        return String(item.label)
                            .toLowerCase()
                            .indexOf(filterText) > -1
                    })
                }

                results = this.sortArray(results, this.sorts);

                return results;
            },
            set(arr){
                // Updates a subset of the links
                // To add or remove items uses should manipulate this.links directly
                const self = this;

                // Keep track of the dispay positions
                let displayPositions = arr.map(item => item.display_order);

                // Sort positions so that we can take the values off the end efficently
                let dir = 'ASC';
                if(this.sorts.length > 0){
                    // Take last sort direction
                    dir = this.sorts[this.sorts.length-1].dir;
                }
                let isAsc = (dir == 'ASC');
                if(isAsc)
                    displayPositions.sort(makeIntegerSort('DESC'));
                else {
                    displayPositions.sort(makeIntegerSort('ASC'));
                }

                // Update order of visible
                arr.map(item => {
                    // update through reference
                    item.display_order = displayPositions.pop();

                    // Update DB
                    self.$db.Link
                        .forge({id: item.id})
                        .save(item);
                });

                let temp = [...self.c_links];
                temp = this.sortArray(temp, this.sorts);
                self.links = temp;
            }
        }
    },
}


//=============================================

//          Delete Prompt Mixin

//=============================================
const deleteProptDialog = {
    data() {
        return {
            deleteItemIds: [],
            deleteProcessing: false,
            showConfirmDeleteDialog: false,
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
    }
}


export default {
    mixins: [ 
        navMixin,
        makeMasterCheckbox('links'),
        sortableMixin,
        deleteProptDialog,
    ],
    data() {
        return {
            links: [],
            dense: false,
            fixedHeader: true,
            height: 300,
            isPageLoaded: false,
        };
    },
    
    methods: {
        async editItem(id){
            this.goToRoute(`/editLink/${id}`);
        },
        
        loadData(){
            this.$db.Link.query().then(data => {
                this.links = data;
            });
        },
    },
    created() {
        this.loadData();
    }
}
</script>



<style scoped>
.action-wrapper {
    display: flex;
}

.flip-list-move {
    transition: transform 0.5s;
}
.no-move {
    transition: transform 0s;
}
.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
.list-group {
    min-height: 20px;
}
.list-group-item {
    cursor: move;
}
.list-group-item i {
    cursor: pointer;
}

>>> .handle {
    cursor: grab;
}
</style>
