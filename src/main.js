import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { useAuthStore } from "./store/AuthStore";
import "./style.css";

const app = createApp(App);
const pinia = createPinia();
pinia.use(createPersistedState());
app.use(pinia);
app.use(router);

// Initialize auth store after pinia is set up
const authStore = useAuthStore();
authStore.initializeAuth();

app.mount("#app");
