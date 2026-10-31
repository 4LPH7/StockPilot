"use client";

import { useEffect, useState } from "react";

export const FALLBACK_USD_INR = 83.5;

/** Daily ECB USD→INR rate (Frankfurter, no key); keeps the fallback when offline or the API fails. */
export function useUsdInrRate() {
  const [rate, setRate] = useState(FALLBACK_USD_INR);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const inr = data?.rates?.INR;
        if (typeof inr === "number" && inr > 0) setRate(inr);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return rate;
}
