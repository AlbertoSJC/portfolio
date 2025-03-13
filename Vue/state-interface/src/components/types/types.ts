export type Service = {
  icon: string;
  color: string;
  temperature: string;
  name: string;
};

export type ToggleItems = {
  image: string;
  title: string;
  active: boolean;
};

export interface GoalsData {
  energy: number;
  trees: number;
  credits: number;
}
