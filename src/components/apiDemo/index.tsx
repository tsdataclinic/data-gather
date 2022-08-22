/**
 * Example use of an API store. Intended to be deprecated
 */
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useInterview from '../../hooks/useInterview';
import useInterviewScreens from '../../hooks/useInterviewScreens';
import useInterviewStore from '../../hooks/useInterviewStore';
import * as ConditionalAction from '../../models/ConditionalAction';
import * as InterviewScreen from '../../models/InterviewScreen';
import * as InterviewScreenEntry from '../../models/InterviewScreenEntry';
import InputText from '../ui/InputText';

type PageDetailsProps = {
  name: string;
  page: InterviewScreen.T;
  updateHandler: (name: string, page: InterviewScreen.T) => void;
};

function PageDetails(props: PageDetailsProps): JSX.Element {
  const { name, page, updateHandler } = props;

  const updatePage = async (): Promise<void> => {
    const newAction: ConditionalAction.T = {
      action: {
        target: ['randomPage'],
        type: 'push',
      },
      conditionalOperator: '=',
      id: uuidv4(),
      responseKey: 'sampleKey',
      screenId: page.id,
      value: 42,
    };

    const newEntry: InterviewScreenEntry.T = {
      id: uuidv4(),
      prompt: "Ceci n'est pas un question",
      responseId: 'responseId',
      responseType: 'string',
      screenId: page.id,
      text: '',
    };

    const updatedPage: InterviewScreen.T = {
      actions: [...page.actions, newAction.id],
      entries: [...page.entries, newEntry.id],
      headerText: page.headerText,
      id: uuidv4(),
      title: page.title,
    };

    updateHandler(name, updatedPage);
  };

  return (
    <>
      <hr />
      <p>Title: {page.title}</p>
      <p>Header text: {page.headerText}</p>
      <p>entries: {JSON.stringify(page.entries)}</p>
      <p>Actions: {JSON.stringify(page.actions)}</p>
      <button type="button" onClick={updatePage}>
        Update page
      </button>
      <hr />
    </>
  );
}

export default function ApiDemo(): JSX.Element {
  const [createInterviewId, setCreateInterviewId] = useState('');
  const [fetchInterviewId, setFetchInterviewId] = useState('');
  const [createPageId, setCreatePageId] = useState('');
  const [allInterviews, setAllInterviews] = useState<string[]>([]);
  const interviewStore = useInterviewStore();

  const fetchedInterview = useInterview(fetchInterviewId);
  const fetchedScreens = useInterviewScreens(fetchInterviewId);

  useEffect(() => {
    const fetchAllInterviews = async (): Promise<void> => {
      const interviews = await interviewStore.getInterviewIds();
      setAllInterviews(interviews);
    };

    fetchAllInterviews();
  });

  const createInterview = async (id: string): Promise<void> => {
    await interviewStore.createInterview('sample name', 'sample description');
    await interviewStore.addScreenToInterview(
      id,
      InterviewScreen.create({ title: 'Sample screen ' }),
    );
  };

  const addPage = async (name: string): Promise<void> => {
    if (fetchedInterview) {
      await interviewStore.addScreenToInterview(
        fetchInterviewId,
        InterviewScreen.create({ title: name }),
      );
      setCreatePageId('');
    }
  };

  return (
    <>
      <h1>Interview API Demo</h1>

      <h2>Create an interview: {createInterviewId}</h2>
      <InputText
        onChange={setCreateInterviewId}
        value={createInterviewId}
        onEnterPress={createInterview}
      />

      <br />
      <br />

      <h2>Inteview IDs: {allInterviews.join(', ')}</h2>

      <br />
      <br />

      <h2>Fetch an interview: {fetchInterviewId}</h2>
      <InputText onChange={setFetchInterviewId} value={fetchInterviewId} />

      <br />
      <br />

      {fetchedInterview && (
        <>
          <h3>Starting state: </h3>
          {fetchedInterview.startingState.join(', ')}

          <h3>Pages:</h3>
          {fetchedScreens?.map(screen => (
            <PageDetails
              key={screen.id}
              name={screen.title}
              page={screen}
              updateHandler={async (_, page) => interviewStore.putScreen(page)}
            />
          ))}
          <p>Add another page:</p>
          <InputText
            onChange={setCreatePageId}
            value={createPageId}
            onEnterPress={addPage}
          />
        </>
      )}
    </>
  );
}
