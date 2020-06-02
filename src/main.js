// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Mint from 'mint-ui';
Vue.use(Mint);
//引入谷歌地图插件
/*import 'vue-googlemaps/dist/vue-googlemaps.css'
import VueGoogleMaps from 'vue-googlemaps'
Vue.use(VueGoogleMaps, {
  load: {
//填入申请的apiKey账号
    apiKey: 'AIzaSyDvy880rCv1ExkKCGXwQs-3VRNcV8Yi1GY',
    libraries: ['places'],
    useBetaRenderer: false,
  },
})*/

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
