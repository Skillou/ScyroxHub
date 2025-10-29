import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../components/Home.vue";
import Settings from "../components/Settings.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    props: true,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
