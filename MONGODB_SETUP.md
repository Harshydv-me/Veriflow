# 🚀 VeriFlow MongoDB Setup Guide

Complete guide to run VeriFlow with MongoDB backend.

---

## **Quick Start (5 Minutes)**

### **Step 1: Start MongoDB** (1 min)

Check if MongoDB is running:
```bash
mongosh
```

If it's not running, start it:
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Or start manually
mongod --dbpath ~/data/db
```

### **Step 2: Start Backend** (1 min)

```bash
cd /Users/harsh/Desktop/Veriflow/backend
npm install
npm run dev
```

Expected output:
```
============================================================
Blue Carbon Registry Backend
============================================================
Environment: development
Server running on port 5001
API URL: http://localhost:5001
============================================================
✓ MongoDB connected successfully
⚠️  Supabase credentials not provided - using MongoDB only
```

### **Step 3: Start Mobile App** (3 min)

```bash
cd /Users/harsh/Desktop/Veriflow/VeriflowMobile
npm install
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app

---

## **Testing Your Setup**

### **Test 1: Backend Health Check**

Open browser or use curl:
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-30T...",
  "environment": "development"
}
```

### **Test 2: Register a User**

In the mobile app:
1. Tap "Create Account"
2. Fill in:
   - Name: Test Farmer
   - Email: farmer@test.com
   - Password: password123
3. Tap "Register"

Check MongoDB:
```bash
mongosh
use bluecarbon
db.users.find().pretty()
```

You should see your user!

### **Test 3: Submit Field Data**

1. Login with the user you created
2. Tap "Home" → "Submit Field Data"
3. Fill in:
   - Project ID: PROJ-001
   - Tap "Capture GPS Location"
   - Fill in tree measurements:
     - DBH: 25.5
     - Tree Height: 8.2
     - Select a tree species
     - Plot Size: 100
   - Take/select some photos
4. Tap "Submit to IPFS & Blockchain"

Check MongoDB:
```bash
mongosh
use bluecarbon
db.submissions.find().pretty()
```

Your submission should be there!

### **Test 4: Create Tasks**

1. Tap "Home" → "View Tasks"
2. Tap "+ Add Task"
3. Create a task:
   - Title: "Measure new saplings"
   - Description: "Check Plot A"
   - Type: Daily
4. Tap "Add Task"

Check MongoDB:
```bash
mongosh
use bluecarbon
db.tasks.find().pretty()
```

---

## **Available API Endpoints**

### **Authentication**
```bash
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### **Projects**
```bash
GET /api/projects
POST /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
```

### **Field Data**
```bash
GET /api/field-data
POST /api/field-data
GET /api/field-data/:id
```

### **Submissions** (New!)
```bash
POST /api/submissions
GET /api/submissions/my-submissions
GET /api/submissions/:id
GET /api/submissions/admin/all (Admin only)
POST /api/submissions/admin/:id/review (Admin only)
```

### **Tasks** (New!)
```bash
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
GET /api/tasks/stats
```

### **Notifications**
```bash
GET /api/notifications
PUT /api/notifications/:id
POST /api/notifications
```

### **Marketplace**
```bash
GET /api/marketplace
GET /api/marketplace/:id
```

### **Wallet**
```bash
GET /api/wallet
POST /api/wallet/deposit
POST /api/wallet/withdraw
```

---

## **Testing API Endpoints with curl**

### **Register a User**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Farmer",
    "email": "farmer@test.com",
    "password": "password123",
    "role": "farmer"
  }'
```

### **Login**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@test.com",
    "password": "password123"
  }'
```

Save the token from the response!

### **Create a Task** (with auth token)
```bash
curl -X POST http://localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Measure new saplings",
    "description": "Check Plot A for new growth",
    "type": "daily"
  }'
```

### **Get My Tasks**
```bash
curl -X GET http://localhost:5001/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## **Database Collections**

Your MongoDB database (`bluecarbon`) will have these collections:

- `users` - User accounts and profiles
- `projects` - Carbon offset projects
- `fielddata` - Field data entries
- `submissions` - Submission records with admin review
- `tasks` - User tasks and checklists
- `notifications` - User notifications
- `carboncredits` - Carbon credit tokens
- `wallets` - User crypto wallets
- `transactions` - Transaction history

---

## **Viewing Data in MongoDB**

```bash
# Connect to MongoDB
mongosh

# Switch to database
use bluecarbon

# Show all collections
show collections

