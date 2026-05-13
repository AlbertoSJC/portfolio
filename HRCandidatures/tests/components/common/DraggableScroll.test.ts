import DraggableScroll from '@components/common/DraggableScroll.vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';

describe('DraggableScroll', () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
  });

  test('should render the component with the correct id and classes', () => {
    const wrapper = mount(DraggableScroll, {
      props: {
        id: 'test-scroll-container',
        classes: 'custom-class',
      },
      slots: {
        default: '<div>Content</div>',
      },
    });

    const container = wrapper.find('#test-scroll-container');
    expect(container.exists()).toBe(true);
    expect(container.classes()).toContain('custom-class');
    expect(container.text()).toContain('Content');
  });

  test('should not handle mouse drag when space key is not pressed', async () => {
    const wrapper = mount(DraggableScroll, {
      props: {
        id: 'test-scroll-container',
      },
    });

    const container = wrapper.find('#test-scroll-container');
    const scrollableElement = container.element as HTMLElement;

    scrollableElement.scrollLeft = -50;
    vi.spyOn(scrollableElement, 'scrollLeft', 'get').mockReturnValue(0);
    vi.spyOn(scrollableElement, 'scrollLeft', 'set');

    const mousedownEvent = new MouseEvent('mousedown', { clientX: 100 });
    container.trigger('mousedown', mousedownEvent);

    const mousemoveEvent = new MouseEvent('mousemove', { clientX: 150 });
    container.trigger('mousemove', mousemoveEvent);

    const mouseupEvent = new MouseEvent('mouseup');
    container.trigger('mouseup', mouseupEvent);

    expect(scrollableElement.scrollLeft).toBe(0);
  });

  test('should handle mouse drag when space key is pressed', async () => {
    const wrapper = mount(DraggableScroll, {
      props: {
        id: 'test-scroll-container',
      },
    });

    const container = wrapper.find('#test-scroll-container');
    const scrollableElement = container.element as HTMLElement;

    scrollableElement.scrollLeft = 0;
    vi.spyOn(scrollableElement, 'scrollLeft', 'get').mockReturnValue(50);
    vi.spyOn(scrollableElement, 'scrollLeft', 'set');

    const keydownEvent = new KeyboardEvent('keydown', { code: 'Space' });
    document.dispatchEvent(keydownEvent);

    const mousedownEvent = new MouseEvent('mousedown', { clientX: 100 });
    await container.trigger('mousedown', mousedownEvent);

    const mousemoveEvent = new MouseEvent('mousemove', { clientX: 150 });
    await container.trigger('mousemove', mousemoveEvent);

    const mouseupEvent = new MouseEvent('mouseup');
    await container.trigger('mouseup', mouseupEvent);

    expect(scrollableElement.scrollLeft).toBe(50);
  });
});
