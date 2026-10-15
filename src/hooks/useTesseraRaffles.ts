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

const INITIAL_ACTIVE_RAFFLES: TesseraRaffle[] = [
  {
    raffleId: 'd231efe8-afd3-439a-9fe0-e4353ccd2c70',
    slug: 'onchainpigarc-dc70',
    title: 'Onchainpigarc',
    description:
      'Pigarc is an NFT ecosystem built around 4,888 unique Pig NFTs, with each Pig connected to its own Property NFT. 4,888 Pigs. 4,888 Properties. One Connected Economy.\nChain - Robinhood • Supply - 4,888',
    raffleUrl: 'https://tesserapp.org/raffle/onchainpigarc-dc70',
    status: 'active',
    createdAt: '2026-09-30T13:29:58.908071',
    startAt: '2026-09-30T13:29:58.908071',
    endAt: '2026-10-01T13:29:00Z',
    endedAt: null,
    entryCount: 60,
    participantCount: 60,
    winnerCount: 28,
    tiers: [
      { name: 'FCFS', count: 20 },
      { name: 'GTD', count: 8 },
    ],
    drawn: false,
    requiredWalletType: 'EVM',
    image:
      'https://pbs.twimg.com/profile_images/2102063268990742528/rvR_fkFe_400x400.jpg',
    banner:
      'https://pbs.twimg.com/profile_banners/2099781966530777088/1790006501/1500x500',
    teamName: 'Alpha Collectiv3',
    teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp:
      'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg',
    discordInvite: 'https://discord.gg/jKxXGAanth',
    partnerXHandle: 'Onchainpigarc',
    runner: {
      displayName: 'NFTGuro',
      discordUsername: 'NFTGuro',
      discordId: '1541106547990470762',
      xUsername: 'NFTGuroETH',
    },
    roleBoosts: [
      { roleName: 'Metal Core', multiplier: 5 },
      { roleName: 'Alpha (Boosters)', multiplier: 3 },
      { roleName: 'Spark', multiplier: 2 },
      { roleName: 'Alpha Army', multiplier: 1 },
    ],
    requirements: [
      {
        id: 'discord_linked_req',
        type: 'discord_linked',
        label: 'Discord account required',
        value: '',
        guildName: null,
        inviteLink: null,
        tweetId: null,
      },
      {
        id: 'discord_server_req',
        type: 'discord_server',
        label:
          'Have any of: Alpha (Boosters), Alpha Army, Spark, Metal Core in AlphaCollective',
        value: '1505079950317715589',
        guildName: 'AlphaCollective',
        inviteLink: 'https://discord.gg/AlphaCollective',
        tweetId: null,
      },
      {
        id: 'twitter_follow_alpha',
        type: 'twitter_follow',
        label: 'Follow @AlphaCollectiv3 on X',
        value: 'AlphaCollectiv3',
        guildName: null,
        inviteLink: null,
        tweetId: null,
      },
    ],
  },
  {
    raffleId: '7b2b0db2-a89f-4e59-b07c-c2a28eadc496',
    slug: 'tokesuworld',
    title: 'Tokesuworld',
    description:
      'Official Alpha Collectiv3 partner allowlist raffle for Tokesuworld on Tessera.',
    raffleUrl: 'https://tesserapp.org/raffle/tokesuworld',
    status: 'active',
    createdAt: '2026-09-30T11:15:42.493110',
    startAt: '2026-09-30T11:15:42.493110',
    endAt: '2026-10-01T11:15:00Z',
    endedAt: null,
    entryCount: 64,
    participantCount: 64,
    winnerCount: 10,
    tiers: [
      { name: 'FCFS', count: 7 },
      { name: 'GTD', count: 3 },
    ],
    drawn: false,
    requiredWalletType: 'EVM',
    image:
      'https://pbs.twimg.com/profile_images/2102353323089170432/OLi2IQCd_400x400.jpg',
    banner:
      'https://pbs.twimg.com/profile_banners/2101324319162777600/1790075068/1500x500',
    teamName: 'Alpha Collectiv3',
    teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp:
      'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg',
    discordInvite: 'https://discord.gg/jKxXGAanth',
    partnerXHandle: 'tokesuworld',
    runner: {
      displayName: 'NFTGuro',
      discordUsername: 'NFTGuro',
      discordId: '1541106547990470762',
      xUsername: 'NFTGuroETH',
    },
    roleBoosts: [
      { roleName: 'Metal Core', multiplier: 5 },
      { roleName: 'Alpha (Boosters)', multiplier: 3 },
      { roleName: 'Spark', multiplier: 2 },
      { roleName: 'Alpha Army', multiplier: 1 },
    ],
    requirements: [
      {
        id: 'discord_linked_req',
        type: 'discord_linked',
        label: 'Discord account required',
        value: '',
        guildName: null,
        inviteLink: null,
        tweetId: null,
      },
      {
        id: 'discord_server_req',
        type: 'discord_server',
        label:
          'Have any of: Alpha (Boosters), Alpha Army, Spark, Metal Core in AlphaCollective',
        value: '1505079950317715589',
        guildName: 'AlphaCollective',
        inviteLink: 'https://discord.gg/AlphaCollective',
        tweetId: null,
      },
    ],
  },
];

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
    sharedCache?.endedRaffles ?? []
  );
  const [stats, setStats] = useState(
    sharedCache?.stats ?? {
      activeCount: INITIAL_ACTIVE_RAFFLES.length,
      endedCount: 0,
      totalActiveWinners: 38,
      totalActiveEntries: 124,
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
