import { mount } from '@vue/test-utils';
import CandidateForm from '@components/recruitment/modals/CandidateForm.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useRecruitmentStore } from '@stores/recruitment';

describe('CandidateForm', () => {
  let recruitmentStore: ReturnType<typeof useRecruitmentStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    recruitmentStore = useRecruitmentStore();
  });

  test('Should mount correctly', () => {
    const wrapper = mount(CandidateForm);
    expect(wrapper).toBeDefined();
  });

  test('Should render all TextInput components with correct props', () => {
    const wrapper = mount(CandidateForm);

    const firstNameInput = wrapper.find('#first-name-candidate');
    expect(firstNameInput.exists()).toBe(true);

    const lastNameInput = wrapper.find('#last-name-candidate');
    expect(lastNameInput.exists()).toBe(true);

    const emailInput = wrapper.find('#email-candidate');
    expect(emailInput.exists()).toBe(true);

    const linkedinInput = wrapper.find('#linkedin-candidate');
    expect(linkedinInput.exists()).toBe(true);

    const webInput = wrapper.find('#web-candidate');
    expect(webInput.exists()).toBe(true);

    const locationInput = wrapper.find('#location-candidate');
    expect(locationInput.exists()).toBe(true);
  });

  test('Should render all NumberInput components with correct props', () => {
    const wrapper = mount(CandidateForm);

    const phoneInput = wrapper.find('#phone-candidate');
    expect(phoneInput.exists()).toBe(true);

    const salaryInput = wrapper.find('#salary-candidate');
    expect(salaryInput.exists()).toBe(true);
  });

  test('Should render DateInput component with correct props', () => {
    const wrapper = mount(CandidateForm);

    const startWorkDateInput = wrapper.find('#web-candidate');
    expect(startWorkDateInput.exists()).toBe(true);
  });

  test('Should call clearError when input events are triggered', async () => {
    const clearErrorSpy = vi.spyOn(recruitmentStore, 'clearError');
    const wrapper = mount(CandidateForm);

    const firstNameInput = wrapper.find('#first-name-candidate');
    await firstNameInput.trigger('input');
    expect(clearErrorSpy).toHaveBeenCalledWith('firstName');

    const lastNameInput = wrapper.find('#last-name-candidate');
    await lastNameInput.trigger('input');
    expect(clearErrorSpy).toHaveBeenCalledWith('lastName');

    const emailInput = wrapper.find('#email-candidate');
    await emailInput.trigger('input');
    expect(clearErrorSpy).toHaveBeenCalledWith('email');
  });

  test('Should update firstName in the store and input element', async () => {
    const wrapper = mount(CandidateForm);
    const firstNameInput = wrapper.find('#first-name-candidate');

    await firstNameInput.setValue('John');
    expect(recruitmentStore.candidateToUpload.firstName).toBe('John');
    expect((firstNameInput.element as HTMLInputElement).value).toBe('John');
  });

  test('Should update lastName in the store and input element', async () => {
    const wrapper = mount(CandidateForm);
    const lastNameInput = wrapper.find('#last-name-candidate');

    await lastNameInput.setValue('Doe');
    expect(recruitmentStore.candidateToUpload.lastName).toBe('Doe');
    expect((lastNameInput.element as HTMLInputElement).value).toBe('Doe');
  });

  test('Should update email in the store and input element', async () => {
    const wrapper = mount(CandidateForm);
    const emailInput = wrapper.find('#email-candidate');

    await emailInput.setValue('example@gmail.com');
    expect(recruitmentStore.candidateToUpload.email).toBe('example@gmail.com');
    expect((emailInput.element as HTMLInputElement).value).toBe('example@gmail.com');
  });

  test('Should update phone in the store and input element', async () => {
    const wrapper = mount(CandidateForm);
    const phoneInput = wrapper.find('#phone-candidate');

    await phoneInput.setValue('123456789');
    expect(recruitmentStore.candidateToUpload.phone).toBe(123456789);
    expect((phoneInput.element as HTMLInputElement).value).toBe('123456789');
  });

  test('Should update linkedInURL in the store and input element', async () => {
    const wrapper = mount(CandidateForm);
    const linkedinInput = wrapper.find('#linkedin-candidate');

    await linkedinInput.setValue('https://www.linkedin.com/in/johndoe');
    expect(recruitmentStore.candidateToUpload.linkedInURL).toBe('https://www.linkedin.com/in/johndoe');
    expect((linkedinInput.element as HTMLInputElement).value).toBe('https://www.linkedin.com/in/johndoe');
  });

  test('Should update desiredSalary in the store and input element', async () => {
    const wrapper = mount(CandidateForm);
    const salaryInput = wrapper.find('#salary-candidate');

    await salaryInput.setValue('50000');
    expect(recruitmentStore.candidateToUpload.desiredSalary).toBe(50000);
    expect((salaryInput.element as HTMLInputElement).value).toBe('50000');
  });

  test('Should update web in the store and input element', async () => {
    const wrapper = mount(CandidateForm);
    const webInput = wrapper.find('#web-candidate');

    await webInput.setValue('https://www.example.com');
    expect(recruitmentStore.candidateToUpload.web).toBe('https://www.example.com');
    expect((webInput.element as HTMLInputElement).value).toBe('https://www.example.com');
  });

  test('Should update location in the store and input element', async () => {
    const wrapper = mount(CandidateForm);
    const locationInput = wrapper.find('#location-candidate');

    await locationInput.setValue('Spain');
    expect(recruitmentStore.candidateToUpload.location).toBe('Spain');
    expect((locationInput.element as HTMLInputElement).value).toBe('Spain');
  });
});
