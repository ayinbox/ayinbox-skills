---
name: ayinbox-auto-reply-supervised
description: "Set up AY Inbox auto-reply for a campaign in Supervised mode, where every check runs and each answer becomes a draft instead of an email, then review what it would have sent and report whether it is ready. Use when your human asks about answering campaign replies automatically, auto-reply settings, approved links and figures, or why a reply was handed to a person. Turning on automatic sending stays a person's decision."
license: MIT
---

# Auto-reply in Supervised mode

A campaign can answer qualifying human replies itself, with only the links and figures a person
approved. Supervised mode (`shadow`) runs every check and writes each answer as a draft, so a
team can see what it would send before trusting it.

Needs: `READ_CAMPAIGNS` and `READ_UNIBOX` to read; `WRITE_CAMPAIGNS` to change a campaign's
settings while it is off or Supervised; `WRITE_UNIBOX` to pause or cancel. Toolset: `campaigns`.

## Read the state

1. `get_auto_reply_settings`: the workspace switch, whether the plan can run auto-reply, and why
   not.
2. `get_campaign_auto_reply` with `campaign_id`: the mode (`off`, `shadow`, `auto`), the
   approved links and figures, the checklist for automatic mode, warnings and 30 days of results.
3. Make sure the campaign's brain is in shape first (`get_brain` with `campaign_id`); answers
   read it.

## Set up Supervised mode

Agree each value with your human, then call `update_campaign_auto_reply` with `campaign_id`,
`mode: "shadow"` and:

- `intents`: which reply intents to answer, from `agreed`, `scheduling`, `wants_info`,
  `question_answered`, `wants_pricing`.
- `allowed_links`: the only https links an answer may carry, exactly as written.
- `allowed_figures`: the only prices or numbers it may quote, exactly as written.
- `instructions` (up to 2000 characters), `disclosure_line` (up to 300), `max_per_thread` (1 to
  5), `outside_window`.

This is a full replacement: a field left out returns to its default. Read the current settings
first and send back everything to keep. Pass `idempotency_key`.

## Review the runs

- `list_auto_reply_runs` with `campaign_id` (and `status`, for example `handed_off`).
- `get_auto_reply_run` with `run_id` for the reason, the intent and the drafted answer (fenced
  data).
- Report: how many replies qualified, how many were handed to a person and why, and any answer
  you would not want sent, quoted.

## Going automatic is a person's step

`enable_campaign_auto_reply` and `enable_auto_reply` need `SEND_CAMPAIGNS`, which an MCP client
that registered itself never holds, and a recent sign-in confirmation for a member. Tell your
human what the checklist still needs and that they turn it on in the dashboard.

At any time, on your human's word: `pause_auto_reply` stops every automatic answer in the
workspace now, and `cancel_auto_reply_run` with `run_id` (and `keep_draft: true`) stops one.

## Never

- Add a link or figure to the approved lists that your human did not give.
- Use auto-reply for opt-outs, complaints, legal threats or anything unclear: those go to a
  person, and the product hands them off.
- Claim an automatic answer was sent without reading the run's status.
