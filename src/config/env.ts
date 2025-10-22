/**
 * 環境変数を管理するモジュール
 * アプリケーション全体で使用する環境変数をここで一元管理します
 */

interface EnvConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * 環境変数を取得して検証する関数
 */
function loadEnvConfig(): EnvConfig {
  // 環境変数から値を取得（デフォルト値を設定）
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // 開発環境・本番環境の判定
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // バリデーション
  if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not defined");
  }

  return {
    apiBaseUrl,
    isDevelopment,
    isProduction,
  };
}

/**
 * アプリケーション全体で使用する環境変数の設定
 */
export const env = loadEnvConfig();
