# CHAEVI Public Remote MCP v0.1.0

Stateless, read-only advisory MCP transport for the **public** CHAEVI v0.3 routing and goal-classification code. No private CAN-80 policy, account data, credentials, model quota or internal dispatch state is embedded. This is *not* a substitute for the authoritative internal resource-selection policy.

## Endpoints

- `POST /mcp`: Streamable HTTP (JSON responses); methods: `initialize`, `ping`, `tools/list`, `tools/call`, notifications.
- `GET /health`: public capability and health summary.
- `GET /mcp`: 405; SSE is intentionally not supported.

Tools: `route_task` (advisory surface, tool, model capability and preflight), `recommend_goal_actions` (up to five Now/Next/Later suggestions using copied public v0.3 classifier), `get_capabilities`.

The MCP Worker deliberately embeds a versioned extract of the current public web routing logic. **Parity must be reviewed when the web UI changes**; the longer-term refactor should move this into a shared public core. All *exact* model recommendations are currently PROVISIONAL pending live provider availability. Public tools do not execute an external action, store prompts, or accept credentials.

## Test

```bash
node --test tests/mcp-worker.test.mjs
npm run lint
```

## Deploy and connect

Cloudflare Worker `chaevi-mcp` deployed on 2026-10-22 from this branch and its public HTTPS health endpoint was verified independently.

- Remote MCP: `https://chaevi-mcp.aldol-lab.workers.dev/mcp`
- Health: `https://chaevi-mcp.aldol-lab.workers.dev/health`

Connect a custom remote MCP from ChatGPT web Plugins, or install a separately distributed private plugin where supported. Plugin creation, endpoint health and an actual `tools/call` invocation are separate validation steps. Set authentication to none **only because these tools are public and read-only**. Do not enable private data or write tools without authenticated authorization. As of 2026-10-22, official ChatGPT custom-MCP documentation describes web support, not native mobile availability. Do not claim Android ChatGPT tool invocation is validated; verify separately if the platform changes.

The Worker name/host used in deployment is operational state, not defined by this source file. Consult the deployment evidence before claiming it is live.
