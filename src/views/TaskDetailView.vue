<template>
  <div class="max-w-4xl mx-auto p-5">
    <div v-if="loading" class="text-center py-10 text-base">読み込み中...</div>

    <div v-else-if="error" class="text-center py-10 text-base text-red-600">
      {{ error }}
    </div>

    <div v-else-if="task" class="bg-white rounded-lg shadow-md overflow-hidden mx-auto">
      <!-- ヘッダー -->
      <div
        class="flex justify-between items-start p-8 bg-gray-50 border-b border-gray-200 md:flex-row flex-col md:gap-0 gap-5"
      >
        <div
          class="flex items-center gap-5 md:flex-row flex-col md:gap-5 gap-4 md:items-center items-stretch"
        >
          <button
            @click="goBack"
            class="bg-gray-600 hover:bg-gray-700 text-white border-none px-4 py-2 rounded-md cursor-pointer text-sm transition-colors duration-300"
          >
            ← 戻る
          </button>
          <h1 class="m-0 text-slate-700 text-3xl font-semibold md:text-3xl text-2xl">
            {{ task.title }}
          </h1>
        </div>
        <div class="flex gap-2.5 md:flex-row flex-col md:gap-2.5 gap-2 md:self-start self-start">
          <span
            :class="[
              'px-3 py-1.5 rounded-full text-sm font-medium',
              task.is_done ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800',
            ]"
          >
            {{ task.is_done ? "完了" : "未完了" }}
          </span>
          <span
            v-if="task.is_public"
            class="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            公開
          </span>
        </div>
      </div>

      <!-- タスク情報 -->
      <div class="p-8">
        <TaskInfo :task="task" />

        <!-- アクション一覧 -->
        <TaskActions
          :task-id="task.id"
          :actions="actions"
          :loading="actionsLoading"
          :error="errorMessage"
        />
      </div>

      <!-- アクションボタン -->
      <div class="flex gap-4 p-8 bg-gray-50 border-t border-gray-200 md:flex-row flex-col">
        <button
          @click="toggleTaskStatus"
          :class="[
            'px-6 py-3 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-300',
            task.is_done
              ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
              : 'bg-green-500 hover:bg-green-600 text-white',
          ]"
        >
          {{ task.is_done ? "未完了に戻す" : "完了にする" }}
        </button>
        <button
          @click="editTask"
          class="px-6 py-3 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-300 bg-blue-500 hover:bg-blue-600 text-white"
        >
          編集
        </button>
        <button
          @click="deleteTask"
          class="px-6 py-3 border-none rounded-md cursor-pointer text-sm font-medium transition-all duration-300 bg-red-500 hover:bg-red-600 text-white"
        >
          削除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTask, useTaskActions, useUpdateTask, useDeleteTask } from "@/api/hooks";
import TaskInfo from "@/components/TaskInfo.vue";
import TaskActions from "@/components/TaskActions.vue";

const router = useRouter();
const route = useRoute();

// タスクIDを取得
const taskId = computed(() => {
  const id = route.params.id;
  return typeof id === "string" ? parseInt(id) : null;
});

// APIからタスク詳細を取得
const { data: taskData, isLoading: loading, error: taskError } = useTask(taskId.value);

// APIからアクション一覧を取得
const {
  data: actionsData,
  isLoading: actionsLoading,
  error: actionsError,
} = useTaskActions(taskId.value);

// タスク情報を取得
const task = computed(() => taskData.value?.task || null);

// アクション一覧を取得
const actions = computed(() => actionsData.value?.actions || []);

// エラーメッセージを取得
const error = computed(() => {
  if (taskError.value) {
    return "タスクの取得に失敗しました";
  }
  return "";
});

const errorMessage = computed(() => {
  if (actionsError.value) {
    return "アクションの取得に失敗しました";
  }
  return "";
});

// タスク更新のミューテーション
const updateTaskMutation = useUpdateTask();

// タスク削除のミューテーション
const deleteTaskMutation = useDeleteTask();

// 戻るボタン
const goBack = () => {
  router.push("/tasks");
};

// タスクステータス切り替え
const toggleTaskStatus = async () => {
  if (!task.value) return;

  try {
    await updateTaskMutation.mutateAsync({
      taskId: task.value.id,
      data: {
        is_done: !task.value.is_done,
      },
    });
  } catch (err) {
    console.error("Error updating task status:", err);
  }
};

// タスク編集
const editTask = () => {
  // 編集画面への遷移（実装予定）
  console.log("Edit task:", task.value?.id);
};

// タスク削除
const deleteTask = async () => {
  if (!task.value) return;

  if (confirm("このタスクを削除しますか？")) {
    try {
      await deleteTaskMutation.mutateAsync(task.value.id);
      // タスク一覧に戻る
      router.push("/tasks");
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  }
};
</script>
