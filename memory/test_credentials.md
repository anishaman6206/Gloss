# Gloss — Test Credentials

## Test User (seeded via `node scripts/seed-test-user.mjs`)
- **Email**: `demo@gloss.app`
- **Name**: Demo Reader
- **Auth**: Emergent-managed Google (no password). For automated testing, use the pre-seeded session token.
- **Session token (cookie name `session_token`)**: `test_session_gloss_demo`
- **Expires**: 7 days from seed.

## Injecting the session for browser tests
```python
await page.context.add_cookies([{
    "name": "session_token",
    "value": "test_session_gloss_demo",
    "domain": "localhost",       # or your preview host
    "path": "/",
    "httpOnly": True,
    "secure": False,             # True in preview/prod (HTTPS)
    "sameSite": "Lax",           # "None" over HTTPS
}])
```

## API examples
```bash
# Session identity
curl -s http://localhost:3000/api/auth/me --cookie "session_token=test_session_gloss_demo"

# Definition lookup (no auth required)
curl -sX POST http://localhost:3000/api/define \
  -H 'Content-Type: application/json' \
  -d '{"phrase":"gloss","sentence":"She added a quick gloss in the margin."}'
```

## Seeded content
- 3 sample words in the demo user's library: `ephemeral`, `gloss`, `obfuscate`
- 3 review logs (streak of 3 days)
- Trial: 7 days from seed

## Re-seed
```bash
node scripts/seed-test-user.mjs demo@gloss.app test_session_gloss_demo
```
