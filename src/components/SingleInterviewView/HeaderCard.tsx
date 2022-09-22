import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { Element as ScrollableElement } from 'react-scroll';
import useAppDispatch from '../../hooks/useAppDispatch';
import useInterviewStore from '../../hooks/useInterviewStore';
import * as InterviewScreen from '../../models/InterviewScreen';
import Form from '../ui/Form';

interface Props {
  screen: InterviewScreen.T;
}

function HeaderCard({ screen }: Props): JSX.Element {
  const dispatch = useAppDispatch();
  const interviewStore = useInterviewStore();
  const [displayedScreen, setDisplayedScreen] =
    useState<InterviewScreen.T>(screen);

  useEffect(() => {
    setDisplayedScreen(screen);
  }, [screen]);

  const onSubmit = useCallback(
    async (vals: Map<string, string>): Promise<void> => {
      const updatedScreen = InterviewScreen.update(screen, {
        headerText: vals.get('Header text') ?? '',
        title: vals.get('Title') ?? '',
      });
      const newScreen = await interviewStore.putScreen(updatedScreen);
      setDisplayedScreen(newScreen);
      dispatch({
        screen: newScreen,
        type: 'SCREEN_UPDATE',
      });
    },
    [interviewStore, screen, dispatch],
  );

  return (
    <ScrollableElement
      name="HEADER"
      className="flex w-full flex-row bg-white p-5 shadow-md"
    >
      <div className="flex w-1/6 flex-row">
        <FontAwesomeIcon className="h-6 w-6 pr-4" icon={faGear} />
      </div>
      <Form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Form.Input
          key={`${displayedScreen.id}-title`}
          label="Title"
          name="Title"
          value={displayedScreen.title}
        />
        <Form.Input
          key={`${displayedScreen.id}-headerText`}
          label="Header
          text"
          name="Header text"
          value={displayedScreen.headerText}
        />
        <Form.SubmitButton>Save</Form.SubmitButton>
      </Form>
    </ScrollableElement>
  );
}

export default HeaderCard;
