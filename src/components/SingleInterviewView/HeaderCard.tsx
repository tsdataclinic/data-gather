import { faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as InterviewScreen from '../../models/InterviewScreen';
import Form from '../ui/Form';
import SelectedLanguageContext from './SelectedLanguageContext';

type Props = {
  onScreenChange: (newScreen: InterviewScreen.WithChildrenT) => void;
  screen: InterviewScreen.WithChildrenT;
};

function HeaderCard(
  { screen, onScreenChange }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  const selectedLanguageCode = React.useContext(SelectedLanguageContext);

  return (
    <ScrollableElement
      name="HEADER"
      className="flex w-full flex-row border border-gray-200 bg-white p-5 shadow-lg"
    >
      <div className="flex w-1/6 flex-row">
        <FontAwesomeIcon className="h-6 w-6 pr-4" icon={faTag} />
      </div>
      <Form ref={forwardedRef} className="w-full pr-16 pb-4">
        <Form.Input
          label="Title"
          name="title"
          infoTooltip="The title of this stage that will be displayed"
          value={screen.title[selectedLanguageCode] ?? ''}
          onChange={(newVal: string) => {
            onScreenChange({
              ...screen,
              title: { ...screen.title, [selectedLanguageCode]: newVal },
            });
          }}
        />
        <Form.Input
          label="Header text"
          name="headerText"
          infoTooltip="Additional descriptive text about this stage that will be displayed"
          required={false}
          value={screen.headerText[selectedLanguageCode] ?? ''}
          onChange={(newVal: string) => {
            onScreenChange({
              ...screen,
              headerText: {
                ...screen.headerText,
                [selectedLanguageCode]: newVal,
              },
            });
          }}
        />
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(HeaderCard);
