import 'styled-components/macro';
import { useCallback } from 'react';
import { useToast } from '../../components/ui/Toast';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Modal from '../../components/ui/Modal';
import isFakeAuthEnabled from '../isFakeAuthEnabled';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
};

async function storeToken(tokenResponse: Response): Promise<void> {
  const token = await tokenResponse.json();
  window.localStorage.setItem('token', token.access_token);
}

async function post(
  url: string,
  data: Record<string, string>,
): Promise<Response> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Error during authentication');
  }
  return response;
}

export default function FakeAuthModal({
  isOpen,
  onDismiss,
}: Props): JSX.Element | null {
  const toaster = useToast();

  const showError = useCallback(
    (e: unknown): void => {
      console.error(e);
      if (e instanceof Error) {
        toaster.notifyError('Error', e.message);
      }
    },
    [toaster],
  );

  const onSubmitLogin = useCallback(
    async (email: string): Promise<void> => {
      try {
        const response = await post('/api/auth/login', {
          email,
        });
        await storeToken(response);
        onDismiss();

        // refresh the page after logging in to make sure all application state
        // gets reset correctly
        window.location.reload();
      } catch (e: unknown) {
        showError(e);
      }
    },
    [onDismiss, showError],
  );

  const onSubmitRegister = useCallback(
    async (
      email: string,
      firstName: string,
      lastName: string,
    ): Promise<void> => {
      try {
        const response = await post('/api/auth/register', {
          email,
          firstName,
          lastName,
        });
        await storeToken(response);
        onDismiss();
      } catch (e: unknown) {
        showError(e);
      }
    },
    [onDismiss, showError],
  );

  if (!isFakeAuthEnabled()) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <h1>Fake auth - use only in development</h1>
      <div
        css={`
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
          > * {
            flex: 1;
          }

          > *:first-child {
            border-right: 1px solid black;
          }

          > *:last-child {
            margin-left: 3rem;
          }
        `}
      >
        <LoginForm onSubmitLogin={onSubmitLogin} />
        <RegisterForm onSubmitRegister={onSubmitRegister} />
      </div>
    </Modal>
  );
}
