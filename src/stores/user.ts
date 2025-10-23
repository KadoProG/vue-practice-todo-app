import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { apiClientWithRetry, clearAuthToken } from "@/api/client";
import { useLogout } from "@/api/hooks";
import type { components } from "@/types/api";

// 型定義
type UserResource = components["schemas"]["UserResource"];

export const useUserStore = defineStore("user", () => {
  const user = ref<UserResource | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ログイン状態を計算
  const isLoggedIn = computed(() => {
    const token = localStorage.getItem("auth_token");
    return !!token && !!user.value;
  });

  // ユーザー名を取得（未ログイン時はゲスト）
  const displayName = computed(() => {
    if (isLoggedIn.value && user.value) {
      return user.value.name || user.value.email || "ユーザー";
    }
    return "ゲスト";
  });

  // ユーザー情報を取得
  const fetchUserInfo = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      user.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: apiError } = await apiClientWithRetry.GET("/v1/users/me" as const);

      if (apiError) {
        if (apiError.status === 401) {
          // 認証エラーの場合、トークンをクリア
          clearAuthToken();
          localStorage.removeItem("auth_token");
          user.value = null;
        } else {
          error.value = "ユーザー情報の取得に失敗しました";
        }
        return;
      }

      if (data?.user) {
        user.value = data.user;
      }
    } catch (err) {
      console.error("Failed to fetch user info:", err);
      error.value = "ユーザー情報の取得に失敗しました";
    } finally {
      isLoading.value = false;
    }
  };

  // ログアウト処理
  const logout = async () => {
    try {
      const logoutMutation = useLogout();
      await logoutMutation.mutateAsync();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // エラーが発生してもローカル状態をクリア
      clearAuthToken();
      localStorage.removeItem("auth_token");
      user.value = null;
    }
  };

  // ユーザー情報をクリア
  const clearUser = () => {
    user.value = null;
    error.value = null;
  };

  return {
    user,
    isLoading,
    error,
    isLoggedIn,
    displayName,
    fetchUserInfo,
    logout,
    clearUser,
  };
});
