import React, { useState, useEffect } from 'react';
import {
  X,
  Ticket,
  TrendingUp,
  Gamepad2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Trophy,
  ExternalLink,
  RotateCcw,
  Radio,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Gift,
  Flame,
  Layers,
  RefreshCw,
  Send,
  Zap,
  Tag,
  Check,
  Info,
} from 'lucide-react';
import {
  useTesseraRaffles,
  TesseraRaffle,
  TesseraWinner,
} from '../hooks/useTesseraRaffles';
import {
  useDiscordAirdrops,
  DiscordAirdropItem,
} from '../hooks/useDiscordAirdrops';
import {
  useDiscordTrends,
  TrendSignalItem,
} from '../hooks/useDiscordTrends';
import {
  dispatchAirdropSignalDirect,
  dispatchTrendSignalDirect,
} from '../services/discordWebhook';

export type PillarType = 'raffles' | 'airdrops' | 'trends' | 'games';

interface PillarDetailModalProps {
  pillar: PillarType | null;
  onClose: () => void;
}

function formatCountdown(endAtIso: string, nowMs: number): string {
  if (!endAtIso) return 'Live now';
  const normalized =
    endAtIso.endsWith('Z') || endAtIso.includes('+') ? endAtIso : `${endAtIso}Z`;
  const target = new Date(normalized).getTime();
  if (Number.isNaN(target)) return 'Live now';

  const diff = target - nowMs;
  if (diff <= 0) return 'Drawing soon';

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m left`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s left`;
  }
  return `${minutes}m ${seconds}s left`;
}

function maskWallet(wallet: string): string {
  if (!wallet || wallet.length < 12) return wallet || 'Verified Wallet';
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

export const TREND_SIGNALS = [
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
  },
];

