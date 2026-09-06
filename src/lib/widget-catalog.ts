import type { HomeWidgetType } from "@/lib/types";

export const widgetCatalog: { type: HomeWidgetType; label: string; hint: string }[] = [
  { type: "schedule", label: "Today's games", hint: "The slate, with Elo win chances under each match" },
  { type: "news", label: "News", hint: "Latest desk posts" },
  { type: "results", label: "Recent results", hint: "Final scores" },
  { type: "brackets", label: "Brackets", hint: "Shortcuts into knockout boards" },
  { type: "note", label: "Custom note", hint: "Write your own text and add a photo" },
];
