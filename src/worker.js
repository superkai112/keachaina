const PRODUCTS = {
  1: { name: "Fresh Shrimp", km: "បង្គាស្រស់", price: 8, unit: "per kg" },
  2: { name: "Fresh Crab", km: "ក្តាមស្រស់", price: 10, unit: "per kg" },
  3: { name: "Fresh Fish", km: "ត្រីស្រស់", price: 5, unit: "per kg" },
  4: { name: "Fresh Squid", km: "មឹកស្រស់", price: 7, unit: "per kg" },
  5: { name: "Jasmine Rice", km: "អង្ករម្លិះ", price: 18, unit: "per 10 kg" },
  6: { name: "White Rice", km: "អង្ករស", price: 12, unit: "per 10 kg" },
  7: { name: "Brown Rice", km: "អង្ករសម្រូប", price: 20, unit: "per 10 kg" },
  8: { name: "Premium Fragrant Rice", km: "អង្ករក្រអូបពិសេស", price: 22, unit: "per 10 kg" }
};

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/order") {
      if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
      if (!env.BOT_TOKEN || !env.CHAT_ID) return json({ ok: false, error: "server_not_configured" }, 503);

      const length = Number(request.headers.get("content-length") || 0);
      if (length > 12000) return json({ ok: false, error: "request_too_large" }, 413);

      let order;
      try {
        order = await request.json();
      } catch {
        return json({ ok: false, error: "invalid_json" }, 400);
      }

      const customer = typeof order.customer === "string" ? order.customer.trim() : "";
      const phone = typeof order.phone === "string" ? order.phone.trim() : "";
      const delivery = typeof order.delivery === "string" ? order.delivery.trim() : "";
      const language = order.language === "km" ? "km" : "en";
      if (!customer || customer.length > 80 || !phone || phone.length > 40 || !delivery || delivery.length > 60) {
        return json({ ok: false, error: "invalid_customer_details" }, 400);
      }
      if (!Array.isArray(order.items) || order.items.length < 1 || order.items.length > 8) {
        return json({ ok: false, error: "invalid_items" }, 400);
      }

      const seen = new Set();
      const lines = [];
      let total = 0;
      for (const item of order.items) {
        const id = Number(item?.id);
        const quantity = Number(item?.quantity);
        const product = PRODUCTS[id];
        if (!product || seen.has(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          return json({ ok: false, error: "invalid_item" }, 400);
        }
        seen.add(id);
        const subtotal = product.price * quantity;
        total += subtotal;
        const name = language === "km" ? product.km : product.name;
        lines.push(`• ${name} x ${quantity} — $${subtotal.toFixed(2)}`);
      }

      const message = [
        language === "km" ? "ការកម្មង់ KEO CHAINA" : "KEO CHAINA ORDER",
        `Name: ${customer}`,
        `Phone: ${phone}`,
        `Delivery / pickup: ${delivery}`,
        "",
        ...lines,
        "",
        `Total: $${total.toFixed(2)}`
      ].join("\n");

      try {
        const telegram = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: env.CHAT_ID, text: message })
        });
        const result = await telegram.json();
        if (!telegram.ok || !result.ok) return json({ ok: false, error: "telegram_delivery_failed" }, 502);
        return json({ ok: true });
      } catch {
        return json({ ok: false, error: "telegram_unavailable" }, 502);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
