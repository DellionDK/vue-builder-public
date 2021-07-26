<template lang="pug">
  .right-sidebar
    .properties-wrap(v-if="activeElementNode")
      .activeElementNode()
          .propertiesLine
            .editProperty
              button.minus(@click="zIndexMinus" :disabled="!activeElementNode.zIndex()") Down
            .editProperty
              button.plus(@click="zIndexPlus" :disabled="activeElementNode.zIndex() === maxZIndex") Up
          .propertiesLine
            .editProperty
              md-field
                label Width
                md-input(v-model="width" min="100" :max="getImageWidthLimit" type="number" step="0.1")
              input(v-model="width" min="100" :max="getImageWidthLimit" type="range" step="0.1")
            .editProperty
              md-field
                label Height
                md-input(v-model="height" min="100" :max="getImageWidthLimit" type="number" step="0.1")
              input(v-model="height" min="100" :max="getImageWidthLimit" type="range" step="0.1")
          .propertiesLine
            .edit-property
              md-field
                label Opacity
                md-input(v-model="opacity" min="0.05" max="1" type="range" step="0.05")
          .propertiesLine(v-if="isImage")
            .editProperty(v-if="!activeCropperNode")
              button(@click="cropStart") Crop
            .editProperty(v-else-if="activeCropperNode")
              button(@click="cropEnd") Complete
            .editProperty(v-if="!activeCropperNode")
              button(@click="deleteObject(activeElementNode.name())") Delete
          .propertiesLine(v-if="activeCropperNode")
            .cropProperty
              md-field
                label Cropper x
                md-input(v-model="cropperX" type="number" step="0.1")
            .cropProperty
              md-field
                label Cropper y
                md-input(v-model="cropperY" type="number" step="0.1")
          .propertiesLine(v-if="activeCropperNode")
            .cropProperty
              md-field
                label Cropper width
                md-input(v-model="cropperWidth" min="100" :max="getImageWidthLimit" type="number" step="0.1")
              input(v-model="cropperWidth" min="100" :max="getImageWidthLimit" type="range" step="0.1")
            .cropProperty
              md-field
                label Cropper height
                md-input(v-model="cropperHeight" min="100" :max="getImageWidthLimit" type="number" step="0.1")
              input(v-model="cropperHeight" min="100" :max="getImageWidthLimit" type="range" step="0.1")
          .propertiesLine(v-if="isText")
            .editProperty
              md-field
                label Text color
                md-input(v-model="textColor" type="color")
            .editProperty
              md-field
                label Text
                md-input(v-model="text")
          .propertiesLine(v-if="isText")
            .editProperty
              md-field
                label Font
                md-select(v-model="fontFamily")
                  md-option(v-for="font in fonts" :value="font") {{font}}
            .editProperty(v-if="!activeCropperNode")
              button(@click="deleteObject(activeElementNode.name())" style="margin-top: 12px") Delete
      hr
    .selectTemplate
      TemplateConfig
    .layers-wrap
      CanvasLayers

</template>

<script>

// import axios from "axios";

import TemplateConfig from "@/components/TemplateConfig";
const croppersSubName = "cropRect"
import {mapGetters} from "vuex"
import _ from 'lodash'
import CanvasLayers from "@/components/CanvasLayers";

