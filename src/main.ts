import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";

import App from "./App.vue";

const app = createApp(App);

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
