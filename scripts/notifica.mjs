// Invia la notifica push della ricorrenza del giorno (eseguito da GitHub Actions)
import fs from "node:fs";
import webpush from "web-push";

const VAPID_PUBLIC_KEY = "BBVAr8DK6_j_x6CUOXjjTA7QzXnQxbR8tGHjfbRpQpidwtecpvHt-x1elx3VXUDGvVbHpEyzpHyaowCe1FE0E0E";
const { VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION, SCHEDULE = "", TEST = "false", DATA_OVERRIDE = "" } = process.env;

const pad = (n) => String(n).padStart(2, "0");
function pasqua(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, month - 1, day));
}
function regolaData(rule, y) {
  const p = rule.match(/^pasqua([+-]\d+)$/);
  if (p) { const d = pasqua(y); d.setUTCDate(d.getUTCDate() + Number(p[1])); return d; }
  const n = rule.match(/^nth:(\d+):(\d):(\d):(-?\d+)$/);
  if (n) {
    const d = new Date(Date.UTC(y, n[1] - 1, 1));
    d.setUTCDate(1 + ((n[2] - d.getUTCDay() + 7) % 7) + (n[3] - 1) * 7 + Number(n[4]));
    return d;
  }
  const l = rule.match(/^last:(\d+):(\d)$/);
  if (l) { const d = new Date(Date.UTC(y, l[1], 0)); d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() - l[2] + 7) % 7)); return d; }
  return null;
}
function ricorrenzeDi(data, y, m, d) {
  const out = [...(data.fisse[`${pad(m)}-${pad(d)}`] || [])];
  Object.entries(data.mobili).forEach(([rule, names]) => {
    const r = regolaData(rule, y);
    if (r && r.getUTCMonth() + 1 === m && r.getUTCDate() === d) out.push(...names);
  });
  return out.map((s) => { const [nome, q] = s.split("|"); return { nome, q: q || nome }; });
}

// Data e ora attuali in Italia
const now = new Date();
const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
  .formatToParts(now).map((p) => [p.type, p.value]));
const romeOffset = (Number(parts.hour) - now.getUTCHours() + 24) % 24;

// Due orari programmati (10:00 e 11:00 UTC): parte solo quello che corrisponde alle 12:00 italiane
const expected = romeOffset === 2 ? "0 10 * * *" : "0 11 * * *";
if (SCHEDULE && SCHEDULE !== expected) {
  console.log(`Salto: questo orario (${SCHEDULE}) non corrisponde alle 12:00 in Italia.`);
  process.exit(0);
}

const [y, m, d] = DATA_OVERRIDE ? DATA_OVERRIDE.split("-").map(Number) : [Number(parts.year), Number(parts.month), Number(parts.day)];
const feste = ricorrenzeDi(JSON.parse(fs.readFileSync("feste.json", "utf8")), y, m, d);
console.log(`Data: ${y}-${pad(m)}-${pad(d)} · Ricorrenze:`, feste.map((f) => f.nome).join(", ") || "nessuna");

let payload;
if (feste.length) {
  const [f, ...altre] = feste;
  payload = {
    title: `Oggi: ${f.nome}`,
    body: altre.length ? `Anche: ${altre.map((x) => x.nome).join(", ")}. Tocca per scoprire storia e curiosità.` : "Tocca per scoprire storia e curiosità su Cultora.",
    q: f.q,
    url: `?q=${encodeURIComponent(f.q)}`
  };
} else if (TEST === "true") {
  payload = { title: "Cultora · Notifica di prova", body: "Funziona! Tocca per aprire una ricerca di esempio.", q: "Festa dei nonni", url: "?q=Festa%20dei%20nonni" };
} else {
  console.log("Nessuna ricorrenza oggi: nessuna notifica inviata.");
  process.exit(0);
}

if (!VAPID_PRIVATE_KEY || !PUSH_SUBSCRIPTION) {
  console.log("Mancano i secret VAPID_PRIVATE_KEY o PUSH_SUBSCRIPTION. Notifica che sarebbe stata inviata:", payload);
  process.exit(DATA_OVERRIDE ? 0 : 1);
}

webpush.setVapidDetails("https://cultora1.vercel.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.trim());
const raw = JSON.parse(PUSH_SUBSCRIPTION);
const subs = Array.isArray(raw) ? raw : [raw];
for (const sub of subs) {
  await webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 6 * 3600 });
  console.log("Notifica inviata:", payload.title);
}
