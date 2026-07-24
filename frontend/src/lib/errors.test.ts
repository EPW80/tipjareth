import { describe, expect, it } from "vitest";
import { friendlyChainError } from "./errors";

describe("friendlyChainError", () => {
  it("maps user rejection (ethers and EIP-1193 codes)", () => {
    expect(friendlyChainError({ code: "ACTION_REJECTED" })).toBe("Transaction cancelled.");
    expect(friendlyChainError({ code: 4001 })).toBe("Transaction cancelled.");
  });

  it("maps insufficient funds", () => {
    expect(friendlyChainError({ code: "INSUFFICIENT_FUNDS" })).toBe(
      "Insufficient balance for this tip."
    );
  });

  it("never leaks raw messages for unknown errors", () => {
    const result = friendlyChainError({ code: "WEIRD", message: "revert 0xdeadbeef stack..." });
    expect(result).toBe("Something went wrong. Please try again.");
    expect(result).not.toContain("0xdeadbeef");
  });

  it("handles non-object errors", () => {
    expect(friendlyChainError(undefined)).toBe("Something went wrong. Please try again.");
    expect(friendlyChainError("boom")).toBe("Something went wrong. Please try again.");
  });
});
