const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ZapitTradeContract", function () {
  let ZapitTradeContract;
  let zapitTrade;
  let owner;
  let buyer1;
  let buyer2;
  let seller;
  let token;

  // ERC20 token setup for testing
  before(async function () {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("TestToken", "TT", 18);
  });

  beforeEach(async function () {
    console.log(ethers);
    // [owner, buyer1, buyer2, seller] = await ethers.getSigners();

    // // Deploy the ZapitTradeContract
    // ZapitTradeContract = await ethers.getContractFactory("ZapitTradeContract");
    // zapitTrade = await ZapitTradeContract.deploy();

    // Seller gets some tokens for testing
    const sellerInitialBalance = ethers.utils.parseUnits("1000.0", 18);
    // await token.transfer(seller.address, sellerInitialBalance);

    // // Seller approves ZapitTradeContract to spend tokens
    // await token.connect(seller).approve(zapitTrade.address, sellerInitialBalance);
  });

  describe("Creating an order", function () {
    it("Should allow a seller to create an order for an ERC20 token", async function () {
      const amount = ethers.utils.parseUnits("100.0", 18);

      await expect(zapitTrade.connect(seller).createOrder(token.address, amount, true))
        .to.emit(zapitTrade, "OrderCreated")
        .withArgs(0, seller.address, token.address, amount, true);
    });

    it("Should allow a seller to create an order for native Ether", async function () {
      const amount = ethers.utils.parseEther("1");

      await expect(await zapitTrade.connect(seller).createOrder(ethers.constants.AddressZero, amount, false))
        .to.changeEtherBalance(zapitTrade, amount);
    });
  });

  describe("Registering as a buyer", function () {
    it("Should allow a buyer to register for an order", async function () {
      const orderId = 0;
      const randomMessage = ethers.utils.formatBytes32String("RandomNumber123");

      await expect(zapitTrade.connect(buyer1).registerAsBuyer(orderId, randomMessage))
        .to.emit(zapitTrade, "BuyerRegistered")
        .withArgs(orderId, buyer1.address, randomMessage);
    });
  });

  describe("Fulfilling an order", function () {
    it("Should allow the seller to fulfill an order", async function () {
      const orderId = 0;
      const amount = ethers.utils.parseUnits("100", 18);
      const randomMessage = ethers.utils.formatBytes32String("RandomNumber123");

      // Create order
      await zapitTrade.connect(seller).createOrder(token.address, amount, true);
      
      // Register buyer
      await zapitTrade.connect(buyer1).registerAsBuyer(orderId, randomMessage);

      // Fulfill order
      await expect(zapitTrade.connect(seller).fulfillOrder(orderId, buyer1.address, randomMessage))
        .to.emit(zapitTrade, "OrderFulfilled")
        .withArgs(orderId, buyer1.address, randomMessage);

      // Check buyer received the tokens
      expect(await token.balanceOf(buyer1.address)).to.equal(amount);
    });
  });

  // Add more test cases as needed...
});
