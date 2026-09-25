// app/order-confirm/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type LookupResult = {
  orderNumber: string;
  status: "in_progress" | "confirmed" | "discarded" | "expired";
  totalCents: number;
};

export default function OrderConfirmPage() {
  return (
    <Suspense fallback={<main style={{ padding: 32 }}>Се вчитува...</main>}>
      <OrderConfirmContent />
    </Suspense>
  );
}

function OrderConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMsg("Линкот е невалиден.");
      setLoading(false);
      return;
    }

    fetch(`/api/orders/lookup?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data: LookupResult) => setLookup(data))
      .catch(() => setErrorMsg("Линкот е невалиден или нарачката не постои."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleConfirm() {
    if (!token) return;
    setConfirming(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg("Нарачката е веќе обработена или линкот е невалиден.");
      } else {
        setFinalStatus(data.status);
      }
    } catch {
      setErrorMsg("Настана грешка. Обидете се повторно.");
    } finally {
      setConfirming(false);
    }
  }

  if (loading) {
    return <main style={{ padding: 32 }}>Се вчитува...</main>;
  }

  if (errorMsg && !lookup) {
    return <main style={{ padding: 32 }}>{errorMsg}</main>;
  }

  if (finalStatus === "confirmed") {
    return (
      <main style={{ padding: 32 }}>
        <h1>Нарачката е потврдена!</h1>
        <p>Ви благодариме, нарачката #{lookup?.orderNumber} е потврдена и наскоро ќе биде испратена.</p>
      </main>
    );
  }

  if (finalStatus === "discarded") {
    return (
      <main style={{ padding: 32 }}>
        <h1>Нарачката не можеше да се потврди</h1>
        <p>За жал, некој артикл од нарачката повеќе не е достапен, или линкот е истечен.</p>
      </main>
    );
  }

  if (lookup?.status === "confirmed") {
    return (
      <main style={{ padding: 32 }}>
        <h1>Оваа нарачка е веќе потврдена</h1>
        <p>Нарачка #{lookup.orderNumber}</p>
      </main>
    );
  }

  if (lookup?.status === "discarded" || lookup?.status === "expired") {
    return (
      <main style={{ padding: 32 }}>
        <h1>Оваа нарачка веќе не е активна</h1>
        <p>Нарачка #{lookup.orderNumber} е {lookup.status === "expired" ? "истечена" : "откажана"}.</p>
      </main>
    );
  }

  // status === "in_progress" -> show the confirm button
  return (
    <main style={{ padding: 32, maxWidth: 480 }}>
      <h1>Потврди ја нарачката</h1>
      <p>Нарачка #{lookup?.orderNumber}</p>
      <p>Вкупно: {lookup?.totalCents} ден.</p>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
      <button
        onClick={handleConfirm}
        disabled={confirming}
        style={{
          marginTop: 16,
          padding: "12px 24px",
          fontSize: 16,
          cursor: confirming ? "not-allowed" : "pointer",
        }}
      >
        {confirming ? "Се потврдува..." : "Потврди нарачка"}
      </button>
    </main>
  );
}