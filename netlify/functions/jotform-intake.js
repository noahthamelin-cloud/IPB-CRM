// JotForm webhook. ONE address serves BOTH forms:
//   - the public website form, which creates new leads
//   - the internal form Noah fills in, which creates or updates
//
// It matches on phone number. If that number already exists it updates that
// lead and leaves anything the form did not answer alone. If it does not exist
// it creates a new one. So the same URL is safe to point both forms at.
//
// Paste this into JotForm > Settings > Integrations > Webhooks:
//   https://idp-crm.netlify.app/.netlify/functions/jotform-intake

import { getStore } from "@netlify/blobs";

const KEY = "pipeline";

// Left side is the lead field, right side is words that may appear in your
// JotForm question label. Matching is case insensitive and partial, so
// "What is your average monthly light bill?" matches "bill".
const MAP = {
  name:         ["name", "client", "customer"],
  phone:        ["phone", "whatsapp", "number", "mobile", "contact"],
  email:        ["email"],
  island:       ["island"],
  address:      ["address", "location", "site"],
  bill:         ["bill", "light bill", "monthly bill", "bpl"],
  objective:    ["message", "comment", "looking for", "note", "detail", "about"],
  propertyType: ["home or business", "property type", "residential"],
  package:      ["package", "system", "level"],
  salesStage:   ["sales stage", "stage", "status"],
  payStage:     ["payment", "deposit", "paid"],
  fulStage:     ["fulfilment", "fulfillment", "delivery", "install status"],
  nextAction:   ["next action", "next step", "follow up"],
  nextDate:     ["next date", "action date", "follow up date", "when"]
};

function pick(fields, keys) {
  for (const k of Object.keys(fields)) {
    const clean = k.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
    if (keys.some((t) => clean.includes(t))) {
      const v = fields[k];
      if (v == null) return "";
      if (typeof v === "object") return Object.values(v).filter(Boolean).join(" ").trim();
      return String(v).trim();
    }
  }
  return "";
}

const digits = (v) => String(v || "").replace(/\D/g, "");
const num = (v) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;

// Keep this in step with matchPackage() in public/index.html.
function matchPackage(bill) {
  const b = num(bill);
  if (b <= 0) return "";
  if (b <= 300) return "p1200";
  if (b <= 600) return "p2400";
  if (b <= 1000) return "p4400";
  return "pmax";
}

// Accepts "2400", "Level 2400", "PowerUP 2400", "level two", "Level 2".
function readPackage(v) {
  const t = String(v || "").toLowerCase();
  if (!t) return "";
  if (/max|8800/.test(t)) return "pmax";
  if (/4400|level ?(3|three)\b/.test(t)) return "p4400";
  if (/2400|level ?(2|two)\b/.test(t)) return "p2400";
  if (/1200|level ?(1|one)\b/.test(t)) return "p1200";
  return "";
}

