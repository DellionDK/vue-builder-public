<template lang="pug">
  md-list.layers(
  )
    draggable(@update="reorder" v-model="getLayers")
      md-list-item.layer(
        v-for="item in getLayers"
        @click="selectShape(item.name)"
        @mouseover="hoverLayer(item.name)"
        @mouseleave="hoverLayer('')"
      )
        .layerRow
          span.layer layer {{item.zIndex}}
          span(v-if="item.image")
            img(:src="item.image.src")
          span(v-if="item.text") {{item.text}}
</template>

<script>
import draggable from 'vuedraggable'
import {mapGetters} from "vuex";

export default {
  name: "CanvasLayers",
  components:{
    draggable
  },
  data(){
    return {
      options:{
        dropzoneSelector: 'ul',
        draggableSelector: 'li',
        handlerSelector: null,
        reactivityEnabled: true,
        multipleDropzonesItemsDraggingEnabled: true,
        showDropzoneAreas: true,
      }
    }
  },
  computed: {
    ...mapGetters("images", ["getImages"]),
    ...mapGetters("texts", ["getTexts"]),
    getAll: {
      get() {
        return this.getTexts.concat(this.getImages)
      }
    },
    getLayers: {
      get() {
        return this.getAll.slice().sort((a, b)=>{return b.zIndex - a.zIndex})
      },
      set(){
        console.clear()
      }
    },
    maxZIndex(){
      return this.getImages.length + this.getTexts.length - 1
    },
  },
  methods: {
    reorder(e){
      let name = this.getLayers[e.oldIndex].name
      let zIndex = this.maxZIndex - e.newIndex
      this.$events.emit("layerDrag", name, zIndex)
    },
    hoverLayer(name){
      this.$events.emit("hoverLayer", name)
    },
    selectShape(name){
      this.$events.emit("selectShape", name)
      this.$events.emit("hoverLayer", "")
    },
  }
}
</script>

<style scoped lang="scss">
.layers{
  img {
    width: 50px;
    height: 50px;
    object-fit: cover;
  }
  .layerRow{
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 50px;
  }
}

</style>