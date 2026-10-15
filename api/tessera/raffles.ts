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
  const project = raffle.project || {};
  if (project.projectId && ALPHA_TEAM_IDS.has(String(project.projectId))) {
    return true;
  }
  if (String(project.xUsername || '').toLowerCase() === 'alphacollectiv3') {
    return true;
  }
  if (String(project.name || '').toLowerCase().includes('alphacollectiv')) {
    return true;
  }
  if (raffle.runner?.discordId && ALPHA_TEAM_DISCORD_IDS.has(String(raffle.runner.discordId))) {
    return true;
  }
  if (Array.isArray(raffle.requirements)) {
    for (const req of raffle.requirements) {
      if (
        String(req.guildId || '') === ALPHA_GUILD_ID ||
        String(req.value || '') === ALPHA_GUILD_ID ||
        String(req.guildName || '').toLowerCase().includes('alphacollectiv')
      ) {
        return true;
      }
      if (
        req.type === 'twitter_follow' &&
        String(req.value || '').replace(/^@/, '').toLowerCase() === 'alphacollectiv3'
      ) {
        return true;
      }
    }
  }
  return false;
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
      const resp = await fetch(`${TESSERA_API_BASE}${endpoint}`, {
        headers: {
          'X-API-Key': TESSERA_API_KEY,
          Accept: 'application/json',
        },
      });
      return resp.ok ? await resp.json() : null;
    };

    const [activeRes, endedRes] = await Promise.allSettled([
      fetchTessera('/provider/raffles?status=active&limit=100&offset=0'),
      fetchTessera('/provider/raffles?status=ended&limit=100&offset=0'),
    ]);

    const activeList =
      activeRes.status === 'fulfilled' && Array.isArray(activeRes.value?.raffles)
        ? activeRes.value.raffles.filter(isAlphaCollectiveRaffle)
        : [];
    const endedList =
      endedRes.status === 'fulfilled' && Array.isArray(endedRes.value?.raffles)
        ? endedRes.value.raffles.filter(isAlphaCollectiveRaffle)
        : [];

    res.status(200).json({
      activeRaffles: activeList,
      endedRaffles: endedList,
      stats: {
        activeCount: activeList.length,
        endedCount: endedList.length,
        totalActiveWinners: activeList.reduce((acc: number, r: any) => acc + (r.winnerCount || 1), 0),
        totalActiveEntries: activeList.reduce((acc: number, r: any) => acc + (r.entryCount || 0), 0),
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
