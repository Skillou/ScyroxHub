<template>
  <div id="app">
    <!-- Views -->
    <Device v-show="!isHome && !isSetting" />
    <Home v-show="isHome && !isSetting" class="home" />
    <Settings v-show="isSetting" />

    <!-- Fixed assets -->
    <div class="logo">
      <img :src="logo" alt="Scyrox" />
    </div>
    <div class="corner" v-show="!isHome && !isSetting">
      <img :src="divImg" alt="decor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import Device from "./components/Device.vue";
import Home from "@/components/Home.vue";
import Settings from "@/components/Settings.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const logo = "https://via.placeholder.com/150x50?text=Skillou";
const divImg = "https://placehold.co/200x40/2f54eb/FFF?text=Divider";

// import logo from "@/img/2Main/logo.png"; //log appli
// import divImg from "@/img/2Main/div.png"; // image souris

// const isHome = ref(true);
// const isSetting = ref(false);

const isHome = computed(() => route.name === "home" || route.path === "/");
const isSetting = computed(
  () => route.name === "settings" || route.path === "/settings"
);
</script>

<style scoped>
#app {
  position: relative;
  min-height: 100dvh;
}
.logo {
  position: absolute;
  left: 136px;
  top: 74px;
}
.corner {
  position: absolute;
  left: 1158px;
  top: 590px;
}
.home {
  /* place custom home styles here if needed */
}
</style>
