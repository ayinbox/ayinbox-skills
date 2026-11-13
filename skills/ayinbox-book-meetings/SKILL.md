---
name: ayinbox-book-meetings
description: "Turn an AY Inbox reply that asks for a call into a meeting offer, open times from the workspace's Cal.com or Calendly in the prospect's time zone, and follow the offer until a person books the prospect's pick. Use when a prospect wants to meet, asks for times, or picks a slot, or when your human asks which meeting offers are waiting. Booking itself mails an invitation, so a person does it."
license: MIT
---

# Follow up until booked

AY Inbox offers real open times from the workspace's own Cal.com or Calendly and books the
prospect's pick through that provider, which sends the invitation. Over MCP you prepare the offer
and watch it; a person sends the reply that carries the times, and a person books.

Needs: `READ_UNIBOX` and `READ_CONTACTS` to read availability and offers; `WRITE_UNIBOX` to
prepare, stop or resume an offer. Toolset: `inbox`. Booking must be connected in the dashboard
(the provider key is pasted there; no tool takes it).

## Check the setup once

`get_booking_settings` (mode `off`, `draft` or automatic, and follow-up bounds),
`list_booking_types` (use one whose status is ok), `get_booking_summary`. If nothing is connected,
tell your human to connect Cal.com or Calendly in the dashboard and stop.

## Offer times on a reply

1. Confirm the thread really asks for a call: `get_thread` with `thread_id`. A "maybe later" is
   not a request to meet.
2. `get_availability` with `thread_id` (and `limit`, up to 50). Times come back labelled in the
   prospect's zone. Read `timezone_source`: when the zone was guessed (from the email domain or
   the workspace), say so to your human.
3. `offer_meeting_times` with `thread_id` and, if your human chose them, `slot_starts` (exact
   starts from step 2). Leave `slot_starts` out to let the booking type pick. Pass
   `idempotency_key`. It returns a text `block` with the numbered times and sends nothing. Only
   one open offer may hold a thread or a contact.
4. Draft the reply around the block, unchanged: `draft_reply` with `thread_id` and a `body` that
   holds a short answer plus the block. The offer becomes live only when a person sends a reply
   carrying every time in the block.

## Follow the offer

- `list_meeting_offers` with `status: "pick_pending,needs_human"` each morning.
- `get_meeting_offer` with `offer_id`: `events` say what was detected and quote the words it rests
  on (`evidence`). A clear pick is "option 2" or a full day and time; a condition or a negation
  goes to a person.
- A wrong pick: `reject_meeting_pick`. Your human wants it stopped: `stop_meeting_offer`. Hand it
  back to the agent: `resume_meeting_offer`. Each with `offer_id`, and only on your human's word.

## Booking is a person's step

Booking makes the provider email an invitation, so it is not an MCP tool. Tell your human which
offer and slot to book in the dashboard. Their own code can call
`POST /v1/booking/offers/:id/book` with `{"slot_id": "..."}`, an `Idempotency-Key`, and a key
holding `WRITE_CONTACTS` and `WRITE_UNIBOX`; the CLI equivalent is `ayinbox booking book OFFER_ID
--slot SLOT_ID`, which prompts first. A `409 booking_new_reply` means a reply arrived that nobody
has read: read it before booking.

## Never

- Book, or tell the prospect a meeting is booked before the provider confirmed it.
- Change the attendee: the invite always goes to the contact's stored address.
- Turn on automatic booking. `enable_booking_auto` needs `SEND_CAMPAIGNS` and a person's decision.
- Invent availability or propose times that did not come from `get_availability`.
