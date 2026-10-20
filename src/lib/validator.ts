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
    return { valid: false, reason: 'Kode skrip 3D tidak boleh kosong.' };
  }
  if (code.length > 50000) {
    return { valid: false, reason: 'Ukuran skrip melebihi batas maksimum 50 KB.' };
  }
  if (!/function\s+createAsset\s*\(/.test(code)) {
    return { valid: false, reason: "Skrip wajib memiliki fungsi 'createAsset(THREE, p)'." };
  }
  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(code)) {
      return {
        valid: false,
        reason: `Security Sandbox Violation: Penggunaan API '${rule.name}' dilarang.`
      };
    }
  }
  return { valid: true };
}
