import { ethers } from 'ethers';

// Contract ABIs (simplified - add full ABIs after deployment)
const REGISTRY_ABI = [
  "function registerProject(string projectId, string ipfsHash, string location, uint256 area, string ecosystemType) external",
  "function submitFieldData(string dataId, string projectId, string ipfsHash, string gpsLocation, string notes) external",
  "function getProject(string projectId) external view returns (tuple(string projectId, address owner, string ipfsHash, string location, uint256 area, string ecosystemType, uint8 status, uint256 createdAt, uint256 verifiedAt, address verifiedBy, uint256 estimatedCredits, uint256 issuedCredits))",
  "function getFieldData(string dataId) external view returns (tuple(string dataId, string projectId, address collector, string ipfsHash, string gpsLocation, uint256 timestamp, bool verified, address verifiedBy, string notes))",
  "function getUserProjects(address user) external view returns (string[])",
  "function getTotalProjects() external view returns (uint256)",
  "event ProjectRegistered(string indexed projectId, address indexed owner, string ipfsHash, uint256 timestamp)",
  "event FieldDataSubmitted(string indexed dataId, string indexed projectId, address indexed collector, string ipfsHash, uint256 timestamp)"
];

const TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function retiredCredits(address account) external view returns (uint256)",
  "function totalRetiredCredits() external view returns (uint256)"
];

const VERIFICATION_ABI = [
  "function createCreditRequest(string projectId, address recipient, uint256 amount, string ipfsProof) external returns (uint256)",
  "function voteOnRequest(uint256 requestId, bool approve) external",
  "function getRequestStatus(uint256 requestId) external view returns (string projectId, address recipient, uint256 amount, uint256 approvalCount, uint256 rejectionCount, uint8 status, bool executed)"
];

export class BlockchainService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  public registryContract: ethers.Contract;
  public tokenContract: ethers.Contract;
  public verificationContract: ethers.Contract;

  constructor() {
    const rpcUrl = process.env.ALCHEMY_SEPOLIA_URL;
    const privateKey = process.env.PRIVATE_KEY;

    if (!rpcUrl || !privateKey) {
      throw new Error('Missing blockchain configuration');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    const registryAddress = process.env.CONTRACT_REGISTRY;
    const tokenAddress = process.env.CONTRACT_CARBON_TOKEN;
    const verificationAddress = process.env.CONTRACT_VERIFICATION;

    if (!registryAddress || !tokenAddress || !verificationAddress) {
      throw new Error('Missing contract addresses');
    }

    this.registryContract = new ethers.Contract(registryAddress, REGISTRY_ABI, this.wallet);
    this.tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, this.wallet);
    this.verificationContract = new ethers.Contract(verificationAddress, VERIFICATION_ABI, this.wallet);
  }

  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  async waitForTransaction(txHash: string, confirmations = 1) {
    return await this.provider.waitForTransaction(txHash, confirmations);
  }
}

export const initBlockchain = (): BlockchainService | null => {
  try {
    return new BlockchainService();
  } catch (error) {
    console.error('Blockchain initialization failed:', error);
    return null;
  }
};
