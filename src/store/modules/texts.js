export default {
  namespaced: true,
  state: {
    texts: [
      []
    ],
    uniqueId: 0,
    historyIndex: 0,
    historyLimit: 15
  },
  getters: {
    getTexts(state){
      return state.texts[state.historyIndex] || []
    },
    getTextUniqueId(state){
      return state.uniqueId
    }
  },
  actions: {
    setTexts({commit}, texts){
      commit("changeTexts", texts)
    },
    addText({commit}, text){
      commit("pushText", text)
    },
    deleteText({commit}, name){
      commit("removeText", name)
    },
    historyPrevious({commit}){
      commit("historyPrevious")
    },
    historyNext({commit}){
      commit("historyNext")
    }
  },
  mutations: {
    changeTexts(state, texts){
      state.texts = state.texts.slice(state.historyIndex)
      state.texts.unshift(texts)
      state.texts = state.texts.slice(0, state.historyLimit)
      state.historyIndex = 0
    },
    pushText(state, text){
      state.texts[0].push(text)
      state.uniqueId++
    },
    removeText(state, name){
      let index = state.texts[0].findIndex((el)=>el.name == name)
      state.texts[0].splice(index, 1)
    },
    historyPrevious(state){
      let index = state.historyIndex
      if(index < state.texts.length - 1){
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
      state.texts.forEach((arr) => {
        arr.forEach((text)=> {
          if(text.scaleX){
            text.scaleX *= k
          }
          if(text.scaleY){
            text.scaleY *= k
          }
          if(text.x){
            text.x *= k
          }
          if(text.y){
            text.y *= k
          }
        })
      })
    }
  },
}