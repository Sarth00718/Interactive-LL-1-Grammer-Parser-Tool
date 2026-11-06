const BASE = '/api'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = (data && (data.detail?.error || data.detail?.message || data.error || data.detail)) || 'Request failed'
    const err = new Error(typeof message === 'string' ? message : JSON.stringify(message))
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
  health: () => get('/health'),
  examples: () => get('/examples'),

  // Grammar endpoints
  validateGrammar: (grammar_text, start_symbol) =>
    post('/grammar/validate', { grammar_text, start_symbol }),
  analyzeGrammar: (grammar_text, start_symbol) =>
    post('/grammar/analyze', { grammar_text, start_symbol }),

  // Top-Down LL(1)
  analyzeLL1: (grammar_text, start_symbol) =>
    post('/parser/ll1/analyze', { grammar_text, start_symbol }),
  parseLL1: (grammar_text, start_symbol, input_string) =>
    post('/parser/ll1/parse', { grammar_text, start_symbol, input_string }),

  // Bottom-Up Family
  analyzeLR0: (grammar_text, start_symbol) =>
    post('/parser/lr0/analyze', { grammar_text, start_symbol }),
  parseLR0: (grammar_text, start_symbol, input_string) =>
    post('/parser/lr0/parse', { grammar_text, start_symbol, input_string }),

  analyzeSLR1: (grammar_text, start_symbol) =>
    post('/parser/slr/analyze', { grammar_text, start_symbol }),
  parseSLR1: (grammar_text, start_symbol, input_string) =>
    post('/parser/slr/parse', { grammar_text, start_symbol, input_string }),

  analyzeCLR1: (grammar_text, start_symbol) =>
    post('/parser/clr/analyze', { grammar_text, start_symbol }),
  parseCLR1: (grammar_text, start_symbol, input_string) =>
    post('/parser/clr/parse', { grammar_text, start_symbol, input_string }),

  analyzeLALR1: (grammar_text, start_symbol) =>
    post('/parser/lalr/analyze', { grammar_text, start_symbol }),
  parseLALR1: (grammar_text, start_symbol, input_string) =>
    post('/parser/lalr/parse', { grammar_text, start_symbol, input_string }),

  // Multi-parser comparison
  compare: (grammar_text, start_symbol) =>
    post('/parser/compare', { grammar_text, start_symbol }),

  // Deep explanations
  explainCell: (grammar_text, start_symbol, non_terminal, terminal) =>
    post('/grammar/explain-cell', { grammar_text, start_symbol, non_terminal, terminal }),
  explainFirst: (grammar_text, start_symbol, non_terminal) =>
    post('/grammar/explain-first', { grammar_text, start_symbol, non_terminal }),
  explainFollow: (grammar_text, start_symbol, non_terminal) =>
    post('/grammar/explain-follow', { grammar_text, start_symbol, non_terminal }),

  // Backward compatibility aliases
  analyze: (grammar_text, start_symbol) =>
    post('/grammar/analyze', { grammar_text, start_symbol }),
  parse: (grammar_text, start_symbol, input_string) =>
    post('/parser/parse', { grammar_text, start_symbol, input_string }),
}
