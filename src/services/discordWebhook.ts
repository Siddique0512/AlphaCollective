// Discord Webhook Delivery Service (Dual-Layer: Works both in Node and directly in Browser on Vercel)

export const DEFAULT_DISCORD_APPLICATIONS_CHANNEL_ID = '1559546521861619802';
export const DEFAULT_DISCORD_APPLICATIONS_CHANNEL_NAME = 'invite-applications';

export const DEFAULT_DISCORD_APPLICATIONS_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559546595899342938/ghji0QZHJvqQ7FGxHc0V4MuaV0Ub73T9PPD3ApeIQzXuVCaBaOuck75BxUKrbjrhzG2k';

export const DEFAULT_DISCORD_AIRDROP_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559546892252352592/kOJuuMgNYiEsMfnjFXvEt70NEb2rR2-CEp34hewUkdHrc74YH0NfXyn-BIn_AyUDSAYB';

export const DEFAULT_DISCORD_TRENDS_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559576791503343717/9GACy32EApMOlGboE0QKdXTJN-gqO0c3OHcPjBxTb2gHL0UEmV-wqB0PYPKDWKOqEXee';

export const GOOGLE_FORM_RESPONSE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe_yxrxl83nn0okPlrJep2zCVecWbbYuhZH9KGARuEZXQ_w1g/formResponse';

export const FOCUS_AREA_LABELS: Record<string, string> = {
  airdrops: '🪂 Airdrop Hunting & Testnets',
  nfts: '🖼️ NFT Minting & Secondary Whitelists',
  defi: '📈 DeFi Yield, Staking & Perpetuals',
  dev: '💻 Web3 & Smart Contract Dev',
  gaming: '🎮 Web3 Gaming & Tournaments',
  mod: '✍️ Content Creation & Community Mod',
};

export function getApplicationsWebhookUrl(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DISCORD_APPLICATIONS_WEBHOOK_URL) {
    return (import.meta as any).env.VITE_DISCORD_APPLICATIONS_WEBHOOK_URL;
  }
  return DEFAULT_DISCORD_APPLICATIONS_WEBHOOK_URL;
}

export function getAirdropWebhookUrl(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DISCORD_AIRDROP_WEBHOOK_URL) {
    return (import.meta as any).env.VITE_DISCORD_AIRDROP_WEBHOOK_URL;
  }
  return DEFAULT_DISCORD_AIRDROP_WEBHOOK_URL;
}

export function getTrendsWebhookUrl(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DISCORD_TRENDS_WEBHOOK_URL) {
    return (import.meta as any).env.VITE_DISCORD_TRENDS_WEBHOOK_URL;
  }
  return DEFAULT_DISCORD_TRENDS_WEBHOOK_URL;
}

export interface ApplicationSubmissionData {
  fullName: string;
  email?: string;
  xUsername: string;
  discordHandle?: string;
  yearsInWeb3: string;
  focusAreas: string[];
  weeklyActivity: string;
  whyJoin: string;
  valuesBrought?: string;
  previousCommunities?: string;
  walletAddress?: string;
  referralSource?: string;
}

/**
 * Dispatches an application directly to Discord Webhooks with full embed formatting.
 * This ensures delivery even if deployed on Vercel as a static site without a running Express server.
 */
