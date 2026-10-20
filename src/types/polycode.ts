export interface ParamSchemaItem {
  type: 'number' | 'color' | 'boolean';
  label: string;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
}

export type ParamSchema = Record<string, ParamSchemaItem>;
export type ParamValues = Record<string, any>;

export interface Asset3D {
  id: string;
  slug: string;
  title: string;
  category: 'Nature' | 'Sci-Fi' | 'Weapons' | 'Architecture' | 'Primitives';
  author_name: string;
  version: string;
  code: string;
  downloads: number;
  forked_from?: string | null;
  created_at: string;
}

export interface PullRequest3D {
  id: string;
  asset_id: string;
  asset_title?: string;
  author_name: string;
  title: string;
  description: string;
  proposed_code: string;
  status: 'open' | 'merged' | 'rejected';
  created_at: string;
}

export interface TelemetryStats {
  vertices: number;
  triangles: number;
  scriptSizeKB: string;
  compileTimeMs: number;
}
