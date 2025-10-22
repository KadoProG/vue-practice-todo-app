import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { apiClient, handleApiError } from "../api/client";
import type { paths } from "../types/api";

// 型定義のエイリアス
type LoginRequest = NonNullable<
  paths["/v1/login"]["post"]["requestBody"]
>["content"]["application/json"];
type LoginResponse = NonNullable<
  paths["/v1/login"]["post"]["responses"]["200"]
>["content"]["application/json"];

type TaskListResponse = NonNullable<
  paths["/v1/tasks"]["get"]["responses"]["200"]
>["content"]["application/json"];
type TaskCreateRequest = NonNullable<
  paths["/v1/tasks"]["post"]["requestBody"]
>["content"]["application/json"];
type TaskCreateResponse = NonNullable<
  paths["/v1/tasks"]["post"]["responses"]["200"]
>["content"]["application/json"];

type TaskResponse = NonNullable<
  paths["/v1/tasks/{task}"]["get"]["responses"]["200"]
>["content"]["application/json"];
type TaskUpdateRequest = NonNullable<
  paths["/v1/tasks/{task}"]["put"]["requestBody"]
>["content"]["application/json"];

type UserResponse = NonNullable<
  paths["/v1/users/me"]["get"]["responses"]["200"]
>["content"]["application/json"];

// 認証関連のフック
export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      console.log("login data", data);
      const response = await apiClient.POST("/v1/login", {
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
      const response = await apiClient.POST("/v1/logout");
      if (response.error) {
        throw new Error("Logout failed");
      }
      return response.data;
    },
    onSuccess: () => {
      // ログアウト後、すべてのキャッシュをクリア
      queryClient.clear();
    },
    onError: handleApiError,
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.POST("/v1/refresh");
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
      const response = await apiClient.GET("/v1/users/me");
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
      const response = await apiClient.GET("/v1/users");
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
  });
};

// タスク関連のフック
export const useTasks = (params?: {
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
    queryKey: ["tasks", params],
    queryFn: async () => {
      const response = await apiClient.GET("/v1/tasks", {
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

export const useTask = (taskId: number) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const response = await apiClient.GET("/v1/tasks/{task}", {
        params: {
          path: { task: taskId },
        },
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskCreateRequest) => {
      const response = await apiClient.POST("/v1/tasks", {
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
      const response = await apiClient.PUT("/v1/tasks/{task}", {
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
      const response = await apiClient.DELETE("/v1/tasks/{task}", {
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
      const response = await apiClient.GET("/v1/users/me/tasks", {
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
