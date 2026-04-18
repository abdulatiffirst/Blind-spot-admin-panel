const INGEST_URL = 'http://127.0.0.1:7511/ingest/c22796fd-d934-4f19-a741-0adf490fd539'
const SESSION_ID = '76d30b'

export const agentLog = (payload) => {
  const body = JSON.stringify({
    sessionId: SESSION_ID,
    ...payload,
    timestamp: typeof payload.timestamp === 'number' ? payload.timestamp : Date.now(),
  })

  // Primary: Cursor debug ingest (may be unreachable from browser)
  // #region agent log
  fetch(INGEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': SESSION_ID,
    },
    body,
  }).catch(() => {})
  // #endregion

  // Secondary: Vite dev middleware -> workspace NDJSON log file
  if (import.meta.env.DEV) {
    // #region agent log
    fetch('/__debug/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }).catch(() => {})
    // #endregion
  }
}
