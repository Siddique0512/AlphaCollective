// Vercel Serverless Function: GET /api/tessera/raffles

const TESSERA_API_BASE = 'https://api.tesserapp.org';
const FALLBACK_TESSERA_API_KEY =
  'tess_vL1uVhuq9Nn6HM0Ea4CLrmjfb5w1RtUEqCug0E8-kWI';
const ENV_TESSERA_API_KEY = (process.env.TESSERA_API_KEY || '').trim();
const TESSERA_API_KEY =
  ENV_TESSERA_API_KEY && ENV_TESSERA_API_KEY !== 'YOUR_TESSERA_API_KEY'
    ? ENV_TESSERA_API_KEY
    : FALLBACK_TESSERA_API_KEY;

const RECENTLY_ENDED_WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours (3 days)

function parseTesseraTimeMs(iso: string | null | undefined): number {
  if (!iso || typeof iso !== 'string') return 0;
  const trimmed = iso.trim();
  if (!trimmed) return 0;
  const hasTz = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  const normalized = hasTz ? trimmed : `${trimmed}Z`;
  const ms = new Date(normalized).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

const ALPHA_TEAM_IDS = new Set([
  '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
  '7c85df3c-480f-45f7-b101-196de322fc38',
]);
const ALPHA_GUILD_ID = '1505079950317715589';

function isAlphaCollectiveRaffle(raffle: any): boolean {
  if (!raffle) return false;

  const reqs = Array.isArray(raffle.requirements) ? raffle.requirements : [];
  const serverReqs = reqs.filter((r: any) => r.type === 'discord_server');

  // Check if requirement contains Alpha Collective's official Discord server
  const hasAlphaGuild = serverReqs.some(
    (req: any) =>
      String(req.guildId || '') === ALPHA_GUILD_ID ||
      String(req.value || '') === ALPHA_GUILD_ID ||
      String(req.guildName || '').toLowerCase().includes('alphacollectiv')
  );

  // If the raffle requires a foreign Discord guild and NOT Alpha Collective, strictly reject
  const hasForeignGuildOnly = serverReqs.length > 0 && !hasAlphaGuild;

  // Check hostedFor / team details
  const hostedFor = raffle.hostedFor || {};
  const isHostedForAlpha =
    (hostedFor.teamId && ALPHA_TEAM_IDS.has(String(hostedFor.teamId))) ||
    (hostedFor.projectId && ALPHA_TEAM_IDS.has(String(hostedFor.projectId))) ||
    String(hostedFor.name || '').toLowerCase().includes('alphacollectiv') ||
    String(hostedFor.slug || '').toLowerCase().includes('alphacollectiv');

  // Check project details
  const project = raffle.project || {};
  const isAlphaProject =
    (project.projectId && ALPHA_TEAM_IDS.has(String(project.projectId))) ||
    String(project.xUsername || '').toLowerCase() === 'alphacollective' ||
    String(project.xUsername || '').toLowerCase() === 'alphacollectiv3' ||
    String(project.name || '').toLowerCase().includes('alphacollectiv');

  // Check title or slug
  const title = String(raffle.title || raffle.name || '').toLowerCase();
  const slug = String(raffle.slug || '').toLowerCase();
  const hasAlphaInTitle =
    title.includes('alphacollectiv') ||
    slug.includes('alphacollectiv') ||
    title.includes('alpha collective') ||
    slug.includes('alpha-collective');

  // Check Twitter follow requirement for Alpha Collective
  const hasAlphaTwitterReq = reqs.some(
    (req: any) =>
      req.type === 'twitter_follow' &&
      (String(req.value || '').replace(/^@/, '').toLowerCase() === 'alphacollective' ||
       String(req.value || '').replace(/^@/, '').toLowerCase() === 'alphacollectiv3')
  );

  // Exclude foreign community raffles (such as Lethal Injection) even if managed by a shared runner
  if (hasForeignGuildOnly && !isHostedForAlpha && !hasAlphaInTitle) {
    return false;
  }

  return hasAlphaGuild || isHostedForAlpha || isAlphaProject || hasAlphaInTitle || hasAlphaTwitterReq;
}

function parseAllocationTiers(tiersRaw: unknown): { name: string; count: number }[] {
  if (!tiersRaw) return [];
  if (Array.isArray(tiersRaw)) {
    return tiersRaw
      .filter((t) => t && typeof t.name === 'string')
      .map((t) => ({ name: String(t.name), count: Number(t.count) || 0 }));
  }
  if (typeof tiersRaw === 'string') {
    try {
      const parsed = JSON.parse(tiersRaw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((t) => t && typeof t.name === 'string')
          .map((t) => ({ name: String(t.name), count: Number(t.count) || 0 }));
      }
    } catch {
      return [];
    }
  }
  return [];
}

function extractRoleBoosts(requirements: any[]): { roleName: string; multiplier: number }[] {
  if (!Array.isArray(requirements)) return [];
  const serverReq = requirements.find(
    (r) => r.type === 'discord_server' && (r.roleMultipliers || r.roleNames)
  );
  if (!serverReq) return [];

  const roleIds: string[] = Array.isArray(serverReq.roleIds) ? serverReq.roleIds : [];
  const roleNames: string[] = Array.isArray(serverReq.roleNames) ? serverReq.roleNames : [];
  const multipliers: Record<string, number> = serverReq.roleMultipliers || {};

  const boosts: { roleName: string; multiplier: number }[] = [];
  for (let i = 0; i < roleNames.length; i++) {
    const roleId = roleIds[i];
    const roleName = roleNames[i];
    const mult = roleId && multipliers[roleId] ? Number(multipliers[roleId]) : 1;
    boosts.push({ roleName, multiplier: mult });
  }

  return boosts.sort((a, b) => b.multiplier - a.multiplier);
}

function extractPartnerTwitterHandle(raffle: any): string | null {
  const runnerX = String(raffle.runner?.xUsername || '').toLowerCase();
  if (Array.isArray(raffle.requirements)) {
    const followReqs = raffle.requirements.filter((r: any) => r.type === 'twitter_follow' && r.value);
    for (const req of followReqs) {
      const handle = String(req.value).replace(/^@/, '').trim();
      const lower = handle.toLowerCase();
      if (lower && lower !== 'alphacollective' && lower !== 'alphacollectiv3' && lower !== runnerX) {
        return handle;
      }
    }
    if (followReqs.length > 0) {
      return String(followReqs[0].value).replace(/^@/, '').trim();
    }
  }
  const projectX = String(raffle.project?.xUsername || '').replace(/^@/, '').trim();
  if (
    projectX &&
    projectX.toLowerCase() !== 'alphacollective' &&
    projectX.toLowerCase() !== 'alphacollectiv3'
  ) {
    return projectX;
  }
  return null;
}

const ALPHA_DEFAULT_AVATAR = 'https://unavatar.io/x/AlphaCollectiv3';

async function enrichAndNormalizeRaffle(
  r: any,
  fetchTessera: (endpoint: string, timeoutMs?: number) => Promise<any>,
  partnerById: Map<string, any>
): Promise<any> {
  const slugFromUrl = String(r.raffleUrl || '')
    .split('/raffle/')
    .pop()
    ?.replace(/\/$/, '');
  const lookupKey = slugFromUrl || r.slug || r.raffleId;

  let partnerDetail: any = partnerById.get(r.raffleId) || null;
  if (!r.image && !partnerDetail && lookupKey) {
    partnerDetail = await fetchTessera(
      `/partner/v1/raffles/${encodeURIComponent(lookupKey)}`,
      3500
    );
  }

  const tiers = parseAllocationTiers(r.allocation?.tiers || r.tiers);
  const roleBoosts = extractRoleBoosts(r.requirements || []);
  const partnerXHandle = extractPartnerTwitterHandle(r);

  const fallbackAvatar = partnerXHandle
    ? `https://unavatar.io/x/${encodeURIComponent(partnerXHandle)}`
    : ALPHA_DEFAULT_AVATAR;

  return {
    raffleId: r.raffleId,
    slug: partnerDetail?.slug || r.slug || slugFromUrl || r.raffleId,
    title: r.title || r.name || partnerDetail?.title || 'Alpha Collective Raffle',
    description: r.description || '',
    raffleUrl:
      r.raffleUrl ||
      partnerDetail?.raffleUrl ||
      `https://tesserapp.org/raffle/${partnerDetail?.slug || r.slug || r.raffleId}`,
    status: r.status === 'active' ? 'active' : 'ended',
    createdAt: r.createdAt || new Date().toISOString(),
    startAt: r.startAt || r.createdAt || new Date().toISOString(),
    endAt: partnerDetail?.endsAt || r.endsAt || r.endAt || new Date().toISOString(),
    endedAt:
      r.endedAt ||
      (r.status !== 'active' ? partnerDetail?.endsAt || r.endsAt || r.endAt : null),
    entryCount: Number(partnerDetail?.entryCount ?? r.entryCount ?? 0),
    participantCount: Number(r.participantCount ?? partnerDetail?.entryCount ?? r.entryCount ?? 0),
    winnerCount: Number(partnerDetail?.winnerCount ?? r.winnerCount ?? r.allocation?.totalWinners ?? 1),
    tiers,
    drawn: Boolean(partnerDetail?.drawn ?? r.drawn ?? (r.drawnBy !== null && r.status === 'ended')),
    requiredWalletType: partnerDetail?.requiredWalletType || r.requiredWalletType || r.project?.chain || 'EVM',
    image: partnerDetail?.image || r.image || fallbackAvatar,
    banner: partnerDetail?.banner || r.banner || null,
    teamName: partnerDetail?.teamName || r.teamName || 'AlphaCollective',
    teamId: partnerDetail?.teamId || r.teamId || '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp: partnerDetail?.teamPfp || r.teamPfp || ALPHA_DEFAULT_AVATAR,
    discordInvite: partnerDetail?.discordInvite || r.discordInvite || 'https://discord.gg/jKxXGAanth',
    partnerXHandle: partnerXHandle || r.partnerXHandle || null,
    runner: {
      displayName: r.runner?.displayName || 'Alpha Collective',
      discordUsername: r.runner?.discordUsername || '',
      discordId: r.runner?.discordId || '',
      xUsername: r.runner?.xUsername || '',
    },
    roleBoosts,
    requirements: Array.isArray(r.requirements) ? r.requirements : [],
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const fetchTessera = async (endpoint: string, timeoutMs = 5500) => {
      const doFetch = async (apiKey: string) => {
        const resp = await fetch(`${TESSERA_API_BASE}${endpoint}`, {
          headers: {
            'X-API-Key': apiKey,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(timeoutMs),
        });
        return resp;
      };

      try {
        let resp = await doFetch(TESSERA_API_KEY);
        if (
          (resp.status === 401 || resp.status === 403) &&
          TESSERA_API_KEY !== FALLBACK_TESSERA_API_KEY
        ) {
          resp = await doFetch(FALLBACK_TESSERA_API_KEY);
        }
        return resp.ok ? await resp.json() : null;
      } catch {
        return null;
      }
    };

    const [partnerActiveRes, ...providerResults] = await Promise.allSettled([
      fetchTessera('/partner/v1/raffles'),
      fetchTessera('/provider/raffles?status=active&limit=200&offset=0'),
      fetchTessera('/provider/raffles?status=active&limit=200&offset=200'),
      fetchTessera('/provider/raffles?status=active&limit=200&offset=400'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=0'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=200'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=400'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=600'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=800'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=1000'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=1200'),
    ]);

    const partnerById = new Map<string, any>();
    if (
      partnerActiveRes.status === 'fulfilled' &&
      Array.isArray(partnerActiveRes.value?.raffles)
    ) {
      for (const pr of partnerActiveRes.value.raffles) {
        if (pr?.raffleId) partnerById.set(pr.raffleId, pr);
      }
    }

    // Put provider feeds first so runner metadata is preserved
    const rawList: any[] = [];
    for (const r of [...providerResults, partnerActiveRes]) {
      if (r.status === 'fulfilled' && Array.isArray(r.value?.raffles)) {
        rawList.push(...r.value.raffles);
      }
    }

    const nowMs = Date.now();
    const seenIds = new Set<string>();
    const matched: any[] = [];

    for (const r of rawList) {
      if (!r?.raffleId || seenIds.has(r.raffleId)) continue;
      if (!isAlphaCollectiveRaffle(r)) continue;

      // Pre-filter stale ended raffles BEFORE making enrichment requests to keep response fast
      if (r.status !== 'active') {
        const endedMs = parseTesseraTimeMs(r.endedAt || r.endAt || r.endsAt || r.createdAt);
        if (!endedMs || nowMs - endedMs > RECENTLY_ENDED_WINDOW_MS) {
          continue;
        }
      }

      seenIds.add(r.raffleId);
      matched.push(r);
    }

    const normalized = await Promise.all(
      matched.map((r) => enrichAndNormalizeRaffle(r, fetchTessera, partnerById))
    );

    const activeList = normalized
      .filter((r) => r.status === 'active')
      .sort((a, b) => parseTesseraTimeMs(a.endAt) - parseTesseraTimeMs(b.endAt));

    const endedList = normalized
      .filter((r) => {
        if (r.status === 'active') return false;
        const endedMs = parseTesseraTimeMs(r.endedAt || r.endAt || r.createdAt);
        return endedMs > 0 && nowMs - endedMs <= RECENTLY_ENDED_WINDOW_MS;
      })
      .sort((a, b) => {
        const timeA = parseTesseraTimeMs(a.endedAt || a.endAt || a.createdAt);
        const timeB = parseTesseraTimeMs(b.endedAt || b.endAt || b.createdAt);
        return timeB - timeA;
      });

    const isForceRefresh = req.query?.refresh === '1' || req.query?.refresh === 'true';
    if (!isForceRefresh) {
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    }

    res.status(200).json({
      activeRaffles: activeList,
      endedRaffles: endedList,
      stats: {
        activeCount: activeList.length,
        endedCount: endedList.length,
        totalActiveWinners: activeList.reduce(
          (acc: number, r: any) => acc + (r.winnerCount || 1),
          0
        ),
        totalActiveEntries: activeList.reduce(
          (acc: number, r: any) => acc + (r.entryCount || 0),
          0
        ),
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Tessera Vercel proxy error:', err);
    res.status(200).json({
      activeRaffles: [],
      endedRaffles: [],
      stats: { activeCount: 0, endedCount: 0, totalActiveWinners: 0, totalActiveEntries: 0 },
      syncedAt: new Date().toISOString(),
    });
  }
}
