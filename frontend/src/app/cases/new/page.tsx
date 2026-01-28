import NewCaseClient from './NewCaseClient';

type NewCasePageProps = {
  searchParams?: {
    transaction_id?: string;
  };
};

export default function NewCasePage({ searchParams }: NewCasePageProps) {
  return <NewCaseClient transactionId={searchParams?.transaction_id ?? null} />;
}

