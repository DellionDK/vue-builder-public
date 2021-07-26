<template lang="pug">
  #app
    .container
      LeftSidebar.left-sidebar(v-show="isLeftS || (isLeftSShow)")
      CanvasBuilder
      RightSidebar.right-sidebar(v-show="isRightS || (isRightSShow)")
    .control-buttons
      .logo-wrap
        img(src="@/assets/logo.png")
      .addObject(v-if="!isLeftSShow && !isLeftS" @click="showLeftS")
        img(src='@/assets/add-24px.svg')
      .configObject(v-if="!isRightSShow && !isRightS" @click="showRightS")
        img(:src='require(\'@/assets/settings_applications-24px.svg\')'  )
      .history-prev(v-if="isHistoryBack" @click="historyBackStep")
        img(:src='require(\'@/assets/undo-24px.svg\')')
      .history-prev(v-else)
        img(:src='require(\'@/assets/disabled-undo-24px.svg\')')
      .history-next(v-if="isHistoryNext" @click="historyNextStep")
        img(:src='require(\'@/assets/redo-24px.svg\')')
      .history-next(v-else)
        img(:src='require(\'@/assets/disabled-redo-24px.svg\')')
      .save-as-image(@click="saveAsImage")
        img(:src='require(\'@/assets/get_app-24px.svg\')')

</template>

<script>
import LeftSidebar from "@/components/LeftSidebar";
import CanvasBuilder from "@/components/CanvasBuilder";
import RightSidebar from "@/components/RightSidebar";
import {mapActions} from "vuex"
import {mapGetters} from "vuex"
// import axios from "axios";

export default {
  name: 'App',
  components: {
    CanvasBuilder,
    LeftSidebar,
    RightSidebar
  },

  data(){
    return {
      isLeftS: false,
      isRightS: false,
      isLeftSShow: true,
      isRightSShow: false
    }
  },
  computed: {
    ...mapGetters(["getImageWidthLimit"]),
    ...mapGetters("images",["isHistoryNext", "isHistoryBack"]),
  },
  created() {
    window.addEventListener("resize", () =>{ this.windowToggleSidebars() })
    this.windowToggleSidebars()
    if(location.origin == "https://www.photomix.co.il"){
      location.href = location.href.replace("www.", "")
    }
  },
  methods: {
    ...mapActions(["setWindowWidth"]),
    ...mapActions("images", ["instagramAvailable"]),
    ...mapActions("images", {
      imageHistoryNext: "historyNext",
      imageHistoryPrevious: "historyPrevious",
    }),
    ...mapActions("texts", {
      textsHistoryNext: "historyNext",
      textsHistoryPrevious: "historyPrevious",
    }),
    saveAsImage(){
      this.$events.emit("SaveStageAsAImage")
    },
    windowToggleSidebars(){
      let w = window.innerWidth
      if(w > 1299){
        this.isRightS = true
        this.isLeftS = true
      }
      else {
        this.isRightS = false
        this.isLeftS = false
      }
      this.setWindowWidth(w)
    },
    showLeftS(){
      this.isLeftSShow = true
      this.isRightSShow = false
    },
    showRightS(){
      this.isLeftSShow = false
      this.isRightSShow = true
    },
    historyBackStep(){
      this.imageHistoryPrevious()
      this.textsHistoryPrevious()
      // this.cropperHistoryPrevious()
      this.$events.emit("historyStep")
    },
    historyNextStep(){
      this.imageHistoryNext()
      this.textsHistoryNext()
      // this.cropperHistoryNext()
      this.$events.emit("historyStep")
    },
    hideMenus(){
      this.isLeftSShow = false
      this.isRightSShow = false
    },

  },
  events:{
    objectAdded(){
      this.showRightS()
    }
  }
}
</script>

<style lang="scss">

@import "~vue-material/dist/vue-material.min.css";
@import "~vue-material/dist/theme/default.css";
@import "https://fonts.googleapis.com/css?family=ABeeZee";
@import "https://fonts.googleapis.com/css?family=Abel";
@import "https://fonts.googleapis.com/css?family=Abhaya+Libre";
@import "https://fonts.googleapis.com/css?family=Abril+Fatface";
@import "https://fonts.googleapis.com/css?family=Aclonica";
@import "https://fonts.googleapis.com/css?family=Acme";
@import "https://fonts.googleapis.com/css?family=Actor";
@import "https://fonts.googleapis.com/css?family=Adamina";
@import "https://fonts.googleapis.com/css?family=Advent+Pro";
@import "https://fonts.googleapis.com/css?family=Aguafina+Script";
*{
  margin: 0;
  padding: 0;
}
body, html{
  /*background: #42b983;*/
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  font-size: 16px;
}
.container{
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  @media(max-width: 835.1px){
    flex-direction: column;
    align-items: center;
  }
}

button, .upload-label{
  width: auto;
  height: auto;
  line-height: 26px;
  font-size: 14px;
  padding: 7px 20px;
  background: #254369;
  color: #ffffff;
  margin: 0px;
  border-radius: 25px;
  font-weight: 600;
  letter-spacing: 0.8px;
  cursor: pointer;
  border: none;
  text-transform: capitalize;
  transition: all 0.5s ease-out 0s;
  font-family: 'Open Sans',Arial,Helvetica,sans-serif;
  &:hover{
    background-color: black;
  }
  &:focus{
    outline: none;
  }
  &:disabled{
    background: gray;
    color: #dfdfdf
  }
}
.upload-label{
  display: block;
  text-align: center;
}
  .control-buttons{
    &>*{
      cursor: pointer;
    }
    padding: 0 10px;
    .logo-wrap{
      margin-right: auto;
      img{
        height: 60px;
        margin-left: 0px;
      }
    }
    img{
      height: 30px;
      margin-left: 15px;
    }
    background-color: #c3def0;
    display: flex;
    align-items: center;
    width: 100%;
    z-index: 2;
    position: fixed;
    top: 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1) ;
    height: 81px;
    @media(max-width: 835.1px){
      bottom: 0px;
      top: unset;
      border-top: 1px solid rgba(0, 0, 0, 0.1) ;
      justify-content: space-around;
      //background-color: white;
      .logo-wrap{
        display: none;
      }
      img{
        margin: 0;
      }
    }
  }
.md-field.md-has-value label{
  font-size: 13px;
  font-weight: bold;
}
  #app{
    margin-top: 81px;
    @media(max-width: 835.1px){
      margin-bottom: 81px;
      margin-top: 20px;
    }
  }

</style>

