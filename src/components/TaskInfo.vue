<template>
  <div>
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4 pb-2 border-b-2 border-gray-200">
        <h3 class="text-slate-700 text-lg font-semibold m-0">基本情報</h3>
        <button
          v-if="!isEditing"
          @click="handleEdit"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors duration-300"
        >
          編集
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label class="font-medium text-gray-600 text-sm">作成者</label>
          <span class="text-slate-700 text-base">{{ task.created_user.name }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-medium text-gray-600 text-sm">作成日時</label>
          <span class="text-slate-700 text-base">{{ formatDate(task.created_at) }}</span>
        </div>
        <div class="flex flex-col gap-1" v-if="task.expired_at">
          <label class="font-medium text-gray-600 text-sm">期限</label>
          <span
            :class="[
              'text-base',
              isExpired(task.expired_at) ? 'text-red-600 font-medium' : 'text-slate-700',
            ]"
          >
            {{ formatDate(task.expired_at) }}
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-medium text-gray-600 text-sm">最終更新</label>
          <span class="text-slate-700 text-base">{{ formatDate(task.updated_at) }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="font-medium text-gray-600 text-sm">担当者</label>
          <div class="flex flex-wrap gap-2">
            <template v-if="task.assigned_users.length > 0">
              <span
                v-for="user in task.assigned_users"
                :key="user.id"
                class="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {{ user.name }}
              </span>
            </template>
            <span v-else class="text-gray-500 text-sm"> 担当者なし </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 編集フォーム -->
    <div v-if="isEditing" class="mb-8">
      <h3 class="text-slate-700 text-lg font-semibold m-0 mb-4 pb-2 border-b-2 border-gray-200">
        タスク編集
      </h3>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- タイトル -->
        <div class="flex flex-col gap-2">
          <label class="font-medium text-gray-600 text-sm">タイトル</label>
          <input
            v-model="editForm.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="タスクのタイトルを入力"
            required
          />
        </div>

        <!-- 説明 -->
        <div class="flex flex-col gap-2">
          <label class="font-medium text-gray-600 text-sm">説明</label>
          <textarea
            v-model="editForm.description"
            rows="3"
            class="w-full p-2 border rounded focus:outline-none focus:ring"
            placeholder="タスクの説明を入力"
          ></textarea>
        </div>

        <!-- 期限 -->
        <div class="flex flex-col gap-2">
          <label class="font-medium text-gray-600 text-sm">期限</label>
          <input
            v-model="editForm.expired_at"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="期限を選択"
          />
        </div>

        <!-- 担当者 -->
        <div class="flex flex-col gap-2">
          <label class="font-medium text-gray-600 text-sm">担当者</label>
          <div class="space-y-2">
            <div v-for="user in users" :key="user.id" class="flex items-center gap-2">
              <input
                :id="`user-${user.id}`"
                v-model="editForm.assigned_user_ids"
                :value="user.id"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label :for="`user-${user.id}`" class="text-sm text-gray-700">
                {{ user.name }} ({{ user.email }})
              </label>
            </div>
          </div>
        </div>

        <!-- ボタン -->
        <div class="flex gap-4">
          <button
            type="submit"
            class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors duration-300"
          >
            保存
          </button>
          <button
            type="button"
            @click="handleCancel"
            class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-300"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>

    <!-- 表示モード -->
    <div v-else>
      <div v-if="task.description">
        <h3 class="font-semibold mb-2">説明</h3>
        <div class="text-gray-700">
          {{ task.description }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { components } from "@/types/api";
import { useUsers } from "@/api/hooks";

type TaskResource = components["schemas"]["TaskResource"];

interface Props {
  task: TaskResource;
  isEditing: boolean;
}

interface Emits {
  edit: [];
  save: [
    data: {
      title: string;
      description: string | null;
      assigned_user_ids: number[];
      expired_at: string | null;
    }
  ];
  cancel: [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// ユーザー一覧を取得
const { data: usersData } = useUsers();
const users = computed(() => usersData.value?.users || []);

// 編集フォームのデータ
const editForm = ref({
  title: "",
  description: "",
  assigned_user_ids: [] as number[],
  expired_at: props.task.expired_at,
});

// 編集モードが変更されたときにフォームを初期化
watch(
  () => props.isEditing,
  (newValue) => {
    if (newValue) {
      editForm.value = {
        title: props.task.title,
        description: props.task.description || "",
        assigned_user_ids: props.task.assigned_users.map((user) => user.id),
        expired_at: props.task.expired_at,
      };
    }
  },
  { immediate: true }
);

// 編集開始
const handleEdit = () => {
  emit("edit");
};

// フォーム送信
const handleSubmit = () => {
  emit("save", {
    title: editForm.value.title,
    description: editForm.value.description || null,
    assigned_user_ids: editForm.value.assigned_user_ids,
    expired_at: editForm.value.expired_at || null,
  });
};

// キャンセル
const handleCancel = () => {
  emit("cancel");
};

// 日付フォーマット
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 期限切れチェック
const isExpired = (expiredAt: string) => {
  return new Date(expiredAt) < new Date();
};
</script>