export async function dispatchApplicationToDiscordDirect(
  app: ApplicationSubmissionData,
  appId: string
): Promise<{ success: boolean; mainDelivered: boolean; error?: string }> {
  const cleanX = String(app.xUsername || '').replace(/^@/, '');
  const xLink = cleanX ? `[@${cleanX}](https://x.com/${cleanX})` : 'N/A';
  const focusListFormatted =
    app.focusAreas && app.focusAreas.length > 0
      ? app.focusAreas.map((f: string) => FOCUS_AREA_LABELS[f] || `• ${f}`).join('\n')
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
        title: `🛡️ New Alpha Application: ${app.fullName}`,
        description: `A prospective member has submitted an official application for Alpha Collectiv3 membership.\n\n**Application ID:** \`${appId}\`\n**Status:** 🟡 \`PENDING COUNCIL REVIEW\``,
        color: 0xd71920,
        thumbnail: {
          url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        },
        fields: [
          {
            name: '👤 Moniker / Name',
            value: `**${app.fullName}**`,
            inline: true,
          },
          ...(app.email
            ? [
                {
                  name: '✉️ Email',
                  value: `\`${app.email}\``,
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
            value: app.discordHandle ? `\`${app.discordHandle}\`` : '*Not provided*',
            inline: true,
          },
          {
            name: '⏳ Experience in Web3',
            value: `\`${app.yearsInWeb3}\``,
            inline: true,
          },
          {
            name: '⏱️ Weekly Commitment',
            value: `\`${app.weeklyActivity}\``,
            inline: true,
          },
          {
            name: '📢 Referral Source',
            value: app.referralSource ? `*${app.referralSource}*` : 'Direct Portal',
            inline: true,
          },
          {
            name: '🎯 Core Focus Areas',
            value: focusListFormatted,
            inline: false,
          },
          {
            name: '💡 Why Join Alpha Collectiv3?',
            value: `>>> ${app.whyJoin}`,
            inline: false,
          },
          {
            name: '💎 Values Brought to Alpha Collective',
            value: app.valuesBrought ? `>>> ${app.valuesBrought}` : '*None specified*',
            inline: false,
          },
          {
            name: '🌐 Previous DAOs / Roles',
            value: app.previousCommunities ? `>>> ${app.previousCommunities}` : '*None specified*',
            inline: false,
          },
          {
            name: '💳 EVM / SOL Whitelist Wallet',
            value: app.walletAddress ? `\`${app.walletAddress}\`` : '*None provided*',
            inline: false,
          },
        ],
        footer: {
          text: 'Alpha Collectiv3 • #invite-applications Council Gatekeeper (Vercel Direct)',
          icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const tasks: Promise<any>[] = [];

  // 1. Deliver to main Discord Applications channel webhook
  const appsWebhookUrl = getApplicationsWebhookUrl();
  const mainDeliveryPromise = fetch(appsWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardPayload),
  })
    .then((res) => ({ ok: res.ok, status: res.status }))
    .catch((err) => ({ ok: false, error: err?.message }));

  tasks.push(mainDeliveryPromise);

  // 2. Cross-post to Airdrop channel if candidate selected airdrops
  if (Array.isArray(app.focusAreas) && app.focusAreas.includes('airdrops')) {
    const airdropApplicantPayload = {
      username: 'Alpha Collectiv3 Portal',
      avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      embeds: [
        {
          title: '🪂 New Airdrop Hunter Candidate Applied!',
          description: `**${app.fullName}** submitted an application with a key focus on **Airdrop Hunting & Testnets**!`,
          color: 0x38bdf8,
          fields: [
            { name: '👤 Candidate', value: app.fullName, inline: true },
            { name: '🐦 X / Twitter', value: `[${app.xUsername}](https://x.com/${cleanX})`, inline: true },
            { name: '💬 Discord Handle', value: app.discordHandle ? `\`${app.discordHandle}\`` : '*N/A*', inline: true },
            { name: '⏳ Web3 Experience', value: app.yearsInWeb3, inline: true },
            { name: '⚡ Weekly Commitment', value: app.weeklyActivity, inline: true },
            { name: '💳 Whitelist Wallet', value: app.walletAddress ? `\`${app.walletAddress}\`` : '*None*', inline: true },
            { name: '💡 Why Join / Value', value: app.whyJoin.slice(0, 400), inline: false },
          ],
          footer: {
            text: 'Alpha Collectiv3 • Airdrop Division Dispatch',
            icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const airdropWebhookUrl = getAirdropWebhookUrl();
    tasks.push(
      fetch(airdropWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(airdropApplicantPayload),
      }).catch((e) => console.warn('Airdrop webhook error:', e))
    );
  }

  // 3. Cross-post to Trends channel if candidate selected nfts or defi
  if (
    Array.isArray(app.focusAreas) &&
    (app.focusAreas.includes('nfts') || app.focusAreas.includes('defi'))
  ) {
    const trendsApplicantPayload = {
      username: 'Alpha Collectiv3 Portal',
      avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      embeds: [
        {
          title: '📈 New NFT / Market Trends Candidate Applied!',
          description: `**${app.fullName}** submitted an application focusing on **${app.focusAreas
            .filter((f: string) => f === 'nfts' || f === 'defi')
            .map((f: string) => FOCUS_AREA_LABELS[f] || f)
            .join(' & ')}**!`,
          color: 0xef4444,
          fields: [
            { name: '👤 Candidate', value: app.fullName, inline: true },
            { name: '🐦 X / Twitter', value: `[${app.xUsername}](https://x.com/${cleanX})`, inline: true },
            { name: '💬 Discord Handle', value: app.discordHandle ? `\`${app.discordHandle}\`` : '*N/A*', inline: true },
            { name: '⏳ Web3 Experience', value: app.yearsInWeb3, inline: true },
            { name: '⚡ Weekly Commitment', value: app.weeklyActivity, inline: true },
            { name: '💡 Why Join / Value', value: app.whyJoin.slice(0, 400), inline: false },
          ],
          footer: {
            text: 'Alpha Collectiv3 • Trends Division Dispatch',
            icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const trendsWebhookUrl = getTrendsWebhookUrl();
    tasks.push(
      fetch(trendsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trendsApplicantPayload),
      }).catch((e) => console.warn('Trends webhook error:', e))
    );
  }

  // 4. Background submission to Google Form for spreadsheet sync
  try {
    const params = new URLSearchParams();
    params.append('entry.1536574840', app.fullName);
    params.append('entry.572848926', app.xUsername);
    params.append('entry.954633512', app.yearsInWeb3);
    params.append(
      'entry.969560273',
      `${app.whyJoin}${app.valuesBrought ? `\n\n[Values to Collective: ${app.valuesBrought}]` : ''}\n\n[DC: ${
        app.discordHandle || ''
      } | Focus: ${app.focusAreas.join(', ')} | Activity: ${app.weeklyActivity}]`
    );
    params.append(
      'entry.673122536',
      `${app.previousCommunities || 'None provided'}\n[Wallet: ${app.walletAddress || 'N/A'}]`
    );

    tasks.push(
      fetch(GOOGLE_FORM_RESPONSE_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }).catch((e) => console.warn('Google Form forward ping notice:', e))
    );
  } catch (err) {
    console.warn('Google Form sync error:', err);
  }

  const results = await Promise.allSettled(tasks);
  const mainResult = results[0]?.status === 'fulfilled' ? (results[0].value as any) : null;
  const isMainOk = mainResult ? Boolean(mainResult.ok) : false;

  return {
    success: true,
    mainDelivered: isMainOk,
  };
}

/**
 * Dispatches an Airdrop signal directly to the Airdrop Discord webhook.
 */
export async function dispatchAirdropSignalDirect(airdrop: any): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const embed = {
      title: `🪂 AIRDROP SIGNAL: ${airdrop.projectName}${airdrop.ticker ? ` (${airdrop.ticker})` : ''}`,
      description: airdrop.overview || 'Verified on-chain airdrop intelligence tracked by Alpha Collective.',
      color: 0x38bdf8,
      fields: [
        { name: '⛓️ Chain / Network', value: airdrop.chain || 'Multi-Chain', inline: true },
        { name: '💰 Cost / Capital', value: airdrop.cost || 'FREE / TESTNET', inline: true },
        { name: '📈 Stage', value: airdrop.stage || 'Active Phase', inline: true },
        { name: '🎯 Est. Potential', value: airdrop.estimatedPotential || 'High Potential', inline: true },
        ...(Array.isArray(airdrop.guideSteps) && airdrop.guideSteps.length > 0
          ? [
              {
                name: '📋 Farming Checklist',
                value: airdrop.guideSteps
                  .map((step: string, i: number) => `**${i + 1}.** ${step}`)
                  .slice(0, 5)
                  .join('\n'),
                inline: false,
              },
            ]
          : []),
        ...(Array.isArray(airdrop.requirements) && airdrop.requirements.length > 0
          ? [
              {
                name: '⚡ Requirements',
                value: airdrop.requirements.map((r: string) => `• ${r}`).join('\n'),
                inline: false,
              },
            ]
          : []),
        ...(airdrop.officialUrl
          ? [
              {
                name: '🔗 Official Link',
                value: `[Access Portal](${airdrop.officialUrl})`,
                inline: true,
              },
            ]
          : []),
      ],
      author: {
        name: airdrop.author?.name ? `${airdrop.author.name} (Alpha Collective)` : 'Alpha Collective Airdrop Radar',
        icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      },
      footer: {
        text: 'Alpha Collectiv3 • On-Chain Airdrop Radar (Direct)',
        icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      },
      timestamp: new Date().toISOString(),
    };

    const webhookUrl = getAirdropWebhookUrl();
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Alpha Airdrop Radar',
        avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        embeds: [embed],
      }),
    });

    if (res.ok) {
      return { ok: true, message: 'Airdrop signal sent to Discord #airdrop channel successfully' };
    }
    const errText = await res.text();
    return { ok: false, error: `Discord rejected webhook: ${errText}` };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error delivering to Discord' };
  }
}

