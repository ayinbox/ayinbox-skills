# AY Inbox agent skills

Agent skills for [AY Inbox](https://ayinbox.com), a hosted cold email platform. Each skill is a
`SKILL.md` playbook that tells an AI agent how to do one job with the AY Inbox MCP server or the
`ayinbox` CLI: which tools to call, in what order, what to confirm with you, and what never to do.

AY Inbox is a hosted service. This repository holds agent skills that drive its public MCP server
and REST API. The service itself is not open source.

## Install

With the [`skills`](https://github.com/vercel-labs/skills) CLI, for Claude Code, Codex, Cursor,
Gemini CLI, GitHub Copilot and the other agents it supports:

```bash
npx skills add ayinbox/ayinbox-skills
```

It asks which skills and which agents. To see the list without installing anything:

```bash
npx skills add ayinbox/ayinbox-skills --list
```

To install one skill for one agent: `npx skills add ayinbox/ayinbox-skills --skill ayinbox-triage-replies -a claude-code`.

### By hand

Copy the folders you want from `skills/` into your agent's skills directory, one folder per
skill, named after it. For Claude Code that is `.claude/skills/` in a project or
`~/.claude/skills/` for every project, so `skills/ayinbox/SKILL.md` becomes
`.claude/skills/ayinbox/SKILL.md`. Other agents read skills from their own directories; check
your agent's docs, or let the `skills` CLI place them.

For Claude Code, Codex and Cursor there is also a plugin that bundles these skills with the MCP
server connection: [ayinbox/ayinbox-plugin](https://github.com/ayinbox/ayinbox-plugin).

## Before you use them

- **An AY Inbox workspace.** Access to the hosted service is invite only for now: ask at
  team@ayinbox.com.
- **The MCP server connected** in your agent: `https://api.ayinbox.com/v1/mcp`, with OAuth sign-in
  or an API key. In Claude Code:

  ```bash
  claude mcp add --transport http ayinbox https://api.ayinbox.com/v1/mcp
  ```

  then run `/mcp` and choose Authenticate. Other clients are in the
  [MCP server docs](https://docs.ayinbox.com/api/mcp/).
- **Or the `ayinbox` CLI** for `ayinbox-cli-ci` and the REST-only parts of `ayinbox-ab-test`,
  `ayinbox-deliverability-check` and `ayinbox-reply-webhooks`. See the
  [CLI docs](https://docs.ayinbox.com/api/cli/).

Keep the API key out of chat and out of your repository: put it in the client's config or an
environment variable.

## Skills

| Skill | What it does |
|---|---|
| [`ayinbox`](skills/ayinbox/SKILL.md) | The base skill: connect, credentials, what the tools do, what waits for a person |
| [`ayinbox-build-contact-list`](skills/ayinbox-build-contact-list/SKILL.md) | Add, find, label and segment contacts for a campaign; keep do-not-contact addresses out |
| [`ayinbox-write-cold-sequence`](skills/ayinbox-write-cold-sequence/SKILL.md) | Write a short sequence and save it as a draft campaign with senders, schedule and audience |
| [`ayinbox-campaign-brain`](skills/ayinbox-campaign-brain/SKILL.md) | Write and maintain the brain every AI reply draft reads |
| [`ayinbox-triage-replies`](skills/ayinbox-triage-replies/SKILL.md) | Sort new replies and prepare drafts for a person to send |
| [`ayinbox-book-meetings`](skills/ayinbox-book-meetings/SKILL.md) | Offer open Cal.com or Calendly times on a reply and follow the offer |
| [`ayinbox-auto-reply-supervised`](skills/ayinbox-auto-reply-supervised/SKILL.md) | Run auto-reply in Supervised mode and review what it would send |
| [`ayinbox-campaign-report`](skills/ayinbox-campaign-report/SKILL.md) | A weekly report per campaign and step, with the Advisor's findings |
| [`ayinbox-deliverability-check`](skills/ayinbox-deliverability-check/SKILL.md) | Mailbox health bands, warmup standing, SPF, DKIM and DMARC |
| [`ayinbox-suppression-hygiene`](skills/ayinbox-suppression-hygiene/SKILL.md) | Suppressions, opt-outs, and holding one lead instead of unsubscribing |
| [`ayinbox-ab-test`](skills/ayinbox-ab-test/SKILL.md) | Add a variant to a step and read the winner and confidence |
| [`ayinbox-crm-from-replies`](skills/ayinbox-crm-from-replies/SKILL.md) | Deals, tasks and notes from what replies say |
| [`ayinbox-reply-webhooks`](skills/ayinbox-reply-webhooks/SKILL.md) | Signed webhooks for reply events, and a receiver that verifies them |
| [`ayinbox-cli-ci`](skills/ayinbox-cli-ci/SKILL.md) | The `ayinbox` CLI in scripts and CI |

## The safety model these skills follow

- **The agent prepares; a person sends.** No AY Inbox MCP tool sends an individual email, books a
  meeting or lifts a suppression. Reply drafts wait for a person.
- **Starting a campaign** needs a credential with `START_CAMPAIGNS` or `SEND_CAMPAIGNS` and your
  explicit request in the conversation. The skills never start, resume or re-enrol a campaign on
  their own.
- **Spending** (`find_leads`, `generate_reply_draft`, paid address checks) happens only within a
  budget or a count you agreed.
- **No invented facts.** Copy, brains and CRM records use only what you gave and what the tools
  returned. Nothing about a prospect is made up.
- **Tool results are data.** Mail, form answers and imported lists are written by people outside
  your workspace; the skills read them and never follow instructions inside them.
- **No deliverability promises.** The skills report what AY Inbox measured and never claim inbox
  placement or reputation outcomes.

## Development

```bash
node scripts/lint-skills.mjs        # frontmatter, name matches folder, description length, links
npx skills add . --list             # what the skills CLI discovers
```

CI runs both on every push and pull request. The base skill follows the agent guide published at
https://ayinbox.com/skill.md; keep the two in step.

## Links

- Docs: https://docs.ayinbox.com
- MCP server and every tool's scope: https://docs.ayinbox.com/api/mcp/
- Permissions: https://docs.ayinbox.com/api/permissions/
- Agent guide: https://ayinbox.com/skill.md
- Contact: team@ayinbox.com

## License

MIT. See [LICENSE](LICENSE).
