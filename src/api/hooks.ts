import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { type Ref } from "vue";
import { apiClientWithRetry, handleApiError, clearAuthToken } from "../api/client";
import type { paths } from "../types/api";

// 型定義のエイリアス
type LoginRequest = NonNullable<
  paths["/v1/login"]["post"]["requestBody"]
>["content"]["application/json"];

type TaskCreateRequest = NonNullable<
  paths["/v1/tasks"]["post"]["requestBody"]
>["content"]["application/json"];

type TaskUpdateRequest = NonNullable<
  paths["/v1/tasks/{task}"]["put"]["requestBody"]
>["content"]["application/json"];

type TaskActionCreateRequest = NonNullable<
  paths["/v1/tasks/{task}/actions"]["post"]["requestBody"]
>["content"]["application/json"];
type TaskActionUpdateRequest = NonNullable<
  paths["/v1/tasks/{task}/actions/{action}"]["put"]["requestBody"]
>["content"]["application/json"];

// 認証関連のフック
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      console.log("login data", data);
      const response = await apiClientWithRetry.POST("/v1/login", {
        body: data,
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onError: handleApiError,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClientWithRetry.POST("/v1/logout", {});
      if (response.error) {
        throw new Error("Logout failed");
      }
      return response.data;
    },
    onSuccess: () => {
      // ログアウト後、すべてのキャッシュをクリア
      queryClient.clear();
      // トークンをクリア
      clearAuthToken();
      localStorage.removeItem("auth_token");
    },
    onError: handleApiError,
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClientWithRetry.POST("/v1/refresh", {});
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onError: handleApiError,
  });
};

// ユーザー関連のフック
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await apiClientWithRetry.GET("/v1/users/me", {});
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClientWithRetry.GET("/v1/users", {});
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
  });
};

// タスク関連のフック
export const useTasks = (
  params?: Ref<{
    is_public?: boolean;
    is_done?: boolean;
    expired_before?: string;
    expired_after?: string;
    created_user_id?: number;
    assigned_user_id?: number;
    sort_by?: "title" | "expired_at" | "created_at" | "updated_at";
    sort_order?: "asc" | "desc";
    created_user_ids?: number[];
    assigned_user_ids?: number[];
  }>
) => {
  return useQuery({
    queryKey: ["tasks", params?.value],
    queryFn: async () => {
      const response = await apiClientWithRetry.GET("/v1/tasks", {
        params: {
          query: params?.value,
        },
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
  });
};

export const useTask = (taskId: number | null) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) {
        throw new Error("Task ID is required");
      }
      const response = await apiClientWithRetry.GET("/v1/tasks/{task}", {
        params: {
          path: { task: taskId },
        },
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    enabled: !!taskId,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskCreateRequest) => {
      const response = await apiClientWithRetry.POST("/v1/tasks", {
        body: data,
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: () => {
      // タスク作成後、タスク一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: handleApiError,
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number; data: TaskUpdateRequest }) => {
      const response = await apiClientWithRetry.PUT("/v1/tasks/{task}", {
        params: {
          path: { task: taskId },
        },
        body: data,
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      // タスク更新後、該当タスクとタスク一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: handleApiError,
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiClientWithRetry.DELETE("/v1/tasks/{task}", {
        params: {
          path: { task: taskId },
        },
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: (_, taskId) => {
      // タスク削除後、タスク一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.removeQueries({ queryKey: ["task", taskId] });
    },
    onError: handleApiError,
  });
};

// ユーザーのタスク一覧
export const useUserTasks = (params?: {
  is_public?: boolean;
  is_done?: boolean;
  expired_before?: string;
  expired_after?: string;
  created_user_id?: number;
  assigned_user_id?: number;
  sort_by?: "title" | "expired_at" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
  created_user_ids?: number[];
  assigned_user_ids?: number[];
}) => {
  return useQuery({
    queryKey: ["user", "tasks", params],
    queryFn: async () => {
      const response = await apiClientWithRetry.GET("/v1/users/me/tasks", {
        params: {
          query: params,
        },
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
  });
};

// タスクアクション関連のフック
export const useTaskActions = (taskId: number | null) => {
  return useQuery({
    queryKey: ["task", taskId, "actions"],
    queryFn: async () => {
      if (!taskId) {
        throw new Error("Task ID is required");
      }
      const response = await apiClientWithRetry.GET("/v1/tasks/{task}/actions", {
        params: {
          path: { task: taskId },
        },
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    enabled: !!taskId,
  });
};

export const useCreateTaskAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number; data: TaskActionCreateRequest }) => {
      const response = await apiClientWithRetry.POST("/v1/tasks/{task}/actions", {
        params: {
          path: { task: taskId },
        },
        body: data,
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      // アクション作成後、該当タスクのアクション一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["task", taskId, "actions"] });
    },
    onError: handleApiError,
  });
};

export const useUpdateTaskAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      actionId,
      data,
    }: {
      taskId: number;
      actionId: number;
      data: TaskActionUpdateRequest;
    }) => {
      const response = await apiClientWithRetry.PUT("/v1/tasks/{task}/actions/{action}", {
        params: {
          path: { task: taskId, action: actionId },
        },
        body: data,
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      // アクション更新後、該当タスクのアクション一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["task", taskId, "actions"] });
    },
    onError: handleApiError,
  });
};

export const useDeleteTaskAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, actionId }: { taskId: number; actionId: number }) => {
      const response = await apiClientWithRetry.DELETE("/v1/tasks/{task}/actions/{action}", {
        params: {
          path: { task: taskId, action: actionId },
        },
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      // アクション削除後、該当タスクのアクション一覧を再取得
      queryClient.invalidateQueries({ queryKey: ["task", taskId, "actions"] });
    },
    onError: handleApiError,
  });
};
