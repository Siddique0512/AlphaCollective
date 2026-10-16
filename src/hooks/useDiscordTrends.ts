import { useState, useEffect, useCallback } from 'react';
import { dispatchTrendSignalDirect } from '../services/discordWebhook';

export interface TrendSignalItem {
  id: string;
  title: string;
  category: 'SURGE' | 'MINT' | 'ALLOCATION' | 'WHALE INFLOW' | string;
  badge: string;
  badgeColor: string;
  detail: string;
  floorBefore?: string;
  floorAfter?: string;
  gain: string;
  calledBy: string;
  chain: string;
  type: 'surges' | 'mints' | 'whales' | string;
  timestamp?: string;
  channelId?: string;
  source?: string;
}

export interface DiscordTrendsChannelMeta {
  channelId: string;
  channelName: string;
  guildId: string;
  guildName: string;
  webhookName: string;
  url: string;
  topic: string;
}

export interface TrendsTelemetry {
  topCall: string;
  topCallItem: TrendSignalItem | null;
  whaleFlow: string;
  totalSignals: number;
}

export interface DiscordTrendsState {
  trends: TrendSignalItem[];
  channel: DiscordTrendsChannelMeta;
  telemetry: TrendsTelemetry;
  liveConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  syncedAt: string;
  syncTrends: () => Promise<void>;
  broadcastTrend: (signal: Partial<TrendSignalItem>) => Promise<{ ok: boolean; message?: string; error?: string }>;
}

const INITIAL_TRENDS: TrendSignalItem[] = [
  {
    id: 'trend-cloud-quest',
    title: 'Cloud Quest Pass',
    category: 'SURGE',
    badge: '▲ +403% SURGE',
    badgeColor: 'bg-[#10B981]/20 text-[#34D399]',
    detail: 'Floor $4.37 ➔ $22.01 • Called by @NFTGuro',
    floorBefore: '$4.37',
    floorAfter: '$22.01',
    gain: '+403% (+$17.64 / pass)',
    calledBy: '@NFTGuro',
    chain: 'Ethereum',
    type: 'surges',
    timestamp: '2026-10-15T07:20:00Z',
    channelId: '1555848318960013342',
    source: 'Discord #trends (UGC Webhook)',
  },
  {
    id: 'trend-monkeyhood',
    title: 'MonkeyHood Free Mint',
    category: 'MINT',
    badge: 'LIQUID OFFERS',
    badgeColor: 'bg-[#38BDF8]/20 text-[#38BDF8]',
    detail: 'Free Mint (0.00 ETH) ➔ $21.15 Top Bid • Verified OpenSea',
    floorBefore: '0.00 ETH',
    floorAfter: '0.0156 WETH ($21.15)',
    gain: 'Pure Profit Free Mint',
    calledBy: 'Alpha Collective Core',
    chain: 'Ethereum',
    type: 'mints',
    timestamp: '2026-10-14T19:45:00Z',
    channelId: '1555848318960013342',
    source: 'Discord #trends (UGC Webhook)',
  },
  {
    id: 'trend-shinka',
    title: 'Shinka NFT Allocation',
    category: 'ALLOCATION',
    badge: '10 GTD ALLOCATED',
    badgeColor: 'bg-[#A855F7]/20 text-[#C084FC]',
    detail: 'Mint $4.50 ➔ Secondary Floor $12.00 (+166%)',
    floorBefore: '$4.50',
    floorAfter: '$12.00',
    gain: '+166% Gain',
    calledBy: 'Alpha Collective Whitelist Desk',
    chain: 'EVM / Polygon',
    type: 'surges',
    timestamp: '2026-10-14T12:10:00Z',
    channelId: '1555848318960013342',
    source: 'Discord #trends (UGC Webhook)',
  },
  {
    id: 'trend-monad-whales',
    title: 'Smart Money Wallet Cluster',
    category: 'WHALE INFLOW',
    badge: 'ACCUMULATION',
    badgeColor: 'bg-[#F59E0B]/20 text-[#F59E0B]',
    detail: 'Net Inflow: +84.2 ETH into early Monad testnet mints',
    floorBefore: 'Early Discovery',
    floorAfter: 'Active Inflow',
    gain: 'High Conviction (+84.2 ETH)',
    calledBy: 'On-Chain Forensics Desk',
    chain: 'Monad EVM',
    type: 'whales',
    timestamp: '2026-10-15T04:30:00Z',
    channelId: '1555848318960013342',
    source: 'Discord #trends (UGC Webhook)',
  },
];

