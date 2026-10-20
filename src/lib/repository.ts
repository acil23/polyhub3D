import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_ASSETS, INITIAL_PULL_REQUESTS } from './seedData';
import { Asset3D, PullRequest3D } from '@/types/polycode';

const LS_ASSETS_KEY = 'polycode_hub_assets_v03';
const LS_PRS_KEY = 'polycode_hub_prs_v03';

export async function fetchAllAssets(): Promise<Asset3D[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as Asset3D[];
  }

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

export async function saveNewAsset(newAsset: Asset3D, currentAssets: Asset3D[]): Promise<Asset3D[]> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('assets').insert([newAsset]);
  }
  const updated = [newAsset, ...currentAssets];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_ASSETS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function fetchAllPullRequests(): Promise<PullRequest3D[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('pull_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as PullRequest3D[];
  }

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
  pr: PullRequest3D,
  currentPRs: PullRequest3D[]
): Promise<PullRequest3D[]> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('pull_requests').insert([pr]);
  }
  const updated = [pr, ...currentPRs];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_PRS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export async function mergePullRequestRepo(
  pr: PullRequest3D,
  currentAssets: Asset3D[],
  currentPRs: PullRequest3D[]
): Promise<{ assets: Asset3D[]; prs: PullRequest3D[] }> {
  const updatedAssets = currentAssets.map((a) => {
    if (a.id !== pr.asset_id) return a;
    const parts = a.version.split('.').map(Number);
    const nextVer = `${parts[0]}.${(parts[1] || 0) + 1}.0`;
    const merged = { ...a, code: pr.proposed_code, version: nextVer };
    if (isSupabaseConfigured && supabase) {
      supabase.from('assets').update({ code: merged.code, version: merged.version }).eq('id', a.id);
    }
    return merged;
  });

  const updatedPRs = currentPRs.map((item) =>
    item.id === pr.id ? { ...item, status: 'merged' as const } : item
  );

  if (isSupabaseConfigured && supabase) {
    await supabase.from('pull_requests').update({ status: 'merged' }).eq('id', pr.id);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_ASSETS_KEY, JSON.stringify(updatedAssets));
    localStorage.setItem(LS_PRS_KEY, JSON.stringify(updatedPRs));
  }

  return { assets: updatedAssets, prs: updatedPRs };
}

export async function rejectPullRequestRepo(
  prId: string,
  currentPRs: PullRequest3D[]
): Promise<PullRequest3D[]> {
  const updatedPRs = currentPRs.map((item) =>
    item.id === prId ? { ...item, status: 'rejected' as const } : item
  );
  if (isSupabaseConfigured && supabase) {
    await supabase.from('pull_requests').update({ status: 'rejected' }).eq('id', prId);
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_PRS_KEY, JSON.stringify(updatedPRs));
  }
  return updatedPRs;
}

export function resetLocalDemoData(): { assets: Asset3D[]; prs: PullRequest3D[] } {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_ASSETS_KEY, JSON.stringify(INITIAL_ASSETS));
    localStorage.setItem(LS_PRS_KEY, JSON.stringify(INITIAL_PULL_REQUESTS));
  }
  return { assets: INITIAL_ASSETS, prs: INITIAL_PULL_REQUESTS };
}
