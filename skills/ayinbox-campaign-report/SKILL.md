---
name: ayinbox-campaign-report
description: "Write a weekly (or any period) AY Inbox campaign report from real numbers: sends, replies, positive replies, bounces and meetings per campaign and per step, the leads that went cold, and the Advisor's open findings, with plain next steps. Use when your human asks how campaigns are doing, for a weekly report, a results summary, or which campaign or step works best."
license: MIT
---

# Weekly campaign report

Every number in the report comes from a tool result. Read only; this playbook changes nothing.

Needs: `READ_ANALYTICS`, `READ_CAMPAIGNS`, `READ_CONTACTS`; `READ_CRM` for deals. Toolsets:
`analytics`, `campaigns`, `crm`.

## Steps

1. **Pick the window.** Default to the last 7 full days in UTC. Say the dates in the report.
2. **Headline.** `get_dashboard_analytics` with `period: "7d"` (or `30d`, `90d`): sent, opens,
   clicks, replies, bounces, rates, top campaigns and account health. Add `campaign_ids` or
   `folder_ids` to narrow it.
3. **Per campaign.** `list_campaigns` with `status: "active"`, then for each:
   `get_campaign_stats` with `campaign_id`, `from` and `to` (both `YYYY-MM-DD`, together). That
   counts the emails sent on those days and every reply or bounce they earned. It has positive
   replies, replies by classification and the same numbers per step.
4. **Who went cold.** `list_campaign_leads` with `campaign_id` and `status: "completed"` (every
   step sent, no reply). Count them; list a few only if your human wants follow-up ideas.
5. **Meetings and pipeline.** `list_meeting_offers` for offers in the window, and `list_deals`
   with `status: "open"` if the workspace uses the CRM.
6. **What is wrong.** `get_advisor_summary`, then `list_recommendations` with `category`
   (`deliverability`, `mailbox`, `warmup`, `campaign`, `copy`, `list`) or `entity_id` for a
   campaign. Quote the Advisor's own finding rather than diagnosing from raw numbers.

## Write it like this

- One sentence on how the week went.
- A small table: campaign, sent, replies, positive replies, bounce rate, meetings.
- The best and worst step by reply rate, with the sample size. Do not call a winner on a small
  sample (a few dozen sends per step says little).
- Open Advisor findings, worst first, each with its fix.
- 2 or 3 numbered next steps, specific: "1. Rewrite step 2 of Q4 outbound, it has 0 replies from
  140 sends".

## Rules

- Report rates with their denominators. Open rates are a weak signal (image proxies and privacy
  features inflate them); lead with replies and positive replies.
- No claims about inbox placement or what a change will achieve.
- If a campaign shows rising bounces or complaints, say so first and suggest pausing it; pause only
  when your human says so (`set_campaign_status` with `action: "stop"`).
- Do not compare against invented industry benchmarks.
