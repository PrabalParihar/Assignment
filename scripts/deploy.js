// scripts/deploy.js

const hre = require("hardhat");
let token;

async function main() {
  // We get the contract to deploy
  const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("TestToken", "TT", 188889);
    await token.deployed();
    
  const ZapitTradeContract = await hre.ethers.getContractFactory("ZapitTradeContract");
  const zapitTrade = await ZapitTradeContract.deploy();

  await zapitTrade.deployed();

  console.log("ZapitTradeContract deployed to:", zapitTrade.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
