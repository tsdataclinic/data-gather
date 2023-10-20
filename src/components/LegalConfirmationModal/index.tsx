import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from '../ui/Modal';

const CACHE_KEY = 'legalModalHasBeenSeen';

export default function LegalConfirmationModal(): JSX.Element {
  const urlPath = useLocation().pathname;
  const isInLegalPage =
    urlPath === '/terms-of-use' ||
    urlPath === '/privacy-policy' ||
    urlPath === '/about';

  const [isModalOpen, setIsModalOpen] = React.useState(
    !isInLegalPage && localStorage.getItem(CACHE_KEY) !== 'true',
  );

  React.useEffect(() => {
    setIsModalOpen(
      !isInLegalPage && localStorage.getItem(CACHE_KEY) !== 'true',
    );
  }, [isInLegalPage]);

  const onAcceptTerms = (): void => {
    localStorage.setItem(CACHE_KEY, 'true');
    setIsModalOpen(false);
  };

  return (
    <Modal
      hideCancelButton
      useConfirmButton
      title="Welcome to Data Gather"
      isOpen={isModalOpen}
      confirmText="I accept"
      onConfirmClick={onAcceptTerms}
      onDismiss={onAcceptTerms}
    >
      <p>
        I agree that my use is subject to the{' '}
        <Link className="text-blue-600" to="/terms-of-use">
          terms of use
        </Link>{' '}
        and the{' '}
        <Link className="text-blue-600" to="privacy-policy">
          privacy policy.
        </Link>
      </p>
    </Modal>
  );
}
