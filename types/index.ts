export interface LeyData {
  id: number;
  year: number;
  icon: string;
  title: string;
  summary: string;
  detail: string;
  alert?: string;
  category: "traffic" | "civil" | "insurance" | "data" | "technology";
}