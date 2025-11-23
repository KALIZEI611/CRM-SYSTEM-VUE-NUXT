<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import { useSeoMeta } from "nuxt/app";
import { COLLECTION_CUSTOMERS, DB_ID } from "~/constants/app.constants";
import { ICustomer } from "~/types/dealt.types";
import { DB } from "~/Util/appwrite";

useSeoMeta({
  title: "Клиенты",
});

const { data: customers, isLoading } = useQuery({
  queryKey: ["customer"],
  queryFn: () => DB.listDocuments(DB_ID, COLLECTION_CUSTOMERS),
});
</script>

<template>
  <div class="p-10">
    <h1 class="font-bold text-2xl mb-10">Наши клиенты</h1>
    <div v-if="isLoading">Загрузка...</div>
    <ui-table v-else>
      <ui-table-header>
        <ui-table-row>
          <ui-table-head class="w-[200px]">Изображение</ui-table-head>
          <ui-table-head class="w-[300px]">Наименование</ui-table-head>
          <ui-table-head class="w-[300px]">Email</ui-table-head>
          <ui-table-head>Откуда пришел</ui-table-head>
        </ui-table-row>
      </ui-table-header>
      <ui-table-body>
        <ui-table-row
          v-for="customer in (customers?.documents as unknown as ICustomer[])"
          :key="customer.$id"
        >
          <ui-table-cell>
            <nuxt-link :href="`/customers/edit/${customer.$id}`">
              <nuxt-img
                :src="customer.avatar_url"
                :alt="customer.name"
                width="50"
                height="50"
                class="rounded-full"
              />
            </nuxt-link>
          </ui-table-cell>
          <ui-table-cell class="font-medium">
            {{ customer.name }}
          </ui-table-cell>
          <ui-table-cell>
            {{ customer.email }}
          </ui-table-cell>
          <ui-table-cell>
            {{ customer.from_source }}
          </ui-table-cell>
        </ui-table-row>
      </ui-table-body>
    </ui-table>
  </div>
</template>
