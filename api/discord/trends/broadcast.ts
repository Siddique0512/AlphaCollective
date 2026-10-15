// Vercel Serverless Function: POST /api/discord/trends/broadcast

const DEFAULT_TRENDS_WEBHOOK_URL =
  'https://discord.com/api/webhooks/1559576791503343717/9GACy32EApMOlGboE0QKdXTJN-gqO0c3OHcPjBxTb2gHL0UEmV-wqB0PYPKDWKOqEXee';

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
    const { title, summary, description, category, volume, floor, conviction, link, author } =
      body;

    if (!title) {
      res.status(400).json({ error: 'Signal title is required' });
      return;
    }

    const embed = {
      title: `🔥 ALPHA TREND: ${title}`,
      description: summary || description || 'Verified market intelligence tracked by Alpha Collective.',
      color: 0xef4444,
      fields: [
        { name: '🏷️ Category', value: category || 'NFT / Momentum', inline: true },
        { name: '📊 Volume / Flow', value: volume || floor || 'Active', inline: true },
        { name: '⚡ Alpha Conviction', value: conviction || 'HIGH', inline: true },
        ...(link
          ? [
              {
                name: '🔗 Reference Link',
                value: `[View Alpha Link](${link})`,
                inline: true,
              },
            ]
          : []),
      ],
      author: {
        name: author || 'Alpha Collective UGC Trends',
        icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      },
      footer: {
        text: 'Alpha Collectiv3 • Trends Intelligence (Vercel Serverless)',
        icon_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
      },
      timestamp: new Date().toISOString(),
    };

    const webhookUrl =
      process.env.DISCORD_TRENDS_WEBHOOK_URL || DEFAULT_TRENDS_WEBHOOK_URL;

    const hookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Alpha UGC Trends',
        avatar_url: 'https://cdn.discordapp.com/icons/1505079950317715589/a_065e88d011f0c29f.png',
        embeds: [embed],
      }),
    });

    if (hookRes.ok) {
      res.status(200).json({
        ok: true,
        message: 'Trend signal broadcasted to Discord Trends channel successfully',
        signal: {
          id: `trend-${Date.now().toString(36)}`,
          title,
          summary: summary || description,
          category: category || 'NFT / Momentum',
          volume: volume || floor || 'Active',
          conviction: conviction || 'HIGH',
          link,
          timestamp: 'Just now',
          verifiedByDiscord: true,
        },
      });
    } else {
      const errorText = await hookRes.text();
      res.status(502).json({ error: `Discord webhook rejected: ${errorText}` });
    }
  } catch (err: any) {
    console.error('Error broadcasting trend on Vercel:', err);
    res.status(500).json({ error: err?.message || 'Internal error' });
  }
}