export default {
  name: "RightSidebar",
  components: {
    CanvasLayers,
    TemplateConfig,
  },
  data(){
    return {
      watchChanges: null,
      activeCropperNode: null,
      activeElementNode: null,
      startX: null,
      startY: null,
      startWidth: null,
      startHeight: null,
      width: null,
      height: null,
      cropperX: null,
      cropperY: null,
      cropperWidth: null,
      cropperHeight: null,
      startCropperWidth: null,
      startCropperHeight: null,
      opacity: null,
      text: null,
      textColor: "#000000",
      fonts: ["ABeeZee", "Abel", "Abhaya Libre", "Abril Fatface", "Aclonica", "Acme", "Actor", "Adamina", "Advent Pro", "Aguafina Script"],
      fontFamily: "ABeeZee",
    }
  },
  watch: {
    width(newWidth){
      if(!newWidth) return
      if(this.activeElementNode && this.watchChanges){
        let trueWidth = parseFloat(parseFloat(newWidth.toString().replace(',', '.')).toFixed(1))
        // let lastScale = this.activeElementNode.scaleX()
        let newScale = trueWidth / this.startWidth * this.activeElementNode.scaleX()
        this.activeElementNode.scaleX(newScale)
        this.startWidth = trueWidth

        if(this.isImage){
          // this.$events.emit("imageTransform", croppersSubName + this.activeElementNode.name(), {dSX: newScale/lastScale} )
        }
        this.activeElementNode.getLayer().batchDraw()
        this.db(newWidth)
      }
    },
    height(newHeight){
      if(!newHeight) return
      if(this.activeElementNode && this.watchChanges) {
        let trueHeight = parseFloat(parseFloat(newHeight.toString().replace(',', '.')).toFixed(1))
        // let lastScale = this.activeElementNode.scaleY()
        // let newScale = trueHeight / this.startHeight * this.activeElementNode.scaleY()
        this.activeElementNode.scaleY(trueHeight / this.startHeight * this.activeElementNode.scaleY())
        this.startHeight = trueHeight
        if(this.isImage){
          // this.$events.emit("imageTransform", croppersSubName + this.activeElementNode.name(), {dSY: newScale/lastScale} )
        }
        this.activeElementNode.getLayer().batchDraw()
        this.db(newHeight)
      }
    },
    opacity(newOpacity) {
      if(this.activeElementNode && this.watchChanges){
        newOpacity = newOpacity.toString()
        this.activeElementNode.opacity(parseFloat(parseFloat(newOpacity.replace(',', '.')).toFixed(1)) || 1)
        this.activeElementNode?.getLayer().batchDraw()
      }
    },
    cropperX(newX){
      if(this.activeCropperNode){
        this.activeCropperNode?.x(parseFloat(parseFloat(newX.replace(',', '.')).toFixed(1)) || 0)
        this.activeElementNode?.getLayer().batchDraw()
      }
    },
    cropperY(newY){
      if(this.activeCropperNode){
        this.activeCropperNode?.y(parseFloat(parseFloat(newY.replace(',', '.')).toFixed(1)) || 0)
        this.activeElementNode?.getLayer().batchDraw()
      }
    },
    cropperWidth(newWidth){
      if(!newWidth) return
      if(this.activeCropperNode) {
        let trueWidth = parseFloat(parseFloat(newWidth.toString().replace(',', '.')).toFixed(1))
        this.activeCropperNode.scaleX(trueWidth / this.startCropperWidth * this.activeCropperNode.scaleX())
        this.startCropperWidth = trueWidth
        this.activeElementNode.getLayer().batchDraw()
      }
    },
    cropperHeight(newHeight){
      if(!newHeight) return
      if(this.activeCropperNode) {
        let trueHeight = parseFloat(parseFloat(newHeight.toString().replace(',', '.')).toFixed(1))
        this.activeCropperNode.scaleY(trueHeight / this.startCropperHeight * this.activeCropperNode.scaleY())
        this.startCropperHeight = trueHeight
        this.activeElementNode.getLayer().batchDraw()
      }
    },
    text(newText){
      if(!this.watchChanges) return
      if(newText){
        this.activeElementNode.text(newText)
      }else {
        this.activeElementNode.text(" ")
      }

      this.activeElementNode.getLayer().batchDraw()
      this.db(newText)
    },
    textColor(newColor){
      if(!this.watchChanges) return
      this.activeElementNode.fill(newColor)
      this.activeElementNode.getLayer().batchDraw()
      this.db(newColor)
    },
    fontFamily(newFont){
      if(!this.watchChanges) return
      this.activeElementNode.fontFamily(newFont)
      this.activeElementNode.text("")
      this.activeElementNode.text(this.text)
      setTimeout(()=>{
        this.activeElementNode.getLayer().batchDraw()
      }, 100)
      this.$events.emit("saveAllEvent")
    },
  },
  computed: {
    ...mapGetters("images", ["getImages"]),
    ...mapGetters("texts", ["getTexts"]),
    ...mapGetters(["getImageWidthLimit"]),
    getAll: {
      get() {
        return this.getTexts.concat(this.getImages)
      }
    },
    maxZIndex(){
      return this.getImages.length + this.getTexts.length - 1
    },
    isImage(){
      return this.activeElementNode.getClassName() == "Image"
    },
    isText(){
      return this.activeElementNode.getClassName() == "Text"
    },
  },
  methods: {
    reorder(e){
      let name = this.getLayers[e.oldIndex].name
      let zIndex = this.maxZIndex - e.newIndex
      this.$events.emit("layerDrag", name, zIndex)
    },
    db: _.debounce(function(){
        this.$events.emit("saveAllEvent")
      }, 1000),
    zIndexPlus(){
      if(this.activeElementNode.zIndex() < this.maxZIndex) {
        this.activeElementNode.moveUp()
        this.saveAll()
        this.activeElementNode.getLayer().batchDraw()
      }
    },
    zIndexMinus(){
      if(this.activeElementNode.zIndex() !== 0) {
        this.activeElementNode.moveDown()
        this.saveAll()
        this.activeElementNode.getLayer().batchDraw()
      }
    },
    cropEnd(){
      this.$events.emit("cropEndButtonClick")
    },
    cropStart(){
      this.$events.emit("cropStartButtonClick", this.activeElementNode.name(), croppersSubName + this.activeElementNode.name())
    },
    saveAll(){
      this.$events.emit("saveAllEvent")
    },
    deleteObject(name){
      this.$events.emit("deleteObject", name)
    }
  },
  created() {

  },
  events: {
    getActiveElementNode(node) {
      this.watchChanges = false
      this.activeElementNode = node
      if(node){
        this.startX = this.x = parseFloat(this.activeElementNode?.x()).toFixed(1) || 0
        this.startY = this.y = parseFloat(this.activeElementNode?.y()).toFixed(1) || 0
        this.rotation = this.activeElementNode?.rotation() || 0
        this.opacity = parseFloat(this.activeElementNode?.opacity()) || 1
        this.width = this.startWidth = parseFloat((this.activeElementNode?.width() * this.activeElementNode?.scaleX()).toFixed(1))  || 0
        this.height = this.startHeight = parseFloat((this.activeElementNode?.height() * this.activeElementNode?.scaleY()).toFixed(1)) || 0
        // eslint-disable-next-line no-empty
        if(this.activeElementNode.getClassName() == "Image"){
        }
        if(this.activeElementNode.getClassName() == "Text"){
          this.text = node.text()
          this.textColor = node.fill()
          this.fontFamily = node.fontFamily()
        }
      }
      this.$nextTick(()=>{
        this.watchChanges = true
      })
      this.$forceUpdate()
    },
    getActiveCropperNode(node) {
     this.activeCropperNode = node
      if(node){
        this.cropperX = parseFloat(node?.x()).toFixed(1) || 0
        this.cropperY = parseFloat(node?.y()).toFixed(1) || 0
        this.cropperWidth = this.startCropperWidth = parseFloat((node?.width() * node?.scaleX()).toFixed(1))  || 0
        this.cropperHeight = this.startCropperHeight = parseFloat((node?.height() * node?.scaleY()).toFixed(1)) || 0
      }
      this.$forceUpdate()
    }
  }
}
</script>

<style lang="scss" scoped>
.right-sidebar{
  padding-top: 10px;
  min-height: calc(100vh - 81px);
  width: calc(50% - 400px - 20px);
  border-left: 2px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 2;
  @media(max-width: 1300.1px){
    width: 300px;
    //width: calc(100% - 300px - 40px);
  }
  @media(max-width: 1100.1px){
    //width: calc(100% - 300px - 40px);
  }
  @media(max-width: 835.1px) {
    width: 100%;
    min-height: unset;
    z-index: 2;
    border-left: none;
    border-top: 2px solid rgba(0, 0, 0, 0.1);
    padding-top: 5px;
    margin-top: 20px;
  }
}
.activeElementName{
  font-size: 16px;
  font-weight: bold;
}
.activeElementNode{
  display: flex;
  flex-direction: column;
}

.selectTemplate{
  padding: 0 10px;
}
.propertiesLine{
  display: flex;
  &> *{
    width: 50%;
    padding: 10px;
   }
  button{
    width: 100%;
  }
  input{
    width: 100%;
  }
}


</style>
