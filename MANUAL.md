# IPB Pipeline — Instructions Manual

Written for someone with no background at all. If you have just been handed this
system and nobody explained it, start here and read straight through.

---

## 1. What this is

IPB Pipeline is a private website used by Independent Power Bahamas to keep track of
people who want to buy a solar system. It replaces trying to remember everything in a
WhatsApp inbox.

It does five jobs:

1. Holds every lead in one place with their name, number, island and light bill.
2. Works out which solar package fits their bill.
3. Tells you who to follow up with today, and writes the message for you.
4. Lets the installer file a site survey from a job site.
5. Shows the CEO what the pipeline is worth and how much profit is in it.

Nobody outside the company can see it. It is protected by a passcode.

---

## 2. Who uses it

Two people log in. Installers are handled with a document rather than an account.

**Noah, sales.** Sees everything. Adds leads, moves them along, sends follow-ups,
records quotes, sends jobs to the installer.

**Zach, CEO.** Sees everything Noah sees, plus the money screen. Mainly here for the
numbers and to raise quotes.

There is no longer a separate installer login. Instead, any lead can produce a branded
**installer spec sheet** as a PDF, which you send to whichever installer is pricing the
job, or hand to the client so they can price it with their own contractor. See section 4.

Passcodes are set in the file `public/index.html`, in the block marked `ROLES`, near the
top of the script. The starting codes are 2242 for Noah and 1111 for Zach.
**Change these before anyone real logs in.**

---

## 3. Getting it running

### Trying it on your own computer

Open `public/index.html` in a browser. That is it. It works with no internet, no server
and no setup. It loads seven example leads so you can see how everything behaves.
Anything you type is saved in that browser only. Nobody else sees it.

### Putting it live so all three people share one pipeline

1. Push this whole folder to a GitHub repository.
2. In Netlify, choose "Add new site", then "Import an existing project", and pick that
   repository.
3. Leave the build settings alone. The file `netlify.toml` already tells Netlify what
   to do.
4. Deploy. You will get a web address like `ipb-pipeline.netlify.app`.
5. Open that address on your phone and add it to your home screen. It behaves like an app.

Once it is live on Netlify, all three people see the same leads. The app works out on
its own whether it is running on a server or just in a browser, and tells you which on
the More screen under "Where it lives".

---

## 4. Using it day to day

### The Today screen

This is the first thing you see and it is the whole point of the system. It has up to
three sections.

**Your next actions.** Anything you personally dated for today or earlier. Late ones are
marked in red with how many days late.

**Follow-ups ready to send.** Each one shows the customer, and underneath, the exact
message that is going to be sent, in full. Read it, then tap the green button. WhatsApp
opens with the message already typed to that person. You tap send yourself. The system
records that it went out and schedules the next one.

If the customer has replied, tap "They replied" instead. That stops the whole sequence
immediately, which is the correct behaviour, because nobody should get an automated
nudge after they have already answered you.

**Going cold.** Anyone with no activity for seven days and no plan set. This exists so
leads cannot quietly disappear just because you forgot to set a follow-up.

### Adding a lead

Leads screen, then "Add a lead". Name, WhatsApp number and light bill are the ones that
matter. As soon as you type a bill amount, the matching package appears with its price.
Everything else can be filled in later. Twenty seconds on a phone.

**Put the country code on the number**, so `12428019354`, not `801-9354`. The WhatsApp
buttons will not work without it.

Saving a lead starts the follow-up sequence automatically.

### Moving a lead along

Open any lead and tap a sales stage. There are three separate trackers and they are
deliberately independent:

- **Sales stage** is the human relationship: new, contacted, responded, call booked,
  call completed, estimate requested, estimate sent, site visit requested, site visit
  completed, closed won, closed lost, dormant.
- **Payment** is the money: nothing yet, awaiting deposit, 50% deposit received, paid in
  full. This matches the signed sales contract, which is a 50/50 split: 50% on signature
  authorises procurement and holds the allocation, 50% when the equipment reaches the
  destination, cleared before release for collection.
- **Fulfilment** is the equipment: ordered, shipped, landed, delivered, install
  scheduled, install started, install complete, final invoice, final payment.

A customer can be closed won, 50% paid and shipped all at the same time. That is why
they are three fields and not one.

