import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificationToast } from '@/components/NotificationToast';
import { useNotificationStore } from '@/stores/notification';

describe('NotificationToast', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] });
  });

  it('renders a notification and allows dismissal', () => {
    useNotificationStore.getState().pushNotification({
      title: 'Test achievement',
      message: 'You unlocked a badge.',
      variant: 'success',
    });

    render(<NotificationToast />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Test achievement')).toBeInTheDocument();
    expect(screen.getByText('You unlocked a badge.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.queryByText('Test achievement')).not.toBeInTheDocument();
  });
});