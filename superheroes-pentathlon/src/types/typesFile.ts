export type KEY_PARAMETERS = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export interface SuperheroAttributesInformation {
  agility: number;
  strength: number;
  weight: number;
  endurance: number;
  charisma: number;
}

export interface SuperheroInformation {
  id?: string;
  updatedAt?: string;
  createdAt?: string;
  name?: string;
  picture?: string;
  attributes?: SuperheroAttributesInformation;
  selected?: boolean;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  classes?: string;
  type?: string;
  id?: string;
}
