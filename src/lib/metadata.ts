import { Asset3D, CurationStatus } from '@/types/polycode';

const META_PREFIX = '// @polycode-meta ';

export interface EmbeddedMeta {
  status: CurationStatus;
  authorUrl: string;
}

export function normalizeAuthorUrl(input?: string, fallbackAuthor?: string): string {
  const raw = (input || '').trim();
  if (!raw) {
    return fallbackAuthor ? `https://github.com/${fallbackAuthor.replace(/^@/, '')}` : '';
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  if (raw.startsWith('github.com/') || raw.startsWith('x.com/') || raw.startsWith('twitter.com/')) {
    return `https://${raw}`;
  }
  return `https://github.com/${raw.replace(/^@/, '')}`;
}

export function extractAssetMeta(rawCode: string, authorName: string): {
  cleanCode: string;
  status: CurationStatus;
  authorUrl: string;
} {
  if (!rawCode) {
    return {
      cleanCode: '',
      status: 'verified',
      authorUrl: normalizeAuthorUrl('', authorName)
    };
  }

  const lines = rawCode.split('\n');
  if (lines[0] && lines[0].startsWith(META_PREFIX)) {
    try {
      const jsonStr = lines[0].slice(META_PREFIX.length).trim();
      const parsed = JSON.parse(jsonStr);
      return {
        cleanCode: lines.slice(1).join('\n').trimStart(),
        status: parsed.status || 'verified',
        authorUrl: normalizeAuthorUrl(parsed.authorUrl, authorName)
      };
    } catch {}
  }

  return {
    cleanCode: rawCode,
    status: 'verified',
    authorUrl: normalizeAuthorUrl('', authorName)
  };
}

export function injectAssetMeta(cleanCode: string, meta: EmbeddedMeta): string {
  const stripped = extractAssetMeta(cleanCode, '').cleanCode;
  const header = `${META_PREFIX}${JSON.stringify({
    status: meta.status,
    authorUrl: meta.authorUrl
  })}`;
  return `${header}\n${stripped}`;
}

export function hydrateAssetRow(row: any): Asset3D {
  const { cleanCode, status, authorUrl } = extractAssetMeta(row.code || '', row.author_name || 'anonymous');
  return {
    ...row,
    code: cleanCode,
    curation_status: row.curation_status || status,
    author_url: row.author_url || authorUrl
  };
}

/**
 * Menormalisasi kode 3D (menghapus komentar & spasi) untuk mendeteksi duplikat 100%
 */
export function normalizeCodeSignature(code: string): string {
  const { cleanCode } = extractAssetMeta(code, '');
  return cleanCode
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
    .replace(/\s+/g, '')
    .trim();
}
