<template lang="pug">
  .control-buttons
    .addObject
      button(@click="showLeftS" v-if="!isLeftSShow && !isLeftS") add Object
    .configObject
      button(@click="showRightS" v-if="!isRightSShow && !isRightS") configure Objects
</template>

<script>
export default {
  name: "ControlPanel"
}
</script>

<style scoped>

</style>