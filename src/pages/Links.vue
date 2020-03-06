<template>

    <v-row
        align="center"
        justify="center"
    >
        <v-col cols="12">
            <v-card>
                <!-- Title -->
                <v-toolbar color="primary" dark flat>

                    <template v-if="selectedIds.length">
                        <v-toolbar-title>
                            {{selectedIds.length}} {{selectedIds.length == 1 ? 'item' : 'items'}} selected
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn dark icon @click="deletePrompt.prompt(selectedIds)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </template>

                    <template v-else>
                        <v-toolbar-title>
                            Links
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn dark icon @click="filter.toggleFilter" v-bind="{'input-value': filter.isActive.value}" title="toggleFilter">
                            <v-icon>mdi-filter</v-icon>
                        </v-btn>

                        <v-btn  dark icon @click="goToRoute('/addLink')" title="Add Book">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </template>
                    
                </v-toolbar>


                <!-- Filter -->
                <v-card-text v-if="filter.isActive.value"> 
                    <v-text-field 
                        v-model="filter.filterText.value" 
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
                                            <v-checkbox readonly :input-value="isAllSelected" :indeterminate="isIndeterminate"/>
                                        </span>
                                    </th>
                                    <th class="text-left" @click.exact="sortableList.toggleSortOrder('label')" @click.shift.exact="sortableList.toggleSortOrder('label', true)">
                                        Label
                                        <v-icon>{{sortableList.getSortIcon('label')}}</v-icon>
                                    </th>
                                    <th class="text-left" @click.exact="sortableList.toggleSortOrder('display_order')" @click.shift.exact="sortableList.toggleSortOrder('display_order', true)">
                                        Order
                                        <v-icon>{{sortableList.getSortIcon('display_order')}}</v-icon>
                                    </th>
                                    <th class="text-right">Actions</th>
                                </tr>
                            </thead>
                            <draggable 
                                v-model="sortableList.orderedFilteredList.value" 
                                v-bind="sortableList.dragOptions.value"
                                tag="tbody" 
                                handle=".handle" 
                                @start="sortableList.setDraggingState(true)" 
                                @end="sortableList.setDraggingState(false)"
                            >
                                <tr v-for="item in sortableList.orderedFilteredList.value" :key="item.id">
                                    <td class="check-column">
                                        <span @click.stop.exact="clickCheck(item.id)" @click.shift.exact="shiftClickCheck(item.id)">
                                            <v-checkbox readonly :input-value="selectedIds" :value="item.id"/>
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
                                                <v-icon :class="{handle: true, grabbing: sortableList.isDragging.value}">mdi-drag-horizontal</v-icon>
                                            </v-btn>
                                            <v-btn icon @click="editItem(item.id)">
                                                <v-icon title="edit">
                                                    mdi-pencil
                                                </v-icon>
                                            </v-btn>
                                            <v-btn icon @click="deletePrompt.prompt([item.id])">
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
                        v-model="deletePrompt.isShown.value"
                        width="500"
                    >
                        <v-card>
                            <v-card-title class="headline primary white--text" primary-title>
                                Confirm Delete
                            </v-card-title>

                            <template v-if="deletePrompt.processing.value">
                                <div class="pa-4 complete-center">
                                    <v-progress-circular indeterminate color="primary"/>
                                </div>
                            </template>
                            <template v-else>
                                <div class="pa-4">
                                    Are you sure you want to delete {{deletePrompt.count.value}} {{deletePrompt.count.value == 1 ? 'item' : 'items'}}?
                                </div>
                            </template>

                            <v-divider></v-divider>

                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="secondary" @click="deletePrompt.cancel" :disabled="deletePrompt.processing.value">
                                    Cancel
                                </v-btn>
                                <v-btn color="primary" @click="deletePrompt.confirm" :disabled="deletePrompt.processing.value">
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
import Vue from 'vue';
import md5 from 'md5';
import navMixin from '@/mixins/navMixin';
import draggable from 'vuedraggable'

import { getNestedValue } from '@/utils/objectMethods';
import { ref, computed, watch, onMounted, onUnmounted, reactive } from '@vue/composition-api';




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

//              Use Checkbox List 

