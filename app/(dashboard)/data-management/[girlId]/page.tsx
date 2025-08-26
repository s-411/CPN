import { DataManagementClient } from './client';

type Props = {
  params: Promise<{ girlId: string }>;
};

export default async function DataManagementPage(props: Props) {
  const params = await props.params;
  const girlId = params.girlId;
  
  return <DataManagementClient girlId={girlId} />;
}