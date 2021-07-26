<template lang="pug">
  md-field
    label Add text
    md-input(type="text", ref="textAddingInput" @keydown="addTextKeydown" v-model="inputTextValue")
    md-icon(@click.native="addTextFromInput" :mdSrc="require(\'@/assets/add-24px.svg\')")
</template>

<script>


import {mapActions, mapGetters} from "vuex";

export default {
  name: "AddText",
  data(){
    return {
      inputTextValue: ""
    }
  },
  computed:{
    ...mapGetters("images", ["getImages"]),
    ...mapGetters("texts", ["getTexts", "getTextUniqueId"]),
  },
  methods:{
    ...mapActions("texts", ["addText"]),
    addTextKeydown(e){
      if(e.key == "Enter"){
        this.addTextFromInput()
      }
    },
    addTextFromInput(){
      if(this.inputTextValue){
        this.$events.emit("saveAllEvent")
        let text = this.inputTextValue
        let name = "text" + this.getTextUniqueId
        if(text){
          this.addText({
            name: name,
            text: text,
            fontSize: 72,
            draggable: true,
            fill: "#000000",
            scaleX: 1,
            scaleY: 1,
            zIndex: this.getImages.length + this.getTexts.length
          })
          this.inputTextValue = null
          this.$nextTick(() => {
            this.selectNewObject(name)
            this.$events.emit("objectAdded")
          })
        }
      }
    },
    selectNewObject(name){
      this.$events.emit("addNewObject", name)
    },
  }
}
</script>

<style scoped>

</style>