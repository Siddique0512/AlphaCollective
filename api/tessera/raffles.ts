// Vercel Serverless Function: GET /api/tessera/raffles

const TESSERA_API_BASE = 'https://api.tesserapp.org';
const TESSERA_API_KEY =
  process.env.TESSERA_API_KEY || 'tess_vL1uVhuq9Nn6HM0Ea4CLrmjfb5w1RtUEqCug0E8-kWI';

const ALPHA_TEAM_IDS = new Set([
  '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
  '7c85df3c-480f-45f7-b101-196de322fc38',
]);
const ALPHA_GUILD_ID = '1505079950317715589';
const ALPHA_TEAM_DISCORD_IDS = new Set([
  '1541106547990470762', // NFTGuroETH
  '756948444546990251', // Finisher
  '906953108960190506', // Salman Ali
  '1020626038604189727', // Dex
  '1295941152943378527', // Rkaay
  '1322108528369995872', // Retinz
  '1304743405045157968', // Light
]);

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
    const fetchTessera = async (endpoint: string) => {
      try {
        const resp = await fetch(`${TESSERA_API_BASE}${endpoint}`, {
          headers: {
            'X-API-Key': TESSERA_API_KEY,
            Accept: 'application/json',
          },
        });
        return resp.ok ? await resp.json() : null;
      } catch {
        return null;
      }
    };

    const [
      partnerActiveRes,
      partnerEndedRes,
      directSindicatRes,
      directHallOfAshRes,
      directFoomeRes,
      activePage1,
      activePage2,
      endedPage1,
      endedPage2,
      endedPage3,
      endedPage4,
    ] = await Promise.allSettled([
      fetchTessera('/partner/v1/raffles'),
      fetchTessera('/partner/v1/raffles?status=ended'),
      fetchTessera('/partner/v1/raffles/41bd2217-cc48-461e-9092-72e8e56274a2'),
      fetchTessera('/partner/v1/raffles/11f90193-1ae1-42c5-8f7a-e7a8ad7537f6'),
      fetchTessera('/partner/v1/raffles/b2c56a15-4cbf-48d8-a5af-734867b3adec'),
      fetchTessera('/provider/raffles?status=active&limit=100&offset=0'),
      fetchTessera('/provider/raffles?status=active&limit=100&offset=100'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=0'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=200'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=400'),
      fetchTessera('/provider/raffles?status=ended&limit=200&offset=600'),
    ]);

    const rawList: any[] = [];
    for (const r of [
      partnerActiveRes,
      partnerEndedRes,
      activePage1,
      activePage2,
      endedPage1,
      endedPage2,
      endedPage3,
      endedPage4,
    ]) {
      if (r.status === 'fulfilled' && Array.isArray(r.value?.raffles)) {
        rawList.push(...r.value.raffles);
      }
    }

    for (const direct of [directSindicatRes, directHallOfAshRes, directFoomeRes]) {
      if (direct.status === 'fulfilled' && direct.value?.raffleId) {
        rawList.push(direct.value);
      }
    }

    const seenIds = new Set<string>();
    const matched: any[] = [];
    for (const r of rawList) {
      if (!r?.raffleId || seenIds.has(r.raffleId)) continue;
      if (isAlphaCollectiveRaffle(r)) {
        seenIds.add(r.raffleId);
        matched.push(r);
      }
    }

    const activeList = matched.filter((r) => r.status === 'active');
    const endedList = matched
      .filter((r) => r.status !== 'active')
      .sort((a, b) => {
        const timeA = new Date(a.endAt || a.endedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.endAt || b.endedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

    res.status(200).json({
      activeRaffles: activeList,
      endedRaffles: endedList,
      stats: {
        activeCount: activeList.length,
        endedCount: endedList.length,
        totalActiveWinners: activeList.reduce(
          (acc: number, r: any) => acc + (r.winnerCount || r.allocation?.totalWinners || 1),
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
