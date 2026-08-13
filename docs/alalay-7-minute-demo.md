# Alalay — 7-Minute Demo and Q&A Run Order

Target: finish the live product demo in **5 minutes 15 seconds**, leaving **1 minute 45 seconds** for one panel question or recovery from a slow device.

## Before the timer starts

- Open the patient login screen in one tab and the hospital portal in another.
- Reset the seeded demo state.
- Keep the browser at a mobile-sized patient view; keep the portal tab desktop-sized.
- Do not use real camera or government connections during the timed demo.

## 0:00–0:35 — Identity without retyping

1. Tap **Continue with eGovPH**.
2. State: “This is a seeded SSO simulation, clearly labeled—not a live government connection.”
3. Approve the privacy screen.
4. Show Elena’s editable identity and PhilHealth details.

Proof point: trusted data starts the profile, but the patient still reviews it.

## 0:35–1:20 — MDR, beneficiary, and documents

1. Tap **Upload PhilHealth MDR**; the prepared sample is processed through the normal upload flow.
2. Open **Where is this?** beside the PhilHealth PIN for two seconds.
3. Continue to Family and show Ben as Elena’s father.
4. Briefly open Ben’s edit form to show his seeded prescription and phone reconciliation field.
5. Complete setup and select **Ben** on the Dashboard.

Proof point: information is prepared once for the correct patient, with source labels and editable fields.

## 1:20–2:30 — Hospital check-in

1. Tap **Check in** for Ben.
2. Scan the admission-desk QR displayed on the hospital laptop.
3. Show the dynamic visit questions, emergency-contact override, and missing-ID option.
4. Approve the named consent screen.
5. End on the match code and confirmation.

Proof point: Alalay shares only the selected patient’s approved visit snapshot.

## 2:30–3:35 — Hospital portal handoff

1. Switch to the hospital portal.
2. Add or open Ben in the incoming queue.
3. Show medication, prescription, and visit-only contact.
4. Select the MDR-equivalent and admission form.
5. Open the generated document preview.
6. Advance one status-board step.

Proof point: staff receive usable data and documents without editing the patient’s saved profile.

## 3:35–4:20 — Support after check-in

1. Return to the patient Dashboard.
2. Open the admission guide.
3. Show the hospital-updated step and the honestly scoped next action.
4. Mention that non-participating hospitals receive the generic guide without fake live ticks.

Proof point: Alalay continues helping after the QR scan.

## 4:20–5:15 — Ask Alalay and grounded explainers

1. Open **Ask Alalay**.
2. Tap “Why do I still owe ₱12,700?” under Guided Routing.
3. Open the matched Bill Explainer.
4. Ask “What is CF1?” using the suggested question.
5. If time remains, return and show the Lab Explainer for three seconds.

Proof point: this build uses an honest rules-based router and answers only from the displayed document—not an invented diagnosis or government response.

## 5:15–7:00 — Q&A buffer

Keep these concise answers ready:

- **Is eGovPH live?** No. The MVP uses a clearly labeled seeded SSO simulation; production requires an authorized integration.
- **Is the bill or lab explanation medical advice?** No. It is grounded only in the visible document and directs the user to hospital staff for official interpretation.
- **What happens without a participating hospital?** The patient still receives a general admission guide; only live status ticks depend on hospital participation.
- **Why is this better than a digital form?** The selected patient’s information follows the flow from preparation, to consented check-in, to generated paperwork, and then to post-check-in guidance.

## Recovery rule

If any animation, camera, or external-looking step delays the flow, use the visible seeded-demo button immediately and say: “For a reliable pitch, this build uses the prepared sample document.”
