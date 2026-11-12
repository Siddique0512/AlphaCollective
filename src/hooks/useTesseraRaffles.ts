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
    raffleId: '391aa356-7a04-484a-8439-f2c346708e9f',
    slug: 'memefunds-alphacollective',
    title: 'MemeFunds <> AlphaCollective',
    description:
      'Official Alpha Collective partner allowlist raffle for MemeFunds on Tessera.',
    raffleUrl: 'https://tesserapp.org/raffle/memefunds-alphacollective',
    status: 'active',
    createdAt: '2026-11-11T14:43:00Z',
    startAt: '2026-11-11T14:43:00Z',
    endAt: '2026-11-12T14:43:00Z',
    endedAt: null,
    entryCount: 105,
    participantCount: 105,
    winnerCount: 11,
    tiers: [{ name: 'Standard WL', count: 11 }],
    drawn: false,
    requiredWalletType: 'EVM',
    image:
      'https://pbs.twimg.com/profile_images/2117970542687088640/4ernvgEM_400x400.jpg',
    banner:
      'https://pbs.twimg.com/profile_banners/2117903502005411840/1793787146/1500x500',
    teamName: 'AlphaCollective',
    teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp:
      'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg',
    discordInvite: 'https://discord.gg/jKxXGAanth',
    partnerXHandle: 'MemeFundsHQ',
    runner: {
      displayName: '𝐆𝖚𝖗𝖔',
      discordUsername: 'NFTGuro',
      discordId: '1541106547990470762',
      xUsername: 'NFTGuroETH',
    },
    roleBoosts: [
      { roleName: 'Gem', multiplier: 8 },
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
          'Have any of: Spark, Alpha Army, Alpha (Boosters), Metal Core, Gem in AlphaCollective',
        value: '1505079950317715589',
        guildName: 'AlphaCollective',
        inviteLink: 'https://discord.gg/AlphaCollective',
        tweetId: null,
      },
    ],
  },
  {
    raffleId: '53a4e52d-d3ce-4af1-b34f-e65335d986ac',
    slug: 'alpha-collective-x-foomeapp',
    title: 'Alpha Collective x Foomeapp',
    description:
      'Official Alpha Collective partner allowlist raffle for Foomeapp on Tessera.',
    raffleUrl: 'https://tesserapp.org/raffle/alpha-collective-x-foomeapp',
    status: 'active',
    createdAt: '2026-11-11T07:07:00Z',
    startAt: '2026-11-11T07:07:00Z',
    endAt: '2026-11-13T07:07:00Z',
    endedAt: null,
    entryCount: 64,
    participantCount: 64,
    winnerCount: 10,
    tiers: [{ name: 'Standard WL', count: 10 }],
    drawn: false,
    requiredWalletType: 'EVM',
    image:
      'https://pbs.twimg.com/profile_images/2115222296918888449/A1o5fOVs_400x400.jpg',
    banner:
      'https://pbs.twimg.com/profile_banners/2115221513288757248/1793143576/1500x500',
    teamName: 'AlphaCollective',
    teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp:
      'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg',
    discordInvite: 'https://discord.gg/jKxXGAanth',
    partnerXHandle: 'Foomeapp',
    runner: {
      displayName: '𝐆𝖚𝖗𝖔',
      discordUsername: 'NFTGuro',
      discordId: '1541106547990470762',
      xUsername: 'NFTGuroETH',
    },
    roleBoosts: [
      { roleName: 'Gem', multiplier: 8 },
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
          'Have any of: Spark, Alpha Army, Alpha (Boosters), Metal Core, Gem in AlphaCollective',
        value: '1505079950317715589',
        guildName: 'AlphaCollective',
        inviteLink: 'https://discord.gg/AlphaCollective',
        tweetId: null,
      },
    ],
  },
];

