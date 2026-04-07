```bash
curl 'https://api.opusmax.pro/api/key-status?key=sk-ant-opm-nJPuOvPGRL89PBw4v_835TkpHhbRiCuS' 
```
Response:
```json
{
    "status": "found",
    "name": "Key_5",
    "keyPrefix": "sk-ant-opm-nJPuOvPGR",
    "isActive": true,
    "rateLimit": 60,
    "windowTokenLimit": "5000000",
    "windowTokensUsed": "127792",
    "windowStartedAt": "2026-04-07T04:56:24.642Z",
    "windowResetAt": "2026-04-07T09:56:24.642Z",
    "windowActive": true,
    "planName": "Max 5x Plan",
    "expiresAt": "2026-05-04T04:13:37.002Z",
    "lastUsedAt": "2026-04-07T05:18:02.515Z",
    "createdAt": "2026-04-04T04:13:37.003Z",
    "isExpired": false,
    "isOverLimit": false,
    "totalRequests": 80,
    "last24h": {
        "requests": 28,
        "tokensIn": 271828,
        "tokensOut": 7177,
        "totalTokens": 619000,
        "avgLatencyMs": 7858
    },
    "recentLogs": [
        {
            "model": "Opus 4.6",
            "tokensIn": 10407,
            "tokensOut": 198,
            "total": 33329,
            "latency": 6201,
            "status": 200,
            "time": "2026-04-07T05:18:02.515Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 10216,
            "tokensOut": 155,
            "total": 33095,
            "latency": 5056,
            "status": 200,
            "time": "2026-04-07T05:17:54.946Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 9605,
            "tokensOut": 93,
            "total": 32422,
            "latency": 4300,
            "status": 200,
            "time": "2026-04-07T05:17:49.518Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 121,
            "tokensOut": 334,
            "total": 32252,
            "latency": 9037,
            "status": 200,
            "time": "2026-04-07T05:17:42.811Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 8823,
            "tokensOut": 157,
            "total": 31704,
            "latency": 5749,
            "status": 200,
            "time": "2026-04-07T05:11:07.025Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 8586,
            "tokensOut": 191,
            "total": 31501,
            "latency": 4825,
            "status": 200,
            "time": "2026-04-07T05:10:59.959Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 121,
            "tokensOut": 169,
            "total": 30795,
            "latency": 6056,
            "status": 200,
            "time": "2026-04-07T05:10:49.619Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 17918,
            "tokensOut": 348,
            "total": 18266,
            "latency": 9148,
            "status": 200,
            "time": "2026-04-07T05:05:14.975Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 16874,
            "tokensOut": 1001,
            "total": 17875,
            "latency": 22609,
            "status": 200,
            "time": "2026-04-07T05:05:04.461Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 15804,
            "tokensOut": 70,
            "total": 15874,
            "latency": 3325,
            "status": 200,
            "time": "2026-04-07T05:04:41.553Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 15301,
            "tokensOut": 99,
            "total": 15400,
            "latency": 2998,
            "status": 200,
            "time": "2026-04-07T05:04:37.885Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 14586,
            "tokensOut": 316,
            "total": 14902,
            "latency": 10493,
            "status": 200,
            "time": "2026-04-07T05:02:56.026Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 13005,
            "tokensOut": 84,
            "total": 13089,
            "latency": 4152,
            "status": 200,
            "time": "2026-04-07T05:02:44.902Z"
        },
        {
            "model": "Opus 4.6",
            "tokensIn": 11502,
            "tokensOut": 238,
            "total": 11740,
            "latency": 7695,
            "status": 200,
            "time": "2026-04-07T05:02:38.359Z"
        },
        {
            "model": "Haiku 4.5",
            "tokensIn": 13786,
            "tokensOut": 1439,
            "total": 26960,
            "latency": 27784,
            "status": 200,
            "time": "2026-04-07T05:02:30.363Z"
        },
        {
            "model": "Haiku 4.5",
            "tokensIn": 13481,
            "tokensOut": 89,
            "total": 25305,
            "latency": 3782,
            "status": 200,
            "time": "2026-04-07T05:02:02.257Z"
        },
        {
            "model": "Haiku 4.5",
            "tokensIn": 12763,
            "tokensOut": 65,
            "total": 24563,
            "latency": 3529,
            "status": 200,
            "time": "2026-04-07T05:01:58.169Z"
        },
        {
            "model": "Haiku 4.5",
            "tokensIn": 12579,
            "tokensOut": 103,
            "total": 24417,
            "latency": 3311,
            "status": 200,
            "time": "2026-04-07T05:01:54.337Z"
        },
        {
            "model": "Haiku 4.5",
            "tokensIn": 12136,
            "tokensOut": 120,
            "total": 23991,
            "latency": 6444,
            "status": 200,
            "time": "2026-04-07T05:01:50.759Z"
        },
        {
            "model": "Haiku 4.5",
            "tokensIn": 10830,
            "tokensOut": 89,
            "total": 22654,
            "latency": 4228,
            "status": 200,
            "time": "2026-04-07T05:01:43.880Z"
        }
    ]
}
```