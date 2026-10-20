import { INITIAL_ASSETS, INITIAL_PULL_REQUESTS } from './seedData';
import { Asset3D, PullRequest3D } from '@/types/polycode';

const LS_ASSETS_KEY = 'polycode_hub_assets_v042';
const LS_PRS_KEY = 'polycode_hub_prs_v042';

export interface BackendStatus {
  connected: boolean;
  mode: 'supabase_cloud' | 'schema_missing' | 'local_fallback';
  message: string;
}

export async function checkBackendHealth(): Promise<BackendStatus> {
  try {
    const res = await fetch('/api/health', { cache: 'no-store' });
    return await res.json();
  } catch {
    return {
      connected: false,
      mode: 'local_fallback',
      message: 'Berjalan dalam Local Hybrid Mode.'
    };
  }
}

export async function fetchAllAssets(): Promise<Asset3D[]> {
  try {
    const res = await fetch('/api/assets', { cache: 'no-store' });
    const data = await res.json();
    if (data.assets && Array.isArray(data.assets)) {
      if (data.source === 'supabase_cloud' || data.source === 'supabase_seeded') {
        return data.assets;
      }
    }
  } catch {}

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LS_ASSETS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    localStorage.setItem(LS_ASSETS_KEY, JSON.stringify(INITIAL_ASSETS));
  }
  return INITIAL_ASSETS;
}

export async function saveNewAsset(
  payload: {
    title: string;
    category: Asset3D['category'];
    author_name: string;
    author_url?: string;
    code: string;
    forked_from?: string;
    admin_pin?: string;
  },
  currentAssets: Asset3D[]
): Promise<{ assets: Asset3D[]; created: Asset3D }> {
  const res = await fetch('/api/assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal menyimpan aset 3D');
  }

  const created: Asset3D = data.asset;
  const updated = [created, ...currentAssets];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_ASSETS_KEY, JSON.stringify(updated));
  }
  return { assets: updated, created };
}

export async function moderateAssetRepo(
  assetId: string,
  action: 'approve' | 'delete',
  adminPin: string,
  currentAssets: Asset3D[]
): Promise<Asset3D[]> {
  const res = await fetch(`/api/assets/${assetId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, admin_pin: adminPin })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal memproses moderasi aset');
  }

  const updated =
    action === 'delete'
      ? currentAssets.filter((a) => a.id !== assetId)
      : currentAssets.map((a) =>
          a.id === assetId ? { ...a, curation_status: 'verified' as const } : a
        );

  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_ASSETS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function fetchAllPullRequests(): Promise<PullRequest3D[]> {
  try {
    const res = await fetch('/api/pull-requests', { cache: 'no-store' });
    const data = await res.json();
    if (data.pullRequests && Array.isArray(data.pullRequests)) {
      if (data.source === 'supabase_cloud' || data.source === 'supabase_seeded') {
        return data.pullRequests;
      }
    }
  } catch {}

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LS_PRS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    localStorage.setItem(LS_PRS_KEY, JSON.stringify(INITIAL_PULL_REQUESTS));
  }
  return INITIAL_PULL_REQUESTS;
}

export async function createNewPullRequest(
  payload: {
    asset_id: string;
    asset_title: string;
    author_name: string;
    author_url?: string;
    title: string;
    description: string;
    proposed_code: string;
  },
  currentPRs: PullRequest3D[]
): Promise<{ prs: PullRequest3D[]; created: PullRequest3D }> {
  const res = await fetch('/api/pull-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal mengirim Pull Request');
  }

  const created: PullRequest3D = data.pullRequest;
  const updated = [created, ...currentPRs];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_PRS_KEY, JSON.stringify(updated));
  }
  return { prs: updated, created };
}

export async function mergePullRequestRepo(
  pr: PullRequest3D,
  adminPin: string,
  currentAssets: Asset3D[],
  currentPRs: PullRequest3D[]
): Promise<{ assets: Asset3D[]; prs: PullRequest3D[] }> {
  const targetAsset = currentAssets.find((a) => a.id === pr.asset_id);
  const res = await fetch(`/api/pull-requests/${pr.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'merge',
      admin_pin: adminPin,
      asset_id: pr.asset_id,
      current_version: targetAsset?.version || '1.0.0',
      proposed_code: pr.proposed_code,
      title: pr.title
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal melakukan Merge PR');
  }

  const updatedAssets = currentAssets.map((a) =>
    a.id === pr.asset_id ? { ...a, code: pr.proposed_code, version: data.nextVersion } : a
  );
  const updatedPRs = currentPRs.map((item) =>
    item.id === pr.id ? { ...item, status: 'merged' as const } : item
  );

  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_ASSETS_KEY, JSON.stringify(updatedAssets));
    localStorage.setItem(LS_PRS_KEY, JSON.stringify(updatedPRs));
  }

  return { assets: updatedAssets, prs: updatedPRs };
}

export async function rejectPullRequestRepo(
  prId: string,
  adminPin: string,
  currentPRs: PullRequest3D[]
): Promise<PullRequest3D[]> {
  const res = await fetch(`/api/pull-requests/${prId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reject', admin_pin: adminPin })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Gagal menolak Pull Request');
  }

  const updatedPRs = currentPRs.map((item) =>
    item.id === prId ? { ...item, status: 'rejected' as const } : item
  );
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_PRS_KEY, JSON.stringify(updatedPRs));
  }
  return updatedPRs;
}
