
const electron = window.electron;
const ipcRenderer  = window.ipcRenderer;
const mime = require('mime-types')
const basename = require('basename');
import { getNestedValue } from '@/utils/objectMethods';

// Convert buffer to base64 string
function Uint8ToBase64(u8Arr){
    var CHUNK_SIZE = 0x8000; //arbitrary number
    var index = 0;
    var length = u8Arr.length;
    var result = '';
    var slice;
    while (index < length) {
        slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length)); 
        result += String.fromCharCode.apply(null, slice);
        index += CHUNK_SIZE;
    }
    return btoa(result);
}


class ImageRepository {

    constructor(db){
        this.db = db;
        this.sizeIdToKeyMap = {};
        this.sideKeyToIdMap = {};
        this.imageSizes = [];
    }


    async initValues(){
        let sizeFetch = await this.db.ImageSize.fetchAll()
        
        let fallback = [];
        let sizeIdToKeyMap = {};
        let sideKeyToIdMap = {};
        let imageSizes = [];
        let results = getNestedValue(sizeFetch, 'models', fallback);
        results.map(result => {
            let size = result.attributes;
            imageSizes.push(size);
            sizeIdToKeyMap[size.id] = size.key;
            sideKeyToIdMap[size.key] = size.id;
        });
        this.sizeIdToKeyMap = sizeIdToKeyMap;
        this.sideKeyToIdMap = sideKeyToIdMap;
        this.imageSizes = imageSizes;
    }

    async deleteImages(ids){
        console.log('ids', ids);
        await this.db.Image.query().whereIn('id', ids).delete();
        await this.db.ImageVariant.query().whereIn('image_id', ids).delete();
    }


    async fetchVariants(opts={}){
        const self = this;

        // Allow a string to be passed for the size
        if(typeof(opts) === 'string')
            opts.size = opts;

        let imageIds    = opts.imageIds || undefined;
        let sizeIds     = opts.sizeIds || undefined;
        let size        = opts.size || undefined;

        let promiseToReturnVariants = new Promise((resolve, reject) => {

            // Map size_key to size_ids
            if(typeof(size) !== 'undefined'){
                let sizeId = getNestedValue(self.sideKeyToIdMap, size, undefined);
                sizeIds = [];
                if(typeof(sizeId) !== 'undefined')
                    sizeIds.push(sizeId);
            }

            // Fetch variants
            self.db.ImageVariant
                .query(builder => {
                    let b = builder;

                    if(typeof(imageIds) !== 'undefined')
                        b = b.whereIn('image_id', imageIds)
                
                    if(typeof(sizeIds) !== 'undefined')
                        b = b.whereIn('image_size_id', sizeIds)

                    return b;
                })
                .fetchAll({
                    withRelated: ['image', 'size']
                })
                .then(fetched => {
                    console.log('fetched', fetched);
                    // Extract the data from the results
                    let fallback = [];
                    let results = getNestedValue(fetched, 'models', fallback);

                    
                    let processRelations = (relations) => {
                        let hasOne = ['belongsTo', 'hasOne'];
                        return Object.keys(relations).reduce((acc, key) => {
                            let relationObj = relations[key];

                            //Has One
                            if(hasOne.includes(relationObj.relatedData.type)){
                                acc[key] = relationObj.attributes;
                            }
                            return acc;
                        }, {})
                    }
                    

                    let variants = results.map(result => {
                        return {
                            ...result.attributes,
                            // Append relations ${relationName}: {relationObject}
                            ...processRelations(result.relations),
                        }
                    });

                    resolve(variants);
                }).catch(err => {
                    reject(err);
                });
            
        })

        return promiseToReturnVariants;
    }


    async fetchAllVariants(){
        return this.fetchVariants();
    }

    // Cached Getter
    async getAllImageSizes(){
        //---------------------------------------
        // WARNING: HARDCODED 
        //---------------------------------------
        return this.imageSizes;
    }

    async processBuffer(mimeType, buffer, variantCallback=()=>{}){
        const self = this;
        
        let sizeVariants = await this.getAllImageSizes();
        
        //---------------------------------------
        // Original
        //---------------------------------------

        // Get Extension
        let extension = mime.extension(mimeType);

        // Get Base name
        let base = 'untitled';

        // Process Image base object
        let originalRow = await self.db.Image
                            .forge({
                                base_name:  base,
                            })
                            .save();
        let originalAttrs = originalRow.attributes;
        let imageId = originalAttrs.id;


        //---------------------------------------
        // Variants
        //---------------------------------------
        let promiseToProcessVariant = async imageSize => {
            // Make resized variant
            let resizedBuffer = await ipcRenderer.invoke('resize-image', {
                                    img:    new Buffer(buffer), 
                                    opts:   imageSize.config
                                })
            let variantBase64 = Uint8ToBase64(resizedBuffer); 
            let variantInfo = {
                // References
                image_id:       imageId,
                image_size_id:  imageSize.id,
                // Variant details
                mime_type:      mimeType,
                ext:            extension,
                base64:         variantBase64,
                // Keep track of applied config for when size config changes
                config:         imageSize.config,   
            }

            // Save resized variant
            let promiseToSave = new Promise((resolve, reject) => {
                self.db.ImageVariant
                    .forge(variantInfo)
                    .save()
                    .then(variantRow => {
                        let variantAttrs = variantRow.attributes;
                        variantCallback(variantAttrs);
                        resolve(variantAttrs);
                    })
            })
            return promiseToSave;
        };
        let promiseToProcessAllVariants = sizeVariants.map(promiseToProcessVariant)  

        // wait till all processing is completed
        await Promise.all(promiseToProcessAllVariants);
    }

    async processPath(path, variantCallback=()=>{}){
        const self = this;
        
        let sizeVariants = await this.getAllImageSizes();
        
        //---------------------------------------
        // Original
        //---------------------------------------
        // Get Mime
        let mimeType = mime.lookup(path);

        // Get Extension
        let extension = mime.extension(mimeType);

        // Get Base name
        let base = 'untitled';
        if(typeof(path) === 'string'){
            let temp = path.split('/');
            temp = temp[temp.length-1];
            temp = temp.split('\\');
            temp = temp[temp.length-1];
            base = basename(temp);
        }

        // Process Image base object
        let originalRow = await self.db.Image
                            .forge({
                                base_name:  base,
                            })
                            .save();
        let originalAttrs = originalRow.attributes;
        let imageId = originalAttrs.id;


        //---------------------------------------
        // Variants
        //---------------------------------------
        let promiseToProcessVariant = async imageSize => {
            // Make resized variant
            let resizedBuffer = await ipcRenderer.invoke('resize-image', {
                                    img:    path, 
                                    opts:   imageSize.config
                                })
            let variantBase64 = Uint8ToBase64(resizedBuffer); 
            let variantInfo = {
                // References
                image_id:       imageId,
                image_size_id:  imageSize.id,
                // Variant details
                mime_type:      mimeType,
                ext:            extension,
                base64:         variantBase64,
                // Keep track of applied config for when size config changes
                config:         imageSize.config,   
            }

            // Save resized variant
            let promiseToSave = new Promise((resolve, reject) => {
                self.db.ImageVariant
                    .forge(variantInfo)
                    .save()
                    .then(variantRow => {
                        let variantAttrs = variantRow.attributes;
                        variantCallback(variantAttrs);
                        resolve(variantAttrs);
                    })
            })
            return promiseToSave;
        };
        let promiseToProcessAllVariants = sizeVariants.map(promiseToProcessVariant)  

        // wait till all processing is completed
        await Promise.all(promiseToProcessAllVariants);
    }

    
}

export default ImageRepository