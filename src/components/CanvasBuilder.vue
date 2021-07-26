<template lang="pug">
  .builder
    .stage-wrap(
      tabindex="1"
      @keydown="imageKeydown"
    )
      v-stage(
        ref="stage"
        :config="stageSize"
        @mousedown="handleStageMouseDown"
        @touchstart="handleStageMouseDown"
      )
        v-layer
          v-rect(
            :config="backgroundConfig"
          )
        v-layer.layer(ref="layer")
          .item-wrap(v-for="item in getAll" :key="item.name" :style="{backgroundColor: backgroundColor}" )
            v-image(
              v-if="item.image"
              :config="item"
              @dblclick="cropStart"
              @dragStart="dragStart"
              @dragEnd="dragEnd"
              @transformStart="transformStart"
              @transformEnd="transformEnd"
            )
            v-text(
              v-else
              :config="item"
              @dragEnd="saveAll"
              @transformEnd="saveAll"
            )

        v-layer(ref="cropLayer" :config="cropLayerConfig")
          v-rect(
            v-for="(item, index) in getCroppers.slice()"
            :config="item"
            v-if="activeCropper == item.name && 'cropRect' + croppingImage == item.name"
            @transformEnd="cropperTransformEnd"
            @dragEnd="cropperDragEnd"
          )
          v-transformer(ref="cropTransformer" :config="cropTransformerConfig")
        v-layer(ref="builderForm")
          v-image(:config="builderTemplate" v-if="templates[currentTemplate].load")
          v-transformer(ref="transformer" :config="{anchorStrokeWidth: 3, anchorSize: 15}")
          v-rect(
            v-if="hoverRect"
            :config="hoverRectConfig"
          )


</template>

<script>
// import Konva from "konva";

// import Vue from "vue";
import ImageCropper from "@/components/ImageCrop";
import axios from "axios";
import {mapGetters} from "vuex";
import {mapActions} from "vuex";