Moving a lead to responded, call booked, call completed, won or lost stops the follow-up
sequence automatically.

### Getting a quote out

Open the lead, scroll to Quote, tap "Copy the quote packet". That copies a block of text
with the customer's name, number, email, address, island, bill, matched package and spec.
Paste it to Zach in a message. He raises the estimate in the existing quoting tool.

When the quote goes out, type the quote number and total into the two boxes and tap
"Record the quote". That moves the lead to estimate sent and starts the follow-up clock.

The system does not produce the PDF itself. That is deliberate for version 1, because a
working quoting tool already exists and rebuilding it would have delayed everything else.

### Sending a job to the installer

Open the lead, scroll to Site visit, tap "Send this site to Snoop". It appears on his
My Jobs screen straight away. Tap it again to take it back.

### The space calculator

Every lead and every job shows how much room the system actually needs, in inches and
square feet. Snoop sees it on his job screen under "Check this fits on site", before he
drives out.

| | 1200 | 2400 | 4400 | Max |
|---|---|---|---|---|
| Panel array | 247 sq ft | 495 sq ft | 928 sq ft | 1,856 sq ft |
| Battery bank | 23 x 15 x 24 in | 23 x 15 x 48 in | 23 x 15 x 48 in | 51 x 15 x 48 in |
| Clear wall for inverter | 48 x 42 in | 48 x 42 in | 45 x 57 in | 77 x 57 in |
| Total equipment area | 16.6 sq ft | 16.6 sq ft | 17.8 sq ft | 31.9 sq ft |
| Equipment weight | 949 lb | 1,838 lb | 2,896 lb | 5,792 lb |

The working allowances behind those numbers: 6 inches either side of a battery stack,
30 inches in front for service, 12 inches all round the inverter for airflow, and a
2 inch gap between panels. Batteries stack a maximum of three high, and where more than
one stack is needed they split evenly, so four batteries go two and two rather than
three and one.

To change any of it, edit the `HARDWARE` and `CLEAR` blocks near the top of the script
in `public/index.html`. Every figure on every screen recalculates from them.

### Reading the survey

When Snoop submits, the survey appears on the lead with a green or red edge.

- **Green, size confirmed.** He agrees the system fits. Carry on.
- **Red, size flagged.** He thinks there is a problem. His recommendation and comments
  are right there. You and Zach decide what to change. Snoop never changes the package
  himself.

Flagged surveys also collect at the bottom of the Money screen so nothing sits unanswered.

---

## 5. The follow-up sequence

Seven messages, then a quarterly touch. Days are counted from when the sequence started.

| When | What it is |
|---|---|
| Day 1 | 24 hour check in |
| Day 3 | Any questions |
| Day 5 | Summer bills angle |
| Day 12 | Week 1, money into the house not the power company |
| Day 19 | Week 2, you will spend it on bills anyway |
| Day 26 | Week 3, storm season and lights on |
| Day 33 | Week 4, leaving it here for now |
| Every 90 days after | Quarterly touch |

**The rule that matters.** If you do not open the app for three weeks, you do not come
back to fifteen stacked messages. You come back to **one message per lead**, the most
recent one that is due. The ones you missed are skipped, and the app says so on screen:
"You were away. 5 earlier messages skipped, this is the current one."

The sequence never switches itself off. It keeps going until one of these happens:

- The customer replies and you tap "They replied".
- You move them to responded, call booked, call completed, won or lost.
- You tap "They said no, stop everything", which marks them lost and removes them from
  everything permanently.

To change the wording of any message, edit the `SEQUENCE` block in `public/index.html`.
`[NAME]` is replaced with the customer's first name.

### Shipment broadcast

This is separate from the sequence and does not advance it. More screen, type the month
the shipment lands, tap "Build the broadcast list". You get every open lead with a send
button. Anyone already sent this shipment's message is marked, so nobody gets it twice.

---

## 6. The Money screen

Six numbers at the top, and the first two matter most:

- **Cash collected.** Money actually received, counting a deposit as half the order.
- **Invoiced, still owed.** What has been contracted but not yet banked.
- **Profit contracted** and **profit still in the pipeline.**
- **Revenue contracted** and **revenue open.**

