import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import { useUserStore } from "@/stores/user";
import { env } from "@/config/env";

const router = createRouter({
  history: createWebHistory(env.baseUrl),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/tasks",
      name: "tasks",
      component: () => import("@/views/TasksView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/tasks/:id",
      name: "task-detail",
      component: () => import("@/views/TaskDetailView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// ナビゲーションガード
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 認証が必要なページかチェック
  if (to.meta.requiresAuth) {
    // ユーザー情報を取得
    await userStore.fetchUserInfo();

    // ログインしていない場合はログインページにリダイレクト
    if (!userStore.isLoggedIn) {
      next("/login");
      return;
    }
  }

  // ログインページにアクセスした際、既にログインしている場合はホームにリダイレクト
  if (to.name === "login" && userStore.isLoggedIn) {
    next("/");
    return;
  }

  next();
});

export default router;
