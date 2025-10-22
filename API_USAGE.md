# API 型安全環境の使用方法

## 概要

OpenAPI 定義から型安全な API クライアントを自動生成し、TanStack Query (Vue Query) と組み合わせて使用する環境を構築しました。

## ファイル構成

```
src/
├── types/
│   └── api.ts              # OpenAPI定義から自動生成された型定義
├── api/
│   ├── client.ts           # openapi-fetchを使用したAPIクライアント
│   └── hooks.ts            # TanStack Queryを使用したカスタムフック
└── components/
    └── ApiExample.vue      # 使用例コンポーネント
```

## 使用方法

### 1. 基本的な API 呼び出し

```typescript
import { apiClient } from "@/api/client";

// 型安全なAPI呼び出し
const response = await apiClient.GET("/v1/tasks");
if (response.error) {
  console.error("API Error:", response.error);
} else {
  console.log("Tasks:", response.data);
}
```

### 2. TanStack Query フックの使用

```typescript
import { useTasks, useCreateTask } from "@/api/hooks";

// タスク一覧の取得（自動キャッシュ・再取得）
const { data, isLoading, isError, error } = useTasks();

// タスクの作成
const createTaskMutation = useCreateTask();
await createTaskMutation.mutateAsync({
  title: "New Task",
  is_public: true,
});
```

### 3. 認証トークンの管理

```typescript
import { setAuthToken, clearAuthToken } from "@/api/client";

// ログイン時にトークンを設定
setAuthToken("your-jwt-token");

// ログアウト時にトークンをクリア
clearAuthToken();
```

## 利用可能なフック

### 認証関連

- `useLogin()` - ログイン
- `useLogout()` - ログアウト
- `useRefreshToken()` - トークンリフレッシュ

### ユーザー関連

- `useCurrentUser()` - 現在のユーザー情報取得
- `useUsers()` - ユーザー一覧取得

### タスク関連

- `useTasks(params?)` - タスク一覧取得
- `useTask(taskId)` - 特定タスク取得
- `useCreateTask()` - タスク作成
- `useUpdateTask()` - タスク更新
- `useDeleteTask()` - タスク削除
- `useUserTasks(params?)` - ユーザーのタスク一覧取得

## 型安全性の特徴

1. **リクエスト・レスポンスの型チェック**: OpenAPI 定義に基づいて自動生成された型を使用
2. **パス・パラメータの型チェック**: API エンドポイントのパスとパラメータが型安全
3. **エラーハンドリング**: 統一されたエラーハンドリング
4. **自動キャッシュ**: TanStack Query による自動的なデータキャッシュと再取得

## 開発時の注意点

1. **API 定義の更新**: `docs/api.yml`を更新した後は、`npx openapi-typescript docs/api.yml -o src/types/api.ts`で型定義を再生成
2. **認証状態の管理**: ログイン・ログアウト時に適切にトークンを設定・クリア
3. **エラーハンドリング**: API エラーは`handleApiError`関数で統一して処理

## 実行方法

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check
```
