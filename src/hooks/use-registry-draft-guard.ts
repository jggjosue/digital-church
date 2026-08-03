'use client';

import * as React from 'react';

type Options<T> = {
  value: T;
  identity: string;
  loading: boolean;
  onRestore: (value: T) => void;
  onAutoSave: () => Promise<boolean>;
  autoSaveDelay?: number;
};

export function useRegistryDraftGuard<T>({ value, identity, loading, onRestore, onAutoSave, autoSaveDelay = 5000 }: Options<T>) {
  const serialized = React.useMemo(() => JSON.stringify(value), [value]);
  const [baseline, setBaseline] = React.useState(serialized);
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const [autoSave, setAutoSave] = React.useState(false);
  const [autoSaving, setAutoSaving] = React.useState(false);
  const latestSerialized = React.useRef(serialized);
  const autoSaveCallback = React.useRef(onAutoSave);
  const restoreCallback = React.useRef(onRestore);
  latestSerialized.current = serialized;
  autoSaveCallback.current = onAutoSave;
  restoreCallback.current = onRestore;
  const dirty = serialized !== baseline;

  const markSaved = React.useCallback((savedAt = new Date()) => {
    setBaseline(latestSerialized.current);
    setLastSavedAt(savedAt);
  }, []);

  React.useEffect(() => {
    if (!loading) {
      setBaseline(latestSerialized.current);
      setLastSavedAt(null);
    }
  }, [identity, loading]);

  React.useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const protectLinks = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!target || target.getAttribute('target') === '_blank' || target.getAttribute('href')?.startsWith('#')) return;
      if (!window.confirm('Hay cambios pendientes sin guardar. ¿Deseas salir y descartarlos?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener('beforeunload', warn);
    document.addEventListener('click', protectLinks, true);
    return () => {
      window.removeEventListener('beforeunload', warn);
      document.removeEventListener('click', protectLinks, true);
    };
  }, [dirty]);

  React.useEffect(() => {
    if (!autoSave || !dirty || loading || autoSaving) return;
    const timer = window.setTimeout(async () => {
      setAutoSaving(true);
      try {
        if (await autoSaveCallback.current()) markSaved();
      } finally {
        setAutoSaving(false);
      }
    }, autoSaveDelay);
    return () => window.clearTimeout(timer);
  }, [autoSave, autoSaveDelay, autoSaving, dirty, loading, markSaved, serialized]);

  const confirmDiscard = React.useCallback(() => !dirty || window.confirm('Hay cambios pendientes sin guardar. ¿Deseas descartarlos?'), [dirty]);
  const undo = React.useCallback(() => {
    if (!dirty || !window.confirm('¿Deseas deshacer todos los cambios pendientes?')) return;
    restoreCallback.current(JSON.parse(baseline) as T);
  }, [baseline, dirty]);

  return { dirty, lastSavedAt, autoSave, setAutoSave, autoSaving, markSaved, confirmDiscard, undo };
}
