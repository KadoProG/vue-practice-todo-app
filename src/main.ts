import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import router from "@/router";
import { setAuthToken } from "@/api/client";

import App from "@/App.vue";
import "@/assets/main.css";

// アプリケーション起動時にトークンを復元
const initializeAuth = () => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    console.log("Restoring auth token from localStorage");
    setAuthToken(token);
  }
};

// トークン復元を実行
initializeAuth();

const app = createApp(App);

// Pinia プラグインを追加
app.use(createPinia());

// Vue Router プラグインを追加
app.use(router);

// Vue Query プラグインを追加
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5分間キャッシュ
        retry: 1, // リトライ回数
      },
    },
  },
});

app.mount("#app");
