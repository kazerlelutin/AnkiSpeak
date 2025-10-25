import type { Ctrl } from "@features/routes/routes.type";

export type DropCsvCtrl = Ctrl & {
  dropCsv: (event: DragEvent) => Promise<void>;
  dragOver: (event: DragEvent) => void;
  dragEnter: (event: DragEvent) => void;
  dragLeave: (event: DragEvent) => void;
  subscribeToDropCsv: (message: any) => void;
  pasteCsv: (event: ClipboardEvent) => void;
  sendCsvToServer: (csv: string) => void;
  changeFile: (event: Event) => Promise<void>;
}
