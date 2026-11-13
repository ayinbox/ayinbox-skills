---
name: ayinbox-deliverability-check
description: "Check AY Inbox sender mailbox health the way the product reports it: health bands, warmup standing, bounce and complaint signals, SPF, DKIM and DMARC on each sending domain, placement test results and the Advisor's findings, then say what to fix. Use when your human asks why replies dropped, whether mailboxes are healthy, about warmup, bounces, spam placement or DNS records in AY Inbox."
license: MIT
---

# Mailbox health and deliverability check

Read what AY Inbox already measured and explain it. This playbook reads only; any fix waits for
your human.

Needs: `READ_ANALYTICS` and `READ_EMAILS`. Toolsets: `analytics`, `mailboxes`.

## Steps

1. **The Advisor first.** `get_advisor_summary`, then `list_recommendations` with
   `surface: "deliverability"` or `category` (`deliverability`, `mailbox`, `warmup`). Each
   finding carries its evidence. Start the answer from these rather than your own diagnosis.
2. **Every mailbox.** `list_mailboxes`: status, health score, daily usage, warmup state and any
   current error. Note the ones with errors, a disconnected state or a warning.
3. **One mailbox in detail.** `get_mailbox` with `email_account_id` for its caps and warmup
   settings, and `get_warmup_ban_status` for its pool standing: healthy, watched, throttled,
   quarantined or blocked, with the reason.
4. **Domain authentication.** There is no MCP tool for DNS. Over REST with a key holding
   `READ_EMAILS`: `GET /v1/emails/:id/auth-check` runs a live SPF, DKIM and DMARC lookup and
   changes nothing; `GET /v1/emails/domains` lists every sending domain with its records. With
   the CLI: `ayinbox mailbox check MAILBOX_ID`.
5. **Placement tests**, if any were run: `list_placement_tests`, `get_placement_test`,
   `list_placement_batches`, `get_placement_batch`. One test is a signal, not a verdict.

## How the product reads the signals

| Signal | What it means in AY Inbox |
|---|---|
| Watch | Spam placement at Google, Microsoft or Yahoo of 10% or more, or complaints of 0.03% or more. Cold volume is eased |
| Throttled | Spam placement of 20% or more. Warmup runs at half volume, cold volume is halved, it lifts on its own |
| Quarantine | Complaints of 0.10% or more, bounces of 5% or more, or repeated tampering with warmup mail. Out of the paid warmup pool for 7 days, cold sending paused |
| Blocked | Complaints of 0.30% or more or bounces of 10% or more. Out of the pool for 30 days |
| DNS Failing | SPF or DMARC missing. After 72 hours, cold and warmup sending stop on that domain; replies still go out |
| DKIM Not verified | The selector could not be discovered. It does not stop sending; confirm signing in the provider's console |

Bands need a minimum sample (20 verified warmup deliveries in 7 days for placement, 100 delivered
emails in 30 days for complaints), so a new mailbox may show nothing yet.

## What to suggest

- Missing SPF or DMARC: the exact record to add at the registrar, then a re-check
  (`POST /v1/emails/:id/auth-check` needs `WRITE_EMAILS`; the CLI is `ayinbox mailbox recheck`).
- Rising bounces: clean the list (`ayinbox-build-contact-list`) before sending more.
- A throttled or quarantined mailbox: keep warmup running, lower its cold load, wait it out.
- A mailbox with an auth error: a person reconnects it in the dashboard.

Changes such as `update_mailbox`, `set_mailbox_warmup`, `set_mailbox_send_hold` or
`submit_warmup_appeal` happen only when your human asks for that change.

## Never

- Promise inbox placement or a reputation outcome. No check guarantees either.
- Raise a mailbox's `campaign_limit` above 50 a day or stop warmup to get more cold volume.
- Disconnect a mailbox (`disconnect_mailbox` erases its stored mail) unless your human asks for
  exactly that.
