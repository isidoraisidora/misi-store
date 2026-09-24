type ConfirmationEmail = {
  email: string;
  firstName: string;
  orderNumber: string;
  confirmationUrl: string;
};

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
      subject: `Потврди ја нарачката ${orderNumber}`,
      html: `<p>Здраво ${firstName},</p><p>Твојата нарачка <strong>${orderNumber}</strong> е подготвена за потврда.</p><p><a href="${confirmationUrl}">Потврди ја нарачката</a></p><p>Линкот важи 24 часа. Нарачката ќе се обработи дури откако ќе ја потврдиш.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error("Confirmation email could not be sent");
  }
}
