import DateInput from '@components/common/DateInput.vue';
import { mount, VueWrapper } from '@vue/test-utils';

const exampleProps = {
  label: 'Select Date',
  id: 'date-input-id',
  placeholder: 'Choose a date',
  classes: 'custom-class',
  widthFull: true,
};

describe('DateInput', () => {
  let wrapper: VueWrapper;

  beforeEach(() => {
    wrapper = mount(DateInput, {
      props: exampleProps,
    });
  });

  test('Should mount correctly', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render input with correct attributes', () => {
    const input = wrapper.find('input');
    expect(input.attributes('id')).toBe('date-input-id');
    expect(input.attributes('placeholder')).toBe('Choose a date');
    expect(input.attributes('type')).toBe('date');
    expect(input.classes()).toContain('custom-class');
  });

  test('Should render label if provided', () => {
    const label = wrapper.find('label');
    expect(label.exists()).toBe(true);
    expect(label.text()).toBe('Select Date');
    expect(label.attributes('for')).toBe('date-input-id');
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
    await input.setValue('2025-04-05');
    expect(input.element.value).toBe('2025-04-05');
  });
});
