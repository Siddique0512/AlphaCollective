import { useState, useEffect, useCallback } from 'react';
import { dispatchAirdropSignalDirect } from '../services/discordWebhook';

export interface DiscordAirdropItem {
  id: string;
  projectName: string;
  ticker?: string;
  category: 'L1' | 'DeFi' | 'DePIN' | 'Gaming' | 'Restaking' | 'Infrastructure' | string;
  chain: string;
  cost: 'FREE / TESTNET' | 'LOW GAS' | 'VOLUME / STAKING' | string;
  stage: string;
  estimatedPotential: string;
  status: 'ACTIVE' | 'HOT' | 'CONFIRMED TGE' | 'CLOSING SOON' | string;
  postedAt: string;
  author: {
    name: string;
    handle: string;
    role: string;
    avatar: string;
  };
  overview: string;
  guideSteps: string[];
  requirements: string[];
  officialUrl: string;
  discordThreadUrl?: string;
  tgeTiming: string;
  backerFunding?: string;
}

export interface DiscordChannelMeta {
  channelId: string;
  channelName: string;
  guildId: string;
  guildName: string;
  topic: string;
  hunter: string;
}

export interface DiscordAirdropsState {
  airdrops: DiscordAirdropItem[];
  channel: DiscordChannelMeta;
  liveConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  syncedAt: string;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  syncChannel: (channelId?: string) => Promise<void>;
  broadcastAirdrop: (airdrop: DiscordAirdropItem) => Promise<{ ok: boolean; message?: string; error?: string }>;
}

const INITIAL_AIRDROPS: DiscordAirdropItem[] = [
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

export const useDiscordAirdrops = (initialChannelId?: string): DiscordAirdropsState => {
  const [airdrops, setAirdrops] = useState<DiscordAirdropItem[]>(INITIAL_AIRDROPS);
  const [channel, setChannel] = useState<DiscordChannelMeta>({
    channelId: initialChannelId || '1557705831812964393',
    channelName: '#airdrop-alpha',
    guildId: '1505079950317715589',
    guildName: 'AlphaCollective',
    topic: 'Verified Web3 Airdrop intel, testnet farming guides, and node operations led by @Finisher',
    hunter: 'Finisher',
  });
  const [liveConnected, setLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string>(() => new Date().toISOString());
  const [activeFilter, setActiveFilter] = useState('ALL');

  const syncChannel = useCallback(async (channelIdOverride?: string) => {
    setIsSyncing(true);
    try {
      const targetChannel = channelIdOverride || channel.channelId;
      const res = await fetch(`/api/discord/airdrops?channelId=${encodeURIComponent(targetChannel)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.airdrops) && data.airdrops.length > 0) {
          setAirdrops(data.airdrops);
        }
        if (data.channel && typeof data.channel === 'object') {
          setChannel((prev) => ({
            ...prev,
            ...data.channel,
            channelId: data.channel.channelId || data.channel.id || prev.channelId || '1557705831812964393',
            channelName: data.channel.channelName || data.channel.name || prev.channelName || '#airdrop-alpha',
          }));
        }
        setLiveConnected(Boolean(data.liveConnected));
        setSyncedAt(data.syncedAt || new Date().toISOString());
      }
    } catch (err) {
      console.warn('Failed to sync Discord channel:', err);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [channel.channelId]);

  useEffect(() => {
    syncChannel();
    // Poll every 45 seconds for new Discord signals
    const interval = setInterval(() => {
      syncChannel();
    }, 45000);
    return () => clearInterval(interval);
  }, [syncChannel]);

  const broadcastAirdrop = useCallback(async (airdrop: DiscordAirdropItem) => {
    // 1. Try serverless / server endpoint
    try {
      const res = await fetch('/api/discord/airdrops/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(airdrop),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.ok) {
          return { ok: true, message: data.message };
        }
      }
    } catch {
      // Endpoint unavailable on Vercel static deployment
    }

    // 2. Direct Discord webhook dispatch fallback
    return await dispatchAirdropSignalDirect(airdrop);
  }, []);

  return {
    airdrops,
    channel,
    liveConnected,
    isLoading,
    isSyncing,
    syncedAt,
    activeFilter,
    setActiveFilter,
    syncChannel,
    broadcastAirdrop,
  };
};
