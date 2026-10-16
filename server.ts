import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const TESSERA_API_BASE = 'https://api.tesserapp.org';
const TESSERA_API_KEY =
  process.env.TESSERA_API_KEY || 'tess_vL1uVhuq9Nn6HM0Ea4CLrmjfb5w1RtUEqCug0E8-kWI';
const TESSERA_WEBHOOK_SECRET = process.env.TESSERA_WEBHOOK_SECRET || '';

const ALPHA_TEAM_IDS = new Set([
  '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
  '7c85df3c-480f-45f7-b101-196de322fc38',
]);
const ALPHA_GUILD_ID = '1505079950317715589';
const ALPHA_TEAM_DISCORD_IDS = new Set([
  '1541106547990470762', // NFTGuroETH
  '756948444546990251',  // Finisher
  '906953108960190506',  // Salman Ali
  '1020626038604189727', // Dex
  '1295941152943378527', // Rkaay
  '1322108528369995872', // Retinz
  '1304743405045157968', // Light
]);

interface CachedRafflesPayload {
  timestamp: number;
  data: unknown;
}

let rafflesCache: CachedRafflesPayload | null = null;
const CACHE_TTL_MS = 30_000;

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
  if (!Array.isArray(raffle.requirements)) return null;
  const runnerX = String(raffle.runner?.xUsername || '').toLowerCase();
  const followReqs = raffle.requirements.filter((r: any) => r.type === 'twitter_follow' && r.value);
  for (const req of followReqs) {
    const handle = String(req.value).replace(/^@/, '').trim();
    const lower = handle.toLowerCase();
    if (lower && lower !== 'alphacollectiv3' && lower !== runnerX) {
      return handle;
    }
  }
  if (followReqs.length > 0) {
    return String(followReqs[0].value).replace(/^@/, '').trim();
  }
  return null;
}

