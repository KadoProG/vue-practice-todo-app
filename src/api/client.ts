import createClient from "openapi-fetch";
import type { paths } from "../types/api";

// APIクライアントを作成
export const apiClient = createClient<paths>({
  baseUrl: "http://localhost:8080/api",
});

// デフォルトヘッダーを設定
apiClient.use({
  onRequest({ request }) {
    request.headers.set("Content-Type", "application/json");
    request.headers.set("Accept", "application/json");
  },
});

// 認証トークンを設定するヘルパー関数
export const setAuthToken = (token: string) => {
  apiClient.use({
    onRequest({ request }) {
      request.headers.set("Authorization", `Bearer ${token}`);
    },
  });
};

// 認証トークンをクリアするヘルパー関数
export const clearAuthToken = () => {
  apiClient.use({
    onRequest({ request }) {
      request.headers.delete("Authorization");
    },
  });
};

// エラーハンドリング用のヘルパー関数
export const handleApiError = (error: unknown) => {
  if (error && typeof error === "object" && "status" in error && error.status === 401) {
    // 認証エラーの場合、トークンをクリア
    clearAuthToken();
    // ログインページにリダイレクトなど
    console.error("Authentication failed");
  }
  console.error("API Error:", error);
  throw error;
};
