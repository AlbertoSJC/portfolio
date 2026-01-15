import TextInput from '@components/common/TextInput.vue';
import { mount, VueWrapper } from '@vue/test-utils';

const exampleProps = {
  label: 'Test Label',
  classes: 'test-class',
  id: 'test-id',
  placeholder: 'Enter number',
  icon: '/path/to/icon.png',
  required: true,
  errors: ['This field is required'],
};

describe('Text Input', () => {
  let wrapper: VueWrapper;

  beforeAll(() => {
    wrapper = mount(TextInput, { props: exampleProps });
  });

  test('Should mount correctly', () => {
    expect(wrapper).toBeDefined();
  });

  test('Should render input with correct attributes', () => {
    const input = wrapper.find('input');
    expect(input.attributes('id')).toBe('test-id');
    expect(input.attributes('placeholder')).toBe('Enter number');
    expect(input.classes()).toContain('test-class');
  });

  test('Should render icon if provided', () => {
    const icon = wrapper.find('img');
    expect(icon.exists()).toBe(true);
    expect(icon.attributes('src')).toBe('/path/to/icon.png');
  });

  test('Should display error message if errors are provided', () => {
    const errorSpan = wrapper.find('.error');
    expect(errorSpan.exists()).toBe(true);
    expect(errorSpan.text()).toBe('This field is required');
  });

  test('Should not display error message if no errors are provided', async () => {
    await wrapper.setProps({ errors: [] });
    const errorSpan = wrapper.find('span.text-[#770000]');
    expect(errorSpan.exists()).toBe(false);
  });

  test('Should call onInputCallback when input event is triggered', async () => {
    const onInputCallback = vitest.fn();
    await wrapper.setProps({ onInputCallback });
    const input = wrapper.find('input');
    await input.trigger('input');
    expect(onInputCallback).toHaveBeenCalled();
  });

  test('Should set value correctly', async () => {
    const input = wrapper.find('input');
    await input.setValue('example');
    expect(input.element.value).toBe('example');
  });
});
