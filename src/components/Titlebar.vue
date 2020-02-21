<template>
    <div class="titlebar flex">
        <div class="flex grow title">
            <slot/>
        </div>
        <div class="flex row-reverse">
            <div class="row-reverse no-shrink">
                <button class="window-action" @click="toggleMinimize()">🗕</button>
                <button class="window-action" @click="toggleMaximize()">🗖</button>
                <button class="window-action close-btn" @click="close()">✕</button>
            </div>
        </div>
    </div>
</template>


<script>

//const { ipcRenderer } = require('electron');

import windowMixin from '@/mixins/windowMixin';
export default {
    mixins: [ windowMixin ],
}
</script>




<style scoped>
.row-reverse {
    flex-direction: row-reverse;
}

.grow {
    flex-grow:1;
}

.flex {
    display: flex;
}

.title {
}

.titlebar {
    -webkit-user-select: none;
    -webkit-app-region: drag;
    width: 100%;
    position: fixed;
    border-radius: 5px;
}

.window-action {
    padding: 7px 17px;
    font-size: 14px;
    height: fit-content;
    -webkit-app-region: no-drag;
    border: none;
    outline:none;
    transition: 0.1s linear;
}
.window-action:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.close-btn {
    /*border-top-right-radius: 5px;*/
}

.close-btn:hover {
    background-color: #e5002a;
}

</style>
