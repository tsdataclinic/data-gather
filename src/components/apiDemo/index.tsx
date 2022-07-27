/**
 * Example use of an API store. Intended to be deprecated
 */
import { useEffect, useState } from 'react';
import useInterview from '../../hooks/useInterview';
import useInterviewStore from '../../hooks/useInterviewStore';
import { ConditionalAction, Screen, Entry } from '../../store/models';
import InputText from '../ui/InputText';

type PageDetailsProps = {
  name: string;
  page: Screen;
  updateHandler: (name: string, page: Screen) => Promise<void>;
};

function PageDetails(props: PageDetailsProps): JSX.Element {
  const { name, page, updateHandler } = props;

  const updatePage = async (): Promise<void> => {
    const newAction: ConditionalAction = {
      action: 'push',
      condition: {
        key: 'sampleKey',
        operator: '=',
        value: 42,
      },
      target: ['randomPage'],
    };

    const newQuestion: Entry = {
      prompt: "Ceci n'est pas un question",
      responseId: 'responseId',
      responseType: 'string',
      text: '',
    };

    const updatedPage: Screen = {
      actions: [...page.actions, newAction],
      entries: [...page.entries, newQuestion],
      headerText: page.headerText,
      title: page.title,
    };

    await updateHandler(name, updatedPage);
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

  const fetchedInterview = useInterview(fetchInterviewId)?.interview;

  useEffect(() => {
    const fetchAllInterviews = async (): Promise<void> => {
      const interviews = await interviewStore.getInterviewIds();
      setAllInterviews(interviews);
    };

    fetchAllInterviews();
  });

  const createInterview = async (id: string): Promise<void> => {
    await interviewStore.createInterview(
      id,
      'sample name',
      'sample description',
    );
    await interviewStore.addScreenToInterview(id, 'sample-page');
    await interviewStore.updateScreen(id, 'sample-page', {
      actions: [],
      entries: [],
      headerText: 'Sample description',
      title: 'Sample page',
    });
  };

  const addPage = async (name: string): Promise<void> => {
    if (fetchedInterview) {
      await interviewStore.addScreenToInterview(fetchInterviewId, name);
      await interviewStore.updateScreen(fetchInterviewId, name, {
        actions: [],
        entries: [],
        headerText: 'Sample description',
        title: 'Sample page',
      });
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
          {Object.entries(fetchedInterview.screens).map(entry => (
            <PageDetails
              key={entry[0]}
              name={entry[0]}
              page={entry[1]}
              updateHandler={async (name, page) =>
                interviewStore.updateScreen(fetchInterviewId, name, page)
              }
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
