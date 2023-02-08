import styled, { keyframes } from 'styled-components';
import * as React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';

type Props = {
  children: React.ReactElement;
  content: React.ReactNode;
  isOpen: boolean;
  onDismiss: () => void;
};

const slideUpAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideRightAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateX(-2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideDownAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideLeftAndFade = keyframes`
  from {
    opacity: 0;
    transform: translateX(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const StyledContent = styled(RadixPopover.Content)`
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  background-color: white;
  border-radius: 4px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  padding: 20px;
  // width: 260px;
  will-change: transform, opacity;

  &[data-state='open'][data-side='top'] {
    animation-name: ${slideDownAndFade};
  }
  &[data-state='open'][data-side='right'] {
    animation-name: ${slideLeftAndFade};
  }
  &[data-state='open'][data-side='bottom'] {
    animation-name: ${slideUpAndFade};
  }
  &[data-state='open'][data-side='left'] {
    animation-name: ${slideRightAndFade};
  }
`;

const StyledArrow = styled(RadixPopover.Arrow)`
  fill: white;
`;

export default function Popover({
  content,
  children,
  isOpen,
  onDismiss,
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
    <RadixPopover.Root open={isOpen} onOpenChange={onOpenChange}>
      <RadixPopover.Anchor asChild>{children}</RadixPopover.Anchor>
      <RadixPopover.Portal>
        <StyledContent onOpenAutoFocus={e => e.preventDefault()}>
          {content}
          <StyledArrow />
        </StyledContent>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
