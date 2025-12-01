# 🎯 START HERE - VeriFlow Quick Launch

## **Your Current Status:**

✅ MongoDB is running (v8.2.2)
✅ Backend configured with MongoDB
✅ Environment variables set
✅ All mobile screens created
✅ Authentication middleware fixed

---

## **🚀 Launch Your App (3 Steps)**

### **Step 1: Start Backend** (Terminal 1)

```bash
cd /Users/harsh/Desktop/Veriflow/backend
npm run dev
```

**Expected Output:**
```
============================================================
Blue Carbon Registry Backend
============================================================
Environment: development
Server running on port 5001
✓ MongoDB connected successfully
```

**If you see this, backend is ready! ✅**

---

### **Step 2: Start Mobile App** (Terminal 2)

```bash
cd /Users/harsh/Desktop/Veriflow/VeriflowMobile
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator

**The Expo DevTools will open in your browser**

---

### **Step 3: Test the App**

#### **A. Register a New User**
1. Open the app (simulator/emulator should auto-launch)
2. Tap "Create Account"
3. Fill in:
   - Name: `Test Farmer`
   - Email: `farmer@test.com`
   - Password: `password123`
4. Tap "Register"

✅ **You should be logged in and see the Home screen!**

#### **B. Submit Field Data**
1. From Home, tap "Submit Field Data"
2. Fill in:
   - Project ID: `PROJ-001`
   - Tap "Capture GPS Location" (click "Allow" for permissions)
   - DBH: `25.5`
   - Tree Height: `8.2`
   - Tap "Select tree species" → Choose any species
   - Plot Size: `100`
3. Tap "Submit to IPFS & Blockchain"

✅ **You should see a success message!**

#### **C. Create a Task**
1. From Home, tap "View Tasks"
2. Tap "+ Add Task" (bottom right)
3. Fill in:
   - Title: `Measure new saplings`
   - Description: `Check Plot A`
   - Type: Daily
4. Tap "Add Task"

✅ **Your task should appear in the list!**

#### **D. View Submissions**
1. From Home, tap "My Submissions"
2. You should see your field data submission with status "Pending"

✅ **Submissions screen working!**

---

## **📊 Verify Data in MongoDB**

Open a new terminal:

```bash
mongosh
use bluecarbon

# See your user
db.users.find().pretty()

# See your submission
db.submissions.find().pretty()

# See your task
db.tasks.find().pretty()
```

---

## **🎨 Available Screens in Mobile App**

### **Farmer/Field Operator Role:**
- ✅ Home
- ✅ Projects
- ✅ Field Data Collection (with DBH, GPS, photos, documents)
- ✅ Submissions History
- ✅ Tasks/Checklists
- ✅ Interactive Map
- ✅ Notifications
- ✅ Profile

### **Marketplace User Role:**
- ✅ Marketplace (browse carbon credits)
- ✅ Portfolio Dashboard (with graphs)
- ✅ Wallet (token management)
- ✅ Notifications
- ✅ Profile

---

## **🔧 Troubleshooting**

### **Backend won't start?**

**Check MongoDB:**
```bash
mongosh
```
If this fails:
```bash
brew services start mongodb-community
```

**Check port 5001:**
```bash
lsof -i :5001
```
If something is using it, kill it or change PORT in `backend/.env`

---

### **Mobile app can't connect to backend?**

**iOS Simulator:** Use `http://localhost:5001/api` (already set)

**Android Emulator:**
```bash
# Update VeriflowMobile/.env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5001/api
```

**Physical Device:**
```bash
# Find your computer's IP
ifconfig | grep inet

# Update VeriflowMobile/.env
EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:5001/api
```

Then restart Expo (`r` in terminal or shake device)

---

## **📱 Testing Different User Roles**

### **Test as Farmer:**
1. Register with any email
2. You'll see Farmer screens (Home, Projects, Map, Profile tabs)

### **Test as Marketplace User:**
Create a user via MongoDB:
```bash
mongosh
use bluecarbon

db.users.insertOne({
  email: "buyer@test.com",
  name: "Test Buyer",
  role: "marketplace",
  password: "$2a$10$YourHashedPasswordHere",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Then login with `buyer@test.com` to see:
- Marketplace
- Portfolio
- Wallet
- Profile tabs

---

## **🎯 What's Next?**

Once everything is working:

1. **Admin Portal** - Build the review interface for admins
2. **IPFS Integration** - Actually upload files to IPFS
3. **Blockchain** - Record submissions on blockchain
4. **Real-time Notifications** - WebSocket or push notifications
5. **Payment Integration** - For marketplace purchases

---

## **📚 Documentation Files**

- `MONGODB_SETUP.md` - Complete MongoDB guide
- `SUPABASE_SETUP_GUIDE.md` - If you want to switch to Supabase later
- `QUICK_START.md` - Quick reference

---

## **🆘 Need Help?**

1. Check backend terminal for errors
2. Check Expo terminal for errors
3. Check MongoDB connection: `mongosh`
4. Review logs in app (shake device → Show logs)

---

## **✅ Success Checklist**

- [ ] Backend starts without errors
- [ ] Mobile app opens in simulator
- [ ] Can register a new user
- [ ] Can login with the user
- [ ] Can submit field data
- [ ] Can create tasks
- [ ] Can view submissions
- [ ] Data appears in MongoDB

---

**🎉 You're ready to go! Start with Step 1 above.**

Any issues? Check the troubleshooting section or review the error messages carefully.
