export default {
  namespaced: true,
  state: {
    croppers: [],
  },
  getters: {
    getCroppers(store){
      return store.croppers
    },
  },
  actions: {
    setCroppers({commit}, croppers){
      commit("changeCroppers", croppers)
    },
    addCropper({commit}, cropper){
      commit("pushCropper", cropper)
    },
    saveCropperByIndex({commit}, {cropper, index}){
      commit("updateCropperByIndex", {cropper, index})
    },
    changeCropperPosition({commit}, {cropperPosition, index}){
      commit("updateCropperPositionByIndex", {cropperPosition, index})
    },
  },
  mutations: {
    changeCroppers(state, croppers){
      state.croppers = croppers
    },
    updateCropperByIndex(state, {cropper, index}){
      state.croppers[index] = cropper
    },
    pushCropper(state, cropper){
      state.croppers.push(cropper)
    },
    updateCropperPositionByIndex(state, {cropperPosition, index}){
      state.croppers[index].x = cropperPosition.x || state.croppers[index].x
      state.croppers[index].y = cropperPosition.y || state.croppers[index].y
      state.croppers[index].scaleX = cropperPosition.scaleX || state.croppers[index].scaleX
      state.croppers[index].scaleY = cropperPosition.scaleY || state.croppers[index].scaleY
      state.croppers[index].rotation = cropperPosition.rotation || state.croppers[index].rotation
    },
    changeSizesOnResize(state, k){
      state.croppers.forEach((cropper) => {
        if(cropper.scaleX){
          cropper.scaleX *= k
        }
        else{
          cropper.scaleX = k
        }
        if(cropper.scaleY){
          cropper.scaleY *= k
        }
        else{
          cropper.scaleY = k
        }
        if(cropper.x){
          cropper.x *= k
        }
        if(cropper.y){
          cropper.y *= k
        }
      })
      state.croppers = state.croppers.slice()
    }
  },
}