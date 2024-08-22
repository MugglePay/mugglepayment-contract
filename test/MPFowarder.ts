import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("MPForwarder", function () {
  async function deployMPForwarderFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const destination = otherAccount.address;

    const MPForwarder = await hre.ethers.getContractFactory("MPForwarder");
    const mpForwarder = await MPForwarder.deploy(destination);

    return { mpForwarder, destination, owner };
  }

  async function deployNoDestinationMPForwarderFixture() {
    const [owner] = await hre.ethers.getSigners();

    const MPForwarder = await hre.ethers.getContractFactory("MPForwarder");
    const mpForwarder = await MPForwarder.deploy(hre.ethers.ZeroAddress);

    return { mpForwarder, owner };
  }

  describe("deploy", function () {
    it("Should set the right destination", async function () {
      const { mpForwarder, destination } = await loadFixture(
        deployMPForwarderFixture
      );

      expect(await mpForwarder.destination()).to.equal(destination);
    });
  });

  describe("init", function () {
    it("Should set the right destination", async function () {
      const [destination] = await hre.ethers.getSigners();

      const { mpForwarder } = await loadFixture(
        deployNoDestinationMPForwarderFixture
      );

      await mpForwarder.init(destination);

      expect(await mpForwarder.destination()).to.equal(destination);
    });
  });

  describe("flushETH", function () {
    it("Should flush ETH to the destination", async function () {
      const { mpForwarder, destination, owner } = await loadFixture(
        deployMPForwarderFixture
      );

      const mpForwarderAddress = mpForwarder.getAddress();

      // Send some ETH to the contract
      await owner.sendTransaction({
        to: mpForwarderAddress,
        value: hre.ethers.parseEther("1"),
      });

      // Check initial balances
      const initialContractBalance = await hre.ethers.provider.getBalance(
        mpForwarderAddress
      );
      const initialDestinationBalance = await hre.ethers.provider.getBalance(
        destination
      );

      // Flush ETH
      await mpForwarder.flushETH();

      // Check final balances
      const finalContractBalance = await hre.ethers.provider.getBalance(
        mpForwarderAddress
      );
      const finalDestinationBalance = await hre.ethers.provider.getBalance(
        destination
      );

      expect(finalContractBalance).to.equal(0);
      expect(finalDestinationBalance).to.equal(
        initialDestinationBalance + initialContractBalance
      );
    });
  });

  describe("flushERC20", function () {
    it("Should flush ERC20 tokens to the destination", async function () {
      const { mpForwarder, destination, owner } = await loadFixture(
        deployMPForwarderFixture
      );

      const mpForwarderAddress = mpForwarder.getAddress();

      // Deploy a mock ERC20 token
      const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
      const erc20Mock = await ERC20Mock.deploy(
        "Tether USD",
        "USDT",
        owner.address,
        hre.ethers.parseEther("1000")
      );

      // Transfer some tokens to the MPForwarder contract
      await erc20Mock.transfer(
        mpForwarderAddress,
        hre.ethers.parseEther("100")
      );

      // Check initial balances
      const initialContractBalance = await erc20Mock.balanceOf(
        mpForwarderAddress
      );
      const initialDestinationBalance = await erc20Mock.balanceOf(destination);

      // Flush ERC20 tokens
      await mpForwarder.flushERC20(erc20Mock.getAddress());

      // Check final balances
      const finalContractBalance = await erc20Mock.balanceOf(
        mpForwarderAddress
      );
      const finalDestinationBalance = await erc20Mock.balanceOf(destination);

      expect(finalContractBalance).to.equal(0);
      expect(finalDestinationBalance).to.equal(
        initialDestinationBalance + initialContractBalance
      );
    });
  });
});
