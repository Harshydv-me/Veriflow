import { expect } from "chai";
import { ethers } from "hardhat";
import { BlueCarbonRegistry, CarbonCreditToken, BlueCarbonVerification } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-toolbox/signers";

describe("Blue Carbon Registry System", function () {
  let registry: BlueCarbonRegistry;
  let carbonToken: CarbonCreditToken;
  let verification: BlueCarbonVerification;
  let owner: SignerWithAddress;
  let verifier: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, verifier, user] = await ethers.getSigners();

    // Deploy contracts
    const CarbonCreditToken = await ethers.getContractFactory("CarbonCreditToken");
    carbonToken = await CarbonCreditToken.deploy();

    const BlueCarbonRegistry = await ethers.getContractFactory("BlueCarbonRegistry");
    registry = await BlueCarbonRegistry.deploy();

    const BlueCarbonVerification = await ethers.getContractFactory("BlueCarbonVerification");
    verification = await BlueCarbonVerification.deploy(
      await carbonToken.getAddress(),
      await registry.getAddress()
    );

    // Setup roles
    const MINTER_ROLE = await carbonToken.MINTER_ROLE();
    const VERIFIER_ROLE = await registry.VERIFIER_ROLE();

    await carbonToken.grantRole(MINTER_ROLE, await verification.getAddress());
    await registry.grantRole(VERIFIER_ROLE, verifier.address);
    await verification.grantRole(VERIFIER_ROLE, verifier.address);
  });

  describe("BlueCarbonRegistry", function () {
    it("Should register a new project", async function () {
      await registry.connect(user).registerProject(
        "PROJECT001",
        "QmTestHash123",
        "10.123,-75.456",
        10000,
        "Mangrove"
      );

      const project = await registry.getProject("PROJECT001");
      expect(project.projectId).to.equal("PROJECT001");
      expect(project.owner).to.equal(user.address);
      expect(project.ecosystemType).to.equal("Mangrove");
    });

    it("Should submit field data", async function () {
      await registry.connect(user).registerProject(
        "PROJECT001",
        "QmTestHash123",
        "10.123,-75.456",
        10000,
        "Mangrove"
      );

      await registry.connect(user).submitFieldData(
        "DATA001",
        "PROJECT001",
        "QmFieldDataHash",
        "10.123,-75.456",
        "Initial measurements"
      );

      const data = await registry.getFieldData("DATA001");
      expect(data.dataId).to.equal("DATA001");
      expect(data.projectId).to.equal("PROJECT001");
    });

    it("Should verify a project", async function () {
      await registry.connect(user).registerProject(
        "PROJECT001",
        "QmTestHash123",
        "10.123,-75.456",
        10000,
        "Mangrove"
      );

      await registry.connect(verifier).verifyProject("PROJECT001", 3, 100);

      const project = await registry.getProject("PROJECT001");
      expect(project.status).to.equal(3); // Active
      expect(project.estimatedCredits).to.equal(100);
    });
  });

  describe("CarbonCreditToken", function () {
    it("Should issue credits with MINTER_ROLE", async function () {
      const MINTER_ROLE = await carbonToken.MINTER_ROLE();
      await carbonToken.grantRole(MINTER_ROLE, owner.address);

      await carbonToken.issueCredits(user.address, 100, "PROJECT001");

      const balance = await carbonToken.balanceOf(user.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });

    it("Should retire credits", async function () {
      const MINTER_ROLE = await carbonToken.MINTER_ROLE();
      await carbonToken.grantRole(MINTER_ROLE, owner.address);

      await carbonToken.issueCredits(user.address, 100, "PROJECT001");
      await carbonToken.connect(user).retireCredits(50, "Corporate offset");

      const balance = await carbonToken.balanceOf(user.address);
      const retired = await carbonToken.retiredCredits(user.address);

      expect(balance).to.equal(ethers.parseEther("50"));
      expect(retired).to.equal(50);
    });
  });

  describe("BlueCarbonVerification", function () {
    it("Should create a credit request", async function () {
      const requestId = await verification.connect(verifier).createCreditRequest.staticCall(
        "PROJECT001",
        user.address,
        100,
        "QmProofHash"
      );

      await verification.connect(verifier).createCreditRequest(
        "PROJECT001",
        user.address,
        100,
        "QmProofHash"
      );

      const status = await verification.getRequestStatus(requestId);
      expect(status.projectId).to.equal("PROJECT001");
      expect(status.amount).to.equal(100);
    });

    it("Should approve and execute with sufficient votes", async function () {
      // Setup project first
      await registry.connect(user).registerProject(
        "PROJECT001",
        "QmTestHash",
        "10.123,-75.456",
        10000,
        "Mangrove"
      );

      await registry.connect(verifier).verifyProject("PROJECT001", 3, 100);

      // Create and approve credit request
      await verification.connect(verifier).createCreditRequest(
        "PROJECT001",
        user.address,
        100,
        "QmProofHash"
      );

      await verification.connect(verifier).voteOnRequest(0, true);
      await verification.connect(owner).voteOnRequest(0, true);

      const status = await verification.getRequestStatus(0);
      expect(status.executed).to.be.true;
      expect(status.status).to.equal(1); // Approved

      const balance = await carbonToken.balanceOf(user.address);
      expect(balance).to.equal(ethers.parseEther("100"));
    });
  });
});
