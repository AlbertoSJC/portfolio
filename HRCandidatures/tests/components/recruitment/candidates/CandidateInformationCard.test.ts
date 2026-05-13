import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CandidateInformationCard from '@components/recruitment/candidates/CandidateInformationCard.vue';
import { Candidate } from '@domain/Candidate';

const mockCandidate = new Candidate({
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '123456789',
  linkedInURL: 'https://linkedin.com/in/johndoe',
  desiredSalary: '50000',
  startWorkDate: '2025-04-01',
  web: 'https://johndoe.com',
  location: 'New York',
  createdAt: '2025-03-01',
  updatedAt: '2025-03-15',
  vacancyId: 'vacancy-123',
  statusId: 'status-456',
});

describe('CandidateInformationCard.vue', () => {
  test('renders candidate information correctly', () => {
    const wrapper = mount(CandidateInformationCard, {
      props: {
        candidate: mockCandidate,
      },
    });

    expect(wrapper.text()).toContain('John');
    expect(wrapper.text()).toContain('Doe');
    expect(wrapper.text()).toContain('john.doe@example.com');
    expect(wrapper.text()).toContain('123456789');
    expect(wrapper.text()).toContain('50000');
    expect(wrapper.text()).toContain('New York');
    expect(wrapper.text()).toContain('https://linkedin.com/in/johndoe');
    expect(wrapper.text()).toContain('https://johndoe.com');
  });

  test('renders optional fields only when they exist', () => {
    const wrapper = mount(CandidateInformationCard, {
      props: {
        candidate: new Candidate({
          id: '2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          statusId: 'status-789',
          vacancyId: 'vacancy-456',
        }),
      },
    });

    expect(wrapper.text()).toContain('Jane');
    expect(wrapper.text()).toContain('Smith');
    expect(wrapper.text()).toContain('jane.smith@example.com');
    expect(wrapper.text()).not.toContain('123456789');
    expect(wrapper.text()).not.toContain('50000');
    expect(wrapper.text()).not.toContain('New York');
    expect(wrapper.text()).not.toContain('https://linkedin.com/in/johndoe');
    expect(wrapper.text()).not.toContain('https://johndoe.com');
  });

  test('renders links correctly', () => {
    const wrapper = mount(CandidateInformationCard, {
      props: {
        candidate: mockCandidate,
      },
    });

    const emailLink = wrapper.find('a[href="mailto:john.doe@example.com"]');
    expect(emailLink.exists()).toBe(true);
    expect(emailLink.text()).toBe('john.doe@example.com');

    const linkedInLink = wrapper.find('a[href="https://linkedin.com/in/johndoe"]');
    expect(linkedInLink.exists()).toBe(true);
    expect(linkedInLink.text()).toBe('https://linkedin.com/in/johndoe');

    const webLink = wrapper.find('a[href="https://johndoe.com"]');
    expect(webLink.exists()).toBe(true);
    expect(webLink.text()).toBe('https://johndoe.com');
  });
});