//=============================================
let useCheckList = function(items, getId=(i)=>(i.id)){

    let selectedIds = ref([]);
    let lastClicked = ref(null);

    // Create a map for efficent lookup 
    let selectedIdMap = computed(() => {
        let selectedMap = {}
        if(selectedIds.value.length > 0){
            selectedIds.value.map(id => {
                selectedMap[id] = true;
            })
        }
        return selectedMap;
    })


    // Make sure all checked items are visible 
    watch(items, () => {
        let newSelected = [];
        items.value.map(item => {
            let id = getId(item);
            if(typeof(selectedIdMap.value[id]) !== 'undefined')
                newSelected.push(id);
        })
        selectedIds.value = newSelected;
    })


    let isAllSelected = computed(() => {
        let total = items.value.length;
        return selectedIds.value.length == total && total != 0;
    })


    let isSomeSelected = computed(() => {
        return selectedIds.value.length != 0;
    })


    let  isIndeterminate = computed(() => {
        return !isAllSelected.value && isSomeSelected.value;
    })


    let clickCheck = (id) => {
        let index = selectedIds.value.findIndex(item => item === id);
        let temp = [...selectedIds.value];
        if(index > -1){
            selectedIds.value.splice(index, 1);
        } else {
            selectedIds.value.push(id);
        }
        lastClicked.value = id;
    }


    let shiftClickCheck = (id) => {

        // Check if provided id is selected
        let selectedValue = selectedIds.value.findIndex(item => item === id) === -1;

        // Collect the Ids within range
        let detected = 0;
        let detectedBoth = false;
        let idList = [];
        items.value.map(item => {
            let isClickedItem = getId(item) == id;
            
            // If id denotes an extream of the range
            if(item.id == lastClicked.value || isClickedItem)
                detected += 1;
            
            // If the id is within the inclusive range collect
            if(isClickedItem || (0 < detected && !detectedBoth && lastClicked.value !== null)){
                idList.push(getId(item));
            }

            // Detect if all have been collected
            if(detected == 2)
                detectedBoth = true;
        })

        // Select or deselect array of items
        let temp = [...selectedIds.value];
        if(selectedValue){
            idList.map(id => {
                temp.push(id);
            })
        } else {
            temp = temp.filter(value => idList.indexOf(value) === -1);
        }

        // Filter for distinct 
        selectedIds.value = temp.filter((value, index, arr) => arr.indexOf(value) === index);

        // Updated last checkbox clicked 
        lastClicked.value = id;
    }


    let clickMasterCheck = () => {
        if(isAllSelected.value || isSomeSelected.value){
            selectedIds.value = [];
        } else {
            selectedIds.value = items.value.map(item => getId(item));
        }
    }


    let inverseSelection = () => {
        // Foreach item if ID is not found in map, add to new array of selected ids
        let newSelected = [];
        if(items.value.length) {
            items.value.map(item => {
                let id = getId(item);
                if(typeof(selectedIdMap.value[id]) === 'undefined')
                    newSelected.push(id);
            })
        }
        selectedIds.value = newSelected;
    }


    let deselect = (ids) => {
        let idArray = Array.isArray(ids) ? ids : [ids];
        // Remove from selected list
        selectedIds.value = selectedIds.value.filter((value) => {
            return !idArray.includes(value);
        })
    }


    let isIdSelected = (id) => {
        return selectedIds.value.includes(id);
    }


    return {
        selectedIds,
        lastClicked,
        isAllSelected,
        isSomeSelected,
        isIndeterminate,

        isIdSelected,
        clickCheck,
        shiftClickCheck,
        clickMasterCheck,
        deselect,
        inverseSelection,
    }
}


//=============================================

//              Use Filter List 

//=============================================
let useFilter = (items) => {
    let filterText = ref('');
    let isActive = ref(false);


    let toggleFilter = () => {
        isActive.value = !isActive.value;
        filterText.value = '';
    }

    
    let c_filterText = computed(() => {
        if(typeof(filterText.value) !== 'string')
            return '';
        return String(filterText.value).toLowerCase();
    })


    let filteredList = computed(() => {
        let results = [...items.value];
        let filterText = c_filterText.value;
        if(filterText.length > 0 && isActive.value){
            results = results.filter((item) => {
                return String(item.label)
                            .toLowerCase()
                            .indexOf(filterText) > -1
            })
        }
        return results;
    });


    return {
        filterText,
        isActive,
        c_filterText,
        filteredList,
        
        toggleFilter,
    }
}


//=============================================

//              Use Sort List 

