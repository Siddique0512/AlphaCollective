// Vercel Serverless Function: POST /api/applications & GET /api/applications

const DEFAULT_APPLICATIONS_CHANNEL_ID = '1559546521861619802';
const DEFAULT_APPLICATIONS_CHANNEL_NAME = 'invite-applications';
const DEFAULT_APPLICATIONS_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559546595899342938/ghji0QZHJvqQ7FGxHc0V4MuaV0Ub73T9PPD3ApeIQzXuVCaBaOuck75BxUKrbjrhzG2k';
const DEFAULT_AIRDROP_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559546892252352592/kOJuuMgNYiEsMfnjFXvEt70NEb2rR2-CEp34hewUkdHrc74YH0NfXyn-BIn_AyUDSAYB';
const DEFAULT_TRENDS_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559576791503343717/9GACy32EApMOlGboE0QKdXTJN-gqO0c3OHcPjBxTb2gHL0UEmV-wqB0PYPKDWKOqEXee';
const GOOGLE_FORM_RESPONSE_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe_yxrxl83nn0okPlrJep2zCVecWbbYuhZH9KGARuEZXQ_w1g/formResponse';

const FOCUS_AREA_LABELS: Record<string, string> = {
  airdrops: '🪂 Airdrop Hunting & Testnets',
  nfts: '🖼️ NFT Minting & Secondary Whitelists',
  defi: '📈 DeFi Yield, Staking & Perpetuals',
  dev: '💻 Web3 & Smart Contract Dev',
  gaming: '🎮 Web3 Gaming & Tournaments',
  mod: '✍️ Content Creation & Community Mod',
};

// In-memory cache for serverless invocation lifetime
const recentApps: any[] = [];

export default async function handler(req: any, res: any) {
  // Enable CORS for Vercel deployments and preview URLs
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      count: recentApps.length,
      recent: recentApps,
      service: 'Alpha Collectiv3 Portal Gatekeeper on Vercel',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
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
    } = body;

    if (!fullName || !xUsername || !whyJoin) {
      res.status(400).json({ error: 'Missing required application fields (name, X handle, why join)' });
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

    recentApps.unshift(newApp);

    const applicationsWebhook =
      process.env.DISCORD_APPLICATIONS_WEBHOOK_URL || DEFAULT_APPLICATIONS_WEBHOOK_URL;
    const airdropWebhook =
      process.env.DISCORD_AIRDROP_WEBHOOK_URL || DEFAULT_AIRDROP_WEBHOOK_URL;
    const trendsWebhook =
      process.env.DISCORD_TRENDS_WEBHOOK_URL || DEFAULT_TRENDS_WEBHOOK_URL;

    const cleanX = newApp.xUsername.replace(/^@/, '');
    const xLink = cleanX ? `[@${cleanX}](https://x.com/${cleanX})` : 'N/A';
    const focusListFormatted =
      newApp.focusAreas.length > 0
        ? newApp.focusAreas.map((f: string) => FOCUS_AREA_LABELS[f] || `• ${f}`).join('\n')
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
            text: 'Alpha Collectiv3 • #invite-applications Council Gatekeeper (Vercel Serverless)',
            icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const deliveryPromises: Promise<any>[] = [];

    // CRITICAL: On Vercel serverless, promises MUST be awaited before responding
    const mainWebhookPromise = fetch(applicationsWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardPayload),
    })
      .then(async (r) => {
        if (!r.ok) {
          const errBody = await r.text().catch(() => '');
          console.warn('[VERCEL DISCORD] Main webhook response not ok:', r.status, errBody);
        }
        return { ok: r.ok, status: r.status };
      })
      .catch((err) => {
        console.warn('[VERCEL DISCORD] Main webhook transmission failed:', err?.message);
        return { ok: false, error: err?.message };
      });

    deliveryPromises.push(mainWebhookPromise);

    // Cross-post to Airdrop channel if candidate has airdrops focus
    if (Array.isArray(newApp.focusAreas) && newApp.focusAreas.includes('airdrops') && airdropWebhook) {
      const airdropApplicantPayload = {
        username: 'Alpha Collectiv3 Portal',
        avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        embeds: [
          {
            title: '🪂 New Airdrop Hunter Candidate Applied!',
            description: `**${newApp.fullName}** submitted an application with a key focus on **Airdrop Hunting & Testnets**!`,
            color: 0x38bdf8,
            fields: [
              { name: '👤 Candidate', value: newApp.fullName, inline: true },
              { name: '🐦 X / Twitter', value: `[${newApp.xUsername}](https://x.com/${cleanX})`, inline: true },
              { name: '💬 Discord Handle', value: newApp.discordHandle ? `\`${newApp.discordHandle}\`` : '*N/A*', inline: true },
              { name: '⏳ Web3 Experience', value: newApp.yearsInWeb3, inline: true },
              { name: '⚡ Weekly Commitment', value: newApp.weeklyActivity, inline: true },
              { name: '💳 Whitelist Wallet', value: newApp.walletAddress ? `\`${newApp.walletAddress}\`` : '*None*', inline: true },
              { name: '💡 Why Join / Value', value: newApp.whyJoin.slice(0, 400), inline: false },
            ],
            footer: {
              text: 'Alpha Collectiv3 • Airdrop Division Dispatch',
              icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      deliveryPromises.push(
        fetch(airdropWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(airdropApplicantPayload),
        }).catch((e) => console.warn('[VERCEL DISCORD] Airdrop webhook error:', e?.message))
      );
    }

    // Cross-post to Trends channel if candidate has NFT / DeFi focus
    if (
      Array.isArray(newApp.focusAreas) &&
      (newApp.focusAreas.includes('nfts') || newApp.focusAreas.includes('defi')) &&
      trendsWebhook
    ) {
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
            color: 0xef4444,
            fields: [
              { name: '👤 Candidate', value: newApp.fullName, inline: true },
              { name: '🐦 X / Twitter', value: `[${newApp.xUsername}](https://x.com/${cleanX})`, inline: true },
              { name: '💬 Discord Handle', value: newApp.discordHandle ? `\`${newApp.discordHandle}\`` : '*N/A*', inline: true },
              { name: '⏳ Web3 Experience', value: newApp.yearsInWeb3, inline: true },
              { name: '⚡ Weekly Commitment', value: newApp.weeklyActivity, inline: true },
              { name: '💡 Why Join / Value', value: newApp.whyJoin.slice(0, 400), inline: false },
            ],
            footer: {
              text: 'Alpha Collectiv3 • Trends Division Dispatch',
              icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      deliveryPromises.push(
        fetch(trendsWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trendsApplicantPayload),
        }).catch((e) => console.warn('[VERCEL DISCORD] Trends webhook error:', e?.message))
      );
    }

    // Google Form sync
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

      deliveryPromises.push(
        fetch(GOOGLE_FORM_RESPONSE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        }).catch((e) => console.warn('Google Form forward notice:', e?.message))
      );
    } catch (err) {
      console.warn('Google Form sync prep error:', err);
    }

    // Await all deliveries before completing Vercel function response
    const results = await Promise.allSettled(deliveryPromises);
    const mainResult = results[0]?.status === 'fulfilled' ? (results[0].value as any) : null;
    const isMainDelivered = mainResult ? Boolean(mainResult.ok) : false;

    res.status(200).json({
      ok: true,
      appId,
      discordDelivered: isMainDelivered,
      message: 'Application recorded and transmitted to Discord',
      reviewWindow: '24-48 hours',
    });
  } catch (err: any) {
    console.error('Vercel serverless application handler error:', err);
    res.status(500).json({ error: err?.message || 'Internal serverless error' });
  }
}
