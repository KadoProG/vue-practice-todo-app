<template>
  <div>
    <div class="mb-8">
      <h3 class="text-slate-700 text-lg font-semibold m-0 mb-4 pb-2 border-b-2 border-gray-200">
        基本情報
      </h3>
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
      </div>
    </div>

    <div class="mb-8" v-if="task.description">
      <h3 class="text-slate-700 text-lg font-semibold m-0 mb-4 pb-2 border-b-2 border-gray-200">
        説明
      </h3>
      <div class="bg-gray-50 p-4 rounded-md leading-relaxed text-slate-700 whitespace-pre-line">
        {{ task.description }}
      </div>
    </div>

    <div class="mb-8" v-if="task.assigned_users.length > 0">
      <h3 class="text-slate-700 text-lg font-semibold m-0 mb-4 pb-2 border-b-2 border-gray-200">
        担当者
      </h3>
      <div class="grid gap-2.5">
        <div
          v-for="user in task.assigned_users"
          :key="user.id"
          class="bg-gray-50 p-4 rounded-md border-l-4 border-blue-500"
        >
          <div class="flex flex-col gap-1">
            <span class="font-medium text-slate-700">{{ user.name }}</span>
            <span class="text-sm text-gray-600">{{ user.email }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { components } from "@/types/api";

type TaskResource = components["schemas"]["TaskResource"];

interface Props {
  task: TaskResource;
}

defineProps<Props>();

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
