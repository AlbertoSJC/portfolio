'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { usePlayerStore } from '@/stores/player';

type Mode = 'sign-in' | 'sign-up';

export default function AccountPage() {
  const { data: session, isPending } = authClient.useSession();
  const player = usePlayerStore((state) => state.player);
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    const result =
      mode === 'sign-in'
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: name || player?.username || 'Adventurer' });

    setSubmitting(false);
    if (result.error) {
      setError(result.error.message ?? 'Something went wrong. Please try again.');
      return;
    }
    router.push('/');
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  function handleExport() {
    if (!player) {
      setSettingsMessage('No local player data to export yet.');
      return;
    }
    const blob = new Blob([JSON.stringify(player, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finquest-${player.username.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSettingsMessage('Your data was downloaded as JSON.');
  }

  async function handleDeleteCloudData() {
    const response = await fetch('/api/player', { method: 'DELETE' });
    setSettingsMessage(
      response.ok ? 'Cloud data deleted. Your local progress is untouched.' : 'Could not delete cloud data.'
    );
  }

  async function handleDeleteAccount(event: React.FormEvent) {
    event.preventDefault();
    setSettingsMessage('');
    const result = await authClient.deleteUser({ password: deletePassword });
    if (result.error) {
      setSettingsMessage(result.error.message ?? 'Account deletion failed.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  if (isPending) {
    return <div className="loading">Loading account...</div>;
  }

  if (session?.user) {
    return (
      <main>
        <div className="container account-container">
          <h1>Account</h1>
          <div className="account-card">
            <p className="account-status">✅ Signed in — your progress syncs to the cloud.</p>
            <dl className="account-details">
              <div>
                <dt>Name</dt>
                <dd>{session.user.name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{session.user.email}</dd>
              </div>
            </dl>
            <button className="btn btn-secondary" onClick={handleSignOut}>
              Sign out
            </button>
          </div>

          <div className="account-card">
            <h2 className="account-section-title">Your data</h2>
            <div className="account-actions">
              <button className="btn btn-secondary" onClick={handleExport}>
                Export data (JSON)
              </button>
              <button className="btn btn-secondary" onClick={handleDeleteCloudData}>
                Delete cloud data
              </button>
            </div>
            {settingsMessage && <p className="account-message">{settingsMessage}</p>}
          </div>

          <div className="account-card account-card--danger">
            <h2 className="account-section-title">Danger zone</h2>
            {!confirmingDelete ? (
              <button className="btn btn-danger" onClick={() => setConfirmingDelete(true)}>
                Delete account…
              </button>
            ) : (
              <form className="account-form" onSubmit={handleDeleteAccount}>
                <p className="account-status">
                  This permanently removes your account and synced data. Enter your password to confirm.
                </p>
                <label>
                  Password
                  <input
                    type="password"
                    className="form-input"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </label>
                <div className="account-actions">
                  <button className="btn btn-danger" type="submit">
                    Permanently delete
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {
                      setConfirmingDelete(false);
                      setDeletePassword('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container account-container">
        <h1>{mode === 'sign-in' ? 'Sign in' : 'Create account'}</h1>
        <div className="account-card">
          <p className="account-status">
            {mode === 'sign-in'
              ? 'Sign in to sync your quests across devices.'
              : 'Create an account to keep your local progress safe in the cloud.'}
          </p>
          <form className="account-form" onSubmit={handleSubmit}>
            {mode === 'sign-up' && (
              <label>
                Name
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={player?.username ?? 'Your hero name'}
                  maxLength={50}
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <button
            className="account-mode-toggle"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError('');
            }}
          >
            {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </main>
  );
}
