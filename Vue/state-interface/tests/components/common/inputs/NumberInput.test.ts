import NumberInput from '@components/common/inputs/NumberInput.vue';
import { mount, VueWrapper } from '@vue/test-utils';

const exampleProps = {
  label: 'Test Label',
  classes: 'test-class',
  id: 'test-id',
  placeholder: 'Enter number',
};

describe('Components > Common > Inputs > NumberInput', () => {
  let wrapper: VueWrapper;

  beforeAll(() => {
    wrapper = mount(NumberInput, { props: exampleProps });
  });

  test('renders input with correct attributes', () => {
    const input = wrapper.find('input');
    expect(input.attributes('id')).toBe('test-id');
    expect(input.attributes('placeholder')).toBe('Enter number');
    expect(input.classes()).toContain('test-class');
  });

  test('limits the number of characters to 3', async () => {
    const input = wrapper.find('input');
    await input.setValue(4556);
    expect(input.element.value).toBe('455');
  });

  test('updates modelValue correctly', async () => {
    const input = wrapper.find('input');
    await input.setValue(678);
    expect(input.element.value).toBe('678');
  });
});
