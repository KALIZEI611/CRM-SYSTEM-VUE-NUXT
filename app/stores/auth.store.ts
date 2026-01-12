interface iAuthStore {
  email: string;
  name: string;
  status: boolean;
}

const defaultValue: { user: iAuthStore } = {
  user: {
    email: "",
    name: "",
    status: false,
  },
};

export const useAuthStore = defineStore("auth", () => {
  const isAuth = ref(false);
  const user = ref(null);
  const authChecked = ref(false); 

  function set(userData: any) {
    user.value = userData;
    isAuth.value = !!userData;
  }

  function clear() {
    user.value = null;
    isAuth.value = false;
  }

  function setAuthChecked(value: boolean) {
    authChecked.value = value;
  }

  return { isAuth, user, authChecked, set, clear, setAuthChecked };
});

export const useIsLoadingStore = defineStore("isLoading", {
  state: () => ({
    isLoading: true,
  }),
  actions: {
    set(data: boolean) {
      this.$patch({ isLoading: data });
    },
  },
});
