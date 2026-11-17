import { useState, useEffect, useCallback } from 'react';

export interface TesseraTier {
  name: string;
  count: number;
}

export interface TesseraRoleBoost {
  roleName: string;
  multiplier: number;
}

export interface TesseraRequirement {
  id: string;
  type: string;
  label: string;
  value: string;
  guildName: string | null;
  inviteLink: string | null;
  tweetId: string | null;
}

export interface TesseraRaffle {
  raffleId: string;
  slug: string;
  title: string;
  description: string;
  raffleUrl: string;
  status: 'active' | 'ended';
  createdAt: string;
  startAt: string;
  endAt: string;
  endedAt: string | null;
  entryCount: number;
  participantCount: number;
  winnerCount: number;
  tiers: TesseraTier[];
  drawn: boolean;
  requiredWalletType: string;
  image: string;
  banner: string | null;
  teamName: string;
  teamId: string;
  teamPfp: string;
  discordInvite: string;
  partnerXHandle: string | null;
  runner: {
    displayName: string;
    discordUsername: string;
    discordId: string;
    xUsername: string;
  };
  roleBoosts: TesseraRoleBoost[];
  requirements: TesseraRequirement[];
}

export interface TesseraWinner {
  rank: number;
  username: string;
  discordId: string;
  xHandle: string;
  wallet: string;
  tierName: string;
  status: string;
}

export interface TesseraRafflesState {
  activeRaffles: TesseraRaffle[];
  endedRaffles: TesseraRaffle[];
  stats: {
    activeCount: number;
    endedCount: number;
    totalActiveWinners: number;
    totalActiveEntries: number;
  };
  syncedAt: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fetchWinners: (idOrSlug: string) => Promise<{
    ready: boolean;
    winnerCount: number;
    winners: TesseraWinner[];
    reason?: string;
  }>;
}

const INITIAL_ACTIVE_RAFFLES: TesseraRaffle[] = [];

const INITIAL_ENDED_RAFFLES: TesseraRaffle[] = [];

let sharedCache: {
  activeRaffles: TesseraRaffle[];
  endedRaffles: TesseraRaffle[];
  stats: {
    activeCount: number;
    endedCount: number;
    totalActiveWinners: number;
    totalActiveEntries: number;
  };
  syncedAt: string | null;
} | null = null;

export function useTesseraRaffles(): TesseraRafflesState {
  const [activeRaffles, setActiveRaffles] = useState<TesseraRaffle[]>(
    sharedCache?.activeRaffles ?? INITIAL_ACTIVE_RAFFLES
  );
  const [endedRaffles, setEndedRaffles] = useState<TesseraRaffle[]>(
    sharedCache?.endedRaffles ?? INITIAL_ENDED_RAFFLES
  );
  const [stats, setStats] = useState(
    sharedCache?.stats ?? {
      activeCount: 0,
      endedCount: 0,
      totalActiveWinners: 0,
      totalActiveEntries: 0,
    }
  );
  const [syncedAt, setSyncedAt] = useState<string | null>(
    sharedCache?.syncedAt ?? null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!sharedCache);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadRaffles = useCallback(async (force = false) => {
    try {
      if (force) {
        setIsRefreshing(true);
      }
      setError(null);
      const url = force
        ? '/api/tessera/raffles?refresh=1'
        : '/api/tessera/raffles';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.activeRaffles)) {
        setActiveRaffles(data.activeRaffles);
        setEndedRaffles(Array.isArray(data.endedRaffles) ? data.endedRaffles : []);
        const nextStats = data.stats || {
          activeCount: data.activeRaffles.length,
          endedCount: Array.isArray(data.endedRaffles)
            ? data.endedRaffles.length
            : 0,
          totalActiveWinners: data.activeRaffles.reduce(
            (acc: number, r: TesseraRaffle) => acc + (r.winnerCount || 0),
            0
          ),
          totalActiveEntries: data.activeRaffles.reduce(
            (acc: number, r: TesseraRaffle) => acc + (r.entryCount || 0),
            0
          ),
        };
        setStats(nextStats);
        setSyncedAt(data.syncedAt || new Date().toISOString());
        sharedCache = {
          activeRaffles: data.activeRaffles,
          endedRaffles: Array.isArray(data.endedRaffles) ? data.endedRaffles : [],
          stats: nextStats,
          syncedAt: data.syncedAt || new Date().toISOString(),
        };
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to reach Tessera sync service');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRaffles(false);
    const interval = setInterval(() => {
      loadRaffles(false);
    }, 45_000);
    return () => clearInterval(interval);
  }, [loadRaffles]);

  const refresh = useCallback(async () => {
    await loadRaffles(true);
  }, [loadRaffles]);

  const fetchWinners = useCallback(async (idOrSlug: string) => {
    try {
      const res = await fetch(
        `/api/tessera/raffles/${encodeURIComponent(idOrSlug)}/winners`
      );
      if (!res.ok) {
        return { ready: false, winnerCount: 0, winners: [], reason: 'error' };
      }
      const data = await res.json();
      return {
        ready: Boolean(data.ready),
        winnerCount: Number(data.winnerCount || 0),
        winners: Array.isArray(data.winners) ? data.winners : [],
        reason: data.reason,
      };
    } catch {
      return { ready: false, winnerCount: 0, winners: [], reason: 'error' };
    }
  }, []);

  return {
    activeRaffles,
    endedRaffles,
    stats,
    syncedAt,
    isLoading,
    isRefreshing,
    error,
    refresh,
    fetchWinners,
  };
}
