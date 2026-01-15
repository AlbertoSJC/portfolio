import { mount } from '@vue/test-utils';
import HeaderEditCandidate from '@components/recruitment/modals/edit/HeaderEditCandidate.vue';
import ButtonElement from '@components/common/ButtonElement.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useRecruitmentStore } from '@stores/recruitment';
import { useModalsStore, ModalIds } from '@stores/modals';
import { ModalFormSuccess } from '@typesOrigin/recruitment';
import { vi } from 'vitest';

describe('HeaderEditCandidate', () => {
  let recruitmentStore: ReturnType<typeof useRecruitmentStore>;
  let modalsStore: ReturnType<typeof useModalsStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    recruitmentStore = useRecruitmentStore();
    modalsStore = useModalsStore();
  });

  test('Should mount correctly', () => {
    const wrapper = mount(HeaderEditCandidate);
    expect(wrapper).toBeDefined();
  });

  test('Should render the title and image', () => {
    const wrapper = mount(HeaderEditCandidate);
    const title = wrapper.find('h5');
    const image = wrapper.find('img');

    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Editar candidato');
    expect(image.exists()).toBe(true);
  });

  test('Should render ButtonElement with correct props', () => {
    const wrapper = mount(HeaderEditCandidate);
    const button = wrapper.findComponent(ButtonElement);

    expect(button.exists()).toBe(true);
    expect(button.props('text')).toBe('Editar');
    expect(button.props('disabled')).toBe(false);
  });

  test('Should disable ButtonElement if there are errors in the store', async () => {
    recruitmentStore.errors = { firstName: ['Name is required'] };
    const wrapper = mount(HeaderEditCandidate);
    const button = wrapper.findComponent(ButtonElement);

    expect(button.props('disabled')).toBe(true);
  });

  test('Should update ButtonElement text and classes based on formStatus', async () => {
    recruitmentStore.formStatus = ModalFormSuccess.Success;
    const wrapper = mount(HeaderEditCandidate);
    const button = wrapper.findComponent(ButtonElement);

    expect(button.props('text')).toBe('Editado!');
    expect(button.props('classes')).toContain('bg-[#137019]');

    recruitmentStore.formStatus = ModalFormSuccess.Failure;
    await wrapper.vm.$nextTick();

    expect(button.props('text')).toBe('Error!');
    expect(button.props('classes')).toContain('bg-[#801111]');
  });

  test('Should call editCandidate when ButtonElement is clicked', async () => {
    const editCandidateSpy = vi.spyOn(recruitmentStore, 'editCandidate');
    const wrapper = mount(HeaderEditCandidate);
    const button = wrapper.findComponent(ButtonElement);

    await button.trigger('click');
    expect(editCandidateSpy).toHaveBeenCalled();
  });
});
