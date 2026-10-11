"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildQueryString,
  hasActiveFilters,
  parseFilterValuesFromSearchParams,
} from "@/lib/listFilterQuery";

export type UseListFiltersInUrlOptions = {
  debounceMs?: number;
  /** Keys synced to URL after debounce (e.g. `q`). Others sync immediately. */
  debouncedKeys?: string[];
};

export function useListFiltersInUrl(
  defaults: Record<string, string>,
  options: UseListFiltersInUrlOptions = {},
) {
  const { debounceMs = 300, debouncedKeys = ["q"] } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const parseFromUrl = useCallback(() => {
    return parseFilterValuesFromSearchParams(
      defaultsRef.current,
      searchParams,
    );
  }, [searchParams]);

  const [values, setValues] = useState<Record<string, string>>(parseFromUrl);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const parsed = parseFromUrl();
    valuesRef.current = parsed;
    setValues(parsed);
  }, [parseFromUrl]);

  const writeUrl = useCallback(
    (next: Record<string, string>) => {
      const qs = buildQueryString(next, defaultsRef.current);
      router.replace(`${pathname}${qs}`, { scroll: false });
    },
    [router, pathname],
  );

  const scheduleDebouncedWrite = useCallback(
    (next: Record<string, string>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        writeUrl(next);
        debounceRef.current = null;
      }, debounceMs);
    },
    [writeUrl, debounceMs],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const setField = useCallback(
    (key: string, value: string) => {
      const next = { ...valuesRef.current, [key]: value };
      valuesRef.current = next;
      setValues(next);
      if (debouncedKeys.includes(key)) scheduleDebouncedWrite(next);
      else writeUrl(next);
    },
    [debouncedKeys, scheduleDebouncedWrite, writeUrl],
  );

  const setFields = useCallback(
    (patch: Partial<Record<string, string>>) => {
      const next: Record<string, string> = { ...valuesRef.current };
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) next[key] = value;
      }
      valuesRef.current = next;
      setValues(next);
      const needsDebounce = Object.keys(patch).some((k) =>
        debouncedKeys.includes(k),
      );
      if (needsDebounce) scheduleDebouncedWrite(next);
      else writeUrl(next);
    },
    [debouncedKeys, scheduleDebouncedWrite, writeUrl],
  );

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const d = defaultsRef.current;
    const next = { ...d };
    valuesRef.current = next;
    setValues(next);
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const hasActive = useMemo(
    () => hasActiveFilters(defaults, values),
    [defaults, values],
  );

  return { values, setField, setFields, clear, hasActive };
}