//=============================================
let useSort = (items, filteredList, updateItem, fetchFighestPosition) => {

    let isDragging = ref(false);

    let dragOptions = ref({
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
    });

    let highestDisplayOrder = ref(0);
    
    let sorts = ref([
        {
            field: 'display_order',
            dir:   'DESC',
        }
    ]);


    let getSortIcon = (sortField) => {
        let sortItem = sorts.value.find(sort => sort.field === sortField);
        if(typeof(sortItem) !== 'undefined'){
            if(sortItem.dir == 'ASC'){
                return 'mdi-menu-up';
            } else if(sortItem.dir == 'DESC'){
                return 'mdi-menu-down';
            }
        }
        return '';
    }


    let fetchHighestDisplayOrder = async () =>{
        let maxDisplayOrder = 0;
        
        let fetch = await fetchFighestPosition();
        let val = parseFloat(fetch);
        if(!isNaN(val))
            maxDisplayOrder = val;
        
        highestDisplayOrder.value = maxDisplayOrder;
    }


    onMounted(() => {
        fetchHighestDisplayOrder();
    })


    let sortArray = (arr, sorts) => {
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
    }


    let orderedFilteredList = computed({
        get(){
            let results = [...filteredList.value];
            return sortArray(results, sorts.value);
        },
        set(arr){
            // Updates a subset of the items
            // To add or remove items uses should manipulate this.items directly
            // Keep track of the dispay positions present in the filtered list
            
            let displayPositions = arr.map(item => {
                // Get the display order of this item being sorted
                let pos = item.display_order;
                // If a number does not exist
                if(item.display_order === null){
                    ++highestDisplayOrder.value;

                    // Assign position
                    pos = highestDisplayOrder.value;
                }

                return pos;
            });

            // Sort positions so that we can take the values off the end efficently
            let dir = 'ASC';
            if(sorts.value.length > 0){
                // Take last sort direction
                dir = sorts.value[sorts.value.length-1].dir;
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

                // Update Item
                updateItem(item);
            });

            let temp = [...items.value];
            temp = sortArray(temp, sorts.value);
            items.value = temp;
        }
    })


    let toggleSortOrder = (sortField, append=false) => {
        // Cycle = [ASC, DESC, NULL]
        var sortFieldFound = false;     // used to tell if item must be added to list
        var removeIndicies = [];        // used to tell if item(s) should be removed

        // For each sort item check the value
        let temp = sorts.value.map((item, i) => {
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
        sorts.value = temp;
    }


    let setDraggingState = (val) => {
        isDragging.value = val;
    }

    

    return {
        isDragging,
        setDraggingState,
        dragOptions,
        highestDisplayOrder,
        sorts,
        sortArray,
        getSortIcon,
        toggleSortOrder,
        orderedFilteredList,
    }
}


//=============================================

//          Delete Prompt Mixin

//=============================================
let useDeletePropmt = (deselectItems, loadData, deleteItems) => {
    let ids = ref([]);
    let processing = ref(false);
    let isShown = ref(false);

    let prompt = (items) => {
        ids.value = items;
        isShown.value = true;
    }

    let cancel = () => {
        isShown.value = false;
    }

    let execDeleteItems = async (ids) => {
        processing.value = true;
        
        // Remove from selected list
        deselectItems(ids);

        // Delete data
        await deleteItems(ids);

        // Reload data
        await loadData();

        processing.value = false;
    }

    let confirm = () => {
        execDeleteItems(ids.value);
        isShown.value = false;
    }

    let count = computed(() => {
        return ids.value.length
    })

    return {
        count,
        ids,
        processing,
        isShown,

        prompt,
        cancel,
        confirm,
    }
}




export default {
    mixins: [ 
        navMixin,
    ],
    components: {
        draggable,
    },
    setup(){
        let links = ref([]);
        let db = Container.db;


        // Persistant storage
        let loadData = () => {
            db.Link.query().then(data => {
                links.value = data;
            });
        }
        let fetchHighestDisplayOrder = async () =>{
            let maxDisplayOrder = 0;

            let lastItem = await db.Link
                                    .query()
                                    .max('display_order', {as: 'max_display_order'})
                                    .first();
            if(lastItem !== null && typeof(lastItem.max_display_order) !== 'undefined'){
                maxDisplayOrder = await lastItem.max_display_order
            }

            return maxDisplayOrder;
        }
        let updateItem = (item) => {
             db.Link
                .forge({id: item.id})
                .save(item);
        }
        let deleteItems = async (ids) => {
            await db.Link.query().whereIn('id', ids).delete();
        }



        // Sort item logic
        let filter = useFilter(links);
        let sortableList = useSort(links, filter.filteredList, updateItem, fetchHighestDisplayOrder);
        let checkList = useCheckList(sortableList.orderedFilteredList, (item) => item.id);
        

        // Delete item logic
        let deletePrompt = useDeletePropmt(checkList.deselect, loadData, deleteItems);


        // Keyboard Search Shortcut -----------------
        let bindSearchShortcut = (e) => {
            if(e.keyCode == 70 && e.ctrlKey){
                //user pressed ctrl+f
                filter.toggleFilter();
            }
        }
        onMounted(()    => {window.addEventListener(   "keydown", bindSearchShortcut)})
        onUnmounted(()  => {window.removeEventListener("keydown", bindSearchShortcut)})
        //-------------------------------------------

        onMounted(() => {
            loadData()
        })

        return {
            loadData,
            links,
            filter,
            ...checkList,
            sortableList,
            deletePrompt,
        }
    },

    data() {
        return {
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
    },
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