export const PillarDetailModal: React.FC<PillarDetailModalProps> = ({
  pillar,
  onClose,
}) => {
  // 1. RAFFLES STATE (Tessera)
  const {
    activeRaffles,
    endedRaffles,
    stats,
    isLoading: isRafflesLoading,
    isRefreshing: isRafflesRefreshing,
    refresh: refreshRaffles,
    fetchWinners,
  } = useTesseraRaffles();

  const [raffleTab, setRaffleTab] = useState<'active' | 'ended'>('active');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [expandedWinnersId, setExpandedWinnersId] = useState<string | null>(null);
  const [winnersMap, setWinnersMap] = useState<
    Record<
      string,
      {
        loading: boolean;
        ready: boolean;
        winners: TesseraWinner[];
        reason?: string;
      }
    >
  >({});

  // 2. AIRDROPS STATE (Discord Channel Sync)
  const {
    airdrops,
    channel: discordChannel,
    liveConnected: isDiscordLive,
    isSyncing: isAirdropsSyncing,
    syncedAt: airdropsSyncedAt,
    syncChannel,
  } = useDiscordAirdrops();

  const [airdropFilter, setAirdropFilter] = useState<
    'ALL' | 'FREE' | 'CONFIRMED' | 'L1' | 'DEFI' | 'DEPIN'
  >('ALL');
  const [customChannelInput, setCustomChannelInput] = useState('');
  const [showChannelConfig, setShowChannelConfig] = useState(false);

  // 3. TRENDS STATE (Discord UGC Webhook Sync)
  const {
    trends: discordTrends,
    channel: discordTrendsChannel,
    isSyncing: isTrendsSyncing,
    syncTrends,
  } = useDiscordTrends();

  const [trendsFilter, setTrendsFilter] = useState<'all' | 'mints' | 'surges' | 'whales'>('all');

  // DISCORD BROADCASTING STATES
  const [broadcastingTrendId, setBroadcastingTrendId] = useState<string | null>(null);
  const [broadcastedTrends, setBroadcastedTrends] = useState<Record<string, boolean>>({});
  const [broadcastingAirdropId, setBroadcastingAirdropId] = useState<string | null>(null);
  const [broadcastedAirdrops, setBroadcastedAirdrops] = useState<Record<string, boolean>>({});
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const handleBroadcastTrend = async (signal: any) => {
    setBroadcastingTrendId(signal.id);
    let success = false;
    try {
      const res = await fetch('/api/discord/trends/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signal),
      });
      if (res.ok) {
        success = true;
      }
    } catch {
      // Endpoint unavailable on Vercel static deployment
    }

    // Direct fallback
    if (!success) {
      const direct = await dispatchTrendSignalDirect(signal);
      success = direct.ok;
    }

    if (success) {
      setBroadcastedTrends((prev) => ({ ...prev, [signal.id]: true }));
      setBroadcastNotice(`Signal "${signal.title}" sent to Discord #trends channel!`);
      syncTrends();
      setTimeout(() => {
        setBroadcastNotice(null);
        setBroadcastedTrends((prev) => ({ ...prev, [signal.id]: false }));
      }, 4000);
    }
    setBroadcastingTrendId(null);
  };

  const handleBroadcastAirdrop = async (item: DiscordAirdropItem) => {
    setBroadcastingAirdropId(item.id);
    let success = false;
    try {
      const res = await fetch('/api/discord/airdrops/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        success = true;
      }
    } catch {
      // Endpoint unavailable on Vercel static deployment
    }

    // Direct fallback
    if (!success) {
      const direct = await dispatchAirdropSignalDirect(item);
      success = direct.ok;
    }

    if (success) {
      setBroadcastedAirdrops((prev) => ({ ...prev, [item.id]: true }));
      setBroadcastNotice(`Signal "${item.projectName}" sent to Discord #airdrop-alpha!`);
      setTimeout(() => {
        setBroadcastNotice(null);
        setBroadcastedAirdrops((prev) => ({ ...prev, [item.id]: false }));
      }, 4000);
    }
    setBroadcastingAirdropId(null);
  };

  // Live 1-second ticker for active raffle countdowns
  useEffect(() => {
    if (pillar !== 'raffles') return;
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [pillar]);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (pillar) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pillar, onClose]);

  const handleToggleWinners = async (raffle: TesseraRaffle) => {
    const key = raffle.slug || raffle.raffleId;
    if (expandedWinnersId === raffle.raffleId) {
      setExpandedWinnersId(null);
      return;
    }
    setExpandedWinnersId(raffle.raffleId);
    if (winnersMap[raffle.raffleId]) return;

    setWinnersMap((prev) => ({
      ...prev,
      [raffle.raffleId]: { loading: true, ready: false, winners: [] },
    }));

    const res = await fetchWinners(key);
    setWinnersMap((prev) => ({
      ...prev,
      [raffle.raffleId]: {
        loading: false,
        ready: res.ready,
        winners: res.winners,
        reason: res.reason,
      },
    }));
  };

  const handleCustomChannelSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChannelInput.trim()) {
      syncChannel(customChannelInput.trim());
      setShowChannelConfig(false);
    }
  };

  if (!pillar) return null;

  const displayedRaffles = raffleTab === 'active' ? activeRaffles : endedRaffles;

  const filteredAirdrops = airdrops.filter((item) => {
    if (airdropFilter === 'ALL') return true;
    if (airdropFilter === 'FREE') return item.cost.toLowerCase().includes('free');
    if (airdropFilter === 'CONFIRMED')
      return item.status.toLowerCase().includes('confirmed');
    if (airdropFilter === 'L1')
      return item.category === 'L1' || item.category === 'Infrastructure';
    if (airdropFilter === 'DEFI') return item.category === 'DeFi';
    if (airdropFilter === 'DEPIN') return item.category === 'DePIN';
    return true;
  });

  return (
    <div
      id="pillar-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${
          pillar === 'raffles' || pillar === 'airdrops' ? 'max-w-3xl' : 'max-w-2xl'
        } max-h-[90vh] overflow-y-auto rounded-2xl bg-[#141416] border border-[#2B2D31] text-[#F5F5F3] shadow-[0_25px_70px_rgba(0,0,0,0.9)] p-5 sm:p-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-[#1E1F22] hover:bg-[#2B2D31] text-[#A8A8A5] hover:text-white border border-[#2B2D31] transition-colors cursor-pointer z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Live Discord Broadcast Toast Notice */}
        {broadcastNotice && (
          <div className="mb-4 p-3 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-white text-xs font-mono flex items-center justify-between gap-2 animate-in fade-in">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#10B981]" />
              <strong className="text-[#34D399]">{broadcastNotice}</strong>
            </span>
            <span className="text-[10px] text-[#A8A8A5] font-mono">Webhook Dispatched</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* PILLAR 1: RAFFLES (Tessera Discord Raffles)                    */}
        {/* ============================================================== */}
        {pillar === 'raffles' && (
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5" />
                  01 / RAFFLES
                </span>
                <span className="text-[11px] font-mono text-[#34D399] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/25 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                  DISCORD TESSERA SYNC
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white uppercase tracking-tight">
                    ACTIVE DISCORD RAFFLES
                  </h2>
                  <p className="mt-1 text-sm font-sans text-[#A8A8A5]">
                    Real-time allowlists, guaranteed mint allocations, and multiplier boosts directly linked to Alpha Collectiv3 membership.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => refreshRaffles()}
                  disabled={isRafflesRefreshing}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-xs font-mono text-[#E0E0DD] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Force refresh live raffle data from Tessera"
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 text-[#10B981] ${
                      isRafflesRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                  <span>{isRafflesRefreshing ? 'SYNCING...' : 'REFRESH'}</span>
                </button>
              </div>
            </div>

            {/* Live Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0B0B0C] border border-[#242428]">
                <span className="text-[#888885] text-[10px] block uppercase">Live Raffles</span>
                <span className="text-lg font-bold text-[#34D399]">
                  {stats.activeCount} ACTIVE
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0B0C] border border-[#242428]">
                <span className="text-[#888885] text-[10px] block uppercase">Allocations</span>
                <span className="text-lg font-bold text-white">
                  {stats.totalActiveWinners} WL SPOTS
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0B0C] border border-[#242428]">
                <span className="text-[#888885] text-[10px] block uppercase">Total Entries</span>
                <span className="text-lg font-bold text-white">
                  {stats.totalActiveEntries}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B0B0C] border border-[#242428]">
                <span className="text-[#888885] text-[10px] block uppercase">Tessera Team</span>
                <span className="text-xs font-bold text-[#A8A8A5] truncate block mt-1">
                  ALPHA COLLECTIV3
                </span>
              </div>
            </div>

            {/* Filter Tabs: Active vs Recently Ended */}
            <div className="flex items-center justify-between border-b border-[#242428] pb-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRaffleTab('active')}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                    raffleTab === 'active'
                      ? 'bg-[#10B981] text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-[#1C1C21] text-[#A8A8A5] hover:text-white border border-[#2B2D31]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ACTIVE NOW ({activeRaffles.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRaffleTab('ended')}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    raffleTab === 'ended'
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#1C1C21] text-[#A8A8A5] hover:text-white border border-[#2B2D31]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>RECENTLY ENDED ({endedRaffles.length})</span>
                </button>
              </div>
            </div>

            {/* Raffles List */}
            {isRafflesLoading ? (
              <div className="p-12 text-center text-xs font-mono text-[#888885] space-y-3">
                <div className="w-8 h-8 mx-auto border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                <p>Loading live Discord raffles from Tessera API...</p>
              </div>
            ) : displayedRaffles.length === 0 ? (
              <div className="p-10 rounded-xl bg-[#0B0B0C] border border-[#242428] text-center space-y-3">
                <Ticket className="w-8 h-8 mx-auto text-[#666662]" />
                <div className="text-white font-bold text-sm">
                  {raffleTab === 'active'
                    ? 'All current Discord raffles have drawn!'
                    : 'No recently ended raffles recorded.'}
                </div>
                <p className="text-xs font-sans text-[#888885] max-w-md mx-auto">
                  New whitelists drop multiple times per week. Turn on notifications in the Alpha Collectiv3 Discord to enter early.
                </p>
                <a
                  href="https://discord.gg/awSJ7sRYMu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#D71920] text-white text-xs font-mono font-semibold"
                >
                  OPEN DISCORD RAFFLES ↗
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedRaffles.map((raffle) => {
                  const isActive = raffle.status === 'active';
                  const countdown = formatCountdown(raffle.endAt, nowMs);
                  const winnersData = winnersMap[raffle.raffleId];
                  const isExpanded = expandedWinnersId === raffle.raffleId;

                  return (
                    <div
                      key={raffle.raffleId}
                      className={`p-5 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-[#0E0E10] border-[#2B2D31] hover:border-[#10B981]/50'
                          : 'bg-[#0E0E10]/80 border-[#222226]'
                      }`}
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header: Avatar, Title, Status & Timer */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={raffle.image}
                              alt={raffle.title}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://pbs.twimg.com/profile_images/2090326863961083904/dTqfCrgi_400x400.jpg';
                              }}
                              className="w-12 h-12 rounded-xl object-cover border border-[#2B2D31] bg-[#141416]"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base sm:text-lg font-bold text-white">
                                  {raffle.title}
                                </h3>
                                {raffle.partnerXHandle && (
                                  <a
                                    href={`https://x.com/${raffle.partnerXHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-mono text-[#38BDF8] hover:underline"
                                  >
                                    @{raffle.partnerXHandle}
                                  </a>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-[#888885]">
                                <span>{raffle.requiredWalletType} WALLET</span>
                                <span>•</span>
                                <span>Runner: {raffle.runner.displayName}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 text-xs font-mono font-bold">
                                <Clock className="w-3 h-3 animate-pulse" />
                                {countdown}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-[#A8A8A5] text-xs font-mono">
                                ENDED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle Stats Bar: Winners, Entries & Tiers */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg bg-[#141416] border border-[#222226] text-xs font-mono">
                          <div>
                            <span className="text-[#888885] text-[10px] block">TOTAL WINNERS</span>
                            <span className="text-white font-bold text-sm">
                              {raffle.winnerCount} Slots
                            </span>
                          </div>
                          <div>
                            <span className="text-[#888885] text-[10px] block">ENTRIES</span>
                            <span className="text-white font-bold text-sm">
                              {raffle.entryCount}
                            </span>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[#888885] text-[10px] block">TIER SPLIT</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {raffle.tiers && raffle.tiers.length > 0 ? (
                                raffle.tiers.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-1.5 py-0.2 rounded bg-[#202025] text-[#D4D4D0] border border-[#2E2E35]"
                                  >
                                    {t.name}: {t.count}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-[#A8A8A5]">Standard WL</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Discord Multipliers / Boosts */}
                        {raffle.roleBoosts && raffle.roleBoosts.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20 space-y-1.5">
                            <div className="text-[10px] font-mono font-bold text-[#34D399] uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              Alpha Collectiv3 Discord Role Multipliers
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {raffle.roleBoosts.map((rb, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#141416] text-white border border-[#2B2D31] flex items-center gap-1"
                                >
                                  <span>{rb.roleName}</span>
                                  <strong className="text-[#10B981]">
                                    {rb.multiplier > 1 ? `${rb.multiplier}x` : 'Eligible'}
                                  </strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Footer */}
                        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-[#1C1C21]">
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleToggleWinners(raffle)}
                              className="px-3.5 py-2 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-xs font-mono text-white flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                              <span>{isExpanded ? 'HIDE WINNERS' : 'VIEW DRAWN WINNERS'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          <a
                            href={raffle.raffleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-black text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                          >
                            <span>{isActive ? 'ENTER RAFFLE ON TESSERA' : 'VIEW ON TESSERA'}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Expandable Winners Section */}
                        {isExpanded && (
                          <div className="mt-2 p-3.5 rounded-lg bg-[#0B0B0C] border border-[#202024] space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-xs font-mono border-b border-[#1C1C20] pb-2">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                                Verified Winners List
                              </span>
                              {winnersData && (
                                <span className="text-[11px] text-[#A8A8A5]">
                                  {winnersData.winners.length} winners drawn
                                </span>
                              )}
                            </div>

                            {winnersData?.loading ? (
                              <div className="p-4 text-center text-xs font-mono text-[#888885]">
                                Fetching verified drawn winners from Tessera...
                              </div>
                            ) : winnersData?.winners.length === 0 ? (
                              <div className="p-3 text-center text-xs font-mono text-[#888885]">
                                {winnersData.reason === 'not_drawn'
                                  ? 'This raffle is awaiting final draw confirmation.'
                                  : 'Winners data is being synchronized.'}
                              </div>
                            ) : (
                              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                                {winnersData?.winners.map((w, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2 rounded bg-[#141416] border border-[#1E1E22] flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="text-[#F59E0B] font-bold text-[11px]">
                                        #{w.rank}
                                      </span>
                                      <span className="text-white truncate font-medium">
                                        {w.username}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded bg-[#202025] text-[#D4D4D0] text-[10px]">
                                        {w.tierName}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {w.xHandle && (
                                        <span className="text-[11px] text-[#38BDF8]">
                                          @{w.xHandle}
                                        </span>
                                      )}
                                      <span className="text-[11px] text-[#A8A8A5]">
                                        {maskWallet(w.wallet)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PILLAR 2: AIRDROPS (Discord Channel Intel & Testnet Guides)   */}
        {/* ============================================================== */}
        {pillar === 'airdrops' && (
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  02 / AIRDROPS & TESTNET INTEL
                </span>
                <span className="text-[11px] font-mono text-[#38BDF8] bg-[#0284C7]/10 px-2.5 py-0.5 rounded-full border border-[#0284C7]/25 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
                  FEED: {discordChannel.channelName}
                </span>
                <span className="text-[10px] font-mono text-[#A8A8A5] bg-[#1E1F22] px-2 py-0.5 rounded-full border border-[#2B2D31]">
                  LEAD: @{discordChannel.hunter}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white uppercase tracking-tight">
                    ON-CHAIN AIRDROP RADAR
                  </h2>
                  <p className="mt-1 text-sm font-sans text-[#A8A8A5]">
                    Verified farming checklists, testnet step-by-step guides, faucet instructions, and early alpha calls directly from our Discord channel.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => syncChannel()}
                    disabled={isAirdropsSyncing}
                    className="px-3 py-1.5 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-xs font-mono text-[#E0E0DD] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    title="Synchronize fresh signals from Discord channel"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 text-[#38BDF8] ${
                        isAirdropsSyncing ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{isAirdropsSyncing ? 'SYNCING...' : 'SYNC FEED'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowChannelConfig(!showChannelConfig)}
                    className="p-1.5 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-[#A8A8A5] hover:text-white transition-colors cursor-pointer"
                    title="Configure Discord Channel ID"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Channel ID Config Input */}
            {showChannelConfig && (
              <form
                onSubmit={handleCustomChannelSync}
                className="p-3.5 rounded-xl bg-[#0B0B0C] border border-[#26262B] space-y-2 animate-in fade-in"
              >
                <div className="text-xs font-mono text-white font-semibold flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Discord Channel Sync Settings</span>
                </div>
                <p className="text-[11px] font-sans text-[#888885]">
                  Currently syncing from channel ID <strong className="text-white font-mono">{discordChannel.channelId}</strong> ({discordChannel.channelName}). To sync any specific channel, paste its ID below:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customChannelInput}
                    onChange={(e) => setCustomChannelInput(e.target.value)}
                    placeholder="Enter Discord Channel ID (e.g. 1535452231950667876)"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#141416] border border-[#2B2D31] text-xs font-mono text-white placeholder:text-[#555558] focus:outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-[#38BDF8] text-black font-mono text-xs font-bold hover:bg-[#0ea5e9] transition-colors cursor-pointer"
                  >
                    SYNC NOW
                  </button>
                </div>
              </form>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              {[
                { id: 'ALL', label: `ALL SIGNALS (${airdrops.length})` },
                { id: 'FREE', label: 'FREE / TESTNET' },
                { id: 'CONFIRMED', label: 'CONFIRMED TGE' },
                { id: 'L1', label: 'L1 & CHAINS' },
                { id: 'DEFI', label: 'DEFI' },
                { id: 'DEPIN', label: 'DEPIN & NODES' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAirdropFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-full border transition-colors cursor-pointer shrink-0 ${
                    airdropFilter === tab.id
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-[#141416] text-[#888885] border-[#29292B] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Airdrops Feed */}
            <div className="space-y-4">
              {filteredAirdrops.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-[#0E0E10] border border-[#2B2D31] hover:border-[#38BDF8]/40 transition-all space-y-4"
                >
                  {/* Top: Project Info & Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {item.projectName}
                          {item.ticker && (
                            <span className="text-xs px-2 py-0.5 rounded bg-[#1F1F24] text-[#A8A8A5] font-mono border border-[#2B2D31]">
                              {item.ticker}
                            </span>
                          )}
                        </h3>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 font-bold">
                          {item.chain}
                        </span>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            item.cost.includes('FREE')
                              ? 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30'
                              : 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30'
                          }`}
                        >
                          {item.cost}
                        </span>

                        {item.status === 'HOT' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D71920]/15 text-[#EF4444] border border-[#D71920]/30 font-bold flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> HOT
                          </span>
                        )}
                        {item.status === 'CONFIRMED TGE' && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 font-bold">
                            CONFIRMED TGE
                          </span>
                        )}
                      </div>

                      {/* Hunter Author Attribution */}
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={item.author.avatar}
                          alt={item.author.name}
                          className="w-5 h-5 rounded-full object-cover border border-white/20"
                        />
                        <span className="text-xs font-mono text-[#A8A8A5]">
                          Alpha Call by{' '}
                          <strong className="text-white">@{item.author.handle}</strong>{' '}
                          <span className="text-[#38BDF8]">({item.author.role})</span>
                        </span>
                      </div>
                    </div>

                    {/* Potential Valuation Box */}
                    <div className="sm:text-right shrink-0 p-2 sm:p-0 rounded-lg bg-[#141416] sm:bg-transparent border sm:border-0 border-[#222226]">
                      <span className="text-[10px] font-mono text-[#888885] block">
                        EST. REWARD TIER
                      </span>
                      <span className="text-sm sm:text-base font-mono font-bold text-[#34D399]">
                        {item.estimatedPotential}
                      </span>
                      <span className="text-[10px] font-mono text-[#A8A8A5] block">
                        {item.tgeTiming}
                      </span>
                    </div>
                  </div>

                  {/* Overview Paragraph */}
                  <p className="text-xs sm:text-sm font-sans text-[#C8C8C5] leading-relaxed bg-[#141416] p-3 rounded-lg border border-[#1E1E22]">
                    {item.overview}
                  </p>

                  {/* Step-by-Step Farming Guide Checklist */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono font-bold text-[#A8A8A5] uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Actionable Farming Checklist:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                      {item.guideSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#0B0B0C] border border-[#1F1F24] flex items-start gap-2"
                        >
                          <span className="w-5 h-5 rounded bg-[#1E1E22] text-[#38BDF8] font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-[#E0E0DD] text-[11px] leading-snug">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Backers & Requirements Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1C1C21] text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#888885]">
                      {item.backerFunding && (
                        <span className="text-[#A8A8A5] flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[#38BDF8]" />
                          Backers: <strong className="text-white">{item.backerFunding}</strong>
                        </span>
                      )}
                    </div>

                    {/* Action Links */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBroadcastAirdrop(item)}
                        disabled={broadcastingAirdropId === item.id || broadcastedAirdrops[item.id]}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0284C7]/15 hover:bg-[#0284C7]/30 border border-[#0284C7]/40 text-[#38BDF8] text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-60"
                        title="Broadcast verified signal to Discord #airdrop-alpha"
                      >
                        {broadcastedAirdrops[item.id] ? (
                          <>
                            <Check className="w-3 h-3 text-[#10B981]" />
                            <span className="text-[#10B981]">BROADCASTED</span>
                          </>
                        ) : broadcastingAirdropId === item.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>SENDING...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>BROADCAST SIGNAL</span>
                          </>
                        )}
                      </button>
                      {item.discordThreadUrl && (
                        <a
                          href={item.discordThreadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-[#E0E0DD] text-xs font-mono font-medium flex items-center gap-1 transition-colors"
                        >
                          <span>DISCORD INTEL</span>
                          <ExternalLink className="w-3 h-3 text-[#38BDF8]" />
                        </a>
                      )}
                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#0ea5e9] text-black text-xs font-mono font-bold flex items-center gap-1 transition-all shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                      >
                        <span>START FARMING</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PILLAR 3: TRENDS DEEP DIVE (Previously 02, now 03)             */}
        {/* ============================================================== */}
        {pillar === 'trends' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D71920]/15 text-[#EF4444] border border-[#D71920]/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                03 / TRENDS & MARKET INTEL
              </span>
              <a
                href="https://discord.com/channels/1505079950317715589/1555848318960013342"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 px-2.5 py-0.5 rounded-full border border-[#EF4444]/25 flex items-center gap-1.5 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-ping" />
                FEED: #{discordTrendsChannel.channelName.replace('#', '')} ({discordTrendsChannel.webhookName} Webhook)
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
              <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/30 flex items-center gap-1">
                <Check className="w-3 h-3 text-[#10B981]" />
                Webhook Attached
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white uppercase tracking-tight">
                  ON-CHAIN MARKET SIGNALS
                </h2>
                <p className="mt-1 text-sm font-sans text-[#A8A8A5]">
                  Curated intelligence, breakout volume alerts, and smart money wallet tracking before collections reach mainstream attention.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => syncTrends()}
                  disabled={isTrendsSyncing}
                  className="px-3 py-1.5 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-xs font-mono text-[#E0E0DD] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Synchronize fresh signals from Discord Trends channel"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#EF4444] ${
                      isTrendsSyncing ? 'animate-spin' : ''
                    }`}
                  />
                  <span>{isTrendsSyncing ? 'SYNCING...' : 'SYNC FEED'}</span>
                </button>

                <a
                  href="https://discord.com/channels/1505079950317715589/1555848318960013342"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-xs font-mono text-[#E0E0DD] flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>OPEN #TRENDS CHANNEL</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#EF4444]" />
                </a>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
              {[
                { id: 'all', label: `ALL SIGNALS (${discordTrends.length})` },
                { id: 'surges', label: 'FLOOR SURGES' },
                { id: 'mints', label: 'EARLY MINTS' },
                { id: 'whales', label: 'WHALE INFLOWS' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTrendsFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-full border transition-colors cursor-pointer shrink-0 ${
                    trendsFilter === tab.id
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-[#141416] text-[#888885] border-[#29292B] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Signal Stream */}
            <div className="space-y-3">
              {discordTrends.filter(
                (sig) => trendsFilter === 'all' || trendsFilter === sig.type
              ).map((sig) => (
                <div
                  key={sig.id}
                  className="p-4 rounded-xl bg-[#0E0E10] border border-[#26262B] hover:border-[#EF4444]/40 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{sig.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${sig.badgeColor || 'bg-[#10B981]/20 text-[#34D399]'}`}
                        >
                          {sig.badge}
                        </span>
                        {sig.chain && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1F1F24] text-[#A8A8A5] border border-[#2B2D31]">
                            {sig.chain}
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1E] text-[#888885] border border-[#26262B]">
                          {sig.source || 'Discord #trends (UGC Webhook)'}
                        </span>
                      </div>
                      <p className="text-xs text-[#888885] font-mono">{sig.detail}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <span className="text-xs font-mono text-[#34D399] font-bold">
                        {sig.gain}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1C1C21] text-xs font-mono">
                    <span className="text-[11px] text-[#888885]">
                      Called by: <strong className="text-white">{sig.calledBy}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBroadcastTrend(sig)}
                        disabled={
                          broadcastingTrendId === sig.id || broadcastedTrends[sig.id]
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/30 border border-[#EF4444]/40 text-[#EF4444] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                        title="Broadcast verified signal to Discord #trends channel"
                      >
                        {broadcastedTrends[sig.id] ? (
                          <>
                            <Check className="w-3 h-3 text-[#10B981]" />
                            <span className="text-[#10B981]">BROADCASTED</span>
                          </>
                        ) : broadcastingTrendId === sig.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>SENDING...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>BROADCAST TO #TRENDS</span>
                          </>
                        )}
                      </button>

                      <a
                        href="https://discord.com/channels/1505079950317715589/1555848318960013342"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-[#1C1C21] hover:bg-[#25252B] border border-[#2B2D31] text-[#E0E0DD] text-xs font-mono flex items-center gap-1 transition-colors"
                      >
                        <span>CHANNEL</span>
                        <ExternalLink className="w-3 h-3 text-[#EF4444]" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PILLAR 4: GAMES DEEP DIVE (Previously 03, now 04)              */}
        {/* ============================================================== */}
        {pillar === 'games' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5" />
                04 / TOURNAMENTS & GAMING
              </span>
              <span className="text-[11px] font-mono text-[#A8A8A5] bg-[#1A1A1E] px-2.5 py-0.5 rounded-full border border-[#29292B]">
                COMMUNITY POKER & ESPORTS
              </span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white uppercase tracking-tight">
                COMPETE, CONNECT, WIN
              </h2>
              <p className="mt-1 text-sm font-sans text-[#A8A8A5]">
                Because Discord isn't just about reading charts. Weekly Texas Hold'em poker tournaments, smash brackets, and direct prize pool distributions.
              </p>
            </div>

            {/* Featured Tournament Banner */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#1E1B4B]/60 to-[#0F172A]/80 border border-[#4338CA]/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#818CF8] font-bold flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#F59E0B]" />
                  WEEKLY ALPHA POKER INVITATIONAL
                </span>
                <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] text-[10px] font-bold">
                  ● REGISTRATION OPEN
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
                <div className="bg-[#0B0B0C]/60 p-2.5 rounded border border-white/10">
                  <span className="text-[#888885] text-[10px] block">PRIZE POOL</span>
                  <span className="text-[#F59E0B] font-bold text-sm">2.5 ETH</span>
                </div>
                <div className="bg-[#0B0B0C]/60 p-2.5 rounded border border-white/10">
                  <span className="text-[#888885] text-[10px] block">WHITELISTS</span>
                  <span className="text-[#38BDF8] font-bold text-sm">5x GTD Slots</span>
                </div>
                <div className="bg-[#0B0B0C]/60 p-2.5 rounded border border-white/10">
                  <span className="text-[#888885] text-[10px] block">SEATS FILLED</span>
                  <span className="text-white font-bold text-sm">48 / 64</span>
                </div>
                <div className="bg-[#0B0B0C]/60 p-2.5 rounded border border-white/10">
                  <span className="text-[#888885] text-[10px] block">ENTRY FEE</span>
                  <span className="text-[#34D399] font-bold text-sm">FREE (Members)</span>
                </div>
              </div>
            </div>

            {/* Community Hall of Fame */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase text-[#A8A8A5] tracking-wider font-bold flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
                CURRENT SEASON LEADERBOARD
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#1A1A1E] border border-[#28282E] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-[#F59E0B]">🥇 1</span>
                    <span className="text-white font-bold">Ironlady</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#3B82F6]/20 text-[#60A5FA] text-[10px]">SYN BADGE</span>
                  </div>
                  <span className="text-[#E0E0DD] font-semibold">480 PTS • 3x Trophies</span>
                </div>

                <div className="p-3 rounded-lg bg-[#1A1A1E] border border-[#28282E] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-[#A8A8A5]">🥈 2</span>
                    <span className="text-white font-bold">rtcj14</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#8B5CF6]/20 text-[#A78BFA] text-[10px]">AHOY BADGE</span>
                  </div>
                  <span className="text-[#E0E0DD] font-semibold">415 PTS • 2x Trophies</span>
                </div>

                <div className="p-3 rounded-lg bg-[#1A1A1E] border border-[#28282E] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-[#B45309]">🥉 3</span>
                    <span className="text-white font-bold">SALMAN</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#10B981]/20 text-[#34D399] text-[10px]">LAKZ BADGE</span>
                  </div>
                  <span className="text-[#E0E0DD] font-semibold">390 PTS • 1x Trophy</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
