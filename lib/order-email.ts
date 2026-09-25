import nodemailer from "nodemailer";

type ConfirmationEmail = {
  email: string;
  firstName: string;
  orderNumber: string;
  confirmationUrl: string;
};

type NewOrderNotification = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalCents: number;
};

type ConfirmedOrderNotification = {
  orderNumber: string;
  customerName?: string;
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

export async function sendNewOrderNotificationEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  totalCents,
}: NewOrderNotification) {
  const from = getFromAddress();
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;

  if (!from || !recipient) {
    throw new Error("Missing ORDER_FROM_EMAIL, GMAIL_USER, or ORDER_NOTIFICATION_EMAIL");
  }

  await getTransporter().sendMail({
    from,
    to: recipient,
    subject: `Нова нарачка ${orderNumber}`,
    html: `<p>Имате нова нарачка.</p><p><strong>${escapeHtml(orderNumber)}</strong></p><p>Купувач: ${escapeHtml(customerName)}<br />Email: ${escapeHtml(customerEmail)}<br />Телефон: ${escapeHtml(customerPhone)}</p><p>Вкупно: ${totalCents} ден.</p>`,
  });
}

export async function sendOrderConfirmedNotificationEmail({
  orderNumber,
  customerName,
}: ConfirmedOrderNotification) {
  const from = getFromAddress();
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;

  if (!from || !recipient) {
    throw new Error("Missing ORDER_FROM_EMAIL, GMAIL_USER, or ORDER_NOTIFICATION_EMAIL");
  }

  await getTransporter().sendMail({
    from,
    to: recipient,
    subject: `Нарачката ${orderNumber} е потврдена`,
    html: `<p>Нарачката <strong>${escapeHtml(orderNumber)}</strong> е потврдена од купувачот.</p>${customerName ? `<p>Купувач: ${escapeHtml(customerName)}</p>` : ""}`,
  });
}
