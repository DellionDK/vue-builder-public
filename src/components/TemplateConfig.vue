<template lang="pug">
  .wrap
    md-field
      md-select(v-model="currentTemplate")
        md-option(v-for="(item, name) in templates" :value="name" v-if="!item.group") {{item.name}}
        md-optgroup(v-for="(group) in groups" :label="group.name")
          md-option(v-for="item in group.items" :value="item.value") {{item.name}}
    .templateColor
      .color-picker(
        v-for="color in templateColors"
        :style="{backgroundColor: color}"
        @click="backgroundColor =  color"
      )
    .hr
</template>

<script>
export default {
  name: "TemplateConfig",
  data(){
    return {
      currentTemplate: null,
      templates: {
        altimeter: {name: "Altimeter", src: require("@/assets/templates/altimetr.svg"), load: false},
        puzzle: {name: "Puzzle", src: require("@/assets/templates/puzzle.svg"), load: false},
        mug: {name: "Mug", src: require("@/assets/templates/mug.svg"),colors: {yellow: "yellow"}, load: false, id: 9778},
        shirt: {name: "Shirt", src: require("@/assets/templates/shirt-white.svg"),
          colors:{
            white: "white",
            red: "red",
            green: "green",
            blue: "blue"
          },
          load: false, id: 9749},
        loop1: {name: "Loop in a square 1", src: require("@/assets/templates/loop.svg"), load: false, group: "loop", value:"loop1"},
        loop2: {name: "Loop in a square 2", src: require("@/assets/templates/loop2.svg"), load: false, group: "loop", value:"loop2"},
        loop3: {name: "Loop in a square 3", src: require("@/assets/templates/loop3.svg"), load: false, group: "loop", value:"loop3"},
        memory: {name: "The memory game", src: require("@/assets/templates/memorygame.svg"), load: false},
        towel: {name: "Beach towel", src: require("@/assets/templates/towel.svg"), load: false},
        box: {name: "Launch box", src: require("@/assets/templates/box.svg"), load: false},
        bottle: {name: "Drinking bottle", src: require("@/assets/templates/bottle.svg"), load: false},
      },
      backgroundColor: "white",
    }
  },
  computed:{
    templateColors(){
      return this.templates[this.currentTemplate].colors
    },
    groups(){
      let groupedTemplates = []
      for(let item in this.templates){
        if(this.templates[item].group){
          groupedTemplates.push(this.templates[item])
        }
      }
      let newObj = new Object()
      groupedTemplates.forEach((el)=>{
        if(!newObj[el.group]){
          newObj[el.group] = {
            name: el.group,
            items: [el]
          }
        }
        else{
          newObj[el.group].items.push(el)
        }
      })
      return newObj
    },
  },
  watch: {
    currentTemplate(newTemplate){
      this.backgroundColor = (this.templates[newTemplate].colors?.[[Object.keys(this.templates[newTemplate].colors)[0]]]) || "white"
      this.$events.emit("selectNewTemplate", newTemplate)
    },
    backgroundColor(newColor){
      this.$events.emit("pickNewBackground" , newColor)
    }
  },
  created() {
    this.currentTemplate = "shirt"
    let uri = window.location.href.split('?');
    if (uri.length == 2)
    {
      let vars = uri[1].split('&');
      let getVars = {};
      let tmp = '';
      vars.forEach(function(v){
        tmp = v.split('=');
        if(tmp.length == 2)
          getVars[tmp[0]] = tmp[1];
      });
      if(getVars.template){
        if(this.templates[getVars.template]){
          this.currentTemplate = getVars.template
        }
      }
    }
  }
}
</script>

<style scoped>
.templateColor{
  display: flex;
  flex-direction: row;
}
.color-picker{
  cursor: pointer;
  width: 25px;
  height: 25px;
  margin: 10px;
  border: 2px solid black;
}
</style>