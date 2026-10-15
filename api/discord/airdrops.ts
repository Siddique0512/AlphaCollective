// Vercel Serverless Function: GET /api/discord/airdrops

const DEFAULT_AIRDROP_CHANNEL_ID = '1557705831812964393';
const DEFAULT_AIRDROP_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559546892252352592/kOJuuMgNYiEsMfnjFXvEt70NEb2rR2-CEp34hewUkdHrc74YH0NfXyn-BIn_AyUDSAYB';
const ALPHA_GUILD_ID = '1505079950317715589';

const INITIAL_AIRDROPS = [
  {
    id: 'airdrop-monad',
    projectName: 'Monad Network',
    ticker: 'MONAD',
    category: 'layer1',
    chain: 'Monad EVM (10k TPS)',
    cost: 'FREE (Testnet)',
    stage: 'Testnet Phase 1',
    estimatedPotential: '$2,500 – $6,000',
    timeEstimate: '15 mins / week',
    badgeText: 'HOT SIGNAL',
    highlight: true,
    overview:
      'High-performance 10,000 TPS parallel EVM L1. $225M Series A led by Paradigm. Active testnet faucet and smart contract interactions prioritized for Genesis allocation.',
    requirements: [
      'Join Monad Discord & claim testnet faucet role',
      'Execute 10+ swaps on ambient/monad dexes',
      'Deploy minimal smart contract or mint testnet NFT',
      'Hold Alpha Collective Discord verified roles',
    ],
    officialUrl: 'https://monad.xyz',
    discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
    guideSteps: [
      'Connect Web3 wallet to Monad Testnet RPC',
      'Request testnet MON from official Discord channel #faucet',
      'Bridge testnet funds from Sepolia testnet to Monad',
      'Interact with verified native DEX test builds 2x weekly',
      'Log transaction hashes in Alpha Collective #airdrop-alpha thread',
    ],
    author: {
      name: 'Alpha Airdrop Division',
      role: 'Core Lead',
    },
    updatedAt: '2 hours ago',
  },
  {
    id: 'airdrop-berachain',
    projectName: 'Berachain (bArtio)',
    ticker: 'BERA',
    category: 'layer1',
    chain: 'Cosmos SDK / Polaris EVM',
    cost: 'FREE (Testnet)',
    stage: 'Public Testnet bArtio',
    estimatedPotential: '$1,500 – $4,500',
    timeEstimate: '20 mins / week',
    badgeText: 'HIGH VALUE',
    highlight: false,
    overview:
      'Proof of Liquidity (PoL) L1 raised over $142M. The bArtio testnet is the final incentivized testing ground before mainnet token generation event.',
    requirements: [
      'Faucet claim BERA every 8 hours on bArtio',
      'Mint HONEY on Honey dApp by depositing testnet assets',
      'Provide liquidity on BEX and stake LP tokens into BGT reward vaults',
      'Delegate earned BGT to Alpha Collective partner validators',
    ],
    officialUrl: 'https://berachain.com',
    discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
    guideSteps: [
      'Claim BERA at bartio.faucet.berachain.com',
      'Swap 50% BERA to STGUSDC on BEX',
      'Mint HONEY with STGUSDC on Honey dApp',
      'Stake BERA-HONEY LP to begin accumulating BGT yield',
      'Vote on Berachain Governance testnet proposals',
    ],
    author: {
      name: 'Alpha Airdrop Division',
      role: 'Senior Researcher',
    },
    updatedAt: '4 hours ago',
  },
  {
    id: 'airdrop-virtuals',
    projectName: 'Virtuals Protocol (Base)',
    ticker: 'VIRTUAL',
    category: 'ai',
    chain: 'Base L2',
    cost: 'LOW GAS ($5)',
    stage: 'Mainnet Incentive Pools',
    estimatedPotential: '$800 – $2,200',
    timeEstimate: '10 mins',
    badgeText: 'TRENDING AI',
    highlight: true,
    overview:
      'Co-ownership protocol for Autonomous AI Agents on Base. Platform revenue-sharing points distributed to active agent holders and liquidity providers.',
    requirements: [
      'Hold or stake 50+ VIRTUAL on Base',
      'Interact with at least 2 conversational agent dApps weekly',
      'Participate in Genesis agent co-token launches',
    ],
    officialUrl: 'https://app.virtuals.io',
    discordThreadUrl: 'https://discord.com/channels/1505079950317715589/1557705831812964393',
    guideSteps: [
      'Swap ETH for VIRTUAL on Aerodrome (Base)',
      'Stake VIRTUAL in official Agent Factory pool',
      'Bond small positions into newly minted Autonomous AI Agents',
    ],
    author: {
      name: 'Alpha Airdrop Division',
      role: 'AI Researcher',
    },
    updatedAt: '6 hours ago',
  },
];

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

  const channelId =
    process.env.DISCORD_AIRDROP_CHANNEL_ID || DEFAULT_AIRDROP_CHANNEL_ID;
  const webhookUrl =
    process.env.DISCORD_AIRDROP_WEBHOOK_URL || DEFAULT_AIRDROP_WEBHOOK_URL;

  let webhookLive = false;
  try {
    const hookCheck = await fetch(webhookUrl);
    if (hookCheck.ok) {
      webhookLive = true;
    }
  } catch (err) {
    console.warn('Airdrop webhook check error on Vercel:', err);
  }

  res.status(200).json({
    channel: {
      id: channelId,
      name: 'airdrop-alpha',
      guildId: ALPHA_GUILD_ID,
      topic: 'Verified On-Chain Airdrop Intel, Testnet farming guides, and sybil defense',
      liveWebhookUrl: webhookUrl,
    },
    liveConnected: webhookLive,
    totalSignals: INITIAL_AIRDROPS.length,
    airdrops: INITIAL_AIRDROPS,
    syncedAt: new Date().toISOString(),
    source: 'Discord Webhook Airdrop Channel',
  });
}
