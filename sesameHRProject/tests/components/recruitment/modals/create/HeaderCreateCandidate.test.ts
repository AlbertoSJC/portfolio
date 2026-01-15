import { mount } from '@vue/test-utils';
import HeaderCreateCandidate from '@components/recruitment/modals/create/HeaderCreateCandidate.vue';
import ButtonElement from '@components/common/ButtonElement.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useRecruitmentStore } from '@stores/recruitment';
import { ModalFormSuccess } from '@typesOrigin/recruitment';

describe('HeaderCreateCandidate', () => {
  let recruitmentStore: ReturnType<typeof useRecruitmentStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    recruitmentStore = useRecruitmentStore();
  });

  test('Should mount correctly', () => {
    const wrapper = mount(HeaderCreateCandidate);
    expect(wrapper).toBeDefined();
  });

  test('Should render the title and image', () => {
    const wrapper = mount(HeaderCreateCandidate);
    const title = wrapper.find('h5');
    const image = wrapper.find('img');

    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Añadir nuevo candidato');
    expect(image.exists()).toBe(true);
  });

  test('Should render ButtonElement with correct props', () => {
    const wrapper = mount(HeaderCreateCandidate);
    const button = wrapper.findComponent(ButtonElement);

    expect(button.exists()).toBe(true);
    expect(button.props('text')).toBe('Guardar');
    expect(button.props('disabled')).toBe(false);
  });

  test('Should disable ButtonElement if there are errors in the store', async () => {
    recruitmentStore.errors = { firstName: ['Name is required'] };
    const wrapper = mount(HeaderCreateCandidate);
    const button = wrapper.findComponent(ButtonElement);

    expect(button.props('disabled')).toBe(true);
  });

  test('Should update ButtonElement text and classes based on formStatus', async () => {
    recruitmentStore.formStatus = ModalFormSuccess.Success;
    const wrapper = mount(HeaderCreateCandidate);
    const button = wrapper.findComponent(ButtonElement);

    expect(button.props('text')).toBe('Guardado!');
    expect(button.props('classes')).toContain('bg-[#137019]');

    recruitmentStore.formStatus = ModalFormSuccess.Failure;
    await wrapper.vm.$nextTick();

    expect(button.props('text')).toBe('Error!');
    expect(button.props('classes')).toContain('bg-[#801111]');
  });

  test('Should call saveCandidate when ButtonElement is clicked', async () => {
    const saveCandidateSpy = vi.spyOn(recruitmentStore, 'saveCandidate');
    const wrapper = mount(HeaderCreateCandidate);
    const button = wrapper.findComponent(ButtonElement);

    await button.trigger('click');
    expect(saveCandidateSpy).toHaveBeenCalled();
  });
});
