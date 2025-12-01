import axios from 'axios';
import FormData from 'form-data';

export class IPFSService {
  private apiKey: string;
  private secretKey: string;
  private jwt: string;
  private pinataApiUrl = 'https://api.pinata.cloud';

  constructor() {
    this.apiKey = process.env.PINATA_API_KEY || '';
    this.secretKey = process.env.PINATA_SECRET_KEY || '';
    this.jwt = process.env.PINATA_JWT || '';

    if (!this.jwt && (!this.apiKey || !this.secretKey)) {
      throw new Error('Missing Pinata credentials');
    }
  }

  private getHeaders() {
    if (this.jwt) {
      return {
        Authorization: `Bearer ${this.jwt}`,
      };
    }
    return {
      pinata_api_key: this.apiKey,
      pinata_secret_api_key: this.secretKey,
    };
  }

  async pinJSON(data: any, name?: string): Promise<{ ipfsHash: string; ipfsUrl: string }> {
    try {
      const payload = {
        pinataContent: data,
        pinataMetadata: {
          name: name || `blue-carbon-${Date.now()}`,
        },
      };

      const response = await axios.post(
        `${this.pinataApiUrl}/pinning/pinJSONToIPFS`,
        payload,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      return {
        ipfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      };
    } catch (error: any) {
      console.error('IPFS pinning error:', error.response?.data || error.message);
      throw new Error('Failed to pin data to IPFS');
    }
  }

  async pinFile(fileBuffer: Buffer, fileName: string): Promise<{ ipfsHash: string; ipfsUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, fileName);

      const metadata = JSON.stringify({
        name: fileName,
      });
      formData.append('pinataMetadata', metadata);

      const response = await axios.post(
        `${this.pinataApiUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
          },
          maxBodyLength: Infinity,
        }
      );

      const ipfsHash = response.data.IpfsHash;
      return {
        ipfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      };
    } catch (error: any) {
      console.error('IPFS file pinning error:', error.response?.data || error.message);
      throw new Error('Failed to pin file to IPFS');
    }
  }

  async unpinHash(ipfsHash: string): Promise<void> {
    try {
      await axios.delete(
        `${this.pinataApiUrl}/pinning/unpin/${ipfsHash}`,
        {
          headers: this.getHeaders(),
        }
      );
    } catch (error: any) {
      console.error('IPFS unpinning error:', error.response?.data || error.message);
      throw new Error('Failed to unpin from IPFS');
    }
  }

  async getFileFromIPFS(ipfsHash: string): Promise<any> {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      return response.data;
    } catch (error: any) {
      console.error('IPFS retrieval error:', error.message);
      throw new Error('Failed to retrieve data from IPFS');
    }
  }
}

export default new IPFSService();
