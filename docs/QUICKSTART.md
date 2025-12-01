# Quick Start Guide - Blue Carbon Registry

This guide will get you up and running in 30 minutes for the hackathon demo.

## Step 1: Install Dependencies (5 min)

```bash
cd Veriflow
npm install
```

## Step 2: Get API Keys (10 min)

### Pinata (IPFS) - Required
1. Go to https://pinata.cloud
2. Sign up for free account
3. Go to API Keys → New Key
4. Copy: API Key, Secret API Key, and JWT

### Alchemy (Ethereum) - Required
1. Go to https://alchemy.com
2. Sign up for free account
3. Create new app → Choose "Sepolia" testnet
4. Copy the HTTPS URL

### MongoDB - Required
Option A (Quick - Local):
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongodb
```

Option B (Cloud - MongoDB Atlas):
1. Go to https://mongodb.com/atlas
2. Create free cluster
3. Get connection string

### MetaMask - Required
1. Install MetaMask extension
2. Create new wallet or import existing
3. Switch to Sepolia testnet
4. Get test ETH from https://sepoliafaucet.com

## Step 3: Deploy Smart Contracts (5 min)

```bash
cd contracts
cp .env.example .env

# Edit .env file:
nano .env
# Add your Alchemy URL and MetaMask private key

# Deploy
npm install
npm run compile
npm run deploy:sepolia

# IMPORTANT: Copy the 3 contract addresses from output!
```

## Step 4: Configure Backend (3 min)

```bash
cd ../backend
cp .env.example .env

# Edit .env file:
nano .env

# Add:
# - MongoDB URI
# - Pinata keys (all 3)
# - Alchemy URL
# - Private key
# - Contract addresses (from Step 3)

# Start backend
npm install
npm run dev
```

Backend should now be running on http://localhost:5000

## Step 5: Configure & Run Admin Dashboard (2 min)

```bash
cd ../admin
cp .env.example .env

# Edit .env:
nano .env
# Add contract addresses with VITE_ prefix

npm install
npm run dev
```

Admin dashboard: http://localhost:3000

## Step 6: Configure & Run Mobile App (3 min)

```bash
cd ../mobile
cp .env.example .env

# Edit .env:
nano .env
# Add API URL and contract addresses

npm install
npm start
```

Scan QR code with Expo Go app or run in simulator.

## Step 7: Create Test Accounts (2 min)

### Create Verifier Account (Backend)

You need to manually create a verifier user in MongoDB:

```bash
# Connect to MongoDB
mongosh

# Use database
use blue-carbon

# Create verifier
db.users.insertOne({
  email: "verifier@test.com",
  password: "$2a$10$rVqhVqYKv3WlKbJhJhDQ6.N7vJ7Y8qxqMy7qKMQgYZQYZQYZQYZQY",  // "password123"
  name: "Test Verifier",
  role: "verifier",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the API to register and then manually update the role in MongoDB:

```bash
# Register via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"verifier@test.com","password":"password123","name":"Test Verifier"}'

# Then update role in MongoDB
db.users.updateOne({email: "verifier@test.com"}, {$set: {role: "verifier"}})
```

### Create Field Agent Account (Mobile App)

Just use the registration screen in the mobile app!

## Demo Flow

1. **Admin Login** (http://localhost:3000)
   - Email: verifier@test.com
   - Password: password123

2. **Mobile App**
   - Register new account
   - Create a project
   - Fill in details, enable GPS
   - Submit

3. **Admin Dashboard**
   - Refresh projects page
   - See pending project
   - Click "Approve"

4. **Mobile App**
   - Go to "Field Data" tab
   - Select your project ID
   - Capture GPS
   - Add measurements
   - (Photos optional for quick demo)
   - Submit

5. **Admin Dashboard**
   - Go to "Field Data" page
   - See your submission
   - Click "Approve"
   - View IPFS data

## Troubleshooting

### "Network Error" in Mobile App
- Make sure backend is running
- For iOS simulator, use `http://localhost:5000`
- For Android emulator, use `http://10.0.2.2:5000`
- For physical device, use your computer's IP: `http://192.168.x.x:5000`

### "MongoDB Connection Failed"
```bash
# Check if MongoDB is running
mongosh
# If error, start MongoDB:
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

### "Insufficient Funds" on Contract Deployment
- Get Sepolia ETH from https://sepoliafaucet.com
- Wait a few minutes for it to arrive

### Expo Won't Start
```bash
cd mobile
npx expo start --clear
```

## Tips for Demo

1. **Prepare screenshots** of the workflow
2. **Have test data ready** (project info, measurements)
3. **Open all 3 interfaces** before demo:
   - Admin dashboard (browser)
   - Mobile app (phone or simulator)
   - Blockchain explorer (for contract verification)
4. **Pre-deploy contracts** to avoid delays
5. **Test the full flow** once before presenting

## Demo Script

"I'll demonstrate our Blue Carbon MRV system:

1. **Field Agent** creates a mangrove restoration project on mobile
2. Data is uploaded to **IPFS** for immutable storage
3. Project metadata is stored **on-chain** with the IPFS hash
4. **Verifier** reviews the project in our admin dashboard
5. Upon approval, the system calculates estimated carbon credits
6. Field agent submits **real-time data** with GPS and photos
7. Verifier approves, triggering the **smart contract**
8. **ERC-20 carbon credits** are minted to the project owner

All data is transparent, immutable, and verifiable on Ethereum."

## Next Steps

- Customize UI with your team's branding
- Add more ecosystem types
- Enhance MRV calculations
- Add satellite imagery integration
- Deploy to testnet for public demo

Good luck with your hackathon! 🚀
