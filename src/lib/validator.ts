const FORBIDDEN_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /\bwindow\b/, name: 'window' },
  { pattern: /\bdocument\b/, name: 'document' },
  { pattern: /\bfetch\b/, name: 'fetch()' },
  { pattern: /\bXMLHttpRequest\b/, name: 'XMLHttpRequest' },
  { pattern: /\blocalStorage\b/, name: 'localStorage' },
  { pattern: /\bsessionStorage\b/, name: 'sessionStorage' },
  { pattern: /\bindexedDB\b/, name: 'indexedDB' },
  { pattern: /\beval\b/, name: 'eval()' },
  { pattern: /\bFunction\b/, name: 'Function constructor' },
  { pattern: /\bWebSocket\b/, name: 'WebSocket' },
  { pattern: /\bnavigator\b/, name: 'navigator' },
  { pattern: /\blocation\b/, name: 'location' },
  { pattern: /\bcookie\b/, name: 'cookie' },
  { pattern: /\bprocess\b/, name: 'process' },
  { pattern: /\brequire\b/, name: 'require()' },
];

export function validateProceduralScript(code: string): { valid: boolean; reason?: string } {
  if (!code || typeof code !== 'string') {
    return { valid: false, reason: '3D script code cannot be empty.' };
  }
  if (code.length > 50000) {
    return { valid: false, reason: 'Script size exceeds the 50 KB maximum limit.' };
  }
  if (!/function\s+createAsset\s*\(/.test(code)) {
    return { valid: false, reason: "Script must define a 'createAsset(THREE, p)' function." };
  }
  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(code)) {
      return {
        valid: false,
        reason: `Security Sandbox Violation: Usage of '${rule.name}' is forbidden inside 3D scripts.`
      };
    }
  }
  return { valid: true };
}
