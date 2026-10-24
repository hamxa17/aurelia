// Supabase Edge Function: emails the shop owner whenever a new order is placed.
// Triggered by a Database Webhook on INSERT into public.orders.
//
// Secrets to set (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY – from resend.com → API Keys
//   ALERT_EMAIL    – where alerts go (the email your Resend account was created with)
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
//
// Safety: the function only emails about orders it can find in the database that were
// created in the last 10 minutes, so a forged request can't make it send arbitrary emails.

import { createClient } from 'npm:@supabase/supabase-js@2';

const taka = (n: number) => '৳' + Number(n).toLocaleString('en-IN');
const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

Deno.serve(async (req) => {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }
  const orderId = payload?.record?.id;
  if (payload?.type !== 'INSERT' || payload?.table !== 'orders' || !orderId) return new Response('ignored');

  // The order row is saved a moment before its items, so wait briefly, then read the finished order.
  await new Promise((r) => setTimeout(r, 1500));
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: o } = await db
    .from('orders')
    .select('order_number, customer_name, phone, address, area, note, subtotal, delivery_fee, total, created_at, order_items(name, brand, price, qty)')
    .eq('id', orderId)
    .maybeSingle();

  if (!o || Date.now() - new Date(o.created_at).getTime() > 10 * 60 * 1000) {
    return new Response('ignored');
  }

  const rows = (o.order_items as { name: string; brand: string | null; price: number; qty: number }[])
    .map((i) => `<tr><td>${esc([i.brand, i.name].filter(Boolean).join(' '))} × ${i.qty}</td><td align="right">${taka(i.price * i.qty)}</td></tr>`)
    .join('');

  const html = `
    <h2 style="margin:0 0 8px">New order #${o.order_number} — ${taka(o.total)}</h2>
    <p><b>${esc(o.customer_name)}</b><br>
       <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br>
       ${esc(o.address)}<br>
       ${o.area === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}</p>
    ${o.note ? `<p><i>Note: ${esc(o.note)}</i></p>` : ''}
    <table cellpadding="4" style="border-collapse:collapse">${rows}
      <tr><td>Delivery</td><td align="right">${taka(o.delivery_fee)}</td></tr>
      <tr><td><b>Collect in cash</b></td><td align="right"><b>${taka(o.total)}</b></td></tr>
    </table>
    <p><a href="https://aurelia-store-xi.vercel.app/admin">Open the admin panel</a> to confirm it.</p>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Aurelia Orders <onboarding@resend.dev>',
      to: [Deno.env.get('ALERT_EMAIL')],
      subject: `New order #${o.order_number} — ${taka(o.total)} — ${o.customer_name}`,
      html,
    }),
  });

  const body = await res.text();
  if (!res.ok) console.error('Resend error', res.status, body);
  return new Response(res.ok ? 'sent' : `email failed: ${body}`, { status: res.ok ? 200 : 502 });
});
