const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(deployer, network, accounts) {
    //deploy mock dai token
    await deployer.deploy(DaiToken)
    const daiToken= await DaiToken.deployed()

    //deploy mock Dapp token
    await deployer.deploy(DappToken)
    const dappToken= await DappToken.deployed()

    //deploy TokenFarm
    await deployer.deploy(TokenFarm,dappToken.address, daiToken.address)
    const tokenFarm = await TokenFarm.deployed()

    //transfer all tokens to TokenFarm (1million)
    await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

    //transfer 100 Mock Dai to investor
    await daiToken.transfer(accounts[1], '1000000000000000000000000')



};
