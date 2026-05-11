import { useMemo } from "react";

export const useFormatters = (locale: string) => {
  return useMemo(
    () => ({
      distanceFormatter: new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }),
      ratioFormatter: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
      orbitPeriodFormatter: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      orbitHoursFormatter: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    }),
    [locale],
  );
};
