<template>
    <div>
        <v-btn @click="openDialog">Upload</v-btn>
        <v-btn @click="loadData">Refresh</v-btn>
        <v-btn @click="pasteImage">Paste</v-btn>
        <v-btn @click="testQuery">testQuery</v-btn>

        

        <v-dialog v-model="showOverlay" scrollable max-width="100%">
            <v-card>
                <v-card-text class="pt-5">
                    <v-img v-if="content" :src="c_image" contain/>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn text @click="showOverlay = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <template v-for="image in c_imageList">
            <div :key="image.id" v-if="image.content">
                <img :src="image.content"/>
                {{image.image_id}}
                {{image.image_size_id}}
                {{image.image.base_name}}
                {{image.size.name}}

                <v-btn icon @click="loadOriginal(image.image_id)"><v-icon>mdi-image-size-select-large</v-icon></v-btn>
                <v-btn icon @click="deleteImages([image.image_id])"><v-icon>mdi-delete</v-icon></v-btn>
                <br/>
            </div>
        </template>
    </div>
</template>


<script>

import ImageRepository from '@/utils/imageRepository';

const electron = window.electron;
const ipcRenderer  = window.ipcRenderer;
const electronFs = electron.remote.require('fs');
const mime = require('mime-types')
const basename = require('basename');



export default {
    created(){
        this.init();
    },
    data(){
        return {
            imageList: [],

            mimeType: '',
            base: '',
            extension: '',
            fileSize: '',
            content: '',
            imageRepo: null,

            showOverlay: false,
        }
    },
    computed: {
        c_image(){
            return `data:${this.mimeType};base64,${this.content}`
        },
        c_imageList(){
            console.log('this.imageList', this.imageList);
            return this.imageList.map((image) => {
                return {
                    ...image,
                    content: `data:${image.mime_type};base64,${image.base64}`,
                }
            })
        }
    },
    methods: {

        async testQuery(){

            let watch = ['billy bounce', 'full tilt'];
            const self = this;
              var authOptions = {
                method: 'GET',
                url: 'https://api.fortnitetracker.com/v1/store',
                headers: {
                    'TRN-Api-Key': 'd59e8c40-be86-461a-8bf6-855ca1a6f5e5',
                },
                json: true
            };
            return self.$http(authOptions)
                .then(function(response){
                    let name = "full tilt"

                    if(Array.isArray(response.data)){
                        let desired = response.data.find(item => {
                            if(watch.includes(item.name.toLowerCase())){
                                return true;
                            }
                            return false;
                        })
                        if(typeof(desired) !== 'undefined'){
                            alert(`${name} is available!!!!`)
                        }
                    }
                    
                    console.log(response.data);
                    console.log(response.status);
                })
                .catch(function(error){
                    console.log(error);
                });
        },

        async init(){
            this.imageRepo = new ImageRepository(this.$db);
            await this.imageRepo.initValues();
            await this.loadData();
        },
        async loadOriginal(id){
            console.log('id', id);
            const self = this;
            let results = await self.imageRepo.fetchVariants({
                imageIds: [id],
                size: 'original',
            });
            console.log(results);
            if(typeof(results[0]) !== 'undefined'){
                let result = results[0];
                self.mimeType = result.mime_type;
                self.content = result.base64;
                self.showOverlay = true;
            }
        },
        async loadData(){
            const self = this;

            self.imageList = [];
            let results = await self.imageRepo.fetchVariants({
                size: 'thumb',
            });
            self.imageList = results;
        },

        async deleteImages(ids){
            await this.imageRepo.deleteImages(ids);
            this.loadData();
        },

        async pasteImage(){
            const self = this;
            const clipboardItems = await navigator.clipboard.read();
        
            let mime = clipboardItems[0].types[0];
            const blobOutput = await clipboardItems[0].getType(mime);
        
            var reader = new FileReader();
            reader.readAsArrayBuffer(blobOutput); 
            reader.onloadend = async function() {
                var bufferArray = reader.result; 

                let variantCallback = (variantInfo) => {
                    
                }

                await self.imageRepo.processBuffer(mime, bufferArray, variantCallback)
                //console.log(base64data);
                //document.getElementById('image-field').src = base64dataSrc;
            }
        },

        async openDialog(){
            const self = this;


            // Open Dialog
            let opts = { 
                filters: [
                    { 
                        name: 'Images', 
                        extensions: ['jpg', 'png', 'gif', 'bmp'] 
                    },
                ],
                properties: [ 
                    'openFile', 
                    'multiSelections',
                    //'openDirectory'/*, */ 
                ]
            };
            let response = await electron.remote.dialog.showOpenDialog(opts);



            // Handle response
            if(response.canceled){
                console.log('canceled', response);
            } else {
                console.log('success', response.filePaths);

                let variantCallback = (variantInfo) => {
                    console.log({variantInfo})
                }

                let promises = response.filePaths.map(async path => await self.imageRepo.processPath(path, variantCallback))
                await Promise.all(promises);
                this.loadData();


            }
        },
       
        
    }    
}
</script>


<style scoped>

</style>