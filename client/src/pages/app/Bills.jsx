import { useNavigate, useParams } from 'react-router-dom';
import { ServiceWorkspace } from '../../components/ServiceWorkspace';
import { appServiceFromCatalog } from '../../data/services';
import PnrStatus from './PnrStatus';

export default function Bills() {
  const { service } = useParams();
  const navigate = useNavigate();

  if (service === 'pnr-status') {
    return <PnrStatus />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <ServiceWorkspace
        service={appServiceFromCatalog(service)}
        onServiceChange={(id) => navigate(`/app?service=${id}`)}
        hrefFor={(id) => `/app?service=${id}`}
      />
    </div>
  );
}
