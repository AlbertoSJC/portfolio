export type ServiceInfo = {
  icon: string;
  color: string;
  temperature: number;
  name: string;
};

export type LoopIndex = {
  index: number;
};

export type ToggleItems = {
  image: string;
  title: string;
  active: boolean;
};

export interface InputProps {
  label?: string;
  placeholder?: string;
  classes?: string;
  type?: string;
  id?: string;
}
