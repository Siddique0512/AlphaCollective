// Vercel Serverless Function: POST /api/discord/airdrops/broadcast

const DEFAULT_AIRDROP_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559546892252352592/kOJuuMgNYiEsMfnjFXvEt70NEb2rR2-CEp34hewUkdHrc74YH0NfXyn-BIn_AyUDSAYB';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
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
    } = body;

    if (!projectName) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const embed = {
      title: `🪂 AIRDROP SIGNAL: ${projectName}${ticker ? ` (${ticker})` : ''}`,
      description: overview || 'Verified on-chain airdrop intelligence tracked by Alpha Collective.',
      color: 0x38bdf8,
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
        text: 'Alpha Collectiv3 • On-Chain Airdrop Radar (Vercel Serverless)',
        icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      },
      timestamp: new Date().toISOString(),
    };

    const webhookUrl =
      process.env.DISCORD_AIRDROP_WEBHOOK_URL || DEFAULT_AIRDROP_WEBHOOK_URL;

    const hookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Alpha Airdrop Radar',
        avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        embeds: [embed],
      }),
    });

    if (hookRes.ok) {
      res.status(200).json({
        ok: true,
        message: 'Airdrop signal broadcasted to Discord Airdrop channel successfully',
      });
    } else {
      const errorText = await hookRes.text();
      res.status(502).json({ error: `Discord webhook rejected: ${errorText}` });
    }
  } catch (err: any) {
    console.error('Error broadcasting airdrop on Vercel:', err);
    res.status(500).json({ error: err?.message || 'Internal error' });
  }
}
