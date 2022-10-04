import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import * as InterviewScreen from '../../models/InterviewScreen';
import Form from '../ui/Form';

type Props = {
  onScreenChange: (newScreen: InterviewScreen.T) => void;
  screen: InterviewScreen.T;
};

function HeaderCard(
  { screen, onScreenChange }: Props,
  forwardedRef: React.ForwardedRef<HTMLFormElement>,
): JSX.Element {
  return (
    <ScrollableElement
      name="HEADER"
      className="flex w-full flex-row border border-gray-200 bg-white p-5 shadow-lg"
    >
      <div className="flex w-1/6 flex-row">
        <FontAwesomeIcon className="h-6 w-6 pr-4" icon={faGear} />
      </div>
      <Form ref={forwardedRef} className="w-full pr-16 pb-4">
        <Form.Input
          label="Title"
          name="title"
          value={screen.title}
          onChange={(newVal: string) => {
            onScreenChange({ ...screen, title: newVal });
          }}
        />
        <Form.Input
          label="Header text"
          name="headerText"
          value={screen.headerText}
          onChange={(newVal: string) => {
            onScreenChange({ ...screen, headerText: newVal });
          }}
        />
      </Form>
    </ScrollableElement>
  );
}

export default React.forwardRef<HTMLFormElement, Props>(HeaderCard);
