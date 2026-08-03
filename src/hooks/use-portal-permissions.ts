'use client';

import * as React from 'react';

const normalize = (value: string) => value.trim().toLowerCase();

export function usePortalPermissions(moduleName: string) {
  const [state, setState] = React.useState<{ loading: boolean; full: boolean; allowed: string[] }>({ loading: true, full: false, allowed: [] });
  React.useEffect(() => {
    let cancelled = false;
    void fetch('/api/members/me-permissions', { cache: 'no-store' })
      .then(async (response) => {
        const json = await response.json() as { access?: string; modules?: Record<string, string[]> };
        if (cancelled) return;
        const key = Object.keys(json.modules ?? {}).find((item) => normalize(item) === normalize(moduleName));
        setState({ loading: false, full: json.access === 'full', allowed: key ? json.modules?.[key] ?? [] : [] });
      })
      .catch(() => { if (!cancelled) setState({ loading: false, full: false, allowed: [] }); });
    return () => { cancelled = true; };
  }, [moduleName]);
  const can = React.useCallback((permission: string) => state.full || state.allowed.some((value) => normalize(value) === '*' || normalize(value) === normalize(permission)), [state]);
  return { ...state, can };
}
