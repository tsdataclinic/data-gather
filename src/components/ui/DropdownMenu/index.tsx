import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import * as IconType from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import Button from '../Button';

type Props = {
  children: React.ReactNode;
  menuButton?: string;
  menuIcon?: IconType.IconDefinition;
};

const slideUpAndFade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledDropdownContent = styled(RadixDropdownMenu.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  min-width: 220px;
  padding: 0.5rem;

  @media (prefers-reduced-motion: no-preference) {
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;
    &[data-state='open'] {
      &[data-side='bottom'] {
        animation-name: ${slideUpAndFade};
      }
    }
  }
`;

const StyledItem = styled(RadixDropdownMenu.Item)`
  all: unset; // unset all has to be first attribute
  align-items: center;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  height: 30px;
  line-height: 1;
  padding: 0 0.25rem 0 1.5rem;
  position: relative;
  transition: all 150ms;
  user-select: none;

  &[data-disabled] {
    color: rgb(209 213 219); // tailwind gray-300
    pointer-events: none;
  }

  &[data-highlighted] {
    background-color: #2563eb; // blue-600
    color: white;
  }
`;

const StyledArrow = styled(RadixDropdownMenu.Arrow)`
  fill: white;
`;

export default function DropdownMenu({
  children,
  menuButton,
  menuIcon = IconType.faEllipsis,
}: Props): JSX.Element {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>
        <Button
          className="relative inline-block"
          unstyled={menuButton === undefined}
        >
          {menuButton ?? <FontAwesomeIcon icon={menuIcon} />}
        </Button>
      </RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <StyledDropdownContent
          sideOffset={5}
          className="z-10 text-base text-slate-900"
        >
          {children}
          <StyledArrow />
        </StyledDropdownContent>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}

DropdownMenu.Item = StyledItem;
