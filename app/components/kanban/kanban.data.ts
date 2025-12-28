import { EnumStatus } from "@/types/dealt.types";
import type { IColumn } from "./kanban.types";

export const KANBAN_DATA: IColumn[] = [
  {
    id: EnumStatus.todo,
    name: "Новые",
    items: [],
  },
  {
    id: EnumStatus["to-be-agreed"],
    name: "На согласование",
    items: [],
  },
  {
    id: EnumStatus["in-progress"],
    name: "В работе",
    items: [],
  },
  {
    id: EnumStatus.produced,
    name: "Произведено",
    items: [],
  },
  {
    id: EnumStatus.done,
    name: "Выполнено",
    items: [],
  },
];
