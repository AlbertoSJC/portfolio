import Button from '@components/common/Button.vue';
import { VueWrapper, mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';

describe('Common > Button', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(Button, {
      props: {
        id: 'button',
      },
      slots: {
        default: 'Button text',
      },
      attachTo: 'body',
    });
  });

  test('Should mount', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render a button', () => {
    const button = wrapper.find('button');
    expect(button).toBeDefined();
  });

  test('Should render button text correctly', () => {
    const button = wrapper.find('button');
    expect(button.text()).toBe('Button text');
  });
});