# View users
db.users.find().pretty()

# View submissions
db.submissions.find().pretty()

# View tasks
db.tasks.find().pretty()

# Count documents
db.users.countDocuments()
db.submissions.countDocuments()
db.tasks.countDocuments()

# Find specific user
db.users.findOne({ email: "farmer@test.com" })

# Find pending submissions
db.submissions.find({ status: "pending" }).pretty()

# Find completed tasks
db.tasks.find({ completed: true }).pretty()

# Delete all data (if you want to start fresh)
db.users.deleteMany({})
db.submissions.deleteMany({})
db.tasks.deleteMany({})
```

---

## **Troubleshooting**

### **MongoDB not running**
```bash
# Start MongoDB
brew services start mongodb-community

# Check if it's running
brew services list | grep mongodb

# Or check with mongosh
mongosh
```

### **Port 5001 already in use**
```bash
# Find what's using the port
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or change the port in backend/.env
PORT=5002
```

### **Backend crashes on startup**

Check for:
1. MongoDB is running (`mongosh` should connect)
2. `.env` file exists in backend folder
3. All dependencies installed (`npm install`)
4. Check logs for specific error

### **Mobile app can't connect to backend**

For iOS Simulator:
- Use `http://localhost:5001/api`

For Android Emulator:
- Use `http://10.0.2.2:5001/api`

For Physical Device:
- Find your computer's IP: `ifconfig | grep inet`
- Use `http://YOUR_IP:5001/api`
- Update in `VeriflowMobile/.env`

---

## **Project Structure**

```
VeriFlow/
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   └── server.ts        # Main server file
│   └── .env                 # Environment variables
│
├── VeriflowMobile/          # React Native mobile app
│   ├── src/
│   │   ├── screens/         # App screens
│   │   ├── components/      # Reusable components
│   │   ├── navigation/      # Navigation setup
│   │   └── context/         # React context (Auth, etc)
│   └── .env                 # Environment variables
│
└── admin/                   # React admin portal
    └── src/
```

---

## **What's Working**

✅ User authentication (register, login)
✅ Field data submission with GPS
✅ Task management (create, update, delete)
✅ Submissions with status tracking
✅ Admin review workflow (backend)
✅ Notifications
✅ Marketplace listing
✅ Wallet management
✅ Portfolio tracking
✅ Interactive map
✅ MongoDB storage

---

## **What Needs Implementation**

⏳ IPFS file upload integration
⏳ Blockchain transaction recording
⏳ Admin portal UI for reviews
⏳ Payment gateway integration
⏳ Real-time notifications
⏳ Offline mode for mobile app

---

## **Development Workflow**

### **Daily Development**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Mobile App
cd VeriflowMobile && npm start

# Terminal 3: MongoDB (if needed)
mongosh
```

### **Before Committing Code**
```bash
# Check TypeScript errors
cd backend && npm run build

# Test backend endpoints
npm test

# Clean MongoDB (optional)
mongosh
use bluecarbon
db.dropDatabase()
```

---

## **Useful MongoDB Commands**

```javascript
// Create admin user
db.users.insertOne({
  email: "admin@veriflow.com",
  name: "Admin User",
  role: "admin",
  password: "$2a$10$..." // Use hashed password
})

// Update submission status
db.submissions.updateOne(
  { submission_id: "SUB-00001" },
  { $set: { status: "approved", admin_feedback: "Looks good!" } }
)

// Find all pending submissions
db.submissions.find({ status: "pending" }).sort({ submitted_at: -1 })

// Get user with tasks
db.users.aggregate([
  { $lookup: {
      from: "tasks",
      localField: "_id",
      foreignField: "userId",
      as: "tasks"
    }
  }
])
```

---

## **Performance Tips**

1. **Indexes** - Already created on frequently queried fields
2. **Connection Pooling** - Mongoose handles this automatically
3. **Pagination** - Add `?limit=10&skip=0` to API calls
4. **Caching** - Consider Redis for frequently accessed data

---

## **Next Steps**

1. ✅ Start MongoDB
2. ✅ Start backend server
3. ✅ Start mobile app
4. ✅ Test user registration
5. ✅ Test field data submission
6. ✅ Test task creation
7. ⏳ Build admin review UI
8. ⏳ Integrate IPFS
9. ⏳ Add blockchain transactions

---

**🎉 Your VeriFlow app is now running with MongoDB!**

Start testing and let me know if you hit any issues!
