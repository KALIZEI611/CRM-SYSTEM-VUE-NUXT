import { useQuery } from "@tanstack/vue-query";
import { DB } from "@/lib/appwrite";
import { COLLECTION_DEALS, DB_ID } from "~/constants/app.constants";
import { KANBAN_DATA } from "./kanban.data";
import type { IDeal } from "~/types/dealt.types";

export function useKanbarQuery() {
  return useQuery({
    queryKey: ["deals"],
    queryFn: () => DB.listDocuments(DB_ID, COLLECTION_DEALS),
    select(data) {
      const newBoard = [...KANBAN_DATA];
      const deals = data.documents as unknown as IDeal[];
    },
  });
}