/**
 * Dispatches a Trends signal directly to the Trends Discord webhook.
 */
export async function dispatchTrendSignalDirect(signal: any): Promise<{ ok: boolean; message?: string; error?: string }> {
  try {
    const embed = {
      title: `🔥 ALPHA TREND: ${signal.title || 'Market Breakout Signal'}`,
      description: signal.description || signal.summary || 'Verified market intelligence tracked by Alpha Collective.',
      color: 0xef4444,
      fields: [
        { name: '🏷️ Category', value: signal.category || 'NFT / Momentum', inline: true },
        { name: '📊 Volume / Flow', value: signal.volume || signal.floor || 'Active', inline: true },
        { name: '⚡ Alpha Conviction', value: signal.conviction || 'HIGH', inline: true },
        ...(signal.link
          ? [
              {
                name: '🔗 Reference Link',
                value: `[View Alpha Link](${signal.link})`,
                inline: true,
              },
            ]
          : []),
      ],
      author: {
        name: signal.author || 'Alpha Collective UGC Trends',
        icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      },
      footer: {
        text: 'Alpha Collectiv3 • Trends Intelligence (Direct)',
        icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      },
      timestamp: new Date().toISOString(),
    };

    const webhookUrl = getTrendsWebhookUrl();
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Alpha UGC Trends',
        avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        embeds: [embed],
      }),
    });

    if (res.ok) {
      return { ok: true, message: 'Trend signal broadcasted to Discord #trends channel successfully' };
    }
    const errText = await res.text();
    return { ok: false, error: `Discord rejected webhook: ${errText}` };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error delivering to Discord' };
  }
}
