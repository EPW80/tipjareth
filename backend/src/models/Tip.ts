import { Schema, model, InferSchemaType } from "mongoose";

const tipSchema = new Schema(
  {
    txHash: { type: String, required: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    fromAddress: { type: String, lowercase: true },
    creatorAddress: { type: String, lowercase: true },
    creator: { type: Schema.Types.ObjectId, ref: "Creator" },
    amountWei: { type: String }, // wei as string, never Number
    feeWei: { type: String },
    message: { type: String, default: "" },
    isAnonymous: { type: Boolean, default: false },
    blockNumber: { type: Number },
  },
  { timestamps: true }
);

tipSchema.index({ txHash: 1 }, { unique: true });
tipSchema.index({ creatorAddress: 1, createdAt: -1 });
tipSchema.index({ fromAddress: 1, createdAt: -1 });
tipSchema.index({ status: 1 });

export type TipDoc = InferSchemaType<typeof tipSchema>;
export const Tip = model("Tip", tipSchema);
