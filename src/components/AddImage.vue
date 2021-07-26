<template lang="pug">
  .wrap
    .add-image
      label.upload-label Upload an image
        input.upload-input(type="file", accept=".jpg, .png, .jpeg" @change="uploadImage")
    InstagramPhotos
    .add-image
      md-field
        label add image from url
        md-input(type="text", ref="imgUrl" @keydown="addImageKeydown" v-model="inputUrlValue")
        md-icon(@click.native="addImageFromUrlInput" :mdSrc="require(\'@/assets/add-24px.svg\')")
    .available-images
      img.image(
        v-for="image in getAvailableImages"
        tabindex="1"
        :src="image"
        @click="addImageFromUrl(image)"
      )
</template>

<script>

import InstagramPhotos from "@/components/InstagramPhotos";
import {mapActions, mapGetters} from "vuex";
const croppersSubName = "cropRect"
export default {
  name: "AddImage",
  components: {
    InstagramPhotos
  },
  data(){
    return{
      inputUrlValue: "",
    }
  },
  computed:{
    ...mapGetters("images", ["getImages", "getImageUniqueId", "isHistoryNext", "isHistoryBack", "getAvailableImages"]),
    ...mapGetters("texts", ["getTexts", "getTextUniqueId"]),
    ...mapGetters(["getImageWidthLimit"]),
  },
  methods: {
    ...mapActions("images", ["addImage"]),
    ...mapActions("croppers", ["addCropper"]),
    addImageKeydown(e){
      if(e.key == "Enter"){
        this.addImageFromUrlInput()
      }
    },
    uploadImage (e) {
      let img = e.target.files[0]
      this.addImageFromUrl(URL.createObjectURL(img))
    },
    async addImageFromUrlInput(){
      let blob = await fetch(this.inputUrlValue).then(r => r.blob());

      this.addImageFromUrl(URL.createObjectURL(blob))

      this.inputUrlValue = null
    },
    addImageFromUrl(url){
      let image = new Image()
      image.src = url
      image.crossOrigin = 'Anonymous'
      image.onerror = () => {
        alert("Upload Error")
      }
      image.onload = () => {
        this.$events.emit("saveAllEvent")
        let width = image.width
        let height = image.height
        let widthToHeight = width / height
        if(width > this.getImageWidthLimit && widthToHeight >= 1){
          width = this.getImageWidthLimit
          height = this.getImageWidthLimit / widthToHeight
        }
        else if(height > this.getImageWidthLimit && widthToHeight < 1){
          height = this.getImageWidthLimit
          width = this.getImageWidthLimit * widthToHeight
        }
        let name = "image" + this.getImageUniqueId
        this.addImage({
          image: image,
          name: name,
          draggable: true,
          zIndex: this.getImages.length + this.getTexts.length,
          width: width,
          height: height,
          scaleX: 1,
          scaleY: 1,
        })
        this.addCropper({
          name: croppersSubName + name
        })

        this.$nextTick(() => {
          this.selectNewObject(name)
          this.$events.emit("objectAdded")
        })
        console.clear()
      }
    },
    selectNewObject(name){
      this.$events.emit("addNewObject", name)
    },
  }
}
</script>

<style scoped lang="scss">
.available-images{
  max-height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.available-images .image{
  cursor: pointer;
  width: 75px;
  height: 75px;
  object-fit: cover;
  margin: 10px;
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
.text-tab, .image-tab{
  padding: 0 10px;
}
.upload-input{
  visibility: hidden;
  opacity: 0;
  height: 0;
  overflow: hidden;
  position: absolute;
}

</style>