A signed deal with no deposit is not money, so the two are kept apart deliberately. If
any signed deal has no deposit in, an amber panel names those customers. Nothing is
ordered and no allocation is held until the 50% lands.

Below that, where leads fall out of the funnel, and the closing ratios. Those are the
numbers to show investors.

### Contract figures

Every lead with a package shows the exact sales order breakdown, matching the signed
contract line for line. The rule, confirmed against five IPB documents:

```
VAT on parts   = 10% of the equipment base
VAT on landed  = 10% of (VAT on parts + freight)
Total          = base + VAT on parts + freight + VAT on landed
Deposit        = half the total
```

On a PowerUP 2400 that gives base $12,567.00, VAT on parts $1,256.70, freight $1,500.00,
VAT on landed $275.67, total $15,599.37, and a deposit of $7,799.69. Those are the exact
figures on Helen's signed contract.

Where an estimate includes install labour, that line is excluded from VAT on parts. The
Midway commercial job works this way.

"Copy the contract figures" puts the whole block on your clipboard, ready to paste
straight into the sales order.

### How profit is worked out

**Yes, VAT and duty are both in the calculation.** How they are handled depends on one
switch near the top of the script, `VAT_REGISTERED`. It is currently set to `true`.

**If IPB is VAT registered** (the current setting):

```
profit = (equipment base + freight charged) − (cost of goods + duty + freight paid)
```

The VAT charged on the invoice is handed to the government, so what IPB keeps is the
base plus the freight it billed. The VAT paid on the import is not counted as a cost,
because a registered business claims it back.

**If IPB is not VAT registered**, set `VAT_REGISTERED` to `false`. Then:

```
profit = selling price − (cost of goods + duty + freight) × 1.10
```

Nothing is stripped out of the price, and the import VAT stays in as a real cost. This
comes out higher, about $6,027 on a PowerUP 1200 instead of $5,480.

**Check which one is true before showing these numbers to an investor.** The two
treatments differ by roughly $550 per small system and more on the big ones.

Duty on solar is currently 0%. Cost of goods comes from the Kevolt price list dated
24 July 2026.

| Package | Sells for | Costs landed | Profit | Margin |
|---|---|---|---|---|
| PowerUP 1200 | $11,599.00 | $5,065 | $5,398 | 52% |
| PowerUP 2400 | $15,599.37 | $7,404 | $6,663 | 47% |
| PowerUP 4400 | $21,998.99 | $10,146 | $9,686 | 49% |
| PowerUP Max | $45,000.00 | $18,692 | $21,862 | 54% |

These are slightly lower than earlier versions of this manual, and they are now correct.
The old figures divided the invoice by 1.10, but IPB's VAT is charged on the parts and
then again on the landed costs, so it is not a flat 10% of the total. What IPB keeps is
the equipment base plus the freight it charged, which is what the calculation now uses.

Those figures are on the VAT registered setting.

This excludes customs broker fees, delivery to the customer's door, inter-island freight
and any commission. Install is not counted at all, because the customer pays the
installation company directly.

**Two things to check with real numbers.**

First, freight is set at $1,600 per package across the board, taken from a $16,000
container holding about ten packages. That is accurate for a Max, which is heavy enough
that ten of them fill a container. It is very wrong for a PowerUP 1200, which weighs
about 450kg, so roughly fifty fit in the same container. Real freight on a 1200 is closer
to $300. Once you have a real container manifest, set each package's freight separately
and the small systems will show their true margin, which is higher than what is on screen
now. The current figure is deliberately conservative.

Second, duty is set to 0% because panels and inverters are exempt. At least one import
guide says batteries and mounting hardware may not be. Batteries are the biggest single
line item, so get your customs broker to confirm against the tariff codes on your last
entry.

### Changing the cost numbers

Everything lives in one place: the `PACKAGES` block near the top of the script in
`public/index.html`. Change a `cogs` or `freight` figure there and every profit number
in the app updates. `VAT`, `DUTY` and `VAT_REGISTERED` sit just above it. Nothing else
needs touching.

---

## 7. Where the data lives, and backing it up

**On Netlify.** The data sits in Netlify Blobs, a storage box attached to your site.
It saves automatically every time anything changes, and keeps a separate dated copy each
day, so a bad write is never fatal.

