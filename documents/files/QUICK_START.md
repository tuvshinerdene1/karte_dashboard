# 🚀 Frontend-Backend Connection Summary

You're all set! Here's everything you need to know to connect your Next.js frontend to your Express backend.

---

## 📦 What's Been Created

### 1. **apiClient.ts** - Main API Service
   - Centralized API client with all endpoints
   - JWT token handling (automatic)
   - Full TypeScript support
   - Ready to use with all your backend routes

### 2. **useApi.ts** - React Hooks
   - `useApi()` - For simple requests
   - `useGetApi()` - For fetching data
   - `useMutationApi()` - For POST/PUT/DELETE
   - Loading and error states included

### 3. **FRONTEND_BACKEND_INTEGRATION.md** - Full Documentation
   - Complete API reference
   - Usage patterns and examples
   - Troubleshooting guide
   - Best practices

### 4. **EXAMPLE_COMPONENTS.ts** - Code Examples
   - 10 real-world component examples
   - Login, forms, lists, real-time updates
   - Copy-paste ready implementations

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install the Files
```bash
# Copy these files to your frontend:
cp apiClient.ts dashboard-frontend/lib/
cp useApi.ts dashboard-frontend/lib/
```

### Step 2: Start Both Servers
```bash
# Terminal 1 - Backend
cd dashboard-backend
npm run dev
# Runs on http://localhost:8080

# Terminal 2 - Frontend  
cd dashboard-frontend
npm run dev
# Runs on http://localhost:3000
```

### Step 3: Use in Your Components
```typescript
import { apiClient } from '@/lib/apiClient';
import { useGetApi } from '@/lib/useApi';

// Simple request
const hospitals = await apiClient.getHospitals();

// In React component with hooks
const { data, loading, error } = useGetApi('/api/hospital');
```

---

## 💡 Common Usage Patterns

### Pattern 1: Fetch Data on Component Mount
```typescript
const { data: hospitals, loading, error } = useGetApi(
  '/api/hospital',
  true // Auto-fetch
);
```

### Pattern 2: Create/Update Data
```typescript
const { loading, mutate } = useMutationApi();

const handleCreate = async () => {
  await mutate(() => 
    apiClient.createHospital({name: 'New Hospital'})
  );
};
```

### Pattern 3: Login
```typescript
const response = await apiClient.login('username', 'password');
// Token automatically stored in sessionStorage
```

### Pattern 4: Protected API Calls
```typescript
// Token is automatically added to all requests
// No need to manually add headers!
const data = await apiClient.getHospitals();
```

---

## 🔧 API Endpoints Reference

### Auth (No token needed)
```
POST   /api/auth/register
POST   /api/auth/login
```

### Hospital
```
GET    /api/hospital
GET    /api/hospital/:id
POST   /api/hospital
PUT    /api/hospital/:id
DELETE /api/hospital/:id
GET    /api/hospital/:id/dashboard
GET    /api/hospital/:id/patients
GET    /api/hospital/:id/staff
POST   /api/hospital/:id/staff
```

### Monitoring (Requires authentication)
```
GET    /api/monitoring
GET    /api/monitoring/:hospitalId
POST   /api/monitoring/:hospitalId/event
GET    /api/monitoring/:hospitalId/metrics
```

### Support
```
GET    /api/support
GET    /api/support/:id
POST   /api/support
PUT    /api/support/:id
PATCH  /api/support/:id (e.g., close ticket)
```

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8080
- [ ] Frontend running on http://localhost:3000
- [ ] apiClient.ts in dashboard-frontend/lib/
- [ ] useApi.ts in dashboard-frontend/lib/
- [ ] .env.local has NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
- [ ] Can see "✅ Database connected" in backend logs
- [ ] Browser DevTools shows successful API calls in Network tab

---

## 🎓 Next Steps

1. **Update Your Components**
   - Replace mock data with real API calls
   - Use useGetApi for data loading
   - Use useMutationApi for forms

2. **Add Error Handling**
   - Show error messages to users
   - Implement retry logic if needed
   - Log errors for debugging

3. **Implement Real-time Features**
   - Use WebSocket for live updates
   - Check useHospitalSocket hook
   - Join Socket.IO rooms for hospital-specific data

4. **Type Safety**
   - Define interfaces for your API responses
   - Update apiClient.ts with proper types
   - Use TypeScript for better IDE support

5. **Testing**
   - Test each endpoint with curl/Postman first
   - Then implement in components
   - Use DevTools Network tab to verify requests

---

## 🐛 Troubleshooting

### "Cannot find module '@/lib/apiClient'"
```bash
# Make sure you copied the files to the right location
ls dashboard-frontend/lib/apiClient.ts
```

### "Backend connection refused"
```bash
# Check if backend is running
curl http://localhost:8080/api/hospital

# If not running, start it
cd dashboard-backend && npm run dev
```

### "Token invalid" errors
```typescript
// Clear old token and re-login
sessionStorage.removeItem('auth_session');
// Then call apiClient.login() again
```

### "CORS error"
- Backend already has CORS enabled
- Make sure NEXT_PUBLIC_BACKEND_URL is correct
- Check browser console for exact error

---

## 📚 File Organization

```
dashboard-frontend/
├── lib/
│   ├── apiClient.ts     ← NEW: Main API client
│   ├── useApi.ts        ← NEW: React hooks
│   ├── auth.ts          ← Existing: Authentication
│   ├── socket.ts        ← Existing: WebSocket
│   └── ...
├── components/
│   ├── Auth/
│   ├── Main_Interface/
│   └── ...
├── app/
│   ├── dashboard/
│   ├── admin/
│   └── ...
└── ...
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| **apiClient.ts** | Main API service class |
| **useApi.ts** | React hooks for API calls |
| **FRONTEND_BACKEND_INTEGRATION.md** | Complete guide (you have this) |
| **EXAMPLE_COMPONENTS.ts** | Code examples and patterns |

---

## 🎉 You're Ready!

Your frontend and backend are now connected and ready to use. Start building! 

### First Task:
1. Copy the files to lib/
2. Update one component to use apiClient
3. Test the API call in browser
4. Expand from there

### Example: Update Your Dashboard
```typescript
import { useGetApi } from '@/lib/useApi';

export function Dashboard() {
  // Replace hardcoded data with this:
  const { data: hospitalData, loading, error } = useGetApi(
    '/api/hospital/your-hospital-id/dashboard'
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard</div>;

  return (
    // Use hospital Data here
  );
}
```

---

## 💬 Need Help?

1. Check **FRONTEND_BACKEND_INTEGRATION.md** for detailed docs
2. Look at **EXAMPLE_COMPONENTS.ts** for code patterns
3. Review backend logs: `npm run dev` shows all API requests
4. Check browser DevTools Network tab to debug requests

---

**Happy coding! 🚀**
