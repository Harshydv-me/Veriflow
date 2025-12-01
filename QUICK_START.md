# 🚀 VeriFlow Quick Start Guide

## **5-Minute Setup**

### **Step 1: Supabase Setup** (2 min)
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to SQL Editor → Run `supabase-schema.sql`
3. Go to Settings → API → Copy credentials:
   - Project URL
   - anon key
   - service_role key

### **Step 2: Backend Setup** (1 min)
```bash
cd backend
cp .env.example .env
# Add your Supabase credentials to .env
npm install
npm run dev
```

### **Step 3: Mobile App Setup** (2 min)
```bash
cd VeriflowMobile
cp .env.example .env
# Add your Supabase credentials to .env
npm install
npm start
```

---

## **Environment Variables**

### **Backend `.env`**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
JWT_SECRET=your_secret_key
PORT=5000
```

### **Mobile `.env`**
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

---

## **Test Your Setup**

### **1. Register a User**
Mobile App → Register → Create account

### **2. Submit Field Data**
Home → Submit Field Data → Fill form → Submit

### **3. Check Supabase**
Supabase Dashboard → Table Editor → submissions table

---

## **File Locations**

- Schema: `/supabase-schema.sql`
- Setup Guide: `/SUPABASE_SETUP_GUIDE.md`
- Backend Config: `/backend/src/config/supabase.ts`
- Mobile Config: `/VeriflowMobile/src/config/supabase.ts`

---

## **Common Commands**

```bash
# Start Backend
cd backend && npm run dev

# Start Mobile App
cd VeriflowMobile && npm start

# Start Admin Portal
cd admin && npm run dev

# View Logs
# Backend: Check terminal
# Mobile: Shake device → Debug menu → Show logs
```

---

## **Ports**

- Backend API: `http://localhost:5000`
- Admin Portal: `http://localhost:5173`
- Mobile App: Expo DevTools

---

## **Need Help?**

Read full guide: `SUPABASE_SETUP_GUIDE.md`
