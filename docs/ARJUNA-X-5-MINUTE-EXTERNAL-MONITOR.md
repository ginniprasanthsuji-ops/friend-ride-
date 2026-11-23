# ARJUNA X 5-minute external monitor (n8n starter)

This starter is **monitor-only**. It runs every 5 minutes, queries recent QA-branch commits and GitHub Actions runs, and asks the OpenAI API to summarize the status in the n8n execution output. It does **not** write code, create PRs, change Supabase, merge, or deploy.

## Import
1. In n8n, create/import a workflow and import `automation/n8n/arjuna-x-5-minute-monitor.json`.
2. Configure environment variables in the n8n deployment (do not paste secrets into the workflow or chat):
   - `ARJUNA_GITHUB_TOKEN`: fine-grained GitHub PAT, repository-only for `friend-ride-`, read-only Contents and Actions permissions.
   - `ARJUNA_OPENAI_API_KEY`: OpenAI API key with API access and billing configured.
3. If your n8n host disallows environment-variable access in HTTP expressions, replace the two Authorization headers with n8n credential objects (Header Auth credentials), one for GitHub and one for OpenAI. Never expose credentials in node output.
4. Test manually once; inspect execution output and errors. Then activate workflow to enable the 5-minute schedule.
5. Verify schedule timezone in n8n (recommended UTC; timestamps in report are ISO).

## Safety / next phase
- Only branch `arjuna-x/phase-2-repository-assets-inventory` is queried.
- Monitor-only: no AI code-editing actions, issue/PR creation, merge, deployment, or database write.
- n8n AI API calls incur provider usage charges. GitHub API limits apply.
- Next upgrade only after monitor proves reliable: create a separate human-reviewed task/PR workflow with strict allow-list, patch-size limit, tests, no production credentials, and no auto-merge.

## Troubleshooting
- GitHub 401/403: token scope/permissions or API rate limit.
- OpenAI 401/429: key/billing/rate limit.
- No execution output: check workflow activation, schedule timezone and n8n host uptime.
- Starter workflow uses OpenAI Responses API model name `gpt-6-mini`; if unavailable to your API account, change to an available model before activation.
