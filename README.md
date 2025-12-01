# Blue Carbon Registry - Blockchain-Based MRV System

A complete blockchain-based Monitoring, Reporting, and Verification (MRV) system for blue carbon restoration projects. This system enables field agents to collect data via mobile app, stores immutable records on IPFS, and issues carbon credits as ERC-20 tokens on Ethereum.

## Project Structure

```
blue-carbon-registry/
├── contracts/          # Solidity smart contracts (Hardhat)
├── backend/           # Node.js + Express API
├── mobile/            # React Native (Expo) mobile app
├── admin/             # React admin dashboard for verifiers
└── docs/              # Documentation
```

## Features

### Smart Contracts
- **BlueCarbonRegistry**: Stores project and field data hashes on-chain
- **CarbonCreditToken**: ERC-20 token for carbon credits (1 token = 1 ton CO2)
- **BlueCarbonVerification**: Multi-signature verification system

### Mobile App (React Native + Expo)
- GPS-enabled data capture
- Camera integration for before/after photos
- IPFS upload with progress tracking
- Real-time blockchain transaction monitoring
- User dashboard showing project status

### Backend (Node.js + Express)
- RESTful API for data management
- IPFS pinning via Pinata
- Web3 integration for blockchain interaction
- MongoDB for metadata storage
- MRV calculation engine
- JWT authentication

### Admin Dashboard (React)
- Verifier login portal
- Project review and approval
- Field data verification
- Map visualization
- Carbon credit minting interface

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas)
- Expo CLI (for mobile development)
- MetaMask wallet
- Git

## API Keys Required

1. **Pinata (IPFS)**
   - Sign up at https://pinata.cloud
   - Get API Key, Secret Key, and JWT

2. **Alchemy (Ethereum)**
   - Sign up at https://alchemy.com
   - Create a Sepolia testnet app
   - Get your API URL

3. **MongoDB**
   - Local: Install MongoDB locally
   - Atlas: Sign up at https://mongodb.com/atlas

4. **Etherscan (Optional)**
   - For contract verification
   - Get API key at https://etherscan.io

## Quick Start

### 1. Clone and Install

```bash
cd Veriflow
npm install
```

This will install dependencies for all workspaces.

### 2. Smart Contracts Setup

```bash
cd contracts

# Copy environment file
cp .env.example .env

# Edit .env with your keys:
# - ALCHEMY_SEPOLIA_URL
# - PRIVATE_KEY (MetaMask private key - use a test wallet!)
# - ETHERSCAN_API_KEY (optional)

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Save the deployed contract addresses!
```

After deployment, you'll get three contract addresses. Save these for the backend and frontend.

### 3. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration:
# - MongoDB connection string
# - Pinata API keys
# - Deployed contract addresses
# - JWT secret

# Install dependencies (if not done via root)
npm install

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 4. Mobile App Setup

```bash
cd mobile

# Copy environment file
cp .env.example .env

# Edit .env with:
# - Backend API URL
# - Contract addresses

# Install dependencies
npm install

# Start Expo development server
npm start

# Then:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on your phone
```

### 5. Admin Dashboard Setup

```bash
cd admin

# Copy environment file
cp .env.example .env

# Edit .env with:
# - Backend API URL (VITE_API_URL)
# - Contract addresses

# Install dependencies
npm install

# Start development server
npm run dev
```

Admin dashboard will run on http://localhost:3000

## Environment Variables Summary

### Contracts (.env)
```bash
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_key
```

### Backend (.env)
```bash
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/blue-carbon

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d

# Pinata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt

# Blockchain
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key

# Contracts (after deployment)
CONTRACT_CARBON_TOKEN=0x...
CONTRACT_REGISTRY=0x...
CONTRACT_VERIFICATION=0x...
```

### Mobile (.env)
```bash
API_URL=http://localhost:5000/api
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_CARBON_TOKEN=0x...
CONTRACT_REGISTRY=0x...
CONTRACT_VERIFICATION=0x...
```

