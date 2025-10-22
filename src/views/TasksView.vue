<template>
  <div class="max-w-6xl mx-auto p-5 bg-gray-50 min-h-screen">
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h1 class="text-3xl font-bold text-slate-700 mb-4">タスク一覧</h1>
      <button
        @click="() => refreshTasks()"
        class="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        :disabled="loading"
      >
        {{ loading ? "読み込み中..." : "更新" }}
      </button>
    </div>

    <div class="flex gap-5 mb-8 p-4 bg-gray-100 rounded-lg md:flex-row flex-col gap-5">
      <div class="flex items-center gap-2 cursor-pointer text-sm">
        <label>
          <select
            v-model="filters.isDone"
            @change="applyFilters"
            class="px-3 py-2 border border-gray-300 rounded bg-white text-sm cursor-pointer focus:outline-none focus:border-blue-500 focus:shadow-sm"
          >
            <option :value="false">未完了のみ</option>
            <option :value="true">完了のみ</option>
            <option :value="null">すべて表示</option>
          </select>
        </label>
      </div>
      <div class="flex items-center gap-2 cursor-pointer text-sm">
        <label class="flex items-center gap-2 cursor-pointer text-sm">
          <input type="checkbox" v-model="filters.isPublic" @change="applyFilters" class="m-0" />
          公開タスクのみ
        </label>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10 text-base">読み込み中...</div>

    <div v-else-if="errorMessage" class="text-center py-10 text-base text-red-600">
      {{ errorMessage }}
    </div>

    <div v-else-if="tasks.length === 0" class="text-center py-10 text-base text-gray-500">
      タスクがありません
    </div>

    <div v-else class="grid gap-5">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white border border-gray-200 rounded-lg p-5 cursor-pointer transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-blue-500"
        @click="goToTaskDetail(task.id)"
      >
        <div class="flex justify-between items-start mb-2.5">
          <h3 class="m-0 text-slate-700 text-lg font-semibold">
            {{ task.title }}
          </h3>
          <div class="flex gap-2">
            <span
              :class="[
                'px-2 py-1 rounded-xl text-xs font-medium',
                task.is_done ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
              ]"
            >
              {{ task.is_done ? "完了" : "未完了" }}
            </span>
            <span
              v-if="task.is_public"
              class="px-2 py-1 rounded-xl text-xs font-medium bg-blue-100 text-blue-800"
            >
              公開
            </span>
          </div>
        </div>

        <p v-if="task.description" class="text-gray-600 my-2.5 leading-6">
          {{ task.description }}
        </p>

        <div
          class="flex justify-between items-end mt-4 text-sm md:flex-row flex-col gap-2.5 items-start"
        >
          <div class="flex flex-col gap-1.5">
            <span class="text-gray-600"> 作成者: {{ task.created_user.name }} </span>
            <span v-if="task.expired_at" class="text-gray-600 font-medium">
              期限: {{ formatDate(task.expired_at) }}
            </span>
          </div>

          <div v-if="task.assigned_users.length > 0" class="flex flex-wrap gap-1.5 items-center">
            <span class="text-gray-600 font-medium">担当者:</span>
            <span
              v-for="user in task.assigned_users"
              :key="user.id"
              class="bg-gray-200 px-1.5 py-0.5 rounded text-xs text-gray-700"
            >
              {{ user.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useTasks } from "@/api/hooks";

const router = useRouter();

// フィルター
const filters = ref({
  isDone: null as boolean | null,
  isPublic: false,
});

// APIクエリパラメータを計算
const queryParams = computed(() => {
  const params: {
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
  } = {};

  if (filters.value.isDone !== null) {
    params.is_done = filters.value.isDone;
  }

  if (filters.value.isPublic) {
    params.is_public = true;
  }

  return params;
});

// APIからタスク一覧を取得
const {
  data: tasksData,
  isLoading: loading,
  error,
  refetch: refreshTasks,
} = useTasks(queryParams as unknown as Parameters<typeof useTasks>[0]);

// タスク一覧を取得
const tasks = computed(() => tasksData.value?.tasks || []);

// エラーメッセージを取得
const errorMessage = computed(() => {
  if (error.value) {
    return "タスクの取得に失敗しました";
  }
  return "";
});

// フィルター適用
const applyFilters = () => {
  // フィルターが変更されたら即座に再fetch
  refreshTasks();
};

// タスク詳細へ遷移
const goToTaskDetail = (taskId: number) => {
  router.push(`/tasks/${taskId}`);
};

// 日付フォーマット
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
