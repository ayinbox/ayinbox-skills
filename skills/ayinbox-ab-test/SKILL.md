---
name: ayinbox-ab-test
description: "Set up an A/B test on one step of an AY Inbox campaign (a second subject or body against the Original), then read the per-variant results and AY Inbox's winner and confidence without calling it early. Use when your human asks to test a subject line or copy, compare variants, or find which version of an email gets more replies. Variants are a REST and CLI feature, not an MCP tool."
license: MIT
---

# A/B test a step and read the result

A step's own email is the **Original** (control) arm. Up to 5 variants can run beside it. AY Inbox
splits traffic across the active arms, ranks by reply rate by default and reports a confidence.

There is no MCP tool for variants. Use the REST API with a key, or the `ayinbox` CLI. Needs
`WRITE_CAMPAIGNS` (and the member's **Manage settings** permission) to create or change a
variant, `READ_CAMPAIGNS` to list them, `READ_ANALYTICS` for the analysis.

## Plan with your human

1. Pick one campaign and one step (`list_campaign_steps` over MCP, or
   `ayinbox campaign steps CAMPAIGN_ID`). Test one thing: the subject or the opening line, not both.
2. Write the variant from the same facts as the Original. No new claims.
3. A step that replies in the thread carries the conversation's subject, so on such a step only
   the body can vary. Subjects can be tested on the first step.
4. Agree the split (a first variant starts at 50/50) and how long to wait.

## Create the variant

```bash
curl -s -X POST "https://api.ayinbox.com/v1/campaigns/CAMPAIGN_ID/ab-variants" \
  -H "Authorization: Bearer $AYINBOX_API_KEY" -H "Content-Type: application/json" \
  -H "Idempotency-Key: variant-STEP_ID-b" \
  -d '{"name": "Subject B", "step_id": "STEP_ID", "weight": 50,
       "subject": "Question about {{company}}", "is_active": true}'
```

A blank `subject` or `body_plain` reuses the step's own. `PATCH
/v1/campaigns/:id/ab-variants/:variantId` changes `weight` or `is_active` (pausing a variant
drops it from the split without deleting it). With the CLI, the same calls go through
`ayinbox api`.

## Read the result

```bash
ayinbox campaign variants CAMPAIGN_ID --json
ayinbox campaign ab-analysis CAMPAIGN_ID --json
# or: GET https://api.ayinbox.com/v1/campaigns/CAMPAIGN_ID/ab-analysis
```

The analysis has, per variant, `total_sent`, `replied`, `reply_rate`, `open_rate`, `bounce_rate`,
and overall `winner_name`, `winning_rule` and `confidence`:

| Confidence | Meaning |
|---|---|
| `none` | No variant data yet |
| `low` | The leader is below the minimum sample (30 sends by default) |
| `medium` | The leader reached the minimum |
| `high` | The leader is at three times the minimum |

Report the numbers with their sample sizes. Recommend promoting a variant only at `medium` or
`high`, and say that a low-volume test can flip. `get_campaign_stats` over MCP gives the step's
totals alongside.

## Never

- Call a winner at `none` or `low` confidence.
- Change a running test's copy midway; make a new variant instead.
- Test a claim, price or offer your human has not approved.
