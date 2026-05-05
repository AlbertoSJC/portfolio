import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { useNotificationStore } from '@/stores/notification';

describe('NotificationDrawer', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [], history: [] });
  });

  it('opens and closes drawer when clicking the bell', async () => {
    render(<NotificationDrawer />);

    const bell = screen.getByRole('button', { name: '🔔' });
    expect(bell).toBeInTheDocument();

    fireEvent.click(bell);
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close notifications/i }));
    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it('displays notification history', () => {
    useNotificationStore.getState().pushNotification({
      title: 'Test Notification',
      message: 'This is a test',
      variant: 'success',
    });

    render(<NotificationDrawer />);
    const bell = screen.getAllByRole('button')[0];
    fireEvent.click(bell);

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test')).toBeInTheDocument();
  });

  it('clears history when clicking clear button', async () => {
    useNotificationStore.getState().pushNotification({
      title: 'Notification 1',
      message: 'Test 1',
      variant: 'success',
    });

    render(<NotificationDrawer />);
    const bell = screen.getAllByRole('button')[0];
    fireEvent.click(bell);

    expect(screen.getByText('Notification 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /clear history/i }));

    await waitFor(() => {
      expect(screen.queryByText('Notification 1')).not.toBeInTheDocument();
    });
  });
});
