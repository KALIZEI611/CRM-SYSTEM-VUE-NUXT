// useComments.ts
import { useQuery } from "@tanstack/vue-query";
import { useDealSlideStore } from "~/stores/deal-slide.store";
import { COLLECTION_COMMENTS, DB_ID } from "~/constants/app.constants";
import { DB, Query } from "~/Util/appwrite"; // Теперь Query будет доступен

export function useComments() {
  const store = useDealSlideStore();

  const query = useQuery({
    queryKey: ["comments", store.card?.id],
    queryFn: () =>
      DB.listDocuments(DB_ID, COLLECTION_COMMENTS, [
        Query.equal("deal", store.card?.id || ""),
      ]),
    enabled: !!store.card?.id,
  });

  const comments = computed(() => query.data.value?.documents || []);

  return {
    data: comments,
    refetch: query.refetch,
    isLoading: query.isLoading,
  };
}
