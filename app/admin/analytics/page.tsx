"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Analytics = {
  totalOrders: number;
  confirmedOrders: number;
  pendingOrders: number;
  discardedOrders: number;
  confirmedRevenueCents: number;
  pendingValueCents: number;
};

type AdminOrder = {
  id: string;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  email: string;
  total_cents: number;
  status: "in_progress" | "confirmed" | "discarded";
  created_at: string;
  confirmed_at: string | null;
};

const emptyAnalytics: Analytics = {
  totalOrders: 0,
  confirmedOrders: 0,
  pendingOrders: 0,
  discardedOrders: 0,
  confirmedRevenueCents: 0,
  pendingValueCents: 0,
};

const money = new Intl.NumberFormat("mk-MK", { maximumFractionDigits: 0 });

function statusLabel(status: AdminOrder["status"]) {
  return status === "confirmed" ? "Потврдена" : status === "in_progress" ? "На чекање" : "Отфрлена";
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [authenticated, setAuthenticated] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/admin/analytics")
      .then(async (response) => {
        if (response.status === 401) {
          setAuthenticated(false);
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not load analytics");
        setAnalytics(data.analytics as Analytics);
        setOrders((data.orders ?? []) as AdminOrder[]);
      })
      .catch(() => setError("Не може да се вчита аналитиката."));
  }, []);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  if (!authenticated) {
    return <main className="admin-page"><section className="admin-login"><Link className="wordmark" href="/">MISI STORE</Link><p className="eyebrow">Private space</p><h1>Admin<br /><em>sign in.</em></h1><p className="admin-error">Сесијата истече.</p><Link className="button button-dark" href="/admin">Најави се <span>↗</span></Link></section></main>;
  }

  return <main className="admin-page"><header className="admin-header"><Link className="wordmark" href="/">MISI STORE</Link><div><Link className="admin-nav-link" href="/admin">Производи</Link><span>Analytics</span><button onClick={logout}>Одјави се</button></div></header><section className="admin-content"><div className="admin-title"><div><p className="eyebrow">Overview</p><h1>Аналитика</h1></div><p>Следи ги нарачките и приходот од потврдените продажби.</p></div>{error && <p className="admin-error">{error}</p>}<div className="analytics-stats"><article><p>Заработено</p><strong>{money.format(analytics.confirmedRevenueCents)} ден.</strong><span>{analytics.confirmedOrders} потврдени нарачки</span></article><article><p>Вкупно нарачки</p><strong>{analytics.totalOrders}</strong><span>{analytics.totalOrders === 0 ? "Сè уште нема нарачки" : "сите статуси"}</span></article><article><p>На чекање</p><strong>{analytics.pendingOrders}</strong><span>{money.format(analytics.pendingValueCents)} ден. потенцијална вредност</span></article><article><p>Отфрлени</p><strong>{analytics.discardedOrders}</strong><span>не влегуваат во заработката</span></article></div><section className="analytics-orders"><div className="admin-products-heading"><h2>Нарачки</h2><span>{analytics.totalOrders} вкупно</span></div>{orders.length === 0 ? <p className="admin-muted analytics-empty">Нема нарачки во базата.</p> : <div className="analytics-order-list">{orders.map((order) => <article className="analytics-order" key={order.id}><div><strong>{order.order_number}</strong><p>{order.customer_first_name} {order.customer_last_name} · {order.email}</p></div><div><strong>{money.format(order.total_cents)} ден.</strong><span className={`order-status order-status-${order.status}`}>{statusLabel(order.status)}</span></div><time dateTime={order.created_at}>{new Date(order.created_at).toLocaleDateString("mk-MK")}</time></article>)}</div>}</section></section></main>;
}