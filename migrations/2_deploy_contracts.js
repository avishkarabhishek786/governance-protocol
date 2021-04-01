const Comp = artifacts.require("Comp");
const Timelock = artifacts.require("Timelock");
const GovernorAlpha = artifacts.require("GovernorAlpha");
const SampleContract = artifacts.require("Sample");

module.exports = async function (deployer, _network, accounts) {

  const [SHIVASHAKTI, RAM, SITA, KRISHNA, GANESH, KARTIKEYA] = accounts;

  const queueDelay = 120; // 86400*2
    console.log("timelock admin ", SHIVASHAKTI);
  await deployer.deploy(Timelock, SHIVASHAKTI, queueDelay, {from: SHIVASHAKTI});
  const timelock = await Timelock.deployed();
  const timelockAddress = timelock.address;

  await deployer.deploy(Comp, SHIVASHAKTI, {from: SHIVASHAKTI});
  const comp = await Comp.deployed();
  const compAddress = comp.address;
  
  await deployer.deploy(GovernorAlpha, timelockAddress, compAddress, SHIVASHAKTI, {from: SHIVASHAKTI});
  const governorAlpha = await GovernorAlpha.deployed();
  const governorAlphaAddress = governorAlpha.address;

  await deployer.deploy(SampleContract, {from: SHIVASHAKTI});

  console.log("timelockAddress", timelockAddress);
  console.log("compAddress", compAddress);
  console.log("governorAlphaAddress", governorAlphaAddress);

};