export const useDiscordTrends = (): DiscordTrendsState => {
  const [trends, setTrends] = useState<TrendSignalItem[]>(INITIAL_TRENDS);
  const [channel, setChannel] = useState<DiscordTrendsChannelMeta>({
    channelId: '1555848318960013342',
    channelName: '#trends-alpha',
    guildId: '1505079950317715589',
    guildName: 'AlphaCollective',
    webhookName: 'UGC',
    url: 'https://discord.com/api/webhooks/1559576791503343717/9GACy32EApMOlGboE0QKdXTJN-gqO0c3OHcPjBxTb2gHL0UEmV-wqB0PYPKDWKOqEXee',
    topic: 'Verified Web3 Market Trends, Breakout Floor Calls, and Whale Forensics',
  });
  const [telemetry, setTelemetry] = useState<TrendsTelemetry>({
    topCall: '+403% TOP CALL',
    topCallItem: INITIAL_TRENDS[0],
    whaleFlow: '+84.2 ETH (24H)',
    totalSignals: INITIAL_TRENDS.length,
  });
  const [liveConnected, setLiveConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncedAt, setSyncedAt] = useState<string>(() => new Date().toISOString());

  const syncTrends = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/discord/trends');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.trends) && data.trends.length > 0) {
          setTrends(data.trends);
        }
        if (data.channel && typeof data.channel === 'object') {
          setChannel((prev) => ({
            ...prev,
            ...data.channel,
            channelId: data.channel.channelId || data.channel.id || prev.channelId || '1555848318960013342',
            channelName: data.channel.channelName || data.channel.name || prev.channelName || '#trends-alpha',
          }));
        }
        if (data.telemetry) {
          setTelemetry(data.telemetry);
        }
        setLiveConnected(Boolean(data.liveConnected));
        setSyncedAt(data.syncedAt || new Date().toISOString());
      }
    } catch (err) {
      console.warn('Failed to sync Discord trends feed:', err);
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, []);

  const broadcastTrend = useCallback(async (signal: Partial<TrendSignalItem>) => {
    // 1. Try serverless / server endpoint
    try {
      const res = await fetch('/api/discord/trends/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signal),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.ok) {
          if (data.signal) {
            setTrends((prev) => [data.signal, ...prev]);
          }
          return { ok: true, message: data.message };
        }
      }
    } catch {
      // Endpoint unavailable on Vercel static deployment
    }

    // 2. Direct Discord webhook dispatch fallback
    const directRes = await dispatchTrendSignalDirect(signal);
    if (directRes.ok) {
      const mockSignal: TrendSignalItem = {
        id: `trend-${Date.now().toString(36)}`,
        title: signal.title || 'Market Breakout Signal',
        category: signal.category || 'SURGE',
        badge: signal.badge || 'HOT',
        badgeColor: signal.badgeColor || '#EF4444',
        detail: signal.detail || 'Live market call verified by Alpha Collective',
        gain: signal.gain || '+45%',
        calledBy: signal.calledBy || 'Alpha UGC Bot',
        chain: signal.chain || 'Ethereum',
        type: (signal.type as any) || 'surges',
        timestamp: 'Just now',
        source: 'Discord #trends-alpha Feed',
      };
      setTrends((prev) => [mockSignal, ...prev]);
    }
    return directRes;
  }, []);

  useEffect(() => {
    syncTrends();
    // Poll every 45s for fresh channel updates
    const interval = setInterval(() => {
      syncTrends();
    }, 45000);
    return () => clearInterval(interval);
  }, [syncTrends]);

  return {
    trends,
    channel,
    telemetry,
    liveConnected,
    isLoading,
    isSyncing,
    syncedAt,
    syncTrends,
    broadcastTrend,
  };
};
