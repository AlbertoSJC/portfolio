import type { ToggleItems } from '@components/types/types';

export default class Mode implements ToggleItems {
  image: string;
  title: string;
  active: boolean;

  constructor(service: ToggleItems) {
    this.image = service.image;
    this.title = service.title;
    this.active = service.active;
  }

  modeActivation(): void {
    this.active = !this.active;
  }

  public static createEmpty(): Mode {
    return new Mode({
      image: '',
      title: '',
      active: false,
    });
  }
}
