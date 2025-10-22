import createClient from "openapi-fetch";
import type { paths } from "../types/api";

// APIクライアントを作成
export const apiClient = createClient<paths>({
  baseUrl: "http://localhost:8080/api",
});

// トークン管理用の変数
let currentToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

// デフォルトヘッダーを設定
apiClient.use({
  onRequest({ request }) {
    request.headers.set("Content-Type", "application/json");
    request.headers.set("Accept", "application/json");

    // 現在のトークンがある場合は設定
    if (currentToken) {
      request.headers.set("Authorization", `Bearer ${currentToken}`);
    }
  },
});

// 認証トークンを設定するヘルパー関数
export const setAuthToken = (token: string) => {
  currentToken = token;
};

// 認証トークンをクリアするヘルパー関数
export const clearAuthToken = () => {
  currentToken = null;
  refreshPromise = null;
};

// トークンリフレッシュ関数
const refreshToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      console.log("Refreshing token...");
      const response = await apiClient.POST("/v1/refresh");

      if (response.error) {
        throw new Error("Token refresh failed");
      }

      const newToken = response.data?.token;
      if (!newToken) {
        throw new Error("No token received from refresh");
      }

      currentToken = newToken;
      console.log("Token refreshed successfully");
      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuthToken();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// リトライ機能付きのAPI呼び出し
const apiCallWithRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 1
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // 401エラーでリトライ可能な場合
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 401 &&
        attempt < maxRetries
      ) {
        console.log(
          `API call failed with 401, attempting refresh (attempt ${attempt + 1}/${maxRetries + 1})`
        );

        try {
          await refreshToken();
          // リフレッシュ成功後、再試行
          continue;
        } catch (refreshError) {
          console.error("Token refresh failed, redirecting to login");
          clearAuthToken();
          // リフレッシュに失敗した場合はログインページにリダイレクト
          window.location.href = "/login";
          throw refreshError;
        }
      }

      // 401以外のエラーまたは最大リトライ回数に達した場合
      break;
    }
  }

  throw lastError;
};

// エラーハンドリング用のヘルパー関数
export const handleApiError = (error: unknown) => {
  if (error && typeof error === "object" && "status" in error && error.status === 401) {
    console.error("Authentication failed - token may be expired");
  }
  console.error("API Error:", error);
  throw error;
};

// リトライ機能付きAPIクライアントのラッパー
export const apiClientWithRetry = {
  GET: <T extends keyof paths>(path: T, options?: Parameters<typeof apiClient.GET>[1]) =>
    apiCallWithRetry(() => apiClient.GET(path, options)) as any,

  POST: <T extends keyof paths>(path: T, options?: Parameters<typeof apiClient.POST>[1]) =>
    apiCallWithRetry(() => apiClient.POST(path, options)) as any,

  PUT: <T extends keyof paths>(path: T, options?: Parameters<typeof apiClient.PUT>[1]) =>
    apiCallWithRetry(() => apiClient.PUT(path, options)) as any,

  DELETE: <T extends keyof paths>(path: T, options?: Parameters<typeof apiClient.DELETE>[1]) =>
    apiCallWithRetry(() => apiClient.DELETE(path, options)) as any,
};
