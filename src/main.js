import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import App from './App.vue'

import VueKonva from 'vue-konva'
Vue.use(VueKonva)

import VueEvents from "vue-plugin-events";
Vue.use(VueEvents)

import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

// import VueDraggable from 'vue-draggable'
// Vue.use(VueDraggable)

import VueMaterial from 'vue-material'
Vue.use(VueMaterial)

import store from './store'
Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
