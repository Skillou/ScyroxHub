import "./assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";

// --- Ajout Element Plus ---
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import router from "./router";
// ---------------------------

const app = createApp(App);

app.use(router);
// Active Element Plus
app.use(ElementPlus);

// Enregistre toutes les icônes globalement (facultatif mais pratique)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// Monte ton app
app.mount("#app");
