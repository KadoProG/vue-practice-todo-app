<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50 p-5">
    <div class="bg-white rounded-xl shadow-2xl p-10 w-full max-w-lg">
      <h2 class="text-center text-gray-800 mb-8 text-3xl font-semibold">ユーザー情報</h2>

      <div v-if="isLoading" class="text-center text-gray-600 text-base py-10">読み込み中...</div>

      <div
        v-else-if="errorMessage"
        class="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 text-sm text-center mb-5"
      >
        {{ errorMessage }}
      </div>

      <div v-else-if="user" class="flex flex-col gap-4 mb-8">
        <div class="flex items-center py-3 border-b border-gray-200">
          <label class="font-semibold text-gray-600 min-w-[120px] text-sm">ID:</label>
          <span class="text-gray-800 text-sm flex-1">{{ user.id }}</span>
        </div>

        <div class="flex items-center py-3 border-b border-gray-200">
          <label class="font-semibold text-gray-600 min-w-[120px] text-sm">名前:</label>
          <span class="text-gray-800 text-sm flex-1">{{ user.name }}</span>
        </div>

        <div class="flex items-center py-3 border-b border-gray-200">
          <label class="font-semibold text-gray-600 min-w-[120px] text-sm">メールアドレス:</label>
          <span class="text-gray-800 text-sm flex-1">{{ user.email }}</span>
        </div>

        <div class="flex items-center py-3 border-b border-gray-200">
          <label class="font-semibold text-gray-600 min-w-[120px] text-sm">登録日:</label>
          <span class="text-gray-800 text-sm flex-1">{{ formatDate(user.created_at) }}</span>
        </div>

        <div class="flex items-center py-3 border-b border-gray-200">
          <label class="font-semibold text-gray-600 min-w-[120px] text-sm">最終更新日:</label>
          <span class="text-gray-800 text-sm flex-1">{{ formatDate(user.updated_at) }}</span>
        </div>

        <div class="flex items-center py-3">
          <label class="font-semibold text-gray-600 min-w-[120px] text-sm">メール認証:</label>
          <span class="text-sm flex-1">
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold',
                user.email_verified_at ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
              ]"
            >
              {{ user.email_verified_at ? "認証済み" : "未認証" }}
            </span>
          </span>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        <button
          @click="refreshUserInfo"
          class="px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-gray-600 text-white hover:bg-gray-500 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          :disabled="isLoading"
        >
          情報を更新
        </button>
        <button
          @click="handleLogout"
          class="px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5"
        >
          ログアウト
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiClientWithRetry, clearAuthToken, handleApiError } from "../api/client";
import { useLogout } from "../api/hooks";
import type { paths } from "../types/api";

const router = useRouter();

// ログアウトフックを使用
const logoutMutation = useLogout();

// 型定義
type UserResource =
  paths["/v1/users/me"]["get"]["responses"][200]["content"]["application/json"]["user"];

// 状態管理
const user = ref<UserResource | null>(null);
const isLoading = ref(false);
const errorMessage = ref("");

// ユーザー情報を取得
const fetchUserInfo = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const { data, error } = await apiClientWithRetry.GET("/v1/users/me" as any);

    if (error) {
      if (error.status === 401) {
        errorMessage.value = "認証が必要です。ログインしてください。";
        // トークンをクリアしてログインページにリダイレクト
        clearAuthToken();
        localStorage.removeItem("auth_token");
        router.push("/login");
      } else {
        errorMessage.value = "ユーザー情報の取得に失敗しました";
      }
      return;
    }

    if (data?.user) {
      user.value = data.user;
    }
  } catch (err) {
    handleApiError(err);
    errorMessage.value = "ユーザー情報の取得に失敗しました";
  } finally {
    isLoading.value = false;
  }
};

// ユーザー情報を更新
const refreshUserInfo = () => {
  fetchUserInfo();
};

// ログアウト処理
const handleLogout = async () => {
  try {
    await logoutMutation.mutateAsync();
    // ログインページにリダイレクト
    router.push("/login");
  } catch (err) {
    console.error("Logout error:", err);
    // エラーが発生してもログインページにリダイレクト
    router.push("/login");
  }
};

// 日付フォーマット
const formatDate = (dateString: string | null) => {
  if (!dateString) return "未設定";

  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// コンポーネントマウント時にユーザー情報を取得
onMounted(() => {
  fetchUserInfo();
});
</script>