### Admin (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_CONTRACT_CARBON_TOKEN=0x...
VITE_CONTRACT_REGISTRY=0x...
VITE_CONTRACT_VERIFICATION=0x...
```

## Usage Workflow

### For Field Agents (Mobile App)

1. **Register/Login**
   - Create account with email/password
   - Or connect MetaMask wallet

2. **Create Project**
   - Navigate to "New Project"
   - Fill in project details
   - Enable GPS to capture location
   - Submit project

3. **Submit Field Data**
   - Select project
   - Capture GPS coordinates
   - Take before/after photos
   - Enter measurements (biomass, tree count, etc.)
   - Submit to IPFS and blockchain

4. **Track Progress**
   - View all projects in "My Projects"
   - See verification status
   - Check estimated carbon credits

### For Verifiers (Admin Dashboard)

1. **Login**
   - Access admin portal at http://localhost:3000
   - Login with verifier credentials

2. **Review Projects**
   - View all pending projects
   - Check project details and IPFS data
   - Approve or reject projects

3. **Verify Field Data**
   - Review field data submissions
   - View photos and measurements on IPFS
   - Approve verified data

4. **Issue Carbon Credits**
   - Create credit request in verification contract
   - Multi-sig approval process
   - Credits automatically minted on approval

## Development Scripts

### Root Level
```bash
npm run setup              # Install all dependencies
npm run contracts:compile  # Compile smart contracts
npm run contracts:deploy   # Deploy to Sepolia
npm run backend:dev        # Start backend in dev mode
npm run mobile:start       # Start Expo mobile app
npm run admin:dev          # Start admin dashboard
npm run dev                # Start backend + admin together
```

### Smart Contracts
```bash
cd contracts
npm run compile            # Compile contracts
npm test                   # Run tests
npm run deploy:sepolia     # Deploy to Sepolia
npm run deploy:local       # Deploy to local network
```

### Backend
```bash
cd backend
npm run dev                # Development mode with hot reload
npm start                  # Production mode
npm run build              # Build TypeScript
```

### Mobile
```bash
cd mobile
npm start                  # Start Expo
npm run android            # Run on Android
npm run ios                # Run on iOS
```

### Admin
```bash
cd admin
npm run dev                # Development server
npm run build              # Production build
npm run preview            # Preview production build
```

## Testing

### Smart Contract Tests
```bash
cd contracts
npm test
```

### Manual Testing Flow

1. **Deploy Contracts** → Get contract addresses
2. **Start Backend** → Configure with contract addresses
3. **Start Admin** → Create verifier account
4. **Start Mobile** → Create user account
5. **Mobile**: Create a project
6. **Admin**: Approve the project
7. **Mobile**: Submit field data
8. **Admin**: Verify field data and issue credits

## MRV Calculation

The system uses simplified carbon sequestration rates (tons CO2/hectare/year):

- **Mangroves**: 6.5
- **Seagrass**: 4.5
- **Salt Marsh**: 5.0
- **Other**: 3.0

Formula: `Credits = (Area in hectares) × (Sequestration Rate) × (Years)`

**Note**: This is simplified for the hackathon. Production systems should use verified MRV methodologies like Verra VCS or Gold Standard.

## Architecture

### Data Flow

1. **Field Agent** collects data on mobile app
2. **Mobile App** uploads to IPFS via Pinata
3. **Backend** stores metadata in MongoDB
4. **Backend** submits IPFS hash to blockchain
5. **Verifier** reviews data in admin dashboard
6. **Admin** approves and triggers smart contract
7. **Smart Contract** mints carbon credit tokens
8. **Tokens** transferred to project owner's wallet

### Tech Stack

- **Blockchain**: Ethereum (Sepolia testnet)
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **IPFS**: Pinata for pinning
- **Mobile**: React Native, Expo
- **Admin**: React, Vite, TailwindCSS
- **Authentication**: JWT
- **Web3**: ethers.js v6

## Security Considerations

⚠️ **Important for Production**:

1. **Never commit .env files** to Git
2. **Use test wallets only** for development
3. **Enable rate limiting** on API endpoints
4. **Implement proper access control** for verifiers
5. **Audit smart contracts** before mainnet deployment
6. **Use hardware wallets** for production private keys
7. **Enable HTTPS** for all endpoints
8. **Implement proper error handling**

## Troubleshooting

### Common Issues

**1. MongoDB Connection Error**
```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/data
```

**2. Expo Won't Start**
```bash
# Clear cache
cd mobile
rm -rf node_modules
npm install
npx expo start -c
```

**3. Contract Deployment Fails**
- Check you have Sepolia ETH (get from faucet)
- Verify PRIVATE_KEY is correct in .env
- Check Alchemy URL is valid

**4. IPFS Upload Fails**
- Verify Pinata API keys
- Check network connection
- Ensure file size is reasonable

## Deployment to Production

### Backend (Heroku/Railway/DigitalOcean)
```bash
cd backend
npm run build
# Deploy dist/ folder
```

### Admin Dashboard (Vercel/Netlify)
```bash
cd admin
npm run build
# Deploy dist/ folder
```

### Mobile App (Expo)
```bash
cd mobile
expo build:android
expo build:ios
# Submit to app stores
```

### Smart Contracts (Mainnet)
⚠️ Only after thorough testing and audit!
```bash
cd contracts
# Update hardhat.config.ts with mainnet settings
npm run deploy:mainnet
```

## Contributing

This is a hackathon project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- Open an issue on GitHub
- Check the docs/ folder for additional documentation

## Acknowledgments

- Built for [Hackathon Name]
- Blue carbon data based on scientific research
- Uses OpenZeppelin contracts for security

## Roadmap

Future enhancements:
- [ ] Integration with carbon marketplaces
- [ ] Advanced MRV calculations with satellite data
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] NFT certificates for projects
- [ ] Real-time dashboard analytics
- [ ] Mobile wallet integration
- [ ] Automated drone imagery processing
- [ ] Machine learning for verification

---

Built with ❤️ for ocean conservation and climate action