const STAGE_WORDS = {
  "closed won": "won", "closed lost": "lost",
  "call booked": "call_booked", "call completed": "call_done",
  "estimate requested": "est_req", "estimate sent": "est_sent",
  "site visit requested": "visit_req", "site visit completed": "visit_done",
  responded: "responded", contacted: "contacted", dormant: "dormant",
  won: "won", lost: "lost", new: "new"
};
const PAY_WORDS = {
  "deposit invoiced": "invoiced", invoiced: "invoiced",
  "paid in full": "paid", full: "paid", "75": "pay75",
  "50": "dep50", deposit: "dep50", nothing: "none", none: "none"
};
const FUL_WORDS = {
  "not started": "none", "final invoice": "invoiced", "final payment": "settled",
  ordered: "ordered", shipped: "shipped", landed: "landed", delivered: "delivered",
  scheduled: "scheduled", started: "started", complete: "complete"
};
function readWord(v, table) {
  const t = String(v || "").toLowerCase().trim();
  if (!t) return "";
  for (const [word, id] of Object.entries(table)) if (t.includes(word)) return id;
  return "";
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

  const phone = digits(pick(fields, MAP.phone));
  const bill = pick(fields, MAP.bill);
  const name = pick(fields, MAP.name);

  const store = getStore("ipb-pipeline");
  const data = (await store.get(KEY, { type: "json" })) ||
    { leads: [], settings: { shipmentMonth: "", lastBroadcast: null }, meta: { version: 1 } };

  // Match on the last 7 digits, so 2428248759 and +1 (242) 824-8759 are one person.
  const tail = phone.slice(-7);
  const existing = tail ? data.leads.find((l) => digits(l.phone).slice(-7) === tail) : null;

  // Only overwrite a field when the form actually answered it.
  const set = (lead, key, value) => { if (value !== "" && value != null) lead[key] = value; };

  let lead, created;

  if (existing) {
    lead = existing;
    created = false;

    set(lead, "name", name);
    set(lead, "email", pick(fields, MAP.email));
    set(lead, "island", pick(fields, MAP.island));
    set(lead, "address", pick(fields, MAP.address));
    set(lead, "objective", pick(fields, MAP.objective));

    if (num(bill) > 0) {
      lead.bill = num(bill);
      if (!lead.package) lead.package = matchPackage(bill);
    }
    set(lead, "package", readPackage(pick(fields, MAP.package)));

    const prop = pick(fields, MAP.propertyType).toLowerCase();
    if (prop) lead.propertyType = prop.includes("bus") ? "business" : "home";

    const st = readWord(pick(fields, MAP.salesStage), STAGE_WORDS);
    if (st) {
      lead.salesStage = st;
      // Same rule as the app: any sign of life stops the sequence.
      if (["responded", "call_booked", "call_done", "won", "lost"].includes(st)) {
        lead.followUp.active = false;
        lead.followUp.step = 0;
      }
    }
    set(lead, "payStage", readWord(pick(fields, MAP.payStage), PAY_WORDS));
    set(lead, "fulStage", readWord(pick(fields, MAP.fulStage), FUL_WORDS));
    set(lead, "nextAction", pick(fields, MAP.nextAction));

    const nd = pick(fields, MAP.nextDate);
    if (/^\d{4}-\d{2}-\d{2}/.test(nd)) lead.nextActionDate = nd.slice(0, 10);

    lead.updatedAt = Date.now();
    lead.log.unshift({ at: Date.now(), type: "note", body: "Updated from the internal form", by: "Form" });
  } else {
    created = true;
    const prop = pick(fields, MAP.propertyType).toLowerCase();
    lead = {
      id: "l" + Math.random().toString(36).slice(2, 9),
      createdAt: Date.now(), updatedAt: Date.now(),
      source: "JotForm",
      propertyType: prop.includes("bus") ? "business" : "home",
      name: name || "Unnamed form lead",
      phone,
      email: pick(fields, MAP.email),
      island: pick(fields, MAP.island) || "New Providence",
      address: pick(fields, MAP.address),
      bill: num(bill),
      package: readPackage(pick(fields, MAP.package)) || matchPackage(bill),
      objective: pick(fields, MAP.objective),
      salesStage: readWord(pick(fields, MAP.salesStage), STAGE_WORDS) || "new",
      payStage: readWord(pick(fields, MAP.payStage), PAY_WORDS) || "none",
      fulStage: readWord(pick(fields, MAP.fulStage), FUL_WORDS) || "none",
      nextAction: pick(fields, MAP.nextAction),
      nextActionDate: "",
      assigned: false, lostReason: "", notes: "",
      followUp: { active: true, step: 0, startedAt: Date.now(), lastSentAt: null },
      quote: null, survey: null, broadcasts: [],
      log: [{ at: Date.now(), type: "note", body: "Came in through a form", by: "Form" }]
    };
    data.leads.unshift(lead);
  }

  await store.setJSON(KEY, data);
  return Response.json({ ok: true, action: created ? "created" : "updated", id: lead.id });
};
