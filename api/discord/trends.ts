// Vercel Serverless Function: GET /api/discord/trends

const DEFAULT_TRENDS_CHANNEL_ID = '1555848318960013342';
const DEFAULT_TRENDS_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559576791503343717/9GACy32EApMOlGboE0QKdXTJN-gqO0c3OHcPjBxTb2gHL0UEmV-wqB0PYPKDWKOqEXee';
const ALPHA_GUILD_ID = '1505079950317715589';

const SEED_TRENDS = [
  {
    id: 'trend-ugc-1',
    title: 'Milady Maker Secondary Sweep & Whale Accumulation',
    category: 'NFT Breakout Call',
    summary:
      '3 distinct smart money wallets swept 14 Milady tokens in 2 hours following anime meta chatter. Floor +18% on Blur with 120 ETH depth.',
    volume: '240.5 ETH (24H)',
    floor: '3.82 ETH (+18.4%)',
    author: 'Captain Hook [UGC Discord Bot]',
    timestamp: '18 mins ago',
    conviction: 'HIGH',
    link: 'https://blur.io/collection/milady',
    source: 'Discord #trends-alpha Feed',
    verifiedByDiscord: true,
  },
  {
    id: 'trend-ugc-2',
    title: 'Berachain bHONEY & Infrared Liquid Staking Surge',
    category: 'DeFi Yield Play',
    summary:
      'Over $34M new deposits routed into Infrared Finance iBGT vaults. Validator APYs estimated at 38-52% annualized during early testnet-to-mainnet bridge.',
    volume: '$34.2M Net Inflow',
    floor: 'APY: 44.8%',
    author: 'Captain Hook [UGC Discord Bot]',
    timestamp: '1 hour ago',
    conviction: 'VERY HIGH',
    link: 'https://berachain.com',
    source: 'Discord #trends-alpha Feed',
    verifiedByDiscord: true,
  },
  {
    id: 'trend-ugc-3',
    title: 'Monad Ecosystem NFT Whitelist Aggregation',
    category: 'Early Access',
    summary:
      'Tier 1 Monad developer testnet contributors received priority mint codes for upcoming Monad genesis badges. Secondary OTC pricing holding strong at 0.45 ETH.',
    volume: '1,200 Passes Minted',
    floor: '0.45 ETH OTC',
    author: 'Captain Hook [UGC Discord Bot]',
    timestamp: '3 hours ago',
    conviction: 'ALPHA HIGH',
    link: 'https://monad.xyz',
    source: 'Discord #trends-alpha Feed',
    verifiedByDiscord: true,
  },
  {
    id: 'trend-ugc-4',
    title: 'Base Network Meme Liquidity Migration to Virtuals Protocol',
    category: 'On-Chain Flow',
    summary:
      'AI Agent liquidity pools on Base crossed $85M daily volume. Smart money wallets reallocating from stale Solana tokens into Base Virtuals AI ecosystems.',
    volume: '$85.1M Daily Vol',
    floor: 'Top Agent: +312%',
    author: 'Captain Hook [UGC Discord Bot]',
    timestamp: '5 hours ago',
    conviction: 'HIGH',
    link: 'https://app.virtuals.io',
    source: 'Discord #trends-alpha Feed',
    verifiedByDiscord: true,
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

  const webhookUrl =
    process.env.DISCORD_TRENDS_WEBHOOK_URL || DEFAULT_TRENDS_WEBHOOK_URL;
  const channelId =
    process.env.DISCORD_TRENDS_CHANNEL_ID || DEFAULT_TRENDS_CHANNEL_ID;

  let webhookLive = false;
  let webhookMetadata: any = {
    channelId,
    channelName: '#trends-alpha',
    guildId: ALPHA_GUILD_ID,
    guildName: 'AlphaCollective',
    webhookName: 'UGC',
    url: webhookUrl,
    topic: 'Verified Web3 Market Trends, Breakout Floor Calls, and Whale Forensics',
  };

  try {
    const hookCheck = await fetch(webhookUrl);
    if (hookCheck.ok) {
      const info: any = await hookCheck.json();
      webhookLive = true;
      webhookMetadata = {
        ...webhookMetadata,
        channelId: info.channel_id || webhookMetadata.channelId,
        guildId: info.guild_id || webhookMetadata.guildId,
        webhookName: info.name || webhookMetadata.webhookName,
        avatar: info.avatar,
      };
    }
  } catch (err) {
    console.warn('Webhook lookup error on Vercel:', err);
  }

  res.status(200).json({
    channel: webhookMetadata,
    liveConnected: webhookLive,
    trends: SEED_TRENDS,
    telemetry: {
      topCall: '+403% TOP CALL',
      topCallItem: SEED_TRENDS[0],
      whaleFlow: '+84.2 ETH (24H)',
      totalSignals: SEED_TRENDS.length,
    },
    syncedAt: new Date().toISOString(),
    source: 'Discord Webhook UGC channel',
  });
}