// const width = window.innerWidth * 0.6
// const height = window.innerHeight * 0.8
const croppersSubName = "cropRect"
export default {
  name: "CanvasBuilder",
  components: {
    ImageCropper,
  },
  data() {
    return {
      imagesLinks: [
        // "https://konvajs.org/assets/yoda.jpg",
        // "https://konvajs.org/assets/darth-vader.jpg"
        // "https://animevost.org/uploads/posts/2020-12/1607607135__pwotu_n3mo.jpg"
      ],
      images: null,
      texts: [],
      croppedRects: null,
      activeCropper: null,
      selectedShapeName: null,
      croppingImage: null,
      hoverRect: null,
      allObjects: null,
      cropLayerConfig: {
        // opacity: 0.5,
      },
      cropTransformerConfig: {
        rotateEnabled: false,
        boundBoxFunc: this.cropperBoundBoxFunction,
        enabledAnchors: ['middle-right', 'middle-left', 'top-center', 'bottom-center'],
        anchorStrokeWidth: 3,
        anchorSize: 15
      },
      templateSrc: null,
      windowWidth: null,
      backgroundColor: "#ffffff",
      startDragPosition: {},
      endDragPosition: {},
      startTransformPosition: {},
      endTransformPosition: {},
      saveEnabled: true,
      builderFormLoaded: false,
      currentTemplate: null,
      currentTemplateColor: null,
      templates: {
        altimeter: {name: "Altimeter", src: require("@/assets/templates/altimetr.svg"), load: false},
        puzzle: {name: "Puzzle", src: require("@/assets/templates/puzzle.svg"), load: false},
        mug: {name: "Mug", src: require("@/assets/templates/mug.svg"), load: false, id: 9778},
        shirt: {name: "Shirt", src: require("@/assets/templates/shirt-white.svg"),
        colors:{
          white: require("@/assets/templates/shirt-white.svg"),
          red: require("@/assets/templates/shirt-red.svg"),
          green: require("@/assets/templates/shirt-green.svg"),
          blue: require("@/assets/templates/shirt-blue.svg")},
        load: false, id: 9749},
        loop1: {name: "Loop in a square 1", src: require("@/assets/templates/loop.svg"), load: false},
        loop2: {name: "Loop in a square 2", src: require("@/assets/templates/loop2.svg"), load: false},
        loop3: {name: "Loop in a square 3", src: require("@/assets/templates/loop3.svg"), load: false},
        memory: {name: "The memory game", src: require("@/assets/templates/memorygame.svg"), load: false},
        towel: {name: "Beach towel", src: require("@/assets/templates/towel.svg"), load: false},
        box: {name: "Launch box", src: require("@/assets/templates/box.svg"), load: false},
        bottle: {name: "Bottle", src: require("@/assets/templates/bottle.svg"), load: false},
      }
    };
  },
  computed: {
    ...mapGetters("images", ["getImages"]),
    ...mapGetters("croppers", ["getCroppers"]),
    ...mapGetters("texts", ["getTexts"]),
    ...mapGetters(["getImageWidthLimit"]),
    getAll: {
      get() {
        return this.getTexts.concat(this.getImages)
      }
    },
    stageSize() {
      return {
        width: this.getImageWidthLimit,
        height: this.getImageWidthLimit
      }
    },
    backgroundConfig() {
      return {
        fill: this.backgroundColor,
        width: this.getImageWidthLimit,
        height: this.getImageWidthLimit
      }
    },
    template() {
      if(this.templates[this.currentTemplate].colors){
        if(this.templates[this.currentTemplate].colors[this.backgroundColor]){
          return this.templates[this.currentTemplate].colors[this.backgroundColor]
        }
      }
      return this.templates[this.currentTemplate].src
    },
    product_id() {
      return this.templates[this.currentTemplate].id || 9778
    },
    builderTemplate() {
      return {
        name: "builderTemplate",
        image: this.template,
        x: 0,
        y: 0,
        width: this.getImageWidthLimit,
        height: this.getImageWidthLimit,
        stroke: "black",
        strokeWidth: 2,
        visibility: false,
        listening: false,
      }
    },
    hoverRectConfig() {
      let hoverLayerNode = this.$refs.stage.getStage().findOne("." + this.hoverRect)
      return {
        name: "hoverRect",
        x: hoverLayerNode.x(),
        y: hoverLayerNode.y(),
        width: hoverLayerNode.width() * hoverLayerNode.scaleX(),
        height: hoverLayerNode.height() * hoverLayerNode.scaleY(),
        opacity: 0.4,
        rotation: hoverLayerNode.rotation(),
        fill: "blue"
      }
    }
  },
  watch: {
    // canvasWidth(newWidth){
    //
    // },
    selectedShapeName: function (newName) {
      let croppingImageNode = this.$refs.stage.getStage().findOne("." + this.croppingImage)
      let activeElementNode = this.$refs.stage.getStage().findOne("." + newName)
      this.$events.emit("getActiveElementNode", croppingImageNode || activeElementNode)
    },
    activeCropper: function (newName) {
      this.$nextTick(() => {
        let activeCropperNode = this.$refs.stage.getStage().findOne("." + newName)
        this.$events.emit("getActiveCropperNode", activeCropperNode)
      })
    }
  },
  created() {
    // this.initImages();
    for (let t in this.templates) {
      let image = new Image()
      image.src = this.templates[t].src
      image.onload = () => {
        this.templates[t].src = image
        this.templates[t].load = true
      }
      if(this.templates[t].colors){
        for(let color in this.templates[t].colors){
          let image = new Image()
          image.src = this.templates[t].colors[color]
          image.onload = () => {
            this.templates[t].colors[color] = image
          }
        }
      }
    }
    this.currentTemplate = "shirt"
    let uri = window.location.href.split('?');
    if (uri.length == 2) {
      let vars = uri[1].split('&');
      let getVars = {};
      let tmp = '';
      vars.forEach(function (v) {
        tmp = v.split('=');
        if (tmp.length == 2)
          getVars[tmp[0]] = tmp[1];
      });
      if (getVars.template) {
        if (this.templates[getVars.template]) {
          this.currentTemplate = getVars.template
        }
      }
    }
    // this.addImage("https://picsum.photos/536/354")
  },

  methods: {
    ...mapActions("images", ["setImages", "addImage", "deleteImage"]),
    ...mapActions("croppers", ["setCroppers", "saveCropperByIndex", "changeCropperPosition"]),
    ...mapActions("texts", ["addText", "setTexts", "deleteText"]),
    saveAll() {
      console.log("save all")
      let newValue = this.getAll

      let images = newValue.filter(el => {
        return !!el.image
      })
      let trueImages = images.map((el) => {
        let img = this.$refs.stage.getStage().findOne("." + el.name)
        return {...img.attrs, crop: img.crop(), zIndex: img.zIndex()}
      })

      this.setImages(trueImages)
      let texts = newValue.filter(el => {
        return !!el.text
      })
      let trueTexts = texts.map((el) => {
        let text = this.$refs.stage.getStage().findOne("." + el.name)
        return {...text.attrs, zIndex: text.zIndex()}
      })
      this.setTexts(trueTexts)

      this.setCroppers(this.getCroppers)

      let activeElementNode = this.$refs.stage.getStage().findOne("." + this.selectedShapeName)
      if (activeElementNode?.getClassName() != "Rect") {
        this.$events.emit("getActiveElementNode", activeElementNode)
      }
    },
    onResize() {
      this.windowWidth = window.innerWidth
      this.historyStep()
    },
    async saveStage() {
      let transformerNode = this.$refs.transformer.getNode()
      let cropTransformerNode = this.$refs.cropTransformer.getNode()
      transformerNode.nodes([])
      cropTransformerNode.nodes([])
      this.updateCrop()
      this.activeCropper = ""
      transformerNode.getLayer().batchDraw()
      cropTransformerNode.getLayer().batchDraw()

      let uri = this.$refs.stage.getStage().toDataURL({
        x: 0,
        y: 0,
        width: this.stageSize.width,
        height: this.stageSize.height,
        pixelRatio: 3
      })
      let data = new FormData();
      data.append('uri', uri)
      console.log(typeof this.product_id)
      const resp = await fetch('/back/back.php', {
        method: 'POST',
        credentials: 'same-origin',
        mode: 'same-origin',
        body: data
      }).then(r => r.json())

      data = new FormData();
      data.append('id', resp.id)

      fetch('/back/update-meta.php', {
        method: 'POST',
        credentials: 'same-origin',
        mode: 'same-origin',
        body: data
      })

      await fetch('/wp-json/cocart/v1/add-item?product_id=' + resp.id, {
        method: 'POST',
        credentials: 'same-origin',
        mode: 'same-origin'
      })

      location.href = "/shop"

      // this.$nextTick(() => {
      //   this.downloadURI(uri, "")
      // })
    },
    downloadURI(uri, name) {
      name = "stage.png"
      let link = document.createElement('a');
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    async initImages() {
      // let image = new Image()
      // image.src = "https://lh3.googleusercontent.com/proxy/xBO1npt-YuZrrQUKJ_0Zw-Q3R39fPDzHK5cZeHQUeXeB6-D9DhTvbwLqGuv4qXeV0xcB7vCLrHQDIMrKhthCb-YnS3Gfa-s"
      // image.src = require("@/assets/Subtract.svg")
      // image.onload = () => {
      //   this.builderFormLoaded = true
      //   this.templateSrc = image
      // }
      // this.builderTemplate.image = image
      // this.setImages(this.imagesLinks.map((el, index) => {
      //   let image = new Image()
      //   image.src = el
      //   return {
      //     image: image,
      //     name: "initImage" + index,
      //     draggable: true,
      //     crossOrigin: 'Anonymous',
      //   }
      // }))
      // this.setCroppers(this.getImages.map(function (el) {
      //   return {
      //     name: croppersSubName + el.name,
      //   }
      // }))

    },
    uploadImage(e) {
      let img = e.target.files[0]
      let fd = new FormData()

      fd.append('image', img)

      axios.post('upload-image.php', fd)
          .then(resp => {
            console.log(resp)
            this.addImageFromUrl(resp.data.server_url)
            e.target.value = ""
          })

    },
    addImageFromUrlInput() {
      this.addImageFromUrl(this.$refs.imgUrl.value)
      this.$refs.imgUrl.value = ""
    },
    addImageFromUrl(url) {
      let image = new Image()
      image.src = url
      image.crossOrigin = 'Anonymous'
      image.onload = () => {
        let name = "image" + this.getImages.length
        this.addImage({
          image: image,
          name: name,
          draggable: true,
        })
        this.addCropper({
          name: croppersSubName + name
        })
        this.$refs.imgUrl.value = ""
      }
    },
    addTextFromInput() {
      let text = this.$refs.textAddingInput.value
      if (text) {
        this.addText({
          name: "text" + this.texts.length,
          text: text,
          fontSize: 24,
          draggable: true
        })
        this.$refs.textAddingInput.value = ""
      }
    },
    imageKeydown(e) {
      if (e.key == "Delete") {
        this.removeObject()
      }
    },
    removeObject() {
      this.saveAll()
      let name = this.selectedShapeName
      let deletingObject = this.getAll.find((el) => el.name == name)
      if (deletingObject.text) {
        this.deleteText(deletingObject.name)
      }
      if (deletingObject.image) {
        this.deleteImage(deletingObject.name)
      }
      let transformerNode = this.$refs.transformer.getNode()
      let cropTransformerNode = this.$refs.cropTransformer.getNode()
      transformerNode.nodes([])
      cropTransformerNode.nodes([])
      this.activeCropper = ""
      this.selectedShapeName = ""
      transformerNode.getLayer().batchDraw()
      cropTransformerNode.getLayer().batchDraw()

    },


    handleStageMouseDown(e) {
      // console.log(e.target)
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        this.updateCrop();
        this.croppingImage = this.activeCropper = this.selectedShapeName = '';

        this.bothTransformerUpdate()
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
          e.target.getParent().className === 'Transformer';
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      const name = e.target.name();
      const rect = this.texts + this.croppedRects + this.getImages.find((r) => r.name === name);
      if (rect) {
        this.selectedShapeName = name
        if (this.selectedShapeName != this.croppingImage && this.activeCropper != this.selectedShapeName) {
          this.updateCrop()
          this.activeCropper = ''
        }
      } else {
        this.selectedShapeName = ''
      }
      this.bothTransformerUpdate()
    },
    updateTransformer() {
      // here we need to manually attach or detach Transformer node
      let transformerNode;
      let cropTransformerNode;

      transformerNode = this.$refs.transformer.getNode()
      cropTransformerNode = this.$refs.cropTransformer.getNode()
      transformerNode.moveToTop()
      const stage = this.$refs.stage.getStage();
      // const { selectedShapeName } = this;

      const selectedNode = stage.findOne('.' + this.selectedShapeName);
      // do nothing if selected node is already attached


      if (selectedNode === transformerNode.node()) {
        cropTransformerNode.nodes([])
        transformerNode.getLayer().batchDraw()
        cropTransformerNode.getLayer().batchDraw()
        return;
      }

      if (selectedNode === cropTransformerNode.node()) {
        transformerNode.nodes([])
        transformerNode.getLayer().batchDraw()
        cropTransformerNode.getLayer().batchDraw()
        return;
      }

      let nodeClass = selectedNode?.getClassName()

      if (nodeClass == "Image" || nodeClass == "Text") {
        // attach to another node

        transformerNode.nodes([selectedNode])
        cropTransformerNode.nodes([])
      } else if (nodeClass == "Rect") {

        transformerNode.nodes([])
        cropTransformerNode.nodes([selectedNode])
      } else {

        // remove transformer
        transformerNode.nodes([])
        cropTransformerNode.nodes([])
      }

      transformerNode.getLayer().batchDraw()
      cropTransformerNode.getLayer().batchDraw()
    },
    bothTransformerUpdate() {
      this.updateTransformer()
      // this.updateTransformer("crop")
    },
    cropStart(e) {
      this.saveEnabled = false
      const transformerNode = this.$refs.transformer.getNode()
      transformerNode.rotateEnabled(false)
      transformerNode.resizeEnabled(false)
      let attrs
      if (e) {
        attrs = e.target.attrs
      } else {
        let croppingImageNode = this.$refs.stage.getStage().findOne("." + this.croppingImage)
        attrs = croppingImageNode.attrs
      }
      const stage = this.$refs.stage.getStage()

      const croppedImage = stage.findOne('.' + attrs.name)

      let width = attrs.image.width
      let attrsWidth = width // default image width
      let height = attrs.image.height
      let attrsHeight = height
      let widthToHeight = width / height
      if (width > this.getImageWidthLimit && widthToHeight >= 1) {
        width = this.getImageWidthLimit
        height = this.getImageWidthLimit / widthToHeight
      } else if (height > this.getImageWidthLimit && widthToHeight < 1) {
        height = this.getImageWidthLimit
        width = this.getImageWidthLimit * widthToHeight
      }

      let attrsWidthCof = attrsWidth / width
      let attrsHeightCof = attrsHeight / height

      let cos = Math.cos(this.degrees_to_radians(croppedImage.rotation()))
      let sin = Math.sin(this.degrees_to_radians(croppedImage.rotation()))

      let cropX = croppedImage.cropX()
      let cropY = croppedImage.cropY()

      let dX = cos * cropX * croppedImage.scaleX() - sin * cropY * croppedImage.scaleY()
      let dY = sin * cropX * croppedImage.scaleX() + cos * cropY * croppedImage.scaleY()

      let index = this.getCroppers.findIndex((r) => r.name == croppersSubName + attrs.name)

      this.saveCropperByIndex({
        cropper: {
          name: croppersSubName + attrs.name,
          x: croppedImage.x(),
          y: croppedImage.y(),
          scaleX: croppedImage.scaleX(),
          scaleY: croppedImage.scaleY(),
          rotation: croppedImage.rotation(),
          width: croppedImage.width(),
          height: croppedImage.height(),
          stroke: "red",
          strokeWidth: 3,
          strokeScaleEnabled: false,
          draggable: true,
        },
        index: index
      })


      croppedImage.width(width)
      croppedImage.height(height)
      croppedImage.x((croppedImage.x() - dX / attrsWidthCof))
      croppedImage.y((croppedImage.y() - dY / attrsHeightCof))
      croppedImage.crop({
        x: 0,
        y: 0,
        width: attrsWidth,
        height: attrsHeight
      })

      this.activeCropper = croppersSubName + attrs.name
      this.selectedShapeName = croppersSubName + attrs.name
      this.croppingImage = attrs.name
      this.$nextTick(() => {
        let activeNode = this.$refs.stage.getStage().findOne("." + this.croppingImage)
        this.$events.emit("getActiveElementNode", activeNode)
        this.bothTransformerUpdate()
      })
    },
    updateCrop() {
      if (!this.activeCropper) return
      this.saveEnabled = true
      const stage = this.$refs.stage.getStage()
      const cropper = stage.findOne('.' + this.activeCropper)
      const croppedImage = stage.findOne('.' + this.croppingImage)

      let transformerNode = this.$refs.transformer.getNode()
      transformerNode.rotateEnabled(true)
      transformerNode.resizeEnabled(true)

      let attrsWidthCof = croppedImage.attrs.image.width / croppedImage.width()
      let attrsHeightCof = croppedImage.attrs.image.height / croppedImage.height()

      if (croppedImage && cropper) {
        let cropX = Math.cos(this.degrees_to_radians(croppedImage.rotation())) * (cropper.x() - croppedImage.x()) + Math.sin(this.degrees_to_radians(croppedImage.rotation())) * (cropper.y() - croppedImage.y())
        let cropY = -Math.sin(this.degrees_to_radians(croppedImage.rotation())) * (cropper.x() - croppedImage.x()) + Math.cos(this.degrees_to_radians(croppedImage.rotation())) * (cropper.y() - croppedImage.y())

        croppedImage.crop({
          y: cropY * attrsHeightCof / croppedImage.scaleY(),
          x: cropX * attrsWidthCof / croppedImage.scaleX(),
          width: cropper.width() * cropper.scaleX() / croppedImage.scaleX() * attrsWidthCof,
          height: cropper.height() * cropper.scaleY() / croppedImage.scaleY() * attrsHeightCof
        })

        croppedImage.x(cropper.x())
        croppedImage.y(cropper.y())
        croppedImage.width(cropper.width() * cropper.scaleX() / croppedImage.scaleX())
        croppedImage.height(cropper.height() * cropper.scaleY() / croppedImage.scaleY())
        this.saveAll()
        this.croppingImage = ""
      }
    },

    dragStart(e) {
      let dragImage = e.target
      this.startDragPosition = {
        x: dragImage.x(),
        y: dragImage.y(),
      }
    },
    dragEnd(e) {
      let dragImage = e.target
      this.endDragPosition = {
        x: dragImage.x(),
        y: dragImage.y()
      }
      this.saveAll()
      // this.changeCropperOnImageDrag(croppersSubName + dragImage.name())
    },
    changeCropperOnImageDrag(cropperName) {

      let index = this.getCroppers.findIndex((r) => r.name == cropperName)

      if (this.getCroppers[index].used) {
        this.changeCropperPosition({
          cropperPosition: {
            x: this.getCroppers[index].x + this.endDragPosition.x - this.startDragPosition.x,
            y: this.getCroppers[index].y + this.endDragPosition.y - this.startDragPosition.y,
          },
          index: index
        })
      }
    },

    changeCropperWithRightSidebarChangePosition(cropperName, dX, dY) {
      let index = this.getCroppers.findIndex((r) => r.name == cropperName)
      if (this.getCroppers[index].used) {
        this.changeCropperPosition({
          cropperPosition: {
            x: this.getCroppers[index].x + dX,
            y: this.getCroppers[index].y + dY,
          },
          index: index
        })
      }
    },

    transformStart(e) {
      let transformingImage = e.target
      this.startTransformPosition.x = transformingImage.x()
      this.startTransformPosition.y = transformingImage.y()
      this.startTransformPosition.scaleX = transformingImage.scaleX()
      this.startTransformPosition.scaleY = transformingImage.scaleY()
    },
    transformEnd(e) {

      let transformingImage = e.target

      this.endTransformPosition.x = transformingImage.x()
      this.endTransformPosition.y = transformingImage.y()
      this.endTransformPosition.scaleX = transformingImage.scaleX()
      this.endTransformPosition.scaleY = transformingImage.scaleY()
      this.endTransformPosition.rotation = transformingImage.rotation()
      console.log("transform end")
      this.saveAll()
      // this.changeCropperOnImageTransform(croppersSubName + transformingImage.name())
    },
    changeCropperOnImageTransform(cropperName) {
      let index = this.getCroppers.findIndex((r) => r.name == cropperName)
      // console.log(this.endTransformPosition, this.startTransformPosition)
      if (this.getCroppers[index].used) {
        this.changeCropperPosition({
          cropperPosition: {
            x: this.getCroppers[index].x + this.endTransformPosition.x - this.startTransformPosition.x,
            y: this.getCroppers[index].y + this.endTransformPosition.y - this.startTransformPosition.y,
            scaleX: this.getCroppers[index].scaleX * this.endTransformPosition.scaleX / this.startTransformPosition.scaleX,
            scaleY: this.getCroppers[index].scaleY * this.endTransformPosition.scaleY / this.startTransformPosition.scaleY,
            rotation: this.endTransformPosition.rotation
          },
          index: index
        })
      }

      const stage = this.$refs.stage.getStage()
      const cropper = stage.findOne('.' + this.activeCropper)
      const croppedImage = stage.findOne('.' + this.croppingImage)

      if (cropper && croppedImage) {
        cropper.x(cropper.x() + this.endTransformPosition.x - this.startTransformPosition.x)
        cropper.y(cropper.y() + this.endTransformPosition.y - this.startTransformPosition.y)
        cropper.scaleX(cropper.scaleX() * this.endTransformPosition.scaleX / this.startTransformPosition.scaleX)
        cropper.scaleY(cropper.scaleY() * this.endTransformPosition.scaleY / this.startTransformPosition.scaleY)
        cropper.rotation(this.endTransformPosition.rotation)
        this.$forceUpdate()
      }
    },
    changeCropperWithRightSidebarTransform(cropperName, {dX, dY, dSX, dSY, r}) {
      let index = this.getCroppers.findIndex((r) => r.name == cropperName)
      if (this.activeCropper) {
        let cropperNode = this.$refs.stage.getStage().findOne("." + this.activeCropper)
        cropperNode.x(dX ? cropperNode.x() + dX : cropperNode.x())
        cropperNode.y(dY ? cropperNode.y() + dY : cropperNode.y())
        cropperNode.scaleX(dSX ? cropperNode.scaleX() * dSX : cropperNode.scaleX())
        cropperNode.scaleY(dSY ? cropperNode.scaleY() * dSY : cropperNode.scaleY())
        cropperNode.rotation(r != undefined ? r : cropperNode.rotation())
      }
      if (this.getCroppers[index].used) {
        let cropper = this.getCroppers[index]
        this.changeCropperPosition({
          cropperPosition: {
            x: dX ? cropper.x + dX : cropper.x,
            y: dY ? cropper.x + dX : cropper.y,
            scaleX: dSX ? cropper.scaleX * dSX : cropper.scaleX,
            scaleY: dSY ? cropper.scaleY * dSY : cropper.scaleY,
            rotation: r != undefined ? r : cropper.rotation
          },
          index: index
        })
      }
    },
    cropperTransformEnd() {
      this.$nextTick(() => {
        let activeCropperNode = this.$refs.stage.getStage().findOne("." + this.activeCropper)
        this.$events.emit("getActiveCropperNode", activeCropperNode)
      })
    },
    cropperDragEnd() {
      this.$nextTick(() => {
        let activeCropperNode = this.$refs.stage.getStage().findOne("." + this.activeCropper)
        this.$events.emit("getActiveCropperNode", activeCropperNode)
      })
    },
    degrees_to_radians(degrees) {
      let pi = Math.PI;
      return degrees * (pi / 180);
    },
    radians_to_degrees(radians) {
      let pi = Math.PI;
      return radians * (180 / pi)
    },
    cropperBoundBoxFunction(oldBoundBox, newBoundBox) {

      const MIN_WIDTH = 50
      const MIN_HEIGHT = 50

      if (Math.abs(newBoundBox.width) < MIN_WIDTH || Math.abs(newBoundBox.height) < MIN_HEIGHT || oldBoundBox.rotation != newBoundBox.rotation) {
        return oldBoundBox;
      }
      this.x = newBoundBox.x
      this.y = newBoundBox.y
      this.r = newBoundBox.rotation
      return newBoundBox;
    },

    loadJson() {
      const images = localStorage.getItem('images') || '[]';
      this.images = JSON.parse(images);
    },

    saveJson() {
      localStorage.setItem('storage', JSON.stringify(this.images));
    }
  },
  events: {
    saveAllEvent() {
      this.saveAll()
    },
    SaveStageAsAImage() {
      this.saveStage()
    },
    addNewObject(name) {
      this.selectedShapeName = name
      this.updateCrop()
      this.activeCropper = ''
      this.updateTransformer()
    },
    cropStartButtonClick(croppingImage, cropper) {
      this.croppingImage = croppingImage
      // this.activeCropper = cropper
      this.selectedShapeName = cropper
      this.$nextTick(() => {
        this.cropStart()
        this.updateTransformer()
        this.$forceUpdate()
      })
    },
    cropEndButtonClick() {
      this.updateCrop()
      this.selectedShapeName = this.croppingImage
      this.croppingImage = ""
      this.activeCropper = ""
      this.updateTransformer()
      this.$forceUpdate()
    },
    resetObject() {
      this.saveAll()
    },
    historyStep() {
      this.selectedShapeName = ""
      this.activeCropper = ""
      this.croppingImage = ""
      const transformerNode = this.$refs.transformer.getNode()
      this.$refs.stage.getStage().getLayers().forEach(l => {
        l.batchDraw()
      })
      transformerNode.rotateEnabled(true)
      transformerNode.resizeEnabled(true)
      this.updateTransformer()
    },
    selectShape(name) {
      this.selectedShapeName = name
      this.updateTransformer()
    },
    deleteObject(name) {
      this.selectedShapeName = name;
      this.removeObject()
    },
    hoverLayer(name) {
      this.hoverRect = name
    },
    layerDrag(name, zIndex) {
      this.$refs.stage.getStage().findOne("." + name).zIndex(zIndex)
      this.saveAll()
    },
    selectNewTemplate(name) {
      this.currentTemplate = name
    },
    pickNewBackground(color) {
      this.backgroundColor = color
    },
    redraw() {
      this.$refs.stage.getStage().getLayers().forEach(l => {
        l.batchDraw()
      })
    }
  }
}
</script>

<style lang="scss">
.builder {
  margin: 0 auto 0;
  width: 800px;
  @media(max-width: 1100.1px) {
    width: 600px
  }
  @media(max-width: 576.1px) {
    width: 300px;
  }
}

canvas {
  /*background: white !important;*/
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.add-image {
  margin: 10px 0;
}

.add-image input {
  margin-left: 10px;
}

.add-image button {
  margin-left: 10px;
}

.add-text {
  margin: 10px 0;
}

.add-text button {
  margin-left: 10px;
}

.add-text input {
  margin-left: 10px;
}

.stage-wrap {
  padding: 20px;
  @media(max-width: 576.1px) {
    padding: 5px;
  }
}

.stage-wrap:focus {
  outline: none !important;
}


</style>