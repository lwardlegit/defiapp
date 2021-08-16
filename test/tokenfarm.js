const { assert } = require('chai');
const web3 = require('web3');
const utils = require('web3-utils');


const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
.use(require('chai-as-promised'))
.should()

function tokens(n){
    return web3.utils.toWei(n,'ether')
}

contract('TokenFarm', ([owner,investor])=>{
    
    let daiToken, dappToken, tokenFarm
    before(async ()=>{
        //load contracts
         daiToken = await DaiToken.new()
         dappToken = await DappToken.new()
         tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
         
         //transfer all tokens to tokenfarm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        //send tokens to investor
        await daiToken.transfer(investor, tokens('100'), {from: owner})

    })




    describe('Mock DAI deployment', async()=>{
        it('has a name', async ()=>{
      
            const name = await daiToken.name()
            assert.equal(name,'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async()=>{
        it('has a name', async ()=>{
      
            const name = await dappToken.name()
            assert.equal(name,'DApp Token')
        })
    })

    describe('Token Farm deployment', async()=>{
        it('has a name', async ()=>{
      
            const name = await tokenFarm.name()
            assert.equal(name,'Dapp Token Farm')
        })
    })

    it('contract has tokens', async()=>{
        let balance = await dappToken.balanceOf(tokenFarm.address)
        assert.equal(balance.toString(), tokens('1000000'))
    })


    describe('Farming tokens', async ()=>{
        it('rewards investors for staking mDai tokens', async()=>{
            let result
            //check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'),
            'investor Mock Dai wallet balance correct before staking')
 
            // stake mock DAI tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from:investor})
            await tokenFarm.stakeTokens(tokens('100'), {from: investor})

            //check balance of dai token in investor
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor mock DAI wallet balance after staking')
            
            //check balance of dai token in investor
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            // Issue tokens

            await tokenFarm.issueTokens({from:owner})
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'), 'investor Dapp token wallet balance correct')

           //make sure only person who can issue tokens is the owner
           await tokenFarm.issueTokens({from:investor}).should.be.rejected;

           //unstake tokens
           await tokenFarm.unstakeTokens({from: investor})

           //check results after unstaking
           result = await daiToken.balanceOf(investor)
           assert.equal(result.toString(), tokens('100'), 'investor dai wallet balance correct after staking')
           
           //check balance of farm after removing staked dai
           result = await daiToken.balanceOf(tokenFarm.address)
           assert.equal(result.toString(), tokens('0'), 'Token darm mock DAI balance after removing staked coins')

           //investor balance check after removing stake
           result = await tokenFarm.stakingBalance(investor)
           assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

           // check if investor is staking after removing dai
           result = await tokenFarm.isStaking(investor)
           assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
        })
    })


    
})