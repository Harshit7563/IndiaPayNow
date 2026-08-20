import { useNavigate, useSearchParams } from 'react-router-dom';
import { ServiceWorkspace } from '../../components/ServiceWorkspace';

export default function Dashboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const service = params.get('service') || 'mobile';

  return (
    <div className="mx-auto max-w-7xl">
      <ServiceWorkspace
        service={service}
        onServiceChange={(id) => navigate(`/app?service=${id}`, { replace: true })}
        hrefFor={(id) => `/app?service=${id}`}
      />
    </div>
  );
}
