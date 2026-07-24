import { Schema, model, InferSchemaType } from "mongoose";

const creatorSchema = new Schema(
  {
    walletAddress: { type: String, required: true, lowercase: true },
    username: { type: String, required: true },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    stats: {
      totalReceivedWei: { type: String, default: "0" }, // wei as string, never Number
      tipCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

creatorSchema.index({ walletAddress: 1 }, { unique: true });
creatorSchema.index({ username: 1 }, { unique: true });
creatorSchema.index({ "stats.tipCount": -1 });

export type CreatorDoc = InferSchemaType<typeof creatorSchema>;
export const Creator = model("Creator", creatorSchema);
