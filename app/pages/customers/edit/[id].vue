<script lang="ts" setup>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { COLLECTION_CUSTOMERS, DB_ID } from "~/constants/app.constants";
import type { ICustomer } from "~/types/dealt.types";
import { useRoute, useSeoMeta } from "nuxt/app";
import { useForm } from "#imports";
import { DB } from "~/Util/appwrite";

interface ICustomerFormState
  extends Pick<ICustomer, "avatar_url" | "email" | "name" | "from_source"> {}

useSeoMeta({
  title: `Редактирование компании`,
});

const route = useRoute();
const customerId = route.params.id as string;

const { handleSubmit, defineField, setFieldValue, setValues, values } =
  useForm<ICustomerFormState>();

const { data, isSuccess } = useQuery({
  queryKey: ["get customer", customerId],
  queryFn: () => DB.getDocument(DB_ID, COLLECTION_CUSTOMERS, customerId),
});

watch(isSuccess, () => {
  const initialData = data.value as unknown as ICustomerFormState;
  setValues({
    email: initialData.email,
    avatar_url: initialData.avatar_url,
    from_source: initialData.from_source || "",
    name: initialData.name,
  });
});

const [name, nameAttrs] = defineField("name");
const [email, emailAttrs] = defineField("email");
const [fromSource, fromSourceAttrs] = defineField("from_source");

const { mutate, isPending } = useMutation({
  mutationKey: ["update customer", customerId],
  mutationFn: (data: ICustomerFormState) =>
    DB.updateDocument(DB_ID, COLLECTION_CUSTOMERS, customerId, data),
});

const onSubmit = handleSubmit((values) => {
  mutate(values);
});
</script>

<template>
  <div class="p-10">
    <h1 class="font-bold text-2xl mb-10">
      Редактирование {{ (data as unknown as ICustomerFormState)?.name }}
    </h1>

    <form @submit="onSubmit" class="form">
      <UiInput
        placeholder="Наименование"
        v-model="name"
        v-bind="nameAttrs"
        type="text"
        class="input mb-4"
      />

      <UiInput
        placeholder="Email"
        v-model="email"
        v-bind="emailAttrs"
        type="text"
        class="input mb-4"
      />
      <UiInput
        placeholder="Откуда пришел?"
        v-model="fromSource"
        v-bind="fromSourceAttrs"
        type="text"
        class="input mb-4"
      />

      <img
        v-if="values.avatar_url"
        :src="values.avatar_url"
        alt=""
        width="120"
        height="120"
        class="rounded-full my-4"
      />

      <UiButton :disabled="isPending" variant="secondary" class="mt-3">
        {{ isPending ? "Загрузка..." : "Сохранить" }}
      </UiButton>
    </form>
  </div>
</template>

<style scoped>
.input {
  composes: input-base;
}
</style>
