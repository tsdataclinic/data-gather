import * as Toolbar from '@radix-ui/react-toolbar';
import styled from 'styled-components';
import * as InterviewScreen from '../../models/InterviewScreen';
import Button from '../ui/Button';

const StyledHeading = styled.h1`
  flex: 1;
  font-size: 1.5rem;
  letter-spacing: 0.025em;
`;

type Props = {
  onNewActionClick: () => void;
  onNewEntryClick: () => void;
  onSaveClick: () => void;
  screen: InterviewScreen.T;
};

export default function ScreenToolbar({
  screen,
  onNewEntryClick,
  onNewActionClick,
  onSaveClick,
}: Props): JSX.Element {
  return (
    <div className="z-10 flex w-full bg-white p-4 shadow">
      <StyledHeading>{screen.title}</StyledHeading>
      <Toolbar.Root className="flex space-x-2">
        <Toolbar.Button asChild>
          <Button onClick={onSaveClick}>Save</Button>
        </Toolbar.Button>
        <Toolbar.Button asChild>
          <Button onClick={onNewEntryClick}>New Entry</Button>
        </Toolbar.Button>
        <Toolbar.Button asChild>
          <Button onClick={onNewActionClick}>New Action</Button>
        </Toolbar.Button>
      </Toolbar.Root>
    </div>
  );
}
