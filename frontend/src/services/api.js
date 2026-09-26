const BASE = '/api'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error((data && (data.detail?.error || data.error)) || 'Request failed')
    err.detail = data
    throw err
  }
  return data
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const err = new Error('Request failed')
    err.detail = data
    throw err
  }
  return data
}

export const api = {
  analyze: (grammar_text, start_symbol) => post('/grammar/analyze', { grammar_text, start_symbol }),
  parse: (grammar_text, start_symbol, input_string) =>
    post('/parser/parse', { grammar_text, start_symbol, input_string }),
  explainCell: (grammar_text, start_symbol, non_terminal, terminal) =>
    post('/grammar/explain-cell', { grammar_text, start_symbol, non_terminal, terminal }),
  explainFirst: (grammar_text, start_symbol, non_terminal) =>
    post('/grammar/explain-first', { grammar_text, start_symbol, non_terminal }),
  explainFollow: (grammar_text, start_symbol, non_terminal) =>
    post('/grammar/explain-follow', { grammar_text, start_symbol, non_terminal }),
  examples: () => get('/examples'),
}
