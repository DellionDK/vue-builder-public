<template lang="pug">
  .inst(v-if="!wasUpload")
    button(@click="generateAuth") Upload from Instagram

</template>

<script>
import {mapActions} from "vuex";

export default {
  name: "InstagramPhotos",
  data(){
    return {
      iframeSrc: null,
      code: null,
      wasUpload: false
    }
  },
  methods: {
    ...mapActions("images", ["instagramAvailable"]),
    generateAuth(){
      let uri = "https://api.instagram.com/oauth/authorize?client_id=965784877494602&redirect_uri=https://domain.com/auth/&scope=user_profile,user_media&response_type=code";
      window.open(uri, '_blank')
    }
  },
  created(){
    window.addEventListener('storage', async (e) => {
      console.log(`Key Changed: ${e.key}`);
      console.log(`New Value: ${e.newValue}`);
      if(e.key === "instagramCode"){
        let data = new FormData();
        data.append('code', e.newValue)
        const resp = await fetch('/back/insta/getMarker.php', {
          method: 'POST',
          credentials: 'same-origin',
          mode: 'same-origin',
          body: data
        }).then(r => r.json())
        console.log(JSON.parse(resp))

        let jsonResp = JSON.parse(resp)
        let mediaIdsArray = []

        // eslint-disable-next-line no-inner-declarations
        async function getPaginationImages(arrPointer, next){
          let r = await fetch(next, {method: "GET"}).then(r => r.json())
          arrPointer.push(...(r.data))
          if(r.paging?.next){
            return getPaginationImages(arrPointer, r.paging.next)
          }
          else{
            return arrPointer;
          }
        }

        mediaIdsArray = await getPaginationImages(mediaIdsArray, 'https://graph.instagram.com/me/media?fields='+ jsonResp['user_id'] +',caption,media_type&access_token=' + jsonResp['access_token'])
            .then(r => r)
        mediaIdsArray = mediaIdsArray.filter(el => el["media_type"] === "IMAGE" || el['media_type'] === "CAROUSEL_ALBUM")

        let unpackedArray = []

        for(let el of mediaIdsArray){
          console.log(el)
          if(el["media_type"] === "IMAGE"){
            unpackedArray.push(el)
          }
          else {
            let albumImages = await fetch('https://graph.instagram.com/'+ el.id + '/children?fields=id,media_type&access_token=' + jsonResp['access_token']).then(r => r.json())
            unpackedArray.push(...albumImages.data)
          }
        }

        console.log(unpackedArray, "this have to be an array")

        let arr = await Promise.all(unpackedArray.filter(el => el["media_type"] === "IMAGE").map(async (el) => {
          let resp3 = await fetch('https://graph.instagram.com/' + el.id + '?fields=id,media_type,media_url,username,timestamp&access_token=' + jsonResp['access_token'], {
            method: 'GET',
          }).then(r => r.json())
          return resp3
        }))

        this.instagramAvailable(arr.map((el)=> el['media_url']))
        this.wasUpload = true
      }
    });
  }
}
</script>

<style scoped lang="scss">
  .inst{
    padding: 10px 0;
    button{
      width: 100%
    }
  }
</style>