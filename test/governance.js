const ethers = require('ethers')
const timeMachine = require('ganache-time-traveler')
require('chai').use(require('chai-as-promised')).should()
const { BN, expectEvent, expectRevert, time, increase } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup')

const Comp = artifacts.require("Comp");
const Timelock = artifacts.require("Timelock");
const GovernorAlpha = artifacts.require("GovernorAlpha");
const SampleContract = artifacts.require("Sample");

const {
    both,
    etherMantissa,
    encodeParameters,
    advanceBlocks,
    freezeTime,
    mineBlock,
    blockNumber,
    etherUnsigned,
    increaseTime
  } = require('./utils/Ethereum');
//const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');

contract('GovernanceTest', ([SHIVASHAKTI, RAM, SITA, KRISHNA, GANESH, KARTIKEYA])=> {

    const SECONDS_IN_DAY = 86400;
    const queueDelay = 120; // 86400 * 2
    const MINUTE = 60
    const HOUR = 60 * MINUTE
    const DAY = 24 * HOUR
    let gov, timelock, comp, timelockAddress, compAddress, govAddress, sampleContractAddress;

    const ProposalState = {
        0: "Pending",
        1: "Active",
        2: "Canceled",
        3: "Defeated",
        4: "Succeeded",
        5: "Queued",
        6: "Expired",
        7: "Executed"
    }

    describe('start testing', async ()=> {
        
        before(async () =>{
            timelock = await Timelock.new(SHIVASHAKTI, queueDelay, {from: SHIVASHAKTI});
            timelockAddress = timelock.address;
            
            comp = await Comp.new(SHIVASHAKTI, {from: SHIVASHAKTI});
            compAddress = comp.address;
            
            gov = await GovernorAlpha.new(timelockAddress, compAddress, SHIVASHAKTI, {from: SHIVASHAKTI});
            govAddress = gov.address;

            sampleContract = await SampleContract.new({from: SHIVASHAKTI});
            sampleContractAddress = sampleContract.address;

            // const tx_prs = [
            //     SHIVASHAKTI.sendTransaction({
            //         to: timelock,
            //         value: ethers.utils.parseEther("1.0")
            //     }),
            //     SHIVASHAKTI.sendTransaction({
            //         to: compAddress,
            //         value: ethers.utils.parseEther("1.0")
            //     }),
            //     SHIVASHAKTI.sendTransaction({
            //         to: govAddress,
            //         value: ethers.utils.parseEther("1.0")
            //     }),
            //     SHIVASHAKTI.sendTransaction({
            //         to: sampleContractAddress,
            //         value: ethers.utils.parseEther("1.0")
            //     })
            // ];

            // await Promise.all(tx_prs);
            // console.log(tx_prs);

            await timelock.setPendingAdmin(govAddress, {from: SHIVASHAKTI});
            await gov.__acceptAdmin({from: SHIVASHAKTI});
 
            await comp.transfer(RAM, etherMantissa(3e6));
            await comp.delegate(RAM, {from: RAM});

            await comp.transfer(SITA, etherMantissa(3e6));
            await comp.delegate(SITA, {from: SITA});
            
            await advanceBlock();

            snapShot = await timeMachine.takeSnapshot();
            snapshotId = snapShot['result'];
            
        });                 
        
        describe('create a proposal', async ()=> {

            let proposalId;
            
            it('creates a proposal', async () => {
                let ggg = await sampleContract.getVal();
                console.log(Number(ggg));
                const targets = [sampleContractAddress];
                const values = ["0"];
                const signatures = ["setVal(uint256)"];
                const calldatas = [encodeParameters(['uint256'], [27687676])];
                await mineBlock()
                const proposal = await gov.propose(targets, values, signatures, calldatas, "do nothing", {from: RAM});
                proposalId = proposal.logs[0].args[0].toNumber();

                console.log("proposal id", proposalId);
                
                await mineBlock();
                
                expect(proposal.tx).to.have.lengthOf(66);
                expect(proposal.logs[0].event).to.equal('ProposalCreated');
                expect(proposalId).to.be.a('number');
                expect(proposalId % 1).to.equal(0); // check if integer
            })
            
            describe('vote a proposal', () => {
                
                it('should vote a proposal', async () => {

                    //console.log("timelock admin x", SHIVASHAKTI);

                    const txVote1 = await gov.castVote(proposalId, true, {from: RAM});
                    const txVote2 = await gov.castVote(proposalId, true, {from: SITA});
        
                    //console.log(txVote1);
                    //console.log(txVote2);

                    //console.log("ProposalState", Number(await gov.state(proposalId)), ProposalState[Number(await gov.state(proposalId))]);
                    
                    //const block0 = await web3.eth.getBlockNumber()
                    //const t0 = (await web3.eth.getBlock(block0)).timestamp

                    // console.log("block0", block0);
                    // console.log("t0",t0);

                    const latest = await time.latestBlock();
                    //console.log(`Current block: ${latest}`);
                
                    const blk1 = await time.advanceBlockTo(parseInt(latest) + 12);
                    await increaseTime(1)
                    //await time.increase(15*9);

                    //const block1 = await web3.eth.getBlockNumber()
                    //const t1 = (await web3.eth.getBlock(block1)).timestamp

                    // console.log("block1", block1);
                    // console.log("block1", await time.latestBlock());
                    // console.log("t1", t1);
        
                    // console.log("ProposalState before Q", Number(await gov.state(proposalId)), ProposalState[Number(await gov.state(proposalId))]);
    
                    const txQueue1 = await gov.queue(proposalId, {from: SHIVASHAKTI});
    
                    console.log("ProposalState after Q", Number(await gov.state(proposalId)), ProposalState[Number(await gov.state(proposalId))]);
                    
                    let gracePeriod = await timelock.GRACE_PERIOD();
                    //let p = await call(gov, "proposals", [newProposalId]);
                    let p = await gov.proposals(proposalId);
                    let eta = etherUnsigned(p.eta)
                    //console.log("eta", Number(eta));
                    //console.log("gracePeriod", Number(gracePeriod));
                
                    //await freezeTime(eta.plus(gracePeriod).minus(1).toNumber())




                    const block2 = await web3.eth.getBlockNumber()
                    // await time.advanceBlockTo(parseInt(latest2) + 9);
                    //await time.increase(172801);
                    // console.log(eta.plus(gracePeriod).minus(900).toNumber());
                    //await time.increase(eta.plus(gracePeriod).minus(300).toNumber());
                    await time.increase(121);

                    t3 = (await web3.eth.getBlock(block2)).timestamp;
                    //console.log("t3", t3);
                    //console.log(1617454500> 1617281700);


                    //console.log("timelock admin x", SHIVASHAKTI);

                    let ps_state = Number(await gov.state(proposalId));
                    console.log("ps_state", ps_state);

                    assert.equal(ps_state, 5, "Proposal should have been Queued");

                    const txQueue2 = await gov.execute(proposalId, 
                        {
                            from: SHIVASHAKTI, 
                            //value: ethers.utils.formatEther("10000"),
                            //gasPrice: ethers.utils.parseEther(ethers.utils.formatEther("100000000000")),
                            gas: 4712388
                        }
                    );  

                    console.log("ProposalState after X:", ProposalState[Number(await gov.state(proposalId))]);
                    
                    // console.log(txQueue2.receipt.logs[0].args[0].toString());
                    // console.log(txQueue2.receipt.logs[0].args["id"].toString());

                    // timelock.events.allEvents({
                    //     fromBlock: 0
                    // }, function(error, event){ console.log(event); })
                    // .on("connected", function(subscriptionId){
                    //     console.log(subscriptionId);
                    // })
                    // .on('data', function(event){
                    //     console.log(event); // same results as the optional callback above
                    // })
                    // .on('changed', function(event){
                    //     console.log(event);
                    //     // remove event from local database
                    // })
                    // .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
                    //     console.log(error);
                    // });

                    let ggg = await sampleContract.getVal();
                    console.log(Number(ggg));

                });
    
            });

        });

        after(async ()=>{
            await timeMachine.revertToSnapshot(snapshotId);
        })

        
    })
        
});