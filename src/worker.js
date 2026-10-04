// Cloudflare Worker (con static assets): GET/POST /api/reviews
// Todo lo demas lo sirve la carpeta public/ a traves del binding ASSETS.
// Requiere el KV namespace enlazado como REVIEWS (ver wrangler.jsonc)

const MAX_REVIEWS = 100;        // maximo de reseñas guardadas (se borran las mas viejas)
const COOLDOWN_SECONDS = 600;   // 1 reseña por IP cada 10 minutos

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const clean = (s, max) =>
  String(s ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

async function getReviews(env) {
  const raw = await env.REVIEWS.get("reviews");
  return json(raw ? JSON.parse(raw) : []);
}

async function postReview(request, env) {
  // Solo aceptar envios desde tu propio sitio
  const origin = request.headers.get("Origin");
  if (!origin || new URL(origin).host !== new URL(request.url).host) {
    return json({ success: false, message: "Origen no permitido" }, 403);
  }

  let body;
  try { body = await request.json(); } catch { return json({ success: false, message: "Datos invalidos" }, 400); }

  const name = clean(body.name, 80);
  const city = clean(body.city, 60);
  const text = clean(body.text, 600);
  const rating = parseInt(body.rating, 10);

  if (name.length < 2 || text.length < 20 || !(rating >= 1 && rating <= 5)) {
    return json({ success: false, message: "Datos invalidos" }, 400);
  }
  // Anti-spam basico: sin enlaces
  if (/https?:\/\/|www\.|\.(com|net|org|ru|xyz)\b/i.test(text + " " + name + " " + city)) {
    return json({ success: false, message: "No se permiten enlaces" }, 400);
  }

  // Limite por IP
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rlKey = "rl:" + ip;
  if (await env.REVIEWS.get(rlKey)) {
    return json({ success: false, message: "Espera unos minutos antes de enviar otra reseña" }, 429);
  }

  const raw = await env.REVIEWS.get("reviews");
  const list = raw ? JSON.parse(raw) : [];
  const review = { id: crypto.randomUUID(), name, city, text, rating, date: new Date().toISOString() };
  list.unshift(review);
  await env.REVIEWS.put("reviews", JSON.stringify(list.slice(0, MAX_REVIEWS)));
  await env.REVIEWS.put(rlKey, "1", { expirationTtl: COOLDOWN_SECONDS });

  return json({ success: true, review });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/reviews") {
      if (request.method === "GET") return getReviews(env);
      if (request.method === "POST") return postReview(request, env);
      return json({ success: false, message: "Metodo no permitido" }, 405);
    }
    return env.ASSETS.fetch(request);
  },
};
