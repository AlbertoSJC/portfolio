import NumberInput from '@components/common/NumberInput.vue';
import { mount, VueWrapper } from '@vue/test-utils';

const exampleProps = {
  label: 'Enter a number',
  id: 'number-input-id',
  placeholder: 'Type here',
  classes: 'custom-class',
  widthFull: true,
};

describe('NumberInput', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(NumberInput, {
      props: exampleProps,
    });
  });

  test('Should mount correctly', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render input with correct attributes', () => {
    const input = wrapper.find('input');
    expect(input.attributes('id')).toBe('number-input-id');
    expect(input.attributes('placeholder')).toBe('Type here');
    expect(input.attributes('type')).toBe('number');
    expect(input.classes()).toContain('custom-class');
  });

  test('Should render label if provided', () => {
    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe('Enter a number');
    expect(label.attributes('for')).toBe('number-input-id');
  });

  test('Should not render label if not provided', async () => {
    await wrapper.setProps({ label: null });
    const label = wrapper.find('label');
    expect(label.exists()).toBe(false);
  });

  test('Should apply full width class if widthFull is true', () => {
    const container = wrapper.find('div');
    expect(container.classes()).toContain('w-full');
  });

  test('Should not apply full width class if widthFull is false', async () => {
    await wrapper.setProps({ widthFull: false });
    const container = wrapper.find('div');
    expect(container.classes()).not.toContain('w-full');
  });

  test('Should bind v-model correctly', async () => {
    const input = wrapper.find('input');
    await input.setValue(42);
    expect(input.element.value).toBe('42');
  });

  test('Should reset value to empty string if input is empty', async () => {
    const input = wrapper.find('input');
    await input.setValue('');
    expect(input.element.value).toBe('');
  });

  test('Should reset value to empty string if input is negative', async () => {
    const input = wrapper.find('input');
    await input.setValue(-5);
    expect(input.element.value).toBe('');
  });
});
