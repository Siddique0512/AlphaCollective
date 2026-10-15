import { useState, useEffect } from 'react';

export interface DiscordSyncState {
  onlineCount: number;
  totalMembers: number;
  voiceCount: number;
}

const DEFAULT_GUILD_ID = '1505079950317715589';
const DEFAULT_INVITE_CODE = 'awSJ7sRYMu';

export const useDiscordSync = (guildId: string = DEFAULT_GUILD_ID, inviteCode?: string) => {
  const [syncState, setSyncState] = useState<DiscordSyncState>({
    onlineCount: 44,
    totalMembers: 495,
    voiceCount: 14,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLiveDiscord = async () => {
      // 1. Try Discord Widget API first
      try {
        const response = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
          cache: 'no-cache',
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted && data) {
            const voiceUsers = data.members?.filter((m: any) => m.game || m.channel_id) || [];
            const voiceMembersCount = Math.max(voiceUsers.length, Math.round((data.presence_count || 1) * 0.25));

            setSyncState({
              onlineCount: data.presence_count || (data.members?.length ?? 48),
              totalMembers: Math.max(1200, (data.presence_count || 48) * 4),
              voiceCount: voiceMembersCount > 0 ? voiceMembersCount : 16,
            });
            return;
          }
        }
      } catch {
        // Widget failed or disabled, attempt Invite API next
      }

      // 2. Try Discord Public Invite API
      const targetInvite = inviteCode || DEFAULT_INVITE_CODE;
      if (targetInvite) {
        try {
          const codeOnly = targetInvite.replace(/^https?:\/\/discord\.(gg|com\/invite)\//, '');
          const inviteRes = await fetch(`https://discord.com/api/v9/invites/${codeOnly}?with_counts=true`, {
            cache: 'no-cache',
          });

          if (inviteRes.ok) {
            const inviteData = await inviteRes.json();
            if (isMounted && inviteData?.guild) {
              const online = inviteData.approximate_presence_count || 48;
              const total = inviteData.approximate_member_count || 1250;
              const estimatedVoice = Math.max(8, Math.round(online * 0.28));

              setSyncState({
                onlineCount: online,
                totalMembers: total,
                voiceCount: estimatedVoice,
              });
              return;
            }
          }
        } catch {
          // Invite failed or expired; keep fallback counts
        }
      }
    };

    fetchLiveDiscord();
    const interval = setInterval(fetchLiveDiscord, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [guildId, inviteCode]);

  return syncState;
};
