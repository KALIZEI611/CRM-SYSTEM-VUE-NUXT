<script setup lang="ts">
import { useForm } from "#imports";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import { defineProps, ref } from "vue";
import { COLLECTION_CUSTOMERS, COLLECTION_DEALS, DB_ID } from "~/constants/app.constants";
import { DB } from "~/Util/appwrite";

const isOpenForm = ref(false);

interface IDealFormState {
  name: string;
  price: number;
  customerEmail: string;
  customerName: string;
  status: string;
}

const props = defineProps({
  status: {
    type: String,
    default: "",
  },
  refetch: {
    type: Function,
  },
});

const { handleSubmit, defineField, handleReset } = useForm<IDealFormState>({
  initialValues: {
    status: props.status,
  },
});

const [name, nameAttrs] = defineField("name");
const [price, priceAttrs] = defineField("price");
const [customerEmail, customerEmailAttrs] = defineField("customerEmail");
const [customerName, customerNameAttrs] = defineField("customerName");

const { mutate, isPending } = useMutation({
  mutationKey: ["create a new deal"],
  mutationFn: async (data: IDealFormState) => {
    const customer = await DB.createDocument(DB_ID, COLLECTION_CUSTOMERS, uuid(), {
      name: data.customerName,
      email: data.customerEmail,
    });
    return DB.createDocument(DB_ID, COLLECTION_DEALS, uuid(), {
      name: data.name,
      price: Number(data.price),
      status: data.status || props.status,
      customer: customer.$id,
    });
  },
  onSuccess(data) {
    props.refetch?.();
    handleReset();
    isOpenForm.value = false;
  },
  onError(error) {
    console.error(error);
  },
});

const onSubmit = handleSubmit((values) => mutate(values));
</script>

<template>
  <div class="text-center mb-2">
    <button
      @click="isOpenForm = !isOpenForm"
      class="transition-all opacity-5 hover:opacity-100 hover:text-[#a252c8]"
    >
      <Icon
        v-if="isOpenForm"
        name="radix-icons:arrow-up"
        class="fade-in-100 fade-out-0"
        size="30"
      />
      <Icon
        v-else
        name="radix-icons:plus-circled"
        class="fade-in-100 fade-out-0"
        size="30"
      />
    </button>
  </div>
  <form v-if="isOpenForm" @submit="onSubmit" class="form">
    <ui-input
      placeholder="Наименование сделки"
      v-model="name"
      v-bind="nameAttrs"
      type="text"
      class="input"
      required
    />
    <ui-input
      placeholder="Сумма"
      v-model="price"
      v-bind="priceAttrs"
      type="number"
      class="input"
      required
    />
    <ui-input
      placeholder="Email клиента"
      v-model="customerEmail"
      v-bind="customerEmailAttrs"
      type="email"
      class="input"
      required
    />
    <ui-input
      placeholder="Имя клиента"
      v-model="customerName"
      v-bind="customerNameAttrs"
      type="text"
      class="input"
      required
    />
    <button class="btn" :disabled="isPending">
      {{ isPending ? "Загрузка..." : "Добавить" }}
    </button>
  </form>
</template>

<style scoped>
.input {
  border: 1px solid #161c26;
  margin-bottom: 0.5rem;
  transition: border-color 0.3s;
}

.input::placeholder {
  color: #748092;
}

.input:focus {
  border-color: #a252c8;
}

.btn {
  font-size: 0.75rem;
  border: 1px solid #161c26;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: #aebed5;
  transition: all 0.3s;
}

.btn:hover {
  border-color: #482c65;
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form {
  margin-bottom: 0.75rem;
  display: block;
  animation: show 0.3s ease-in-out;
}

@keyframes show {
  from {
    border-color: rgba(162, 82, 200, 0.24);
    transform: translateY(-35px);
    opacity: 0.4;
  }

  90% {
    border-color: rgba(162, 82, 200, 0.24);
  }

  to {
    border-color: transparent;
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
