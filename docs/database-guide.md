# MongoDB Optimization Guide

Mongoose 8. Wei amounts are **always strings** — never Numbers (precision loss above 2^53).

## Index Strategy

```typescript
creatorSchema.index({ walletAddress: 1 }, { unique: true });
creatorSchema.index({ username: 1 }, { unique: true });
creatorSchema.index({ "stats.tipCount": -1 });

tipSchema.index({ txHash: 1 }, { unique: true });
tipSchema.index({ creatorAddress: 1, createdAt: -1 });
tipSchema.index({ fromAddress: 1, createdAt: -1 });
```

Note: string wei fields sort lexicographically, so leaderboards use `$toDecimal` in aggregations, not naive sorts on `totalReceivedWei`.

## Aggregation Pipelines

```typescript
// Creator stats: total, count, unique tippers
Tip.aggregate([
  { $match: { creatorAddress, status: "confirmed" } },
  {
    $group: {
      _id: null,
      totalWei: { $sum: { $toDecimal: "$amountWei" } },
      tipCount: { $sum: 1 },
      uniqueTippers: { $addToSet: "$fromAddress" },
    },
  },
  {
    $project: {
      totalWei: { $toString: "$totalWei" },
      tipCount: 1,
      uniqueTipperCount: { $size: "$uniqueTippers" },
    },
  },
]);
```

## Performance Tips

- `.lean()` for read-only queries
- Paginate every list endpoint (limit 50 max)
- Upsert tips by `txHash` so re-submissions are idempotent
- mongodb-memory-server in tests; MongoDB Atlas + connection pooling in production
