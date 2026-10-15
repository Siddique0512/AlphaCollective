export type NavigationTab =
  | 'home'
  | 'airdrop'
  | 'community'
  | 'collabs'
  | 'team'
  | 'faq';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  number?: string;
  badge?: string;
  quote?: string;
  knownFor?: string;
  bio: string;
  initials?: string;
  image?: string;
  xHandle: string;
  xLink?: string;
  discordHandle?: string;
  discordLink?: string;
}

export interface CollabProposalData {
  projectName: string;
  projectLink?: string;
  contactDiscordOrX: string;
  summary?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CommunityWin {
  id: string;
  project: string;
  screenshotUrl: string;
}

export interface AlphaApplicationData {
  fullName: string;
  email?: string;
  xUsername: string;
  discordHandle: string;
  yearsInWeb3: string;
  focusAreas: string[];
  weeklyActivity: string;
  whyJoin: string;
  valuesBrought?: string;
  previousCommunities: string;
  walletAddress?: string;
  referralSource?: string;
  submittedAt?: string;
}
