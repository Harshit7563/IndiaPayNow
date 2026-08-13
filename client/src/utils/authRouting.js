/** Normalize login/register account intent from URL or UI. */
export const normalizeAccountIntent = (value) => {
  const raw = String(value || '')
    .trim()
    .toLowerCase();
  if (['business', 'merchant', 'merchant_account'].includes(raw)) return 'business';
  if (['personal', 'user', 'consumer'].includes(raw)) return 'personal';
  return null;
};

export const roleForIntent = (intent) => (intent === 'business' ? 'merchant' : 'user');

export const destinationForRole = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'merchant') return '/business';
  return '/app';
};

/**
 * Pick post-login home from account intent + actual role.
 * Merchant accounts always open Business unless user explicitly chose Personal wallet.
 */
export const destinationForLogin = (user, intent, redirectPath) => {
  const role = user?.role;
  if (role === 'admin') return '/admin';

  const safeRedirect = (() => {
    if (!redirectPath || !redirectPath.startsWith('/')) return null;
    if (redirectPath.startsWith('//')) return null;
    if (role === 'merchant') {
      if (redirectPath.startsWith('/business') || redirectPath.startsWith('/app')) return redirectPath;
      return null;
    }
    if (redirectPath.startsWith('/app')) return redirectPath;
    return null;
  })();

  // Explicit business portal request
  if (intent === 'business') {
    if (role === 'merchant') return safeRedirect?.startsWith('/business') ? safeRedirect : '/business';
    return '/app/merchant';
  }

  // Explicit personal wallet request (even for merchants)
  if (intent === 'personal') {
    if (role === 'merchant') return safeRedirect?.startsWith('/app') ? safeRedirect : '/app';
    return safeRedirect?.startsWith('/app') ? safeRedirect : '/app';
  }

  // No intent: follow account role (merchant → business, user → app)
  if (safeRedirect) {
    if (role === 'merchant' && safeRedirect.startsWith('/app') && !safeRedirect.startsWith('/app/merchant')) {
      return '/business';
    }
    return safeRedirect;
  }
  return destinationForRole(role);
};

export const mismatchMessage = (user, intent) => {
  if (!intent || !user) return null;
  if (intent === 'business' && user.role === 'user') {
    return 'This is a personal account. Enable business tools to open the merchant dashboard.';
  }
  if (intent === 'personal' && user.role === 'merchant') {
    return 'Opening your personal wallet. Open Business from the sidebar for merchant tools.';
  }
  return null;
};
