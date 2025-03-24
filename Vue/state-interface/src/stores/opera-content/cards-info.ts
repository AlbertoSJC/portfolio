import type { ToggleItems } from '@components/types/types';
import type Service from '@domain/room-services/RoomService';

export enum ModesLiterals {
  CoolAir = 'Cool Air',
  Eco = 'Eco',
  Silent = 'Silent',
}

export const SERVICES: Service[] = [
  {
    icon: '/src/images/services/living-room.svg',
    color: 'green',
    temperature: 19,
    name: 'Living room',
  },
  {
    icon: '/src/images/services/kitchen.svg',
    color: 'blue',
    temperature: 21,
    name: 'Kitchen',
  },
  {
    icon: '/src/images/services/bedroom.svg',
    color: 'orange',
    temperature: 19,
    name: 'Bedroom',
  },
  {
    icon: '/src/images/services/bathroom.svg',
    color: 'violet',
    temperature: 22,
    name: 'Bathroom',
  },
];

export const MODES: ToggleItems[] = [
  {
    image: '/src/images/modes/cool-air.svg',
    title: ModesLiterals.CoolAir,
    active: false,
  },
  {
    image: '/src/images/modes/eco.svg',
    title: ModesLiterals.Eco,
    active: false,
  },
  {
    image: '/src/images/modes/silent.svg',
    title: ModesLiterals.Silent,
    active: false,
  },
];

export const MENU_ITEMS: ToggleItems[] = [
  {
    image: '/src/images/menu/household.svg',
    title: 'Household',
    active: true,
  },
  {
    image: '/src/images/menu/statistics.svg',
    title: 'Statistics',
    active: false,
  },
  {
    image: '/src/images/menu/learn-more.svg',
    title: 'Learn More',
    active: false,
  },
  {
    image: '/src/images/menu/settings.svg',
    title: 'Settings',
    active: false,
  },
];
