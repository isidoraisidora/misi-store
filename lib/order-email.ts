import nodemailer from "nodemailer";

type ConfirmationEmail = {
  email: string;
  firstName: string;
  orderNumber: string;
  confirmationUrl: string;
};

export type OrderEmailDetails = {
  orderNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
  totalCents: number;
  items: Array<{ title: string; priceCents: number; quantity: number }>;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!user || !password) {
    throw new Error("Missing GMAIL_USER or GMAIL_APP_PASSWORD");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: password },
  });
}

function getFromAddress() {
  return process.env.ORDER_FROM_EMAIL ?? process.env.GMAIL_USER;
}

export async function sendOrderConfirmationEmail({ email, firstName, orderNumber, confirmationUrl }: ConfirmationEmail) {
  const from = getFromAddress();

  if (!from) {
    throw new Error("Missing ORDER_FROM_EMAIL or GMAIL_USER");
  }

  await getTransporter().sendMail({
    from,
    to: email,
    subject: `Потврди ја нарачката ${orderNumber}`,
    html: `<p>Здраво ${escapeHtml(firstName)},</p><p>Твојата нарачка <strong>${escapeHtml(orderNumber)}</strong> е подготвена за потврда.</p><p><a href="${escapeHtml(confirmationUrl)}">Потврди ја нарачката</a></p><p>Линкот важи 24 часа. Нарачката ќе се обработи дури откако ќе ја потврдиш.</p>`,
  });
}

function orderDetailsHtml(details: OrderEmailDetails) {
  const items = details.items.length === 0
    ? "<li>Производите не се достапни</li>"
    : details.items.map((item) => `<li>${escapeHtml(item.title)} · ${item.quantity} × ${item.priceCents} ден.</li>`).join("");

  return `<p><strong>Купувач</strong></p><p>Име: ${escapeHtml(details.firstName)}<br />Презиме: ${escapeHtml(details.lastName)}<br />Email: ${escapeHtml(details.email)}<br />Телефон: ${escapeHtml(details.phone)}<br />Адреса: ${escapeHtml(details.addressLine)}<br />Град: ${escapeHtml(details.city)}<br />Поштенски број: ${escapeHtml(details.postalCode)}<br />Држава: ${escapeHtml(details.country)}</p><p><strong>Производи</strong></p><ul>${items}</ul><p><strong>Вкупно: ${details.totalCents} ден.</strong></p>`;
}

async function sendOwnerOrderEmail(details: OrderEmailDetails, subject: string, intro: string) {
  const from = getFromAddress();
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;

  if (!from || !recipient) {
    throw new Error("Missing ORDER_FROM_EMAIL, GMAIL_USER, or ORDER_NOTIFICATION_EMAIL");
  }

  await getTransporter().sendMail({
    from,
    to: recipient,
    subject,
    html: `<p>${intro}</p><p><strong>Нарачка: ${escapeHtml(details.orderNumber)}</strong></p>${orderDetailsHtml(details)}`,
  });
}

export async function sendNewOrderNotificationEmail(details: OrderEmailDetails) {
  await sendOwnerOrderEmail(details, `Нова нарачка ${details.orderNumber}`, "Имате нова нарачка.");
}

export async function sendOrderConfirmedNotificationEmail(details: OrderEmailDetails) {
  await sendOwnerOrderEmail(details, `Нарачката ${details.orderNumber} е потврдена`, "Нарачката е потврдена од купувачот.");
}
