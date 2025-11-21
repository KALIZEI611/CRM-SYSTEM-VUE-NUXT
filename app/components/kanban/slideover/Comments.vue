<script lang="ts" setup>
import { useDealSlideStore } from "~/stores/deal-slide.store";
import { useCreateComment } from "./useCreateComment";
import { useComments } from "./useComments";
import dayjs from "dayjs";

const store = useDealSlideStore();
const { data, refetch, isLoading } = useComments();
const { commentRef, writeComment } = useCreateComment({ refetch });

// Для отладки
console.log("Comments data:", data);
</script>

<template>
  <ui-input
    placeholder="Оставьте комментарий"
    v-model="commentRef"
    @keyup.enter="writeComment"
  />

  <ui-skeleton v-if="isLoading" class="w-full h-[76px] rounded mt-5" />

  <div v-else>
    <div
      v-for="comment in data"
      :key="comment.$id"
      class="flex items-start mt-5 ml-2 mr-2"
    >
      <Icon name="radix-icons:chat-bubble" class="mr-3 mt-1" size="20" />
      <div class="border-border bg-black/20 rounded p-3 w-full">
        <p class="text-sm text-gray-400 mb-1">
          Комментарий {{ dayjs(comment.$createdAt).format("HH:mm") }}
        </p>
        <p class="text-white">{{ comment.text }}</p>
      </div>
    </div>
  </div>
</template>
