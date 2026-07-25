import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const TIP = ethers.parseEther("0.01");
const DEFAULT_FEE_BPS = 250n;
const BPS = 10_000n;

describe("TipJar", () => {
  async function deployFixture() {
    const [owner, creator, tipper, other] = await ethers.getSigners();
    const tipJar = await ethers.deployContract("TipJar", [owner.address]);
    return { tipJar, owner, creator, tipper, other };
  }

  async function registeredFixture() {
    const ctx = await deployFixture();
    await ctx.tipJar.connect(ctx.creator).registerCreator("alice");
    return ctx;
  }

  describe("deployment", () => {
    it("sets owner, default fee and min tip", async () => {
      const { tipJar, owner } = await loadFixture(deployFixture);
      expect(await tipJar.owner()).to.equal(owner.address);
      expect(await tipJar.platformFeeBps()).to.equal(DEFAULT_FEE_BPS);
      expect(await tipJar.minTipWei()).to.equal(ethers.parseEther("0.0001"));
      expect(await tipJar.accumulatedFees()).to.equal(0n);
    });

    it("rejects direct ETH transfers", async () => {
      const { tipJar, tipper } = await loadFixture(deployFixture);
      await expect(
        tipper.sendTransaction({ to: await tipJar.getAddress(), value: TIP })
      ).to.be.revertedWithCustomError(tipJar, "DirectTransferNotAllowed");
    });
  });

  describe("registerCreator", () => {
    it("registers and emits CreatorRegistered", async () => {
      const { tipJar, creator } = await loadFixture(deployFixture);
      await expect(tipJar.connect(creator).registerCreator("alice"))
        .to.emit(tipJar, "CreatorRegistered")
        .withArgs(creator.address, "alice");

      const stored = await tipJar.getCreator(creator.address);
      expect(stored.username).to.equal("alice");
      expect(stored.isActive).to.equal(true);
      expect(stored.balance).to.equal(0n);
    });

    it("reverts on empty username", async () => {
      const { tipJar, creator } = await loadFixture(deployFixture);
      await expect(
        tipJar.connect(creator).registerCreator("")
      ).to.be.revertedWithCustomError(tipJar, "EmptyUsername");
    });

    it("reverts when already registered", async () => {
      const { tipJar, creator } = await loadFixture(registeredFixture);
      await expect(tipJar.connect(creator).registerCreator("alice2"))
        .to.be.revertedWithCustomError(tipJar, "AlreadyRegistered")
        .withArgs(creator.address);
    });
  });

  describe("tipCreator", () => {
    it("credits creator minus fee and emits TipReceived", async () => {
      const { tipJar, creator, tipper } = await loadFixture(registeredFixture);
      const fee = (TIP * DEFAULT_FEE_BPS) / BPS;
      const creatorAmount = TIP - fee;

      await expect(
        tipJar.connect(tipper).tipCreator(creator.address, "great stream!", false, DEFAULT_FEE_BPS, { value: TIP })
      )
        .to.emit(tipJar, "TipReceived")
        .withArgs(tipper.address, creator.address, TIP, fee, "great stream!", false);

      const stored = await tipJar.getCreator(creator.address);
      expect(stored.balance).to.equal(creatorAmount);
      expect(stored.totalReceived).to.equal(creatorAmount);
      expect(stored.tipCount).to.equal(1n);
      expect(await tipJar.accumulatedFees()).to.equal(fee);
    });

    it("accumulates across multiple tips", async () => {
      const { tipJar, creator, tipper, other } = await loadFixture(registeredFixture);
      await tipJar.connect(tipper).tipCreator(creator.address, "one", false, DEFAULT_FEE_BPS, { value: TIP });
      await tipJar.connect(other).tipCreator(creator.address, "two", true, DEFAULT_FEE_BPS, { value: TIP * 2n });

      const fee = (TIP * DEFAULT_FEE_BPS) / BPS + (TIP * 2n * DEFAULT_FEE_BPS) / BPS;
      const stored = await tipJar.getCreator(creator.address);
      expect(stored.tipCount).to.equal(2n);
      expect(stored.totalReceived).to.equal(TIP * 3n - fee);
      expect(await tipJar.accumulatedFees()).to.equal(fee);
    });

    it("passes the anonymous flag through to the event", async () => {
      const { tipJar, creator, tipper } = await loadFixture(registeredFixture);
      const fee = (TIP * DEFAULT_FEE_BPS) / BPS;
      await expect(
        tipJar.connect(tipper).tipCreator(creator.address, "", true, DEFAULT_FEE_BPS, { value: TIP })
      )
        .to.emit(tipJar, "TipReceived")
        .withArgs(tipper.address, creator.address, TIP, fee, "", true);
    });

    it("reverts below the minimum tip", async () => {
      const { tipJar, creator, tipper } = await loadFixture(registeredFixture);
      const dust = ethers.parseEther("0.00001");
      await expect(
        tipJar.connect(tipper).tipCreator(creator.address, "gm", false, DEFAULT_FEE_BPS, { value: dust })
      )
        .to.be.revertedWithCustomError(tipJar, "InsufficientTipAmount")
        .withArgs(dust, ethers.parseEther("0.0001"));
    });

    it("reverts for an unregistered creator", async () => {
      const { tipJar, tipper, other } = await loadFixture(deployFixture);
      await expect(
        tipJar.connect(tipper).tipCreator(other.address, "gm", false, DEFAULT_FEE_BPS, { value: TIP })
      )
        .to.be.revertedWithCustomError(tipJar, "CreatorNotRegistered")
        .withArgs(other.address);
    });

    it("reverts on self-tips", async () => {
      const { tipJar, creator } = await loadFixture(registeredFixture);
      await expect(
        tipJar.connect(creator).tipCreator(creator.address, "me", false, DEFAULT_FEE_BPS, { value: TIP })
      ).to.be.revertedWithCustomError(tipJar, "SelfTipNotAllowed");
    });

    it("reverts when the fee was raised above what the tipper accepted", async () => {
      const { tipJar, owner, creator, tipper } = await loadFixture(registeredFixture);
      // fee raised after the tipper saw 2.5% in the UI
      await tipJar.connect(owner).setPlatformFee(1000);
      await expect(
        tipJar.connect(tipper).tipCreator(creator.address, "gm", false, DEFAULT_FEE_BPS, { value: TIP })
      )
        .to.be.revertedWithCustomError(tipJar, "FeeAboveUserLimit")
        .withArgs(1000n, DEFAULT_FEE_BPS);
    });

    it("charges no fee when platform fee is zero", async () => {
      const { tipJar, owner, creator, tipper } = await loadFixture(registeredFixture);
      await tipJar.connect(owner).setPlatformFee(0);
      await tipJar.connect(tipper).tipCreator(creator.address, "gm", false, DEFAULT_FEE_BPS, { value: TIP });
      expect((await tipJar.getCreator(creator.address)).balance).to.equal(TIP);
      expect(await tipJar.accumulatedFees()).to.equal(0n);
    });
  });

  describe("withdraw", () => {
    it("transfers the balance to the creator and emits Withdrawal", async () => {
      const { tipJar, creator, tipper } = await loadFixture(registeredFixture);
      await tipJar.connect(tipper).tipCreator(creator.address, "gm", false, DEFAULT_FEE_BPS, { value: TIP });
      const amount = (await tipJar.getCreator(creator.address)).balance;

      await expect(tipJar.connect(creator).withdraw()).to.changeEtherBalances(
        [creator, tipJar],
        [amount, -amount]
      );
      expect((await tipJar.getCreator(creator.address)).balance).to.equal(0n);
    });

    it("emits Withdrawal with the amount", async () => {
      const { tipJar, creator, tipper } = await loadFixture(registeredFixture);
      await tipJar.connect(tipper).tipCreator(creator.address, "gm", false, DEFAULT_FEE_BPS, { value: TIP });
      const amount = (await tipJar.getCreator(creator.address)).balance;
      await expect(tipJar.connect(creator).withdraw())
        .to.emit(tipJar, "Withdrawal")
        .withArgs(creator.address, amount);
    });

    it("reverts with nothing to withdraw", async () => {
      const { tipJar, creator } = await loadFixture(registeredFixture);
      await expect(tipJar.connect(creator).withdraw()).to.be.revertedWithCustomError(
        tipJar,
        "NothingToWithdraw"
      );
    });

    it("reverts when the receiver rejects ETH", async () => {
      const { tipJar, tipper } = await loadFixture(deployFixture);
      const rejecting = await ethers.deployContract("RejectingReceiver", [
        await tipJar.getAddress(),
      ]);
      await rejecting.register("rejector");
      await tipJar
        .connect(tipper)
        .tipCreator(await rejecting.getAddress(), "gm", false, DEFAULT_FEE_BPS, { value: TIP });

      await expect(rejecting.withdraw()).to.be.revertedWithCustomError(
        tipJar,
        "TransferFailed"
      );
    });

    it("blocks reentrancy from the receive hook", async () => {
      const { tipJar, tipper } = await loadFixture(deployFixture);
      const attacker = await ethers.deployContract("ReentrantAttacker", [
        await tipJar.getAddress(),
      ]);
      await attacker.register("attacker");
      await tipJar
        .connect(tipper)
        .tipCreator(await attacker.getAddress(), "gm", false, DEFAULT_FEE_BPS, { value: TIP });

      // inner reentrant withdraw() reverts (guard), so the outer transfer fails
      await expect(attacker.attack()).to.be.revertedWithCustomError(tipJar, "TransferFailed");
    });

    it("blocks reentering tipCreator during a withdrawal payout", async () => {
      const { tipJar, creator, tipper } = await loadFixture(registeredFixture);
      const attacker = await ethers.deployContract("TipReentrantAttacker", [
        await tipJar.getAddress(),
      ]);
      await attacker.register("tip-attacker");
      await attacker.setTarget(creator.address);
      await tipJar
        .connect(tipper)
        .tipCreator(await attacker.getAddress(), "gm", false, DEFAULT_FEE_BPS, { value: TIP });

      // inner reentrant tipCreator() reverts (guard), so the outer transfer fails
      await expect(attacker.attack()).to.be.revertedWithCustomError(tipJar, "TransferFailed");
    });
  });

  describe("owner functions", () => {
    it("updates the platform fee and emits event", async () => {
      const { tipJar, owner } = await loadFixture(deployFixture);
      await expect(tipJar.connect(owner).setPlatformFee(500))
        .to.emit(tipJar, "PlatformFeeUpdated")
        .withArgs(DEFAULT_FEE_BPS, 500n);
      expect(await tipJar.platformFeeBps()).to.equal(500n);
    });

    it("caps the platform fee at MAX_FEE_BPS", async () => {
      const { tipJar, owner } = await loadFixture(deployFixture);
      await expect(tipJar.connect(owner).setPlatformFee(1001))
        .to.be.revertedWithCustomError(tipJar, "FeeTooHigh")
        .withArgs(1001n, 1000n);
    });

    it("updates the minimum tip and emits event", async () => {
      const { tipJar, owner } = await loadFixture(deployFixture);
      const newMin = ethers.parseEther("0.001");
      await expect(tipJar.connect(owner).setMinTip(newMin))
        .to.emit(tipJar, "MinTipUpdated")
        .withArgs(ethers.parseEther("0.0001"), newMin);
      expect(await tipJar.minTipWei()).to.equal(newMin);
    });

    it("withdraws accumulated fees to the given address", async () => {
      const { tipJar, owner, creator, tipper, other } = await loadFixture(registeredFixture);
      await tipJar.connect(tipper).tipCreator(creator.address, "gm", false, DEFAULT_FEE_BPS, { value: TIP });
      const fee = (TIP * DEFAULT_FEE_BPS) / BPS;

      await expect(tipJar.connect(owner).withdrawFees(other.address))
        .to.emit(tipJar, "FeesWithdrawn")
        .withArgs(other.address, fee);
      expect(await tipJar.accumulatedFees()).to.equal(0n);
    });

    it("reverts fee withdrawal to the zero address", async () => {
      const { tipJar, owner } = await loadFixture(deployFixture);
      await expect(
        tipJar.connect(owner).withdrawFees(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(tipJar, "ZeroAddress");
    });

    it("reverts fee withdrawal with no fees", async () => {
      const { tipJar, owner, other } = await loadFixture(deployFixture);
      await expect(
        tipJar.connect(owner).withdrawFees(other.address)
      ).to.be.revertedWithCustomError(tipJar, "NothingToWithdraw");
    });

    it("blocks reentering withdrawFees during the fee payout", async () => {
      const attacker = await ethers.deployContract("FeeReentrantAttacker");
      // the attacker must own the jar: withdrawFees checks onlyOwner before
      // the reentrancy guard, so only the owner can reach it
      const tipJar = await ethers.deployContract("TipJar", [
        await attacker.getAddress(),
      ]);
      await attacker.setTipJar(await tipJar.getAddress());

      const [, creator, tipper] = await ethers.getSigners();
      await tipJar.connect(creator).registerCreator("alice");
      await tipJar
        .connect(tipper)
        .tipCreator(creator.address, "gm", false, DEFAULT_FEE_BPS, { value: TIP });

      // inner reentrant withdrawFees() reverts (guard), so the outer transfer fails
      await expect(attacker.attack()).to.be.revertedWithCustomError(tipJar, "TransferFailed");
    });

    it("reverts fee withdrawal when the recipient rejects ETH", async () => {
      const { tipJar, owner, creator, tipper } = await loadFixture(registeredFixture);
      await tipJar.connect(tipper).tipCreator(creator.address, "gm", false, DEFAULT_FEE_BPS, { value: TIP });
      const rejecting = await ethers.deployContract("RejectingReceiver", [
        await tipJar.getAddress(),
      ]);
      await expect(
        tipJar.connect(owner).withdrawFees(await rejecting.getAddress())
      ).to.be.revertedWithCustomError(tipJar, "TransferFailed");
    });

    it("rejects non-owner calls", async () => {
      const { tipJar, tipper } = await loadFixture(deployFixture);
      await expect(
        tipJar.connect(tipper).setPlatformFee(0)
      ).to.be.revertedWithCustomError(tipJar, "OwnableUnauthorizedAccount");
      await expect(
        tipJar.connect(tipper).setMinTip(0)
      ).to.be.revertedWithCustomError(tipJar, "OwnableUnauthorizedAccount");
      await expect(
        tipJar.connect(tipper).withdrawFees(tipper.address)
      ).to.be.revertedWithCustomError(tipJar, "OwnableUnauthorizedAccount");
    });
  });
});
