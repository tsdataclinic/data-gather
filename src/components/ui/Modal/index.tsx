import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import styled, { keyframes } from 'styled-components';
import Button from '../Button';
import ScrollArea from '../ScrollArea';

type Props = {
  centerFooter?: boolean;
  children: React.ReactNode;
  className?: string;

  /**
   * Use this if the confirm button is a dangerous action and should be rendered
   * red.
   */
  confirmIsDangerous?: boolean;
  confirmText?: React.ReactNode;
  isOpen: boolean;
  onConfirmClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDismiss: () => void;
  title?: string;
  useConfirmButton?: boolean;
};

const overlayShow = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const contentShow = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const StyledOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.33);
  position: fixed;
  inset: 0;
  // z-index: 999;
  @media (prefers-reduced-motion: no-preference) {
    animation: ${overlayShow} 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const StyledModalContent = styled(Dialog.Content)`
  background: white;
  border-radius: 3px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  left: 50%;
  max-height: 85vh;
  max-width: 90vw;
  padding: 1rem 0;
  position: fixed;
  top: 50%;
  transform: translate(-50%, -50%);

  &:focus {
    outline: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    animation: ${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const StyledModalTitle = styled(Dialog.Title)`
  margin: 0;
  font-weight: 700;
  padding: 0 1rem;
`;

const StyledScrollArea = styled(ScrollArea)`
  max-height: 70vh;
  overflow: auto;
  padding: 0 1rem;
`;

const StyledFooter = styled.div<{ centerContent: boolean }>`
  padding: 0 1rem;

  ${props =>
    props.centerContent
      ? `
      display: flex;
      justify-content: center;
      `
      : ''}

  * {
    margin-right: 0.5rem;
  }
`;

export default function Modal({
  children,
  isOpen,
  onDismiss,
  title,
  className,
  onConfirmClick,
  confirmText = 'Yes',
  confirmIsDangerous = false,
  useConfirmButton = false,
  centerFooter = false,
}: Props): JSX.Element {
  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        onDismiss();
      }
    },
    [onDismiss],
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledModalContent className="space-y-4">
          <StyledModalTitle className="text-xl text-slate-800">
            {title}
          </StyledModalTitle>
          <StyledScrollArea>
            <div className="px-1 py-2">
              <div className={className}>{children}</div>
            </div>
          </StyledScrollArea>
          <StyledFooter centerContent={centerFooter}>
            {useConfirmButton ? (
              <Button
                intent={confirmIsDangerous ? 'danger' : 'primary'}
                onClick={onConfirmClick}
              >
                {confirmText}
              </Button>
            ) : null}
            <Dialog.Close asChild>
              <Button>Close</Button>
            </Dialog.Close>
          </StyledFooter>
        </StyledModalContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
