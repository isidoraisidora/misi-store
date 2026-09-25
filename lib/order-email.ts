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

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export async function sendOrderConfirmationEmail({ email, firstName, orderNumber, confirmationUrl }: ConfirmationEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or ORDER_FROM_EMAIL");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `Потврди ја нарачката ${escapeHtml(orderNumber)}`,
      html: `<p>Здраво ${escapeHtml(firstName)},</p><p>Твојата нарачка <strong>${escapeHtml(orderNumber)}</strong> е подготвена за потврда.</p><p><a href="${escapeHtml(confirmationUrl)}">Потврди ја нарачката</a></p><p>Линкот важи 24 часа. Нарачката ќе се обработи дури откако ќе ја потврдиш.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error("Confirmation email could not be sent");
  }
}

export async function sendNewOrderNotificationEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  totalCents,
}: NewOrderNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL;

  if (!apiKey || !from || !recipient) {
    throw new Error("Missing RESEND_API_KEY, ORDER_FROM_EMAIL, or ORDER_NOTIFICATION_EMAIL");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: `Нова нарачка ${escapeHtml(orderNumber)}`,
      html: `<p>Имате нова нарачка.</p><p><strong>${escapeHtml(orderNumber)}</strong></p><p>Купувач: ${escapeHtml(customerName)}<br />Email: ${escapeHtml(customerEmail)}<br />Телефон: ${escapeHtml(customerPhone)}</p><p>Вкупно: ${totalCents} ден.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error("New order notification could not be sent");
  }
}
