import { Navigate, useSearchParams } from 'react-router-dom';
import { findByCategoryParam, servicePath } from '../data/verificationCategories';

export default function VerificationServices() {
  const [params] = useSearchParams();
  const category = params.get('category');
  if (!category) return <Navigate to="/verification/categories" replace />;
  const { item } = findByCategoryParam(category);
  return <Navigate to={servicePath(item.id)} replace />;
}
