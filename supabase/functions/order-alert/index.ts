// Supabase Edge Function: emails the shop owner whenever a new order is placed.
// Triggered by a Database Webhook on INSERT into public.orders.
//
// Secrets to set (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   – from resend.com → API Keys
//   ALERT_EMAIL      – where alerts go (must be your Resend account email until you verify a domain)
//   WEBHOOK_SECRET   – any long random text; also put it in the webhook's "x-webhook-secret" header
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import { createClient } from 'npm:@supabase/supabase-js@2';

const taka = (n: number) => '৳' + Number(n).toLocaleString('en-IN');
const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('WEBHOOK_SECRET')) {
    return new Response('forbidden', { status: 403 });
  }

  const payload = await req.json();
  const order = payload?.record;
  if (payload?.type !== 'INSERT' || !order?.id) return new Response('ignored');

  // The order row is inserted before its items, so wait briefly and read the finished order.
  await new Promise((r) => setTimeout(r, 1500));
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: full } = await db
    .from('orders')
    .select('order_number, customer_name, phone, address, area, note, subtotal, delivery_fee, total, order_items(name, brand, price, qty)')
    .eq('id', order.id)
    .single();
  const o = full ?? order;
  const items = (full?.order_items ?? []) as { name: string; brand: string | null; price: number; qty: number }[];

  const rows = items
    .map((i) => `<tr><td>${esc([i.brand, i.name].filter(Boolean).join(' '))} × ${i.qty}</td><td align="right">${taka(i.price * i.qty)}</td></tr>`)
    .join('');

  const html = `
    <h2>New order #${o.order_number} — ${taka(o.total)}</h2>
    <p><b>${esc(o.customer_name)}</b><br>
       <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a><br>
       ${esc(o.address)}<br>
       ${o.area === 'inside_dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}</p>
    ${o.note ? `<p><i>Note: ${esc(o.note)}</i></p>` : ''}
    <table cellpadding="4" style="border-collapse:collapse">${rows}
      <tr><td>Delivery</td><td align="right">${taka(o.delivery_fee)}</td></tr>
      <tr><td><b>Collect in cash</b></td><td align="right"><b>${taka(o.total)}</b></td></tr>
    </table>
    <p>Open the admin panel to confirm it: /admin</p>`;

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

  return new Response(res.ok ? 'sent' : `email failed: ${await res.text()}`, { status: res.ok ? 200 : 500 });
});
