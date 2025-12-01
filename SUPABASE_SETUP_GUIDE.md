# 🚀 VeriFlow Supabase Integration Guide

Complete guide to set up VeriFlow with Supabase backend.

---

## **Prerequisites**

- Node.js 16+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- A Supabase account (free tier works)

---

## **Part 1: Supabase Project Setup**

### **1.1 Create Supabase Project**

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: VeriFlow or Blue Carbon Registry
   - **Database Password**: (Save this securely!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait ~2 minutes

### **1.2 Run Database Schema**

1. Once project is created, go to **SQL Editor** in left sidebar
2. Click **"New Query"**
3. Copy entire contents of `supabase-schema.sql` file
4. Paste into the SQL editor
5. Click **"Run"** button
6. Verify tables were created:
   - Go to **Table Editor** in sidebar
   - You should see: users, projects, submissions, tasks, notifications, etc.

### **1.3 Get Your Credentials**

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys") ⚠️ Keep this secret!

---

## **Part 2: Backend Setup**

### **2.1 Configure Environment Variables**

1. Navigate to backend folder:
   ```bash
   cd /Users/harsh/Desktop/Veriflow/backend
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file and add your Supabase credentials:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   API_URL=http://localhost:5000

   # Supabase (PostgreSQL)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d

   # CORS
   CORS_ORIGIN=http://localhost:3000,http://localhost:19006

   # Other settings as needed...
   ```

### **2.2 Install Dependencies**

```bash
cd /Users/harsh/Desktop/Veriflow/backend
npm install
```

### **2.3 Update Controllers to Use Supabase**

The controllers are ready but need minor adjustments. Here's an example for tasks:

**File: `backend/src/controllers/task.controller.ts`**

Replace MongoDB imports with Supabase:

```typescript
import supabase from '../config/supabase';

// Get user tasks
export const getUserTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, completed } = req.query;

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (completed !== undefined) {
      query = query.eq('completed', completed === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
```

### **2.4 Start Backend Server**

```bash
npm run dev
```

Server should start on `http://localhost:5000`

---

## **Part 3: Mobile App Setup**

### **3.1 Configure Environment Variables**

1. Navigate to mobile app folder:
   ```bash
   cd /Users/harsh/Desktop/Veriflow/VeriflowMobile
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file:
   ```env
   # Supabase
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # Backend API (if using Express backend)
   EXPO_PUBLIC_API_URL=http://localhost:5000/api

   # Blockchain (optional for now)
   ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
   CHAIN_ID=11155111
   ```

### **3.2 Install Dependencies**

```bash
npm install
```

### **3.3 Update AuthContext to Use Supabase**

**File: `src/context/AuthContext.tsx`**

```typescript
import React, { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile from users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
          });
        }
      }
    } catch (error) {
      console.error('Check user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile in users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user?.id,
          email,
          name,
          role,
        },
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    setUser({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    });
  };

  const login = async (email: string, password: string) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id)
      .single();

    if (profileError) throw profileError;

    setUser({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### **3.4 Start Mobile App**

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

---

## **Part 4: Testing the Integration**

### **4.1 Test User Registration**

1. Open the mobile app
2. Go to Register screen
3. Create a new user:
   - Name: Test Farmer
   - Email: farmer@test.com
   - Password: password123
4. Check Supabase:
   - Go to **Authentication** > **Users** in Supabase dashboard
   - Your user should appear
   - Go to **Table Editor** > **users** table
   - User profile should be there

### **4.2 Test Submissions**

1. Login as the farmer
2. Navigate to Field Data screen
3. Fill in required fields:
   - Project ID
   - GPS location (click "Capture GPS Location")
   - Tree measurements (DBH, height, species, plot size)
   - Take/upload some photos
4. Submit
5. Check Supabase:
   - Go to **Table Editor** > **submissions**
   - Your submission should appear with status "pending"

### **4.3 Test Tasks**

1. Navigate to Tasks screen
2. Click "+ Add Task"
3. Create a task
4. Mark it as complete
5. Check Supabase:
   - Go to **Table Editor** > **tasks**
   - Task should be there with completed = true

---

## **Part 5: Admin Portal Setup**

### **5.1 Configure Admin Portal**

```bash
cd /Users/harsh/Desktop/Veriflow/admin
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **5.2 Install and Run**

```bash
npm install
npm run dev
```

Access at: `http://localhost:5173`

---

## **Part 6: Architecture Overview**

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                     │
│  - React Native                                          │
│  - Supabase Client (Direct DB access for reads)        │
│  - API Client (For complex operations)                  │
└───────────────┬─────────────────────────────────────────┘
                │
                ├──► Supabase (PostgreSQL + Auth)
                │    - Direct queries for simple reads
                │    - Real-time subscriptions
                │    - Row Level Security (RLS)
                │
                └──► Express Backend (Node.js)
                     - Complex business logic
                     - IPFS uploads
                     - Blockchain transactions
                     - Admin operations
                     └──► Supabase (Service Role)
                          - Full database access
                          - Bypasses RLS for admin ops
```

---

## **Part 7: Two Integration Approaches**

### **Approach 1: Hybrid (Recommended)**

- **Mobile App** → Direct Supabase for simple CRUD
- **Mobile App** → Backend API for complex operations (IPFS, blockchain)
- **Backend** → Supabase with service role key

**Pros:**
- Faster reads (no backend hop)
- Real-time updates via Supabase subscriptions
- Offline support
- Backend handles heavy lifting

### **Approach 2: Backend-Only**

- **Mobile App** → Backend API exclusively
- **Backend** → Supabase

**Pros:**
- Centralized business logic
- Easier to maintain
- More secure (no direct DB access from client)

---

## **Part 8: Next Steps**

1. ✅ Set up Supabase project
2. ✅ Run schema SQL
3. ✅ Configure environment variables
4. ✅ Update AuthContext
5. ⏳ Update all screens to use Supabase:
   - SubmissionsScreen
   - TasksScreen
   - NotificationsScreen
   - PortfolioScreen
   - WalletScreen
6. ⏳ Implement IPFS integration
7. ⏳ Implement blockchain integration
8. ⏳ Build admin review interface
9. ⏳ Deploy to production

---

## **Troubleshooting**

### **Issue: "Missing Supabase credentials"**
- Check `.env` file exists
- Verify credentials are correct
- Restart expo (`r` in terminal)

### **Issue: "Row Level Security policy violation"**
- Check user is authenticated
- Verify RLS policies in Supabase
- Use service role key in backend

### **Issue: "Cannot connect to Supabase"**
- Check internet connection
- Verify Supabase URL is correct
- Check Supabase project is not paused

---

## **Resources**

- Supabase Docs: https://supabase.com/docs
- Supabase React Native: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
- Expo Docs: https://docs.expo.dev

---

## **Support**

For issues or questions:
1. Check Supabase dashboard logs
2. Check mobile app console logs
3. Check backend server logs
4. Review RLS policies in Supabase

---

**🎉 You're all set! Your VeriFlow app is now powered by Supabase!**
