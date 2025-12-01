# VeriFlow Test Credentials

## Mobile App Test Users

All test users have the password: **password123**

### Farmer Account
- **Email:** farmer@test.com
- **Password:** password123
- **Role:** Farmer
- **Dashboard:** Farmer Dashboard (shows fields, projects, submissions)

### Marketplace Account
- **Email:** marketplace@test.com
- **Password:** password123
- **Role:** Marketplace Buyer
- **Dashboard:** Marketplace Dashboard (shows marketplace listings, buying options)

### Admin Account
- **Email:** admin@test.com
- **Password:** password123
- **Role:** Admin/Verifier
- **Dashboard:** Admin Dashboard (shows verification tasks, user management)

## Important Notes

1. **Clear App Cache**: If you're experiencing login issues where all users redirect to farmer dashboard:
   - Close the mobile app completely
   - Restart the Expo development server
   - Reopen the app
   - Log out if currently logged in
   - Log in with the appropriate test account

2. **Backend API**: Running on http://localhost:5001
3. **Mobile App**: Running on Expo (default port 8081)

## Testing Login Flow

1. Open the VeriFlow mobile app
2. If logged in, log out first
3. Login with one of the test accounts above
4. Verify you're redirected to the correct dashboard based on the role:
   - **farmer@test.com** → Farmer Dashboard
   - **marketplace@test.com** → Marketplace Dashboard
   - **admin@test.com** → Admin Dashboard

## Database Management Scripts

Located in `backend/scripts/`:

- `setUserRole.js` - Update a specific user's role
- `createTestUsers.js` - Create/update test users
- `testLoginAPI.js` - Test login API endpoints
- `updateUserRoles.js` - Bulk update user roles

### Usage Examples

```bash
# List all users
node scripts/setUserRole.js

# Change a user's role
node scripts/setUserRole.js user@example.com marketplace

# Create/reset test users
node scripts/createTestUsers.js

# Test login API
node scripts/testLoginAPI.js
```
