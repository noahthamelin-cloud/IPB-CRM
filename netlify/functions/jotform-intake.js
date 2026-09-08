// JotForm webhook. Paste this function's URL into
// JotForm > Settings > Integrations > Webhooks.
// Every submission lands as a new lead with source "JotForm".
import { getStore } from "@netlify/blobs";

const KEY = "pipeline";

// Map JotForm field labels to lead fields. Left side is what you
// name the question in JotForm. Change these to match your form.
const MAP = {
  name: ["name", "full name", "your name"],
  phone: ["phone", "whatsapp", "number", "phone number"],
  email: ["email", "email address"],
  island: ["island"],
  address: ["address", "location"],
  bill: ["bill", "light bill", "monthly bill", "bpl bill"],
  objective: ["message", "comments", "what are you looking for", "notes"]
};

function pick(fields, keys) {
  for (const k of Object.keys(fields)) {
    const clean = k.toLowerCase().replace(/[^a-z ]/g, "").trim();
    if (keys.some((t) => clean.includes(t))) return fields[k];
  }
  return "";
}

// Bill to package. Keep in step with the app's own matcher.
function matchPackage(bill) {
  const b = Number(String(bill).replace(/[^0-9.]/g, "")) || 0;
  if (b <= 0) return "";
  if (b <= 300) return "p1200";
  if (b <= 600) return "p2400";
  if (b <= 1000) return "p4400";
  return "pmax";
}

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let fields = {};
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await req.json();
      fields = j.rawRequest ? JSON.parse(j.rawRequest) : j;
    } else {
      const form = await req.formData();
      const raw = form.get("rawRequest");
      fields = raw ? JSON.parse(raw) : Object.fromEntries(form.entries());
    }
  } catch (e) {
    return new Response("Could not read the submission", { status: 400 });
  }

  const bill = pick(fields, MAP.bill);
  const lead = {
    id: "l" + Math.random().toString(36).slice(2, 9),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    source: "JotForm",
    propertyType: "home",
    name: pick(fields, MAP.name) || "Unnamed JotForm lead",
    phone: String(pick(fields, MAP.phone)).replace(/\D/g, ""),
    email: pick(fields, MAP.email),
    island: pick(fields, MAP.island) || "New Providence",
    address: pick(fields, MAP.address),
    bill: Number(String(bill).replace(/[^0-9.]/g, "")) || 0,
    package: matchPackage(bill),
    objective: pick(fields, MAP.objective),
    salesStage: "new",
    payStage: "none",
    fulStage: "none",
    nextAction: "",
    nextActionDate: "",
    assigned: false,
    lostReason: "",
    notes: "",
    followUp: { active: true, step: 0, startedAt: Date.now(), lastSentAt: null },
    quote: null,
    survey: null,
    broadcasts: [],
    log: [{ at: Date.now(), type: "note", body: "Came in through the website form", by: "System" }]
  };

  const store = getStore("ipb-pipeline");
  const data = (await store.get(KEY, { type: "json" })) || { leads: [], settings: {}, meta: {} };
  data.leads.unshift(lead);
  await store.setJSON(KEY, data);

  return Response.json({ ok: true, id: lead.id });
};
