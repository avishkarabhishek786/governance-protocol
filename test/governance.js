const timeMachine = require('ganache-time-traveler')
const { BN, expectRevert } = require('@openzeppelin/test-helpers')
require('chai').use(require('chai-as-promised')).should()

const Comp = artifacts.require("Comp");
const Timelock = artifacts.require("Timelock");
const GovernorAlpha = artifacts.require("GovernorAlpha");

const {
    both,
    etherMantissa,
    encodeParameters,
    advanceBlocks,
    freezeTime,
    mineBlock
  } = require('./utils/Ethereum');
//const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');

contract('GovernanceTest', ([SHIVASHAKTI, RAM, SITA, KRISHNA, GANESH, KARTIKEYA])=> {

    describe('start testing', async ()=> {
        
        const queueDelay = 300; // 86400 * 2
        let gov, timelock, comp, timelockAddress, compAddress, govAddress;
        
        beforeEach(async () =>{
            timelock = await Timelock.new(SHIVASHAKTI, queueDelay, {from: SHIVASHAKTI});
            timelockAddress = timelock.address;
            
            comp = await Comp.new(SHIVASHAKTI, {from: SHIVASHAKTI});
            compAddress = comp.address;
            
            gov = await GovernorAlpha.new(timelockAddress, compAddress, SHIVASHAKTI, {from: SHIVASHAKTI});
            govAddress = gov.address;
            
            // console.log("timelockAddress", timelockAddress);
            // console.log("compAddress", compAddress);
            // console.log("govAddress", govAddress);
            
            // await timelock.setPendingAdmin(govAddress, {from: timelockAddress});
            // await timelock.acceptAdmin({from: govAddress});
 
            await comp.transfer(RAM, etherMantissa(3e6));
            await comp.delegate(RAM, {from: RAM});

            await comp.transfer(SITA, etherMantissa(3e6));
            await comp.delegate(SITA, {from: SITA});
            
            await mineBlock();
            
        }); 
        
        // describe('create a proposal', ()=> {
        //     it('creates a proposal', async () => {
        //         const targets = [compAddress, compAddress];
        //         const values = ["0", "0"];
        //         const signatures = ["getBalanceOf(address)", "getBalanceOf(address)"];
        //         const calldatas = [encodeParameters(['address'], [SHIVASHAKTI]), encodeParameters(['address'], [SHIVASHAKTI])];
        //         const proposalId = await gov.propose(targets, values, signatures, calldatas, "do nothing", {from: RAM});
        //         await mineBlock();
        //         //const proposalIdEvent = proposalId.logs[0].args;
        //         expect(proposalId.tx).to.have.lengthOf(66);
        //         expect(proposalId.logs[0].event).to.equal('ProposalCreated');
        //     })
        // });

        describe('vote a proposal', () => {
            
            it('should vote a proposal', async () => {
                const targets = [compAddress, compAddress];
                const values = ["0", "0"];
                const signatures = ["getBalanceOf(address)", "getBalanceOf(address)"];
                const calldatas = [encodeParameters(['address'], [SHIVASHAKTI]), encodeParameters(['address'], [SHIVASHAKTI])];
                const proposal = await gov.propose(targets, values, signatures, calldatas, "do nothing", {from: RAM});
                const proposalId = proposal.logs[0].args[0].toString();
                console.log(proposalId);
                await mineBlock();
    
                //const txVote1 = await send(gov, 'castVote', [proposalId1, true], {from: a1});
                const txVote1 = await gov.castVote(proposalId, true, {from: RAM});
                const txVote2 = await gov.castVote(proposalId, true, {from: SITA});
    
                console.log(await gov.state(proposalId).toString());
                
                await advanceBlocks(200000);

                console.log(await gov.proposals(proposalId))
    
                console.log(await gov.state(proposalId).toString());

                //const txQueue1 = await gov.queue(proposalId, {from: RAM});

                //console.log(await gov.state(proposalId).toString());
            })


        });
        
    })
        
});