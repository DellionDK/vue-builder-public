export default {
  namespaced: true,
  state: {
    images: [
      []
    ],
    availableImages: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIIav-PcyrbZunEf6BP8SBUnh_o7PR196QZARbFqE0Ds_2No-v"],
    uniqueId: 0,
    historyIndex: 0,
    historyLimit: 15
  },
  getters: {
    getImages(state){
      return state.images[state.historyIndex]
    },
    getAvailableImages(state){
      return state.availableImages
    },
    getImageUniqueId(state){
      return state.uniqueId
    },
    isHistoryNext(state){
      return state.historyIndex > 0
    },
    isHistoryBack(state){
      return state.historyIndex < state.images.length - 1
    }
  },
  actions: {
    setImages({commit}, images){
      commit("changeImages", images)
    },
    addImage({commit}, image){
      commit("pushImage", image)
    },
    deleteImage({commit}, name){
      commit("removeImage", name)
    },
    historyPrevious({commit}){
      commit("historyPrevious")
    },
    historyNext({commit}){
      commit("historyNext")
    },
    instagramAvailable({commit}, imagesLinks){
      commit("addAvailableImagesFromInstagram", imagesLinks)
    }
  }
  ,
  mutations: {
    changeImages(state, images){
      state.images = state.images.slice(state.historyIndex)
      state.images.unshift(images)
      state.images = state.images.slice(0, 15)
      state.historyIndex = 0
    },
    pushImage(state, image){
      state.images[0].push(image)
      state.uniqueId++
      state.availableImages.push(image.image.src)
      state.availableImages = [...new Set(state.availableImages)]
    },
    removeImage(state, name){
      let index = state.images[0].findIndex((el)=>el.name == name)
      state.images[0].splice(index, 1)
    },
    historyPrevious(state){
      let index = state.historyIndex
      if(index < state.images.length - 1){
        state.historyIndex++
      }
    },
    historyNext(state){
      let index = state.historyIndex
      if(index > 0){
        state.historyIndex--
      }
    },
    changeSizesOnResize(state, k){
      state.images.forEach((arr) => {
        arr.forEach((image)=> {
          if(image.width){
            image.width *= k
          }
          if(image.height){
            image.height *= k
          }
          if(image.x){
            image.x *= k
          }
          if(image.y){
            image.y *= k
          }
        })
      })
    },
    addAvailableImagesFromInstagram(state, imagesLinks){
      state.availableImages.push(...imagesLinks)
    }
  },
}