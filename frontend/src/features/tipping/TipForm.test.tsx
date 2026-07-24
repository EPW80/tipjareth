import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parseEther } from "ethers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TipForm } from "./TipForm";

const mockUseWallet = vi.fn();
const mockUseTipJarInfo = vi.fn();
const mockTip = vi.fn();

vi.mock("../../hooks/web3/WalletProvider", () => ({
  useWallet: () => mockUseWallet(),
}));

vi.mock("../../hooks/web3/useTipJar", () => ({
  useTipJarInfo: () => mockUseTipJarInfo(),
  useTipCreator: () => ({ tip: mockTip, state: "idle", reset: vi.fn() }),
}));

const CREATOR = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

function connectedWallet() {
  return {
    account: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
    wrongNetwork: false,
    connect: vi.fn(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseWallet.mockReturnValue(connectedWallet());
  mockUseTipJarInfo.mockReturnValue({
    feeBps: 250n,
    minTipWei: parseEther("0.0001"),
  });
});

describe("TipForm", () => {
  it("prompts to connect when no account", () => {
    mockUseWallet.mockReturnValue({ account: null, wrongNetwork: false, connect: vi.fn() });
    render(<TipForm creatorAddress={CREATOR} creatorName="alice" />);
    expect(screen.getByRole("button", { name: /connect wallet to tip/i })).toBeInTheDocument();
  });

  it("shows the full fee breakdown before signing", () => {
    render(<TipForm creatorAddress={CREATOR} creatorName="alice" />);
    const breakdown = screen.getByTestId("fee-breakdown");
    expect(breakdown).toHaveTextContent("Platform fee (2.50%)");
    expect(breakdown).toHaveTextContent("0.00025 ETH"); // 2.5% of 0.01
    expect(breakdown).toHaveTextContent("@alice receives");
    expect(breakdown).toHaveTextContent("0.00975 ETH");
  });

  it("defaults the anonymous toggle to off and discloses on-chain visibility", () => {
    render(<TipForm creatorAddress={CREATOR} creatorName="alice" />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(
      screen.getByText(/wallet address remains publicly visible on the blockchain/i)
    ).toBeInTheDocument();
  });

  it("rejects an invalid amount", async () => {
    const user = userEvent.setup();
    render(<TipForm creatorAddress={CREATOR} creatorName="alice" />);
    await user.clear(screen.getByLabelText("Amount in ETH"));
    await user.type(screen.getByLabelText("Amount in ETH"), "abc");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid amount");
    expect(screen.getByRole("button", { name: /send tip/i })).toBeDisabled();
    expect(mockTip).not.toHaveBeenCalled();
  });

  it("enforces the on-chain minimum tip", async () => {
    const user = userEvent.setup();
    render(<TipForm creatorAddress={CREATOR} creatorName="alice" />);
    await user.clear(screen.getByLabelText("Amount in ETH"));
    await user.type(screen.getByLabelText("Amount in ETH"), "0.00001");
    expect(screen.getByRole("alert")).toHaveTextContent(/minimum tip is 0.0001 eth/i);
  });

  it("sends the tip with the displayed fee as the accepted maximum", async () => {
    const user = userEvent.setup();
    mockTip.mockResolvedValue("0xhash");
    render(<TipForm creatorAddress={CREATOR} creatorName="alice" />);

    await user.type(screen.getByLabelText("Tip message"), "great work");
    await user.click(screen.getByRole("button", { name: /send tip/i }));

    await waitFor(() => {
      expect(mockTip).toHaveBeenCalledWith({
        creatorAddress: CREATOR,
        amountEth: "0.01",
        message: "great work",
        isAnonymous: false,
        displayedFeeBps: 250n,
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(/tip confirmed/i);
  });

  it("maps a wallet rejection to a friendly message", async () => {
    const user = userEvent.setup();
    mockTip.mockRejectedValue({ code: "ACTION_REJECTED" });
    render(<TipForm creatorAddress={CREATOR} creatorName="alice" />);

    await user.click(screen.getByRole("button", { name: /send tip/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Transaction cancelled.");
  });

  it("disables sending on the wrong network", () => {
    mockUseWallet.mockReturnValue({ ...connectedWallet(), wrongNetwork: true });
    render(<TipForm creatorAddress={CREATOR} creatorName="alice" />);
    expect(screen.getByRole("button", { name: /send tip/i })).toBeDisabled();
    expect(screen.getByText(/switch to the local hardhat network/i)).toBeInTheDocument();
  });
});
