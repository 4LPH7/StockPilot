"use client";

import { useEffect, useState } from "react";

export const FALLBACK_USD_INR = 83.5;

/** Daily ECB USD→INR rate (Frankfurter, no key); keeps the fallback when offline or the API fails. */
export function useUsdInrRate() {
  const [rate, setRate] = useState(FALLBACK_USD_INR);

  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR", { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const inr = data?.rates?.INR;
          if (typeof inr === "number" && inr > 0) {
            setRate(inr);
            window.removeEventListener("online", load);
          }
        })
        .catch(() => {});
    load();
    // Opened offline or the request failed: try again when the connection returns.
    window.addEventListener("online", load);
    return () => {
      controller.abort();
      window.removeEventListener("online", load);
    };
  }, []);

  return rate;
}