const INITIAL_ENDED_RAFFLES: TesseraRaffle[] = [
  {
    raffleId: '41bd2217-cc48-461e-9092-72e8e56274a2',
    slug: 'sindicatgame-alphacollective',
    title: 'Sindicatgame <> AlphaCollective',
    description:
      "We're thrilled to announce our collaboration with @sindicatgame on their upcoming collection!\n\nSINDICAT is a pixel-art P2E set in a city of mafia cats. Dynamic NFT mint and TGE on Robinhood Chain... Grow catnip, sell hacked data, and bank your cash before the dogs catch you.",
    raffleUrl: 'https://tesserapp.org/raffle/sindicatgame-alphacollective',
    status: 'ended',
    createdAt: '2026-11-10T14:53:42.422302Z',
    startAt: '2026-11-10T14:53:42.422302Z',
    endAt: '2026-11-11T14:53:00Z',
    endedAt: '2026-11-11T14:53:57.952278Z',
    entryCount: 106,
    participantCount: 106,
    winnerCount: 10,
    tiers: [{ name: 'Standard WL', count: 10 }],
    drawn: true,
    requiredWalletType: 'EVM',
    image:
      'https://pbs.twimg.com/profile_images/2118586915914149888/JEbz_0Gb_400x400.jpg',
    banner:
      'https://pbs.twimg.com/profile_banners/2105344718158864385/1793945458/1500x500',
    teamName: 'AlphaCollective',
    teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp:
      'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg',
    discordInvite: 'https://discord.gg/jKxXGAanth',
    partnerXHandle: 'sindicatgame',
    runner: {
      displayName: '𝐆𝖚𝖗𝖔',
      discordUsername: 'NFTGuro',
      discordId: '1541106547990470762',
      xUsername: 'NFTGuroETH',
    },
    roleBoosts: [
      { roleName: 'Gem', multiplier: 8 },
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
          'Have any of: Spark, Alpha Army, Alpha (Boosters), Metal Core, Gem in AlphaCollective',
        value: '1505079950317715589',
        guildName: 'AlphaCollective',
        inviteLink: 'https://discord.gg/3xVdcwzUa',
        tweetId: null,
      },
      {
        id: 'twitter_follow_req',
        type: 'twitter_follow',
        label: 'Follow @sindicatgame on X',
        value: 'sindicatgame',
        guildName: null,
        inviteLink: null,
        tweetId: null,
      },
    ],
  },
  {
    raffleId: '11f90193-1ae1-42c5-8f7a-e7a8ad7537f6',
    slug: 'alpha-collective-x-hall-of-ash-fcfs',
    title: 'Alpha Collective x hall of ash Fcfs',
    description:
      'Official Alpha Collective partner allowlist raffle for Hall of Ash on Tessera.',
    raffleUrl: 'https://tesserapp.org/raffle/alpha-collective-x-hall-of-ash-fcfs',
    status: 'ended',
    createdAt: '2026-11-10T12:32:00Z',
    startAt: '2026-11-10T12:32:00Z',
    endAt: '2026-11-11T12:32:00Z',
    endedAt: '2026-11-11T12:32:00Z',
    entryCount: 85,
    participantCount: 85,
    winnerCount: 5,
    tiers: [{ name: 'FCFS', count: 5 }],
    drawn: false,
    requiredWalletType: 'EVM',
    image:
      'https://pbs.twimg.com/profile_images/2117845251293339648/bZ9fSnqS_400x400.jpg',
    banner:
      'https://pbs.twimg.com/profile_banners/2115847946067447809/1793721482/1500x500',
    teamName: 'AlphaCollective',
    teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp:
      'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg',
    discordInvite: 'https://discord.gg/jKxXGAanth',
    partnerXHandle: 'hallofash',
    runner: {
      displayName: '!! KARAN',
      discordUsername: 'karan',
      discordId: '815416692929724476',
      xUsername: '',
    },
    roleBoosts: [
      { roleName: 'Gem', multiplier: 8 },
      { roleName: 'Metal Core', multiplier: 5 },
      { roleName: 'Alpha (Boosters)', multiplier: 3 },
      { roleName: 'Spark', multiplier: 2 },
      { roleName: 'Alpha Army', multiplier: 1 },
    ],
    requirements: [
      {
        id: 'discord_server_req',
        type: 'discord_server',
        label:
          'Have any of: Spark, Alpha Army, Alpha (Boosters), Metal Core, Gem in AlphaCollective',
        value: '1505079950317715589',
        guildName: 'AlphaCollective',
        inviteLink: 'https://discord.gg/AlphaCollective',
        tweetId: null,
      },
    ],
  },
  {
    raffleId: 'b2c56a15-4cbf-48d8-a5af-734867b3adec',
    slug: 'foome-alphacollective',
    title: 'Foome <> AlphaCollective',
    description:
      'Official Alpha Collective partner allowlist raffle for Foome on Tessera.',
    raffleUrl: 'https://tesserapp.org/raffle/foome-alphacollective',
    status: 'ended',
    createdAt: '2026-11-09T16:58:00Z',
    startAt: '2026-11-09T16:58:00Z',
    endAt: '2026-11-10T16:58:00Z',
    endedAt: '2026-11-10T17:58:02Z',
    entryCount: 63,
    participantCount: 63,
    winnerCount: 13,
    tiers: [{ name: 'Standard WL', count: 13 }],
    drawn: true,
    requiredWalletType: 'EVM',
    image:
      'https://pbs.twimg.com/profile_images/2115222296918888449/A1o5fOVs_400x400.jpg',
    banner:
      'https://pbs.twimg.com/profile_banners/2115221513288757248/1793143576/1500x500',
    teamName: 'AlphaCollective',
    teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp:
      'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg',
    discordInvite: 'https://discord.gg/jKxXGAanth',
    partnerXHandle: 'Foomeapp',
    runner: {
      displayName: '𝐆𝖚𝖗𝖔',
      discordUsername: 'NFTGuro',
      discordId: '1541106547990470762',
      xUsername: 'NFTGuroETH',
    },
    roleBoosts: [
      { roleName: 'Gem', multiplier: 8 },
      { roleName: 'Metal Core', multiplier: 5 },
      { roleName: 'Alpha (Boosters)', multiplier: 3 },
      { roleName: 'Spark', multiplier: 2 },
      { roleName: 'Alpha Army', multiplier: 1 },
    ],
    requirements: [
      {
        id: 'discord_server_req',
        type: 'discord_server',
        label:
          'Have any of: Spark, Alpha Army, Alpha (Boosters), Metal Core, Gem in AlphaCollective',
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
    sharedCache?.endedRaffles ?? INITIAL_ENDED_RAFFLES
  );
  const [stats, setStats] = useState(
    sharedCache?.stats ?? {
      activeCount: INITIAL_ACTIVE_RAFFLES.length,
      endedCount: INITIAL_ENDED_RAFFLES.length,
      totalActiveWinners: 21,
      totalActiveEntries: 169,
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
