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
    it("should set the right destination", async function () {
      const { mpForwarder, destination } = await loadFixture(
        deployMPForwarderFixture
      );

      expect(await mpForwarder.destination()).to.equal(destination);
    });
  });

  describe("init", function () {
    it("should set the right destination", async function () {
      const [destination] = await hre.ethers.getSigners();

      const { mpForwarder } = await loadFixture(
        deployNoDestinationMPForwarderFixture
      );

      await mpForwarder.init(destination);

      expect(await mpForwarder.destination()).to.equal(destination);
    });

    it("should revert if the destination is already set", async function () {
      const [destination] = await hre.ethers.getSigners();

      const { mpForwarder } = await loadFixture(deployMPForwarderFixture);

      await expect(mpForwarder.init(destination)).to.be.revertedWith(
        "Destination already set"
      );
    });

    it("should revert if the destination is the zero address", async function () {
      const { mpForwarder } = await loadFixture(
        deployNoDestinationMPForwarderFixture
      );

      await expect(mpForwarder.init(hre.ethers.ZeroAddress)).to.be.revertedWith(
        "Invalid destination address"
      );
    });
  });

  describe("flushETH", function () {
    it("should flush ETH to the destination and emit ETHFlushed event", async function () {
      const { mpForwarder, destination, owner } = await loadFixture(
        deployMPForwarderFixture
      );

      const mpForwarderAddress = await mpForwarder.getAddress();

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
      await expect(mpForwarder.flushETH())
        .to.emit(mpForwarder, "ETHFlushed")
        .withArgs(destination, initialContractBalance);

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

    it("should revert if the destination is the zero address", async function () {
      const { mpForwarder } = await loadFixture(
        deployNoDestinationMPForwarderFixture
      );

      await expect(mpForwarder.flushETH()).to.be.revertedWith(
        "Destination address not set"
      );
    });

    it("should revert if there's no ETH to flush", async function () {
      const { mpForwarder } = await loadFixture(deployMPForwarderFixture);

      const mpForwarderAddress = await mpForwarder.getAddress();

      const initialContractBalance = await hre.ethers.provider.getBalance(
        mpForwarderAddress
      );

      expect(initialContractBalance).to.equal(0);

      await expect(mpForwarder.flushETH()).to.be.revertedWith(
        "No ETH to flush"
      );
    });

    it("should revert if ETH transfer fails", async function () {
      const { mpForwarder, owner } = await loadFixture(
        deployNoDestinationMPForwarderFixture
      );

      const mpForwarderAddress = await mpForwarder.getAddress();

      // Send some ETH to the contract
      await owner.sendTransaction({
        to: mpForwarderAddress,
        value: hre.ethers.parseEther("1"),
      });

      // Mock the destination contract to simulate a failed transfer
      const DestinationMock = await hre.ethers.getContractFactory(
        "DestinationMock"
      );
      const destinationMock = await DestinationMock.deploy();
      const destinationMockAddress = await destinationMock.getAddress();

      // Set the mock destination as the destination address
      await mpForwarder.init(destinationMockAddress);

      // Flush ETH
      await expect(mpForwarder.flushETH()).to.be.revertedWith(
        "ETH transfer failed"
      );
    });
  });

  describe("flushERC20", function () {
    it("should flush ERC20 tokens to the destination and emit ERC20Flushed event", async function () {
      const { mpForwarder, destination, owner } = await loadFixture(
        deployMPForwarderFixture
      );

      const mpForwarderAddress = await mpForwarder.getAddress();

      // Deploy an ERC20 token
      const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
      const erc20Mock = await ERC20Mock.deploy(
        "Tether USD",
        "USDT",
        owner.address,
        hre.ethers.parseEther("1000")
      );
      const erc20MockAddress = await erc20Mock.getAddress();

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
      await expect(mpForwarder.flushERC20(erc20MockAddress))
        .to.emit(mpForwarder, "ERC20Flushed")
        .withArgs(erc20MockAddress, destination, initialContractBalance);

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

    it("should revert if the destination is the zero address", async function () {
      const { mpForwarder, owner } = await loadFixture(
        deployNoDestinationMPForwarderFixture
      );

      // Deploy an ERC20 token
      const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
      const erc20Mock = await ERC20Mock.deploy(
        "Tether USD",
        "USDT",
        owner.address,
        hre.ethers.parseEther("1000")
      );
      const erc20MockAddress = await erc20Mock.getAddress();

      await expect(mpForwarder.flushERC20(erc20MockAddress)).to.be.revertedWith(
        "Destination address not set"
      );
    });

    it("should revert if the token address is the zero address", async function () {
      const { mpForwarder } = await loadFixture(deployMPForwarderFixture);

      await expect(
        mpForwarder.flushERC20(hre.ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid token address");
    });

    it("should revert if there are no tokens to flush", async function () {
      const { mpForwarder, owner } = await loadFixture(
        deployMPForwarderFixture
      );

      // Deploy an ERC20 token
      const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
      const erc20Mock = await ERC20Mock.deploy(
        "Tether USD",
        "USDT",
        owner.address,
        hre.ethers.parseEther("1000")
      );
      const erc20MockAddress = await erc20Mock.getAddress();

      await expect(mpForwarder.flushERC20(erc20MockAddress)).to.be.revertedWith(
        "No ERC20 tokens to flush"
      );
    });
  });
});
