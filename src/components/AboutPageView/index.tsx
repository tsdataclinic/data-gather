import styled from 'styled-components';

const H1 = styled.h1`
  color: #103470;
  display: block;
  font-family: Lato, sans-serif;
  font-size: 3rem;
  font-style: normal;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0.5rem;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
`;

const P = styled.p`
  font-size: 1.125rem;
  line-height: 2.1715;
`;

const Section = styled.section`
  padding: 12px 30px 50px 80px;
`;

export default function AboutPageView(): JSX.Element {
  return (
    <Section>
      <div className="w-1/2">
        <H1>About</H1>
        <P>
          Data Gather is a data entry app builder for the social sector. It
          supports complex conditional logic, connecting to 3rd party data
          stores, and reading, updating, and inserting data into your data
          store.
        </P>
        <P>
          For more information, please visit our{' '}
          <a
            className="text-blue-600"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/tsdataclinic/data-gather"
          >
            GitHub repostiroy.
          </a>
        </P>
        <P>
          To learn more about other Data Clinic products, please visit the{' '}
          <a
            href="https://www.twosigma.com/data-clinic/"
            className="text-blue-600"
            target="_blank"
            rel="noreferrer"
          >
            Data Clinic website
          </a>{' '}
          or reach us at{' '}
          <a href="mailto:dataclinic@twosigma.com" className="text-blue-600">
            dataclinic@twosigma.com
          </a>{' '}
        </P>
      </div>
    </Section>
  );
}
