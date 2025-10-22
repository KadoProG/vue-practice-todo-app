<template>
  <div class="user-profile">
    <div class="profile-card">
      <h2 class="profile-title">ユーザー情報</h2>

      <div v-if="isLoading" class="loading">読み込み中...</div>

      <div v-else-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-else-if="user" class="user-info">
        <div class="info-item">
          <label class="info-label">ID:</label>
          <span class="info-value">{{ user.id }}</span>
        </div>

        <div class="info-item">
          <label class="info-label">名前:</label>
          <span class="info-value">{{ user.name }}</span>
        </div>

        <div class="info-item">
          <label class="info-label">メールアドレス:</label>
          <span class="info-value">{{ user.email }}</span>
        </div>

        <div class="info-item">
          <label class="info-label">登録日:</label>
          <span class="info-value">{{ formatDate(user.created_at) }}</span>
        </div>

        <div class="info-item">
          <label class="info-label">最終更新日:</label>
          <span class="info-value">{{ formatDate(user.updated_at) }}</span>
        </div>

        <div class="info-item">
          <label class="info-label">メール認証:</label>
          <span class="info-value">
            <span :class="['status-badge', user.email_verified_at ? 'verified' : 'unverified']">
              {{ user.email_verified_at ? "認証済み" : "未認証" }}
            </span>
          </span>
        </div>
      </div>

      <div class="actions">
        <button @click="refreshUserInfo" class="refresh-button" :disabled="isLoading">
          情報を更新
        </button>
        <button @click="handleLogout" class="logout-button">ログアウト</button>
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

<style scoped>
.user-profile {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 500px;
}

.profile-title {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.loading {
  text-align: center;
  color: #666;
  font-size: 16px;
  padding: 40px 0;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #fcc;
  font-size: 14px;
  text-align: center;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
  font-size: 14px;
}

.info-value {
  color: #333;
  font-size: 14px;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.verified {
  background: #d4edda;
  color: #155724;
}

.status-badge.unverified {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.refresh-button,
.logout-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.refresh-button {
  background: #6c757d;
  color: white;
}

.refresh-button:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.logout-button {
  background: #dc3545;
  color: white;
}

.logout-button:hover {
  background: #c82333;
  transform: translateY(-1px);
}
</style>
