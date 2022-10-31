import { expect } from "chai";
import { ethers } from "hardhat";

describe("ZkScore contract", function () {

  let owner: any;
  let addr1: any;
  let addr2: any;
  let contract: any;
  let ZkScore: any;

  this.beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    contract = await ethers.getContractFactory("ZkScore");
    ZkScore = await contract.deploy();
  })

  it("check -> first Rgisteration", async () => {
    expect(await ZkScore.isRegistered(owner.getAddress())).to.equal(false);
    let hexMessage = ethers.utils.toUtf8Bytes('0'+owner.getAddress());
    let hashedMessage = ethers.utils.keccak256(hexMessage);
    await ZkScore.firstResister(hashedMessage);
    expect(await ZkScore.isRegistered(owner.getAddress())).to.equal(true);
    await expect(ZkScore.firstResister(hashedMessage)).to.be.revertedWith("You already registered");

  });

  it("check -> add reputation", async () => {
    const from = await addr1.getAddress();
    const to = await addr2.getAddress();

    let genesisScore = ethers.utils.toUtf8Bytes('0'+to);
    let hashedGenesis = ethers.utils.keccak256(genesisScore);
    await expect(ZkScore.addReputation(to, hashedGenesis)).to.be.revertedWith("Recipients has not registered yet");
    await ZkScore.connect(addr2).firstResister(hashedGenesis);


    const globalRoot = await ZkScore.globalState();
    const currentRoot = await ZkScore.userIdentityState(to);
    const addr2Identifier = await ZkScore.userIdentifiers(to);
    const addr2Hash = ethers.utils.keccak256(to);
    expect(addr2Hash).to.equal(addr2Identifier); // check keccak256(msg.sender)

    let reputation = ethers.utils.toUtf8Bytes('5'+from);
    let hashedReputation = ethers.utils.keccak256(reputation);
    await ZkScore.connect(addr1).addReputation(to, hashedReputation);

    let tmp = hashedReputation.substring(2,)+addr2Identifier.substring(2,);
    const leaf = ethers.utils.keccak256("0x"+tmp)

    // check user state
    tmp = currentRoot.substring(2,)+leaf.substring(2,);
    const newRoot = ethers.utils.keccak256("0x"+tmp);
    expect(await ZkScore.userIdentityState(to)).to.equal(newRoot);

    // check global state
    tmp = globalRoot.substring(2,)+leaf.substring(2,);
    const newGlobalRoot = ethers.utils.keccak256("0x"+tmp);
    expect(await ZkScore.globalState()).to.equal(newGlobalRoot);
  });

});