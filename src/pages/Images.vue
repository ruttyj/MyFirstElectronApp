<template>
    <div>
        <v-btn @click="openDialog">Upload</v-btn>
        <v-btn @click="loadData">Refresh</v-btn>


        <v-img v-if="src" :src="src" aspect-ratio="1.7" contain></v-img>

        <template v-for="image in c_imageList">
            <div :key="image.id">
                <v-img v-if="image.content" :src="image.content" aspect-ratio="1.7" contain></v-img>
                {{image.base}} <v-btn icon @click="deleteFiles([image.id])"><v-icon>mdi-delete</v-icon></v-btn>
                <br/>
            </div>
        </template>
    </div>
</template>


<script>
const electron = window.electron;
const ipcRenderer  = window.ipcRenderer;
const electronFs = electron.remote.require('fs');
const mime = require('mime-types')
const basename = require('basename');


export default {
    data(){
        return {
            src: '',
            imageList: [],
        }
    },
    created(){
        this.loadData();
    },
    computed: {
        c_imageList(){
            return this.imageList.map((image) => {
                return {
                    ...image,
                    content: `data:${image.mime};base64,${image.content}`,
                }
            })
        }
    },
    methods: {
        async openDialog(){
            const self = this;
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

            if(response.canceled){
                console.log('canceled', response);
            } else {
                console.log('success', response.filePaths);

                let fs = electronFs;
                let path = response.filePaths[0];

                response.filePaths.map(path => {

                    // Get Mime
                    let mimeType = mime.lookup(path);
                    console.log('mimeType', mimeType);

                    // Get Extension
                    let extension = mime.extension(mimeType);
                    console.log('extension', extension);

                    // Get Base name
                    let temp = path.split('/');
                    temp = temp[temp.length-1];
                    temp = temp.split('\\');
                    temp = temp[temp.length-1];
                    let base = basename(temp);
                    console.log('base', base);

                    //Get Stats
                    console.log('fs', fs);
                    var stats = fs.statSync(path)
                    console.log('fileSize', fileSize);
                    let fileSize = stats.size;
                    

                    var content = fs.readFileSync(path, { encoding: 'base64' });
                    console.log('content', content);

                    //*
                    self.$db.File
                        .forge({
                            mime: mimeType,
                            ext: extension,
                            base: base,
                            content: content,
                        })
                        .save()
                        .then(model => {
                            console.log(model)
                            self.loadData();
                        })
                    //*/
                  
                })
            }
        },
        async loadData(){
            const self = this;
            self.$db.File.query().then(data => {
                self.imageList = data;
            });
        },
        async getSrc(){
            const self = this;
            await this.$db.File
                .forge({id: 5})
                .fetch()
                .then(model => {


                    let attrs = model.attributes;
                    let src = `data:${attrs.mime};base64,${attrs.content}`;
                    self.src = src


                });

            
        },
        async deleteFiles(ids){
            await this.$db.File.query().whereIn('id', ids).delete();

            // Reload data
            this.loadData();
        }
    }    
}
</script>


<style scoped>

</style>