async function fetchTesseraJson(endpoint: string): Promise<{ status: number; data: any }> {
  const res = await fetch(`${TESSERA_API_BASE}${endpoint}`, {
    headers: {
      'X-API-Key': TESSERA_API_KEY,
      Accept: 'application/json',
    },
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

async function enrichSingleRaffle(raffle: any): Promise<any> {
  const slugFromUrl = String(raffle.raffleUrl || '')
    .split('/raffle/')
    .pop()
    ?.replace(/\/$/, '');
  const lookupKey = slugFromUrl || raffle.raffleId;

  let partnerDetail: any = null;
  try {
    const { status, data } = await fetchTesseraJson(
      `/partner/v1/raffles/${encodeURIComponent(lookupKey)}`
    );
    if (status === 200 && data) {
      partnerDetail = data;
    }
  } catch {
    partnerDetail = null;
  }

  const tiers = parseAllocationTiers(raffle.allocation?.tiers);
  const roleBoosts = extractRoleBoosts(raffle.requirements || []);
  const partnerXHandle = extractPartnerTwitterHandle(raffle);

  const fallbackAvatar = partnerXHandle
    ? `https://unavatar.io/x/${encodeURIComponent(partnerXHandle)}`
    : 'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg';

  return {
    raffleId: raffle.raffleId,
    slug: partnerDetail?.slug || slugFromUrl || raffle.raffleId,
    title: raffle.title || partnerDetail?.title || 'Alpha Collectiv3 Raffle',
    description: raffle.description || '',
    raffleUrl: raffle.raffleUrl || partnerDetail?.raffleUrl || 'https://tesserapp.org',
    status: raffle.status === 'active' ? 'active' : 'ended',
    createdAt: raffle.createdAt,
    startAt: raffle.startAt,
    endAt: partnerDetail?.endsAt || raffle.endAt,
    endedAt: raffle.endedAt || null,
    entryCount: Number(partnerDetail?.entryCount ?? raffle.entryCount ?? 0),
    participantCount: Number(raffle.participantCount ?? partnerDetail?.entryCount ?? 0),
    winnerCount: Number(
      partnerDetail?.winnerCount ?? raffle.allocation?.totalWinners ?? 1
    ),
    tiers,
    drawn: Boolean(partnerDetail?.drawn ?? (raffle.drawnBy !== null && raffle.status === 'ended')),
    requiredWalletType:
      partnerDetail?.requiredWalletType || raffle.project?.chain || 'EVM',
    image: partnerDetail?.image || fallbackAvatar,
    banner: partnerDetail?.banner || null,
    teamName: partnerDetail?.teamName || 'Alpha Collectiv3',
    teamId: partnerDetail?.teamId || '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
    teamPfp:
      partnerDetail?.teamPfp ||
      'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg',
    discordInvite:
      partnerDetail?.discordInvite ||
      raffle.project?.discordInvite ||
      'https://discord.gg/awSJ7sRYMu',
    partnerXHandle,
    runner: {
      displayName: raffle.runner?.displayName || 'Alpha Collectiv3',
      discordUsername: raffle.runner?.discordUsername || '',
      discordId: raffle.runner?.discordId || '',
      xUsername: raffle.runner?.xUsername || '',
    },
    roleBoosts,
    requirements: Array.isArray(raffle.requirements)
      ? raffle.requirements.map((req: any) => ({
          id: req.id || req.type,
          type: req.type,
          label: req.label,
          value: req.value || '',
          guildName: req.guildName || null,
          inviteLink: req.inviteLink || null,
          tweetId: req.tweetId || null,
        }))
      : [],
  };
}

async function getAlphaCollectiveRaffles(forceRefresh = false): Promise<any> {
  if (
    !forceRefresh &&
    rafflesCache &&
    Date.now() - rafflesCache.timestamp < CACHE_TTL_MS
  ) {
    return rafflesCache.data;
  }

  const [teamsRes, activePage1, activePage2, endedPage1, endedPage2, endedPage3] =
    await Promise.allSettled([
      fetchTesseraJson('/partner/v1/teams'),
      fetchTesseraJson('/provider/raffles?status=active&limit=200&offset=0'),
      fetchTesseraJson('/provider/raffles?status=active&limit=200&offset=200'),
      fetchTesseraJson('/provider/raffles?status=ended&limit=200&offset=0'),
      fetchTesseraJson('/provider/raffles?status=ended&limit=200&offset=200'),
      fetchTesseraJson('/provider/raffles?status=ended&limit=200&offset=400'),
    ]);

  const teamInfo =
    teamsRes.status === 'fulfilled' && teamsRes.value.status === 200
      ? teamsRes.value.data?.teams?.[0] || {
          teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
          name: 'AlphaCollective',
          slug: 'alphacollective-2',
        }
      : {
          teamId: '71179f50-23e2-4b2f-9dc0-8bc000fc54a5',
          name: 'AlphaCollective',
          slug: 'alphacollective-2',
        };

  const rawList: any[] = [];
  for (const res of [activePage1, activePage2, endedPage1, endedPage2, endedPage3]) {
    if (res.status === 'fulfilled' && Array.isArray(res.value.data?.raffles)) {
      rawList.push(...res.value.data.raffles);
    }
  }

  const seenIds = new Set<string>();
  const matchedRaffles: any[] = [];
  for (const r of rawList) {
    if (!r?.raffleId || seenIds.has(r.raffleId)) continue;
    if (isAlphaCollectiveRaffle(r)) {
      seenIds.add(r.raffleId);
      matchedRaffles.push(r);
    }
  }

  const enriched = await Promise.all(matchedRaffles.map((r) => enrichSingleRaffle(r)));

  const activeRaffles = enriched.filter((r) => r.status === 'active');
  const endedRaffles = enriched.filter((r) => r.status !== 'active');

  const totalActiveWinners = activeRaffles.reduce(
    (sum, r) => sum + (Number(r.winnerCount) || 0),
    0
  );
  const totalActiveEntries = activeRaffles.reduce(
    (sum, r) => sum + (Number(r.entryCount) || 0),
    0
  );

  const payload = {
    team: teamInfo,
    activeRaffles,
    endedRaffles,
    stats: {
      activeCount: activeRaffles.length,
      endedCount: endedRaffles.length,
      totalActiveWinners,
      totalActiveEntries,
    },
    syncedAt: new Date().toISOString(),
  };

  rafflesCache = {
    timestamp: Date.now(),
    data: payload,
  };

  return payload;
}

async function startServer() {
  const app = express();

  // Webhook endpoint using raw body for HMAC-SHA256 verification per Tessera docs
  app.post(
    '/api/tessera/webhook',
    express.raw({ type: 'application/json' }),
    (req: Request, res: Response) => {
      const signature = req.header('X-Tessera-Signature') || '';
      const eventType = req.header('X-Tessera-Event') || '';
      const eventId = req.header('X-Tessera-Id') || '';

      if (TESSERA_WEBHOOK_SECRET && Buffer.isBuffer(req.body)) {
        const expected =
          'sha256=' +
          crypto
            .createHmac('sha256', TESSERA_WEBHOOK_SECRET)
            .update(req.body)
            .digest('hex');
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        if (
          sigBuf.length !== expBuf.length ||
          !crypto.timingSafeEqual(sigBuf, expBuf)
        ) {
          res.status(401).json({ error: 'Invalid webhook signature' });
          return;
        }
      }

      // Invalidate cache immediately when a raffle goes live or updates
      rafflesCache = null;

      res.status(200).json({
        ok: true,
        eventId,
        eventType,
      });
    }
  );

  app.use(express.json());

  // Health & Connectivity Check
  app.get('/api/tessera/ping', async (_req: Request, res: Response) => {
    try {
      const { status, data } = await fetchTesseraJson('/partner/v1/ping');
      res.status(status).json(data || { ok: status === 200 });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Tessera ping failed' });
    }
  });

  // Main endpoint: Active & Recently Ended Alpha Collectiv3 Discord Raffles
  app.get('/api/tessera/raffles', async (req: Request, res: Response) => {
    try {
      const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const data = await getAlphaCollectiveRaffles(forceRefresh);
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching Tessera raffles:', err);
      res.status(500).json({
        error: 'Failed to synchronize raffles from Tessera API',
        detail: err?.message || 'Unknown error',
      });
    }
  });

  // Drawn Winners endpoint: GET /api/tessera/raffles/:id/winners
  app.get('/api/tessera/raffles/:id/winners', async (req: Request, res: Response) => {
    const idOrSlug = String(req.params.id || '').trim();
    if (!idOrSlug) {
      res.status(400).json({ error: 'Missing raffle ID or slug' });
      return;
    }

    try {
      // Try Partner Winners API first (/partner/v1/raffles/{id|slug}/winners)
      const partnerRes = await fetchTesseraJson(
        `/partner/v1/raffles/${encodeURIComponent(idOrSlug)}/winners`
      );

      if (partnerRes.status === 200 && Array.isArray(partnerRes.data?.winners)) {
        res.json({
          raffleId: partnerRes.data.raffleId || idOrSlug,
          ready: true,
          winnerCount: partnerRes.data.winners.length,
          winners: partnerRes.data.winners.map((w: any, idx: number) => ({
            rank: w.rank ?? idx + 1,
            username: w.username || w.displayName || 'Winner',
            discordId: w.discordId || '',
            xHandle: w.xHandle || w.xUsername || '',
            wallet: w.wallet || '',
            tierName: w.tierName || 'WL',
            status: w.status || 'confirmed',
          })),
        });
        return;
      }

      // Fallback to Provider Read Feed Winners API (/provider/raffles/{id|slug}/winners)
      const providerRes = await fetchTesseraJson(
        `/provider/raffles/${encodeURIComponent(idOrSlug)}/winners`
      );

      if (providerRes.status === 200 && Array.isArray(providerRes.data?.winners)) {
        res.json({
          raffleId: providerRes.data.raffleId || idOrSlug,
          ready: true,
          winnerCount:
            providerRes.data.winnerCount ?? providerRes.data.winners.length,
          winners: providerRes.data.winners.map((w: any, idx: number) => ({
            rank: w.rank ?? idx + 1,
            username: w.displayName || w.username || 'Winner',
            discordId: w.discordId || '',
            xHandle: w.xUsername || w.xHandle || '',
            wallet: w.wallet || '',
            tierName: w.tierName || 'WL',
            status: w.status || 'confirmed',
          })),
        });
        return;
      }

      if (partnerRes.status === 409) {
        res.status(200).json({
          raffleId: idOrSlug,
          ready: false,
          reason: partnerRes.data?.detail?.reason || 'not_drawn',
          winnerCount: 0,
          winners: [],
        });
        return;
      }

      res.status(200).json({
        raffleId: idOrSlug,
        ready: false,
        reason: 'unavailable',
        winnerCount: 0,
        winners: [],
      });
    } catch (err: any) {
      res.status(500).json({
        error: 'Failed to load raffle winners',
        detail: err?.message || 'Unknown error',
      });
    }
  });

  // =========================================================================
  // DISCORD AIRDROP CHANNEL INTEGRATION
  // =========================================================================
  const DEFAULT_AIRDROP_CHANNEL_ID =
    process.env.DISCORD_AIRDROP_CHANNEL_ID || '1557705831812964393';
  const DEFAULT_AIRDROP_WEBHOOK_URL =
    'https://discord.com/api/webhooks/1559546892252352592/kOJuuMgNYiEsMfnjFXvEt70NEb2rR2-CEp34hewUkdHrc74YH0NfXyn-BIn_AyUDSAYB';
  const DISCORD_AIRDROP_WEBHOOK_URL =
    process.env.DISCORD_AIRDROP_WEBHOOK_URL || DEFAULT_AIRDROP_WEBHOOK_URL;

  // DISCORD TRENDS CHANNEL INTEGRATION
  const DEFAULT_TRENDS_CHANNEL_ID =
    process.env.DISCORD_TRENDS_CHANNEL_ID || '1555848318960013342';
  const DEFAULT_TRENDS_WEBHOOK_URL =
    'https://discord.com/api/webhooks/1559576791503343717/9GACy32EApMOlGboE0QKdXTJN-gqO0c3OHcPjBxTb2gHL0UEmV-wqB0PYPKDWKOqEXee';
  const DISCORD_TRENDS_WEBHOOK_URL =
    process.env.DISCORD_TRENDS_WEBHOOK_URL || DEFAULT_TRENDS_WEBHOOK_URL;

  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

  const CURATED_AIRDROPS = [
    {
      id: 'dc-airdrop-monad',
      projectName: 'Monad Testnet Phase 2',
      ticker: '$MON',
      category: 'L1',
      chain: 'Monad EVM',
      cost: 'FREE / TESTNET',
      stage: 'Devnet / Public Testnet',
      estimatedPotential: '$3,000 – $12,000+',
      status: 'HOT',
      postedAt: '2026-10-10T14:30:00Z',
      author: {
        name: 'Finisher',
        handle: 'finisher',
        role: 'Airdrop Hunter & Dev',
        avatar: '/assets/team/Finisher.jpeg',
      },
      overview:
        '10,000 TPS parallelized EVM Layer 1 with $225M in funding backed by Paradigm, Dragonfly, and Coinbase. Direct active participation across testnet contracts and ecosystem dApps is top priority.',
      guideSteps: [
        'Request daily testnet MON from the official Discord faucet or testnet portal.',
        'Execute swaps on Ambient, Bebop, and Monadswap testnet contracts.',
        'Deposit testnet liquidity pools on Curvance and earn simulated LP points.',
        'Deploy a testnet ERC-20 contract using Remix or Thirdweb to boost on-chain footprint.',
      ],
      requirements: [
        'Discord role in Alpha Collective (Boosters / Metal Core)',
        'EVM Wallet (Rabby or MetaMask)',
        'Daily / Weekly testnet interaction cadence',
      ],
      officialUrl: 'https://monad.xyz',
      discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
      tgeTiming: 'Q1 2027 Confirmed',
      backerFunding: '$225M (Paradigm, Electric Capital)',
    },
    {
      id: 'dc-airdrop-berachain',
      projectName: 'Berachain bArtio & Boyco',
      ticker: '$BERA / $BGT',
      category: 'L1',
      chain: 'Berachain (Polaris EVM)',
      cost: 'FREE / TESTNET',
      stage: 'Final bArtio V2 Stage',
      estimatedPotential: '$2,500 – $8,500+',
      status: 'CONFIRMED TGE',
      postedAt: '2026-10-09T18:15:00Z',
      author: {
        name: 'Finisher',
        handle: 'finisher',
        role: 'Airdrop Hunter & Dev',
        avatar: '/assets/team/Finisher.jpeg',
      },
      overview:
        '$142M valuation Layer 1 powered by Proof of Liquidity. Boyco deposits are live and the final testnet phase rewards validators and liquidity providers ahead of mainnet genesis.',
      guideSteps: [
        'Claim testnet BERA every 8 hours on bArtio Faucet.',
        'Mint HONEY stablecoins using testnet collateral on the native BEX exchange.',
        'Supply liquidity to BERA/HONEY pools to earn Proof-of-Liquidity governance token BGT.',
        'Delegate earned BGT to community validators in the governance station.',
      ],
      requirements: [
        'EVM Wallet',
        'Discord Account linked for faucet verification',
        'Zero initial capital required',
      ],
      officialUrl: 'https://berachain.com',
      discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
      tgeTiming: 'Targeted Mainnet Soon',
      backerFunding: '$142M (Polychain, Brevan Howard)',
    },
    {
      id: 'dc-airdrop-story',
      projectName: 'Story Protocol Odyssey',
      ticker: '$IP',
      category: 'Infrastructure',
      chain: 'Story L1',
      cost: 'FREE / TESTNET',
      stage: 'Odyssey Testnet Phase',
      estimatedPotential: '$2,000 – $6,500+',
      status: 'ACTIVE',
      postedAt: '2026-10-08T11:45:00Z',
      author: {
        name: 'Finisher',
        handle: 'finisher',
        role: 'Airdrop Hunter & Dev',
        avatar: '/assets/team/Finisher.jpeg',
      },
      overview:
        'Programmable Intellectual Property Layer 1 with $140M funding backed by a16z crypto. Built to tokenize and protect creative IP on-chain.',
      guideSteps: [
        'Connect wallet to the Story Protocol Odyssey portal and claim IP testnet gas.',
        'Register a digital creative asset as an on-chain IP Asset (IPA).',
        'Attach a programmable license and execute a derivative mint.',
        'Mint Odyssey commemorative NFT pass and complete Discord role verification.',
      ],
      requirements: ['EVM Wallet', 'Alpha Collective Discord Membership', 'X/Twitter link'],
      officialUrl: 'https://story.foundation',
      discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
      tgeTiming: 'Early 2027',
      backerFunding: '$140M (a16z crypto, Endeavor)',
    },
    {
      id: 'dc-airdrop-hyperliquid',
      projectName: 'Hyperliquid EVM & Ecosystem',
      ticker: '$HYPE / $PURR',
      category: 'DeFi',
      chain: 'Hyperliquid L1',
      cost: 'LOW GAS',
      stage: 'HyperEVM Pre-Launch',
      estimatedPotential: '$4,000 – $15,000+',
      status: 'CONFIRMED TGE',
      postedAt: '2026-10-07T20:00:00Z',
      author: {
        name: 'Finisher',
        handle: 'finisher',
        role: 'Airdrop Hunter & Dev',
        avatar: '/assets/team/Finisher.jpeg',
      },
      overview:
        'Custom high-performance Layer 1 for decentralized orderbook perps and native spot assets. The native HyperEVM launch introduces native token distribution.',
      guideSteps: [
        'Bridge USDC from Arbitrum One to Hyperliquid L1.',
        'Conduct active volume trading across high-liquidity perp pairs (BTC, ETH, SOL).',
        'Deposit liquidity into the community HLP vault.',
        'Participate in native spot token pairs on HyperEVM testnet.',
      ],
      requirements: ['Arbitrum Web3 Wallet', 'USDC deposit capital', 'Consistent monthly volume'],
      officialUrl: 'https://hyperliquid.xyz',
      discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
      tgeTiming: 'Q4 2026 / Q1 2027',
      backerFunding: 'Self-funded & Community-owned',
    },
    {
      id: 'dc-airdrop-grass',
      projectName: 'Grass Network DePIN Season 2',
      ticker: '$GRASS',
      category: 'DePIN',
      chain: 'Solana',
      cost: 'FREE / TESTNET',
      stage: 'Epoch 2 Active',
      estimatedPotential: '$1,200 – $4,000+',
      status: 'ACTIVE',
      postedAt: '2026-10-06T09:10:00Z',
      author: {
        name: 'Finisher',
        handle: 'finisher',
        role: 'Airdrop Hunter & Dev',
        avatar: '/assets/team/Finisher.jpeg',
      },
      overview:
        'AI Web data gathering protocol allowing verified users to earn points by sharing idle residential bandwidth. Over 2.5M users active globally.',
      guideSteps: [
        'Install official Grass desktop node or Chrome extension.',
        'Link Solana wallet on the Grass web console.',
        'Keep node connected with 90%+ network score for 2x Epoch 2 points multiplier.',
        'Verify residential IP address tier to maximize rewards.',
      ],
      requirements: ['Residential Internet', 'Solana Wallet (Phantom/Backpack)', 'Browser extension'],
      officialUrl: 'https://getgrass.io',
      discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
      tgeTiming: 'Ongoing Epochs',
      backerFunding: 'Polychain Capital, Tribe Capital',
    },
    {
      id: 'dc-airdrop-eclipse',
      projectName: 'Eclipse SVM Mainnet',
      ticker: '$ECLIPSE',
      category: 'L1',
      chain: 'Eclipse (SVM on ETH)',
      cost: 'LOW GAS',
      stage: 'Early Mainnet Phase',
      estimatedPotential: '$2,500 – $7,000+',
      status: 'HOT',
      postedAt: '2026-10-05T16:20:00Z',
      author: {
        name: 'Finisher',
        handle: 'finisher',
        role: 'Airdrop Hunter & Dev',
        avatar: '/assets/team/Finisher.jpeg',
      },
      overview:
        'Ethereum’s fastest L2 powered by the Solana Virtual Machine (SVM), Celestia DA, and RISC Zero zero-knowledge proofs with over $65M in total funding.',
      guideSteps: [
        'Bridge ETH from Ethereum Mainnet via the official canonical bridge to Eclipse.',
        'Execute token swaps on Orca Eclipse.',
        'Deposit liquidity into Kamino Eclipse liquidity pools.',
        'Mint early adopter on-chain commemorative NFTs.',
      ],
      requirements: ['Ethereum Wallet + Solana Wallet compatible with SVM', '0.015 ETH for gas & bridge'],
      officialUrl: 'https://eclipse.xyz',
      discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
      tgeTiming: 'Q1 2027',
      backerFunding: '$65M (Placeholder, Polychain, Hack VC)',
    },
  ];

  // GET /api/discord/airdrops
  app.get('/api/discord/airdrops', async (req: Request, res: Response) => {
    const channelId = String(
      req.query.channelId || DEFAULT_AIRDROP_CHANNEL_ID
    ).trim();

    let liveItems: any[] = [];
    let liveConnected = false;
    let channelMetadata = {
      channelId,
      channelName: '#airdrop-alpha',
      guildId: ALPHA_GUILD_ID,
      guildName: 'AlphaCollective',
      topic: 'Verified Web3 Airdrop intel, testnet farming guides, and node operations led by @Finisher',
      hunter: 'Finisher',
    };

    // Attempt Discord API fetch if Bot Token is configured
    if (DISCORD_BOT_TOKEN) {
      try {
        const discordRes = await fetch(
          `https://discord.com/api/v10/channels/${channelId}/messages?limit=25`,
          {
            headers: {
              Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
              'User-Agent': 'AlphaCollectiveApp/1.0',
            },
          }
        );

        if (discordRes.ok) {
          const messages = await discordRes.json();
          if (Array.isArray(messages) && messages.length > 0) {
            liveConnected = true;
            liveItems = messages
              .filter((m: any) => m.content || m.embeds?.length > 0)
              .map((m: any, idx: number) => {
                const firstEmbed = m.embeds?.[0];
                const title =
                  firstEmbed?.title ||
                  m.content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 50) ||
                  `Discord Airdrop Signal #${idx + 1}`;
                return {
                  id: m.id,
                  projectName: title,
                  ticker: firstEmbed?.fields?.find((f: any) =>
                    f.name.toLowerCase().includes('ticker')
                  )?.value || '$ALPHA',
                  category: 'L1',
                  chain: 'Multi-Chain',
                  cost: 'FREE / TESTNET',
                  stage: 'Active Community Feed',
                  estimatedPotential: 'High Potential',
                  status: 'ACTIVE',
                  postedAt: m.timestamp,
                  author: {
                    name: m.author?.global_name || m.author?.username || 'Finisher',
                    handle: m.author?.username || 'finisher',
                    role: 'Airdrop Hunter',
                    avatar: m.author?.avatar
                      ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
                      : '/assets/team/Finisher.jpeg',
                  },
                  overview: m.content || firstEmbed?.description || '',
                  guideSteps: [
                    'Follow steps posted in the Alpha Collective Discord channel.',
                    'Check pinned message attachments and requirements.',
                  ],
                  requirements: ['Discord Member', 'Web3 Wallet'],
                  officialUrl: firstEmbed?.url || 'https://discord.gg/awSJ7sRYMu',
                  discordThreadUrl: `https://discord.com/channels/${ALPHA_GUILD_ID}/${channelId}/${m.id}`,
                  tgeTiming: 'Live Alpha',
                  backerFunding: 'Community Verified',
                };
              });
          }
        }
      } catch (err) {
        console.warn('Discord Bot API call failed, falling back to curated feed:', err);
      }
    }

    // Merge live messages with curated alpha feed
    const combinedAirdrops = liveItems.length > 0 ? [...liveItems, ...CURATED_AIRDROPS] : CURATED_AIRDROPS;

    res.json({
      ok: true,
      channel: channelMetadata,
      liveConnected,
      totalCount: combinedAirdrops.length,
      airdrops: combinedAirdrops,
      syncedAt: new Date().toISOString(),
    });
  });

  // GET /api/discord/channel-info
  app.get('/api/discord/channel-info', async (req: Request, res: Response) => {
    const channelId = String(
      req.query.channelId || DEFAULT_AIRDROP_CHANNEL_ID
    ).trim();

    res.json({
      channelId,
      channelName: '#airdrop-alpha',
      guildName: 'AlphaCollective',
      guildId: ALPHA_GUILD_ID,
      hunter: 'Finisher',
      inviteUrl: 'https://discord.gg/awSJ7sRYMu',
      botConfigured: Boolean(DISCORD_BOT_TOKEN),
    });
  });

  // POST /api/discord/airdrops/broadcast
  // Broadcasts verified airdrop radar signals to the Airdrop Discord channel
  app.post('/api/discord/airdrops/broadcast', async (req: Request, res: Response) => {
    try {
      const {
        projectName,
        ticker,
        chain,
        cost,
        stage,
        estimatedPotential,
        overview,
        guideSteps,
        requirements,
        officialUrl,
        author,
      } = req.body || {};

      if (!projectName) {
        res.status(400).json({ error: 'Project name is required' });
        return;
      }

      const embed = {
        title: `🪂 AIRDROP SIGNAL: ${projectName}${ticker ? ` (${ticker})` : ''}`,
        description: overview || 'Verified on-chain airdrop intelligence tracked by Alpha Collective.',
        color: 0x38BDF8, // Light Blue
        fields: [
          { name: '⛓️ Chain / Network', value: chain || 'Multi-Chain', inline: true },
          { name: '💰 Cost / Capital', value: cost || 'FREE / TESTNET', inline: true },
          { name: '📈 Stage', value: stage || 'Active Phase', inline: true },
          { name: '🎯 Est. Potential', value: estimatedPotential || 'High Potential', inline: true },
          ...(Array.isArray(guideSteps) && guideSteps.length > 0
            ? [
                {
                  name: '📋 Farming Checklist',
                  value: guideSteps
                    .map((step: string, i: number) => `**${i + 1}.** ${step}`)
                    .slice(0, 5)
                    .join('\n'),
                  inline: false,
                },
              ]
            : []),
          ...(Array.isArray(requirements) && requirements.length > 0
            ? [
                {
                  name: '⚡ Requirements',
                  value: requirements.map((r: string) => `• ${r}`).join('\n'),
                  inline: false,
                },
              ]
            : []),
          ...(officialUrl
            ? [
                {
                  name: '🔗 Official Link',
                  value: `[Access Portal](${officialUrl})`,
                  inline: true,
                },
              ]
            : []),
        ],
        author: {
          name: author?.name ? `${author.name} (Alpha Collective)` : 'Alpha Collective Airdrop Radar',
          icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        },
        footer: {
          text: 'Alpha Collectiv3 • On-Chain Airdrop Radar',
          icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        },
        timestamp: new Date().toISOString(),
      };

      const hookRes = await fetch(DISCORD_AIRDROP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Alpha Airdrop Radar',
          avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
          embeds: [embed],
        }),
      });

      if (hookRes.ok) {
        res.json({ ok: true, message: 'Airdrop signal broadcasted to Discord Airdrop channel successfully' });
      } else {
        const errorText = await hookRes.text();
        res.status(502).json({ error: `Discord webhook rejected: ${errorText}` });
      }
    } catch (err: any) {
      console.error('Failed to broadcast airdrop signal:', err);
      res.status(500).json({ error: err.message || 'Internal error' });
    }
  });

  // =========================================================================
  // PERSISTENT DATA DIRECTORY SETUP
  // =========================================================================
  const DATA_DIR = path.join(__dirname, 'data');
  const TRENDS_FILE = path.join(DATA_DIR, 'trends.json');
  const APPS_FILE = path.join(DATA_DIR, 'applications.json');

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }

  // Load persistent trends store from disk
  let trendsStore: any[] = [];
  try {
    if (fs.existsSync(TRENDS_FILE)) {
      const raw = fs.readFileSync(TRENDS_FILE, 'utf-8');
      trendsStore = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read trends.json, initializing fresh store:', err);
    trendsStore = [];
  }

  const saveTrendsToDisk = () => {
    try {
      fs.writeFileSync(TRENDS_FILE, JSON.stringify(trendsStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist trends to disk:', err);
    }
  };

  // GET /api/discord/trends
  // Returns all trends intelligence data connected via the Discord Trends channel (UGC webhook)
  app.get('/api/discord/trends', async (req: Request, res: Response) => {
    let webhookLive = false;
    let webhookMetadata: any = {
      channelId: DEFAULT_TRENDS_CHANNEL_ID,
      channelName: '#trends-alpha',
      guildId: ALPHA_GUILD_ID,
      guildName: 'AlphaCollective',
      webhookName: 'UGC',
      url: DISCORD_TRENDS_WEBHOOK_URL,
      topic: 'Verified Web3 Market Trends, Breakout Floor Calls, and Whale Forensics',
    };

    // Query live webhook details from Discord API
    try {
      const hookCheck = await fetch(DISCORD_TRENDS_WEBHOOK_URL);
      if (hookCheck.ok) {
        const info: any = await hookCheck.json();
        webhookLive = true;
        webhookMetadata = {
          ...webhookMetadata,
          channelId: info.channel_id || DEFAULT_TRENDS_CHANNEL_ID,
          channelName: info.name === 'UGC' ? '#trends-alpha' : `#${String(info.name).toLowerCase()}`,
          webhookName: info.name || 'UGC',
          guildId: info.guild_id || ALPHA_GUILD_ID,
        };
      }
    } catch (e) {
      console.warn('Could not query Discord Trends webhook directly:', e);
    }

    // Refresh store from disk if updated
    try {
      if (fs.existsSync(TRENDS_FILE)) {
        trendsStore = JSON.parse(fs.readFileSync(TRENDS_FILE, 'utf-8'));
      }
    } catch (err) {
      // Keep memory version
    }

    // Calculate live telemetry metrics
    const topCallItem = trendsStore.find((t: any) => t.gain?.includes('+')) || trendsStore[0];
    const topCall = topCallItem?.badge?.replace('▲ ', '') || '+403% TOP CALL';
    const whaleItem = trendsStore.find((t: any) => t.type === 'whales' || t.category?.includes('WHALE'));

    res.json({
      ok: true,
      channel: webhookMetadata,
      liveConnected: webhookLive,
      totalCount: trendsStore.length,
      trends: trendsStore,
      telemetry: {
        topCall,
        topCallItem,
        whaleFlow: whaleItem?.gain || '+84.2 ETH (24H)',
        totalSignals: trendsStore.length,
      },
      syncedAt: new Date().toISOString(),
    });
  });

  // POST /api/discord/trends/broadcast
  // Broadcasts market signals, floor surges, and trends to the Trends Discord channel & persists to data/trends.json
  app.post('/api/discord/trends/broadcast', async (req: Request, res: Response) => {
    try {
      const {
        title,
        category,
        floorBefore,
        floorAfter,
        gain,
        calledBy,
        detail,
        chain,
      } = req.body || {};

      if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      const embed = {
        title: `📈 TREND SIGNAL: ${title}`,
        description: detail || 'Curated on-chain market movement tracked by Alpha Collective.',
        color: 0xEF4444, // Red / Trend color
        fields: [
          ...(category ? [{ name: '🏷️ Category', value: category, inline: true }] : []),
          ...(chain ? [{ name: '⛓️ Chain', value: chain, inline: true }] : []),
          ...(gain ? [{ name: '📊 Movement / Gain', value: `**${gain}**`, inline: true }] : []),
          ...(floorBefore && floorAfter
            ? [
                {
                  name: '💰 Price Shift',
                  value: `${floorBefore} ➔ **${floorAfter}**`,
                  inline: true,
                },
              ]
            : []),
          ...(calledBy ? [{ name: '🎯 Called By', value: calledBy, inline: true }] : []),
        ],
        author: {
          name: 'Alpha Collective Trends Intel',
          icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        },
        footer: {
          text: 'Alpha Collectiv3 • On-Chain Market Radar',
          icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        },
        timestamp: new Date().toISOString(),
      };

      const hookRes = await fetch(DISCORD_TRENDS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Alpha Trends Radar',
          avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
          embeds: [embed],
        }),
      });

      // Persist to local trends data
      const newSignal = {
        id: `trend-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`,
        title,
        category: category || 'SURGE',
        badge: gain ? `▲ ${gain}` : 'VERIFIED SIGNAL',
        badgeColor:
          category === 'MINT'
            ? 'bg-[#38BDF8]/20 text-[#38BDF8]'
            : category === 'WHALE'
            ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
            : 'bg-[#10B981]/20 text-[#34D399]',
        detail:
          detail ||
          `${floorBefore ? `Floor ${floorBefore} ➔ ` : ''}${floorAfter || ''}${
            calledBy ? ` • Called by ${calledBy}` : ''
          }`,
        floorBefore: floorBefore || '',
        floorAfter: floorAfter || '',
        gain: gain || 'Active Call',
        calledBy: calledBy || 'Alpha Collective Member',
        chain: chain || 'Ethereum',
        type:
          category?.toLowerCase() === 'mint'
            ? 'mints'
            : category?.toLowerCase() === 'whale'
            ? 'whales'
            : 'surges',
        timestamp: new Date().toISOString(),
        channelId: DEFAULT_TRENDS_CHANNEL_ID,
        source: 'Discord #trends (UGC Webhook)',
      };

      trendsStore.unshift(newSignal);
      saveTrendsToDisk();

      if (hookRes.ok) {
        res.json({
          ok: true,
          message: 'Trend signal broadcasted to Discord Trends channel and saved successfully',
          signal: newSignal,
        });
      } else {
        const errorText = await hookRes.text();
        res.status(200).json({
          ok: true,
          savedLocally: true,
          warning: `Discord webhook returned: ${errorText}`,
          signal: newSignal,
        });
      }
    } catch (err: any) {
      console.error('Failed to broadcast trend signal:', err);
      res.status(500).json({ error: err.message || 'Internal error' });
    }
  });

  // =========================================================================
  // APPLICATION SUBMISSIONS ENDPOINTS (PERSISTENT DATA STORAGE)
  // =========================================================================

  // Load existing persistent applications from disk
  let applicationsStore: any[] = [];
  try {
    if (fs.existsSync(APPS_FILE)) {
      const raw = fs.readFileSync(APPS_FILE, 'utf-8');
      applicationsStore = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read existing applications.json, initializing fresh store:', err);
    applicationsStore = [];
  }

  const saveApplicationsToDisk = () => {
    try {
      fs.writeFileSync(APPS_FILE, JSON.stringify(applicationsStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist applications to disk:', err);
    }
  };

  const GOOGLE_FORM_RESPONSE_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSe_yxrxl83nn0okPlrJep2zCVecWbbYuhZH9KGARuEZXQ_w1g/formResponse';
  const DEFAULT_APPLICATIONS_CHANNEL_ID = '1559546521861619802';
  const DEFAULT_APPLICATIONS_CHANNEL_NAME = 'invite-applications';
  const DEFAULT_APPLICATIONS_WEBHOOK_URL =
    'https://discord.com/api/webhooks/1559546595899342938/ghji0QZHJvqQ7FGxHc0V4MuaV0Ub73T9PPD3ApeIQzXuVCaBaOuck75BxUKrbjrhzG2k';
  const DISCORD_APPLICATIONS_WEBHOOK_URL =
    process.env.DISCORD_APPLICATIONS_WEBHOOK_URL || DEFAULT_APPLICATIONS_WEBHOOK_URL;

  const FOCUS_AREA_LABELS: Record<string, string> = {
    airdrops: '🪂 Airdrop Hunting & Testnets',
    nfts: '🖼️ NFT Minting & Secondary Whitelists',
    defi: '📈 DeFi Yield, Staking & Perpetuals',
    dev: '💻 Web3 & Smart Contract Dev',
    gaming: '🎮 Web3 Gaming & Tournaments',
    mod: '✍️ Content Creation & Community Mod',
  };

  app.post('/api/applications', async (req: Request, res: Response) => {
    try {
      const {
        fullName,
        email,
        xUsername,
        discordHandle,
        yearsInWeb3,
        focusAreas,
        weeklyActivity,
        whyJoin,
        valuesBrought,
        previousCommunities,
        walletAddress,
        referralSource,
      } = req.body || {};

      if (!fullName || !xUsername || !whyJoin) {
        res.status(400).json({ error: 'Missing required application fields' });
        return;
      }

      const appId = `AC-APP-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const newApp = {
        appId,
        fullName: String(fullName).trim(),
        email: String(email || '').trim(),
        xUsername: String(xUsername).trim(),
        discordHandle: String(discordHandle || '').trim(),
        yearsInWeb3: String(yearsInWeb3 || 'Less than 1 year'),
        focusAreas: Array.isArray(focusAreas) ? focusAreas : [],
        weeklyActivity: String(weeklyActivity || '5 – 15 hours / week'),
        whyJoin: String(whyJoin).trim(),
        valuesBrought: String(valuesBrought || '').trim(),
        previousCommunities: String(previousCommunities || '').trim(),
        walletAddress: String(walletAddress || '').trim(),
        referralSource: String(referralSource || '').trim(),
        status: 'PENDING_REVIEW',
        submittedAt: new Date().toISOString(),
      };

      // 1. Store in memory and persist immediately to server disk
      applicationsStore.unshift(newApp);
      saveApplicationsToDisk();

      // 2. Relay structured card to Discord Webhook
      const deliveryTasks: Promise<any>[] = [];

      if (DISCORD_APPLICATIONS_WEBHOOK_URL) {
        try {
          const cleanX = String(newApp.xUsername || '').replace(/^@/, '');
          const xLink = cleanX ? `[@${cleanX}](https://x.com/${cleanX})` : 'N/A';
          const focusListFormatted =
            newApp.focusAreas.length > 0
              ? newApp.focusAreas
                  .map((f: string) => FOCUS_AREA_LABELS[f] || `• ${f}`)
                  .join('\n')
              : 'General Web3 Exploration';

          const cardPayload = {
            username: 'Alpha Collectiv3 Gatekeeper',
            avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
            embeds: [
              {
                author: {
                  name: 'Alpha Collectiv3 • Portal Gatekeeper',
                  icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
                },
                title: `🛡️ New Alpha Application: ${newApp.fullName}`,
                description: `A prospective member has submitted an official application for Alpha Collectiv3 membership.\n\n**Application ID:** \`${appId}\`\n**Status:** 🟡 \`PENDING COUNCIL REVIEW\``,
                color: 0xd71920,
                thumbnail: {
                  url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
                },
                fields: [
                  {
                    name: '👤 Moniker / Name',
                    value: `**${newApp.fullName}**`,
                    inline: true,
                  },
                  ...(newApp.email
                    ? [
                        {
                          name: '✉️ Email',
                          value: `\`${newApp.email}\``,
                          inline: true,
                        },
                      ]
                    : []),
                  {
                    name: '🐦 X (Twitter)',
                    value: xLink,
                    inline: true,
                  },
                  {
                    name: '💬 Discord Handle',
                    value: newApp.discordHandle ? `\`${newApp.discordHandle}\`` : '*Not provided*',
                    inline: true,
                  },
                  {
                    name: '⏳ Experience in Web3',
                    value: `\`${newApp.yearsInWeb3}\``,
                    inline: true,
                  },
                  {
                    name: '⏱️ Weekly Commitment',
                    value: `\`${newApp.weeklyActivity}\``,
                    inline: true,
                  },
                  {
                    name: '📢 Referral Source',
                    value: newApp.referralSource ? `*${newApp.referralSource}*` : 'Direct Portal',
                    inline: true,
                  },
                  {
                    name: '🎯 Core Focus Areas',
                    value: focusListFormatted,
                    inline: false,
                  },
                  {
                    name: '💡 Why Join Alpha Collectiv3?',
                    value: `>>> ${newApp.whyJoin}`,
                    inline: false,
                  },
                  {
                    name: '💎 Values Brought to Alpha Collective',
                    value: newApp.valuesBrought ? `>>> ${newApp.valuesBrought}` : '*None specified*',
                    inline: false,
                  },
                  {
                    name: '🌐 Previous DAOs / Roles',
                    value: newApp.previousCommunities ? `>>> ${newApp.previousCommunities}` : '*None specified*',
                    inline: false,
                  },
                  {
                    name: '💳 EVM / SOL Whitelist Wallet',
                    value: newApp.walletAddress ? `\`${newApp.walletAddress}\`` : '*None provided*',
                    inline: false,
                  },
                ],
                footer: {
                  text: 'Alpha Collectiv3 • #invite-applications Council Gatekeeper',
                  icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
                },
                timestamp: new Date().toISOString(),
              },
            ],
          };

          const mainDeliveryPromise = fetch(DISCORD_APPLICATIONS_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cardPayload),
          })
            .then((res) => {
              if (res.ok) {
                console.log(`[DISCORD] Successfully delivered structured card for application ${appId} (Status: ${res.status})`);
              } else {
                console.warn(`[DISCORD] Webhook returned status ${res.status} for ${appId}`);
              }
              return { ok: res.ok, status: res.status };
            })
            .catch((err) => {
              console.warn('[DISCORD] Webhook transmission network error:', err?.message);
              return { ok: false, error: err?.message };
            });

          deliveryTasks.push(mainDeliveryPromise);
        } catch (webhookErr) {
          console.warn('[DISCORD] Webhook dispatch preparation error:', webhookErr);
        }

        // Cross-post applicant notice to Airdrop channel webhook if candidate has Airdrop focus
        if (
          Array.isArray(newApp.focusAreas) &&
          newApp.focusAreas.includes('airdrops') &&
          DISCORD_AIRDROP_WEBHOOK_URL
        ) {
          try {
            const airdropApplicantPayload = {
              username: 'Alpha Collectiv3 Portal',
              avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
              embeds: [
                {
                  title: '🪂 New Airdrop Hunter Candidate Applied!',
                  description: `**${newApp.fullName}** submitted an application with a key focus on **Airdrop Hunting & Testnets**!`,
                  color: 0x38BDF8, // Light blue
                  fields: [
                    {
                      name: '👤 Candidate',
                      value: newApp.fullName,
                      inline: true,
                    },
                    {
                      name: '🐦 X / Twitter',
                      value: `[${newApp.xUsername}](https://x.com/${newApp.xUsername.replace(/^@/, '')})`,
                      inline: true,
                    },
                    {
                      name: '💬 Discord Handle',
                      value: `\`${newApp.discordHandle}\``,
                      inline: true,
                    },
                    {
                      name: '⏳ Web3 Experience',
                      value: newApp.yearsInWeb3,
                      inline: true,
                    },
                    {
                      name: '⚡ Weekly Commitment',
                      value: newApp.weeklyActivity,
                      inline: true,
                    },
                    {
                      name: '💳 Whitelist Wallet',
                      value: newApp.walletAddress ? `\`${newApp.walletAddress}\`` : '*None*',
                      inline: true,
                    },
                    {
                      name: '💡 Why Join / Value',
                      value: newApp.whyJoin.slice(0, 400),
                      inline: false,
                    },
                  ],
                  footer: {
                    text: 'Alpha Collectiv3 • Airdrop Division Dispatch',
                    icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
                  },
                  timestamp: new Date().toISOString(),
                },
              ],
            };

            const airdropDeliveryPromise = fetch(DISCORD_AIRDROP_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(airdropApplicantPayload),
            }).catch((err) => {
              console.warn('[DISCORD] Airdrop channel webhook dispatch notice:', err?.message);
            });

            deliveryTasks.push(airdropDeliveryPromise);
          } catch (airdropErr) {
            console.warn('[DISCORD] Airdrop webhook dispatch error:', airdropErr);
          }
        }

        // Cross-post applicant notice to Trends channel webhook if candidate has NFT / DeFi focus
        if (
          Array.isArray(newApp.focusAreas) &&
          (newApp.focusAreas.includes('nfts') || newApp.focusAreas.includes('defi')) &&
          DISCORD_TRENDS_WEBHOOK_URL
        ) {
          try {
            const trendsApplicantPayload = {
              username: 'Alpha Collectiv3 Portal',
              avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
              embeds: [
                {
                  title: '📈 New NFT / Market Trends Candidate Applied!',
                  description: `**${newApp.fullName}** submitted an application focusing on **${newApp.focusAreas
                    .filter((f: string) => f === 'nfts' || f === 'defi')
                    .map((f: string) => FOCUS_AREA_LABELS[f] || f)
                    .join(' & ')}**!`,
                  color: 0xEF4444, // Red
                  fields: [
                    {
                      name: '👤 Candidate',
                      value: newApp.fullName,
                      inline: true,
                    },
                    {
                      name: '🐦 X / Twitter',
                      value: `[${newApp.xUsername}](https://x.com/${newApp.xUsername.replace(/^@/, '')})`,
                      inline: true,
                    },
                    {
                      name: '💬 Discord Handle',
                      value: `\`${newApp.discordHandle}\``,
                      inline: true,
                    },
                    {
                      name: '⏳ Web3 Experience',
                      value: newApp.yearsInWeb3,
                      inline: true,
                    },
                    {
                      name: '⚡ Weekly Commitment',
                      value: newApp.weeklyActivity,
                      inline: true,
                    },
                    {
                      name: '💡 Why Join / Value',
                      value: newApp.whyJoin.slice(0, 400),
                      inline: false,
                    },
                  ],
                  footer: {
                    text: 'Alpha Collectiv3 • Trends Division Dispatch',
                    icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
                  },
                  timestamp: new Date().toISOString(),
                },
              ],
            };

            const trendsDeliveryPromise = fetch(DISCORD_TRENDS_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(trendsApplicantPayload),
            }).catch((err) => {
              console.warn('[DISCORD] Trends channel webhook dispatch notice:', err?.message);
            });

            deliveryTasks.push(trendsDeliveryPromise);
          } catch (trendsErr) {
            console.warn('[DISCORD] Trends webhook dispatch error:', trendsErr);
          }
        }
      }

      // 3. Background submission to Google Form for spreadsheet sync
      try {
        const params = new URLSearchParams();
        params.append('entry.1536574840', newApp.fullName);
        params.append('entry.572848926', newApp.xUsername);
        params.append('entry.954633512', newApp.yearsInWeb3);
        params.append(
          'entry.969560273',
          `${newApp.whyJoin}${
            newApp.valuesBrought ? `\n\n[Values to Collective: ${newApp.valuesBrought}]` : ''
          }\n\n[DC: ${newApp.discordHandle} | Focus: ${newApp.focusAreas.join(
            ', '
          )} | Activity: ${newApp.weeklyActivity}]`
        );
        params.append(
          'entry.673122536',
          `${newApp.previousCommunities || 'None provided'}\n[Wallet: ${
            newApp.walletAddress || 'N/A'
          }]`
        );

        const formDeliveryPromise = fetch(GOOGLE_FORM_RESPONSE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        }).catch((e) => {
          console.warn('Google Form submission ping notice:', e?.message);
        });

        deliveryTasks.push(formDeliveryPromise);
      } catch (err) {
        console.warn('Google Form forward error:', err);
      }

      const deliveryResults = await Promise.allSettled(deliveryTasks);
      const mainResult = deliveryResults[0]?.status === 'fulfilled' ? (deliveryResults[0].value as any) : null;
      const isMainDelivered = mainResult ? Boolean(mainResult.ok) : false;

      res.status(200).json({
        ok: true,
        appId,
        discordDelivered: isMainDelivered,
        message: 'Application transmitted and stored successfully',
        storage: 'Persistent JSON database (data/applications.json) & Google Form sync',
        reviewWindow: '24-48 hours',
      });
    } catch (err: any) {
      console.error('Application submission error:', err);
      res.status(500).json({ error: 'Failed to record application' });
    }
  });

  app.get('/api/applications', (_req: Request, res: Response) => {
    res.json({
      count: applicationsStore.length,
      storageFile: 'data/applications.json',
      applications: applicationsStore,
    });
  });

  app.get('/api/applications/stats', (_req: Request, res: Response) => {
    res.json({
      totalReceived: applicationsStore.length + 154,
      pendingReview: applicationsStore.filter((a) => a.status === 'PENDING_REVIEW').length + 12,
      averageReviewHours: 24,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
