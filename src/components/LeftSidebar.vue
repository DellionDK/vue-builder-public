<template lang="pug">
  .left-sidebar
    .tab-buttons.propertiesLine
      .wrap
        button(@click="setTab('image-tab')") Image
      .wrap
        button(@click="setTab('text-tab')") Text
    .tabs
      .image-tab(v-if="activeTab == 'image-tab'")
        AddImage
      .text-tab(v-if="activeTab == 'text-tab'")
        AddText
</template>

<script>
// eslint-disable-next-line no-unused-vars

import AddText from "@/components/AddText"
import AddImage from "@/components/AddImage";

export default {
  name: "LeftSidebar",
  components: {
    AddText,
    AddImage
  },
  data(){
    return {
      activeTab: "image-tab",
    }
  },
  methods: {
    setTab(tabName){
      this.activeTab = tabName
    },
  },
}
</script>

<style lang="scss" scoped>

.left-sidebar{
  padding-top: 10px;
  width: calc(50% - 400px - 20px);
  border-right: 2px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 81px);
  z-index: 2;
  @media(max-width: 1300.1px){
    width: 300px;
    //width: calc(100% - 300px - 40px);
  }
  @media(max-width: 1100.1px){
    //width: calc(100% - 300px - 40px);
  }
  @media(max-width: 835.1px) {
    background-color: white;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: white;
    z-index: 2;
  }
  @media(max-width: 576.1px){
    width: 100%;
  }
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

</style>
