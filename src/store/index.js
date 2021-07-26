import Vue from 'vue'
import Vuex from 'vuex'
import images from "@/store/modules/images"
import croppers from "@/store/modules/croppers"
import texts from "@/store/modules/texts"
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    imageLimits: {
      mobile: 290,
      tablet: 540,
      desc: 760,
    },
    windowWidth: null,
    instaCode: null,
    photos: null,
  },
  getters: {
    getImageWidthLimit(state) {
      let w = state.windowWidth
      return w > 1100 ? state.imageLimits.desc : w > 576 ? state.imageLimits.tablet : state.imageLimits.mobile
    },
    getInstaCode(state){
      return state.instaCode
    }
  },
  actions: {
    setWindowWidth({commit, state, getters}, width){
      let w = width
      let newGetterValue = w > 1100 ? state.imageLimits.desc : w > 576 ? state.imageLimits.tablet : state.imageLimits.mobile

      if(newGetterValue != getters.getImageWidthLimit){
        commit("texts/changeSizesOnResize", newGetterValue / getters.getImageWidthLimit)
        commit("images/changeSizesOnResize", newGetterValue / getters.getImageWidthLimit)
        commit("croppers/changeSizesOnResize", newGetterValue / getters.getImageWidthLimit)
      }
      commit("changeWindowWidth", width)
    },
    // setInstaCode({commit}, code){
    //
    // }
  },
  mutations: {
    changeWindowWidth(state, width){
      state.windowWidth = width
    }
  },
  modules: {
    images: images,
    croppers: croppers,
    texts: texts
  }
})
