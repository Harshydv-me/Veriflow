# Testing Login Flow - Complete Guide

## Issue Description
Users were experiencing an issue where logging in with marketplace or admin accounts would incorrectly route to the Farmer Dashboard instead of their respective dashboards.

## Root Cause
The problem was caused by cached user data in AsyncStorage that wasn't being cleared between different user logins.

## Fixes Applied

### 1. Updated Login Function (AuthContext.tsx)
- Now clears any existing session BEFORE performing new login
- Prevents old user data from interfering with new login
- Added comprehensive debug logging

### 2. Added Debug Logging
- Login process logs show exactly what role is received from API
- Navigation logs show which navigator is being rendered
- Helps troubleshoot any future issues

### 3. Enhanced Logout Function
- More thorough cleanup of AsyncStorage
- Ensures complete session termination

## Test Accounts

All test accounts use password: **password123**

| Email | Password | Role | Expected Dashboard |
|-------|----------|------|-------------------|
| farmer@test.com | password123 | farmer | Farmer Dashboard |
| marketplace@test.com | password123 | marketplace | Marketplace Dashboard |
| admin@test.com | password123 | admin | Admin Dashboard |

## Testing Steps

### Complete Test Procedure:

1. **Start Fresh**
   - Close the mobile app completely (swipe away from app switcher)
   - If the app is showing a cached user, see "Force Logout" below

2. **Test Farmer Login**
   ```
   Email: farmer@test.com
   Password: password123
   Expected: Farmer Dashboard with tabs (Dashboard, Projects, Profile)
   ```

3. **Test Marketplace Login**
   - If already logged in, logout first
   - Close and reopen app
   ```
   Email: marketplace@test.com
   Password: password123
   Expected: Marketplace Dashboard with tabs (Dashboard, Marketplace, Wallet, Profile)
   ```

4. **Test Admin Login**
   - If already logged in, logout first
   - Close and reopen app
   ```
   Email: admin@test.com
   Password: password123
   Expected: Admin Dashboard with tabs (Dashboard, Profile)
   ```

### Force Logout (if needed):
If you're stuck on a dashboard and can't find logout:
1. Go to Profile tab (bottom navigation)
2. Look for Settings or Logout option
3. Alternatively, close app and manually clear cache (see below)

### Manual Cache Clear (Emergency):
If issues persist:
1. Close the app
2. Clear app data:
   - **iOS Simulator**: Device → Erase All Content and Settings
   - **Android Emulator**: Settings → Apps → VeriFlow → Clear Data
   - **Physical Device**: Uninstall and reinstall the app
3. Restart Expo server:
   ```bash
   cd /Users/harsh/Desktop/Veriflow/VeriflowMobile
   npm start
   ```

## Debugging

### View Console Logs:
The app now outputs detailed logs during login:

**Login Debug Logs:**
```
=== LOGIN DEBUG ===
Clearing existing session...
Email: marketplace@test.com
User from API: {
  "id": "...",
  "email": "marketplace@test.com",
  "name": "Test Marketplace",
  "role": "marketplace"
}
Role received: marketplace
User state set to: ...
==================
```

**Navigation Debug Logs:**
```
=== NAVIGATION DEBUG ===
User: {
  "id": "...",
  "email": "marketplace@test.com",
  "role": "marketplace"
}
User Role: marketplace
Routing based on role: marketplace
→ Showing MarketplaceNavigator
=======================
```

### Check Backend is Running:
```bash
# Should show process on port 5001
lsof -ti:5001

# Test login API directly
node backend/scripts/testLoginAPI.js
```

### Verify Database:
```bash
# List all users and their roles
node backend/scripts/setUserRole.js

# Update a user's role
node backend/scripts/setUserRole.js user@example.com marketplace

# Reset test users
node backend/scripts/createTestUsers.js
```

## Dashboard Identification

### Farmer Dashboard Features:
- Green primary color theme
- Tabs: Dashboard, Projects, Profile
- Shows field data, submissions, and projects
- "New Field Data" button

### Marketplace Dashboard Features:
- Cyan/Blue primary color theme
- Tabs: Dashboard, Marketplace, Wallet, Profile
- Shows available carbon credits
- Buying and trading features

### Admin Dashboard Features:
- Blue primary color theme
- Tabs: Dashboard, Profile
- Shield icon for dashboard
- Verification and approval features
- User management

## Common Issues

### Issue: Still seeing wrong dashboard
**Solution:**
1. Completely close and reopen the app
2. Make sure you're logging out before switching users
3. Check console logs to verify correct role is being received
4. Clear app cache if needed

### Issue: Login button not responding
**Solution:**
1. Check if backend server is running (port 5001)
2. Check console for errors
3. Verify API URL in .env file

### Issue: "Invalid credentials" error
**Solution:**
1. Verify you're using password: `password123`
2. Check email is correct (lowercase, no spaces)
3. Run `node backend/scripts/createTestUsers.js` to reset test accounts

## Success Criteria

✓ Farmer account opens Farmer Dashboard (green theme)
✓ Marketplace account opens Marketplace Dashboard (cyan theme)
✓ Admin account opens Admin Dashboard (blue theme)
✓ Logging out and logging in with different account works correctly
✓ Console logs show correct role being received and routed

## Files Modified

1. `VeriflowMobile/src/context/AuthContext.tsx`
   - Enhanced login function to clear cache first
   - Added debug logging
   - Improved logout function

2. `VeriflowMobile/src/navigation/RootNavigator.tsx`
   - Added debug logging to track navigation routing

3. `backend/scripts/`
   - `createTestUsers.js` - Creates/resets test accounts
   - `setUserRole.js` - Manages user roles
   - `testLoginAPI.js` - Tests login API

## Need Help?

If you're still experiencing issues:
1. Check the console logs (both Expo and backend)
2. Verify test accounts exist and have correct roles
3. Ensure backend is running and connected to MongoDB
4. Try manual cache clear procedure
5. Restart both backend and mobile app servers