**In a browser only.** If you opened the file directly, everything is in that browser's
storage. It does not travel to another device.

**Take backups.** More screen, "Download backup". That gives you a JSON file with
everything, including every note and every logged message. Take one before any update.
"Download CSV" gives you a spreadsheet of the leads for anything else.

To restore a backup, open the file and paste its contents where the app stores its data,
or ask whoever maintains the system. Keep the backups somewhere that is not this app.

---

## 8. Connecting the forms

Two JotForms feed the CRM, and **they both point at the same web address.** The function
works out which is which on its own.

- The **website form** that customers fill in. A new phone number creates a new lead.
- The **internal form** you fill in yourself to update a customer. A phone number that
  already exists updates that lead instead of creating a duplicate.

Matching is on the last seven digits of the phone number, so `2428248759` and
`+1 (242) 824-8759` are treated as the same person. A field the form did not answer is
left alone, so a short update form cannot wipe out details you already have.

The internal form can also set the sales stage, payment status, fulfilment status, next
action and next action date. Write the answers the way they appear in the app, for
example "Estimate sent", "50% deposit in", "Shipped". Package can be written as "2400",
"Level 2400" or "Level two".

1. Build your JotForm with questions that include the words: name, phone or whatsapp,
   email, island, address, bill, and a message box.
2. In JotForm, go to Settings, then Integrations, then Webhooks.
3. Paste this address, replacing the site name with yours:

```
https://YOUR-SITE.netlify.app/.netlify/functions/jotform-intake
```

4. Repeat for the internal form. Same address, nothing different to configure.
5. Send yourself a test submission from each. A new number should appear at the top of
   the Leads screen within a few seconds. An existing number should update that lead and
   add a line to its history reading "Updated from the internal form".

If your question wording is different, open `netlify/functions/jotform-intake.js` and
edit the `MAP` block at the top. It matches on words appearing anywhere in a question,
so "What is your monthly light bill?" already matches "bill".

WhatsApp and Messenger cannot feed themselves in yet. That needs a paid service and is
planned for version 2.

---

## 9. What this system does not do yet

Being honest about the edges so nobody goes looking for something that is not there.

- It does not produce quote or invoice PDFs. The existing quoting tool does that.
- It does not pull WhatsApp or Messenger messages in automatically.
- It does not send messages by itself. It writes them and opens WhatsApp. You tap send.
  This is on purpose as well as a technical limit, because you should read every message
  before it goes.
- Passcodes live in the page source, so anyone with developer tools open can read them.
  They keep out casual visitors, not a determined one. Moving to a proper database with
  real accounts is the version 2 fix.
- There are no photo uploads on site findings yet.
- The spec sheet is produced by printing to PDF rather than generating a file directly.
  This keeps the app dependency free and gives full control over how it looks.
- There is no automatic ad spend to closed deal reporting yet.

---

## 10. If something goes wrong

**The WhatsApp button does nothing.** The number is missing its country code. Open the
lead and put `1242` in front of it.

**Two people saved at once and something got lost.** Whoever saved last wins. Take a
backup, then re-enter. With three users this is rare. The proper fix is version 2.

**Everything vanished.** Check the More screen, under "Where it lives". If it says
"This device only", you are on a browser copy rather than the live site. Go to the
Netlify address instead.

**I want the demo leads back.** More screen, bottom, "Reload the demo leads". This wipes
what is there, so only use it while learning.

**A number looks wrong on the Money screen.** Check the `PACKAGES` block in
`public/index.html`. Every figure on that screen is calculated from it.

---

## 11. Files in this project

```
public/index.html                    The entire app. One file, no build step.
netlify/functions/leads.js           Reads and writes the shared data.
netlify/functions/jotform-intake.js  Receives website form submissions.
netlify.toml                         Tells Netlify how to deploy.
package.json                         One dependency, the Netlify storage library.
MANUAL.md                            This document.
README.md                            Short version for a developer.
```

The app is one file on purpose. There is no build step, no framework and no compiling.
You can open it, read it, change a word and push it. That is the same pattern as the
XPLR Build Tracker and the Order Board.

---

*Version 1.0. Independent Power Bahamas.*
