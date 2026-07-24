export interface CreatorProfile {
  _id: string;
  walletAddress: string;
  username: string;
  bio: string;
  avatarUrl: string;
  stats: { totalReceivedWei: string; tipCount: number };
  createdAt: string;
}

export interface TipRecord {
  _id: string;
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  fromAddress: string | null; // null when anonymous
  creatorAddress: string;
  amountWei: string;
  feeWei: string;
  message: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface CreatorStats {
  totalWei: string;
  tipCount: number;
  uniqueTipperCount: number;
}
