import styled from 'styled-components/macro';
import '@reach/dialog/styles.css';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import { VisuallyHidden } from '@reach/visually-hidden';
import type { ReactNode } from 'react';

const StyledDialogOverlay = styled(DialogOverlay)`
  z-index: 999;
`;

type Props = {
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  onDismiss: () => void;
  title?: string;
};

export default function Modal({
  children,
  className,
  isOpen,
  onDismiss,
  title,
}: Props): JSX.Element {
  // TODO: how much of this can be tailwind?
  return (
    <StyledDialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <DialogContent>
        <div style={{ position: 'relative' }}>
          <button
            css={`
              background: none;
              color: black;
              font-size: 1rem;
              height: 40px;
              position: absolute;
              right: -32px;
              top: -32px;
              width: 40px;
              transition: all 250ms;

              &:hover,
              &:focus {
                color: #054382;
                background: #e7e9ea;
                outline: none;
              }
              &:focus-visible {
                outline: 5px auto -webkit-focus-ring-color;
              }
            `}
            type="button"
            onClick={onDismiss}
          >
            <VisuallyHidden>Close</VisuallyHidden>
            <FontAwesomeIcon aria-hidden size="1x" icon={faClose} />
          </button>
        </div>
        <div className={className}>
          {title === undefined ? null : (
            <h1 className="pb-8 text-2xl tracking-wider">{title}</h1>
          )}
          {children}
        </div>
      </DialogContent>
    </StyledDialogOverlay>
  );
}
