const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {

    let daiToken, dappToken, tokenFarm

    before(async () => {
        //Load Contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //Transfer all Dapp tokens to farm (1mil)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        // Send tokens to investor
        await daiToken.transfer(investor, tokens('100'), {from: owner })
    })


    describe('Mock Dai deployment', async() => {
        it('has a name', async () => {

            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async() => {
        it('has a name', async () => {

            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async() => {
        it('has a name', async () => {

            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming tokens', async () => {

        it('rewards investors for staking mDai tokens', async () => {
            let result

            //check investor balance for staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens ('100'), 'investor Mock DAI wallet balance correct before staking')

            //stake Mock DAI Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
            await tokenFarm.stakeTokens(tokens('100'),{from: investor})

            //Check Staking result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

            //Check token farm balance
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')

            //Check investor balance after staking
            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

            //Check if investor is currently staking
            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'true', 'investor staking status correct after staking')

            //Issue Tokens
            await tokenFarm.issueTokens ({from: owner})

            //Check balance after issuing tokens
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct after issuing tokens')

            //Ensure only owner cna issue tokens
            await tokenFarm.issueTokens({from: investor}).should.be.rejected;

            //Unstake tokens
            await tokenFarm.unstakeTokens({from:investor})

            //check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'), 'investor mock DAI waller balance correct after unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('0'), 'Token Farm Mock DAI balance correct after unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),tokens('0'), 'investor staking balance correct after unstaking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'false', 'Investor status correct after unstaking')
        })

    })
})