# Frontend-Backend Integration Guide

## Quick Start (5 minutes)

### 1. **Start the Backend**
```bash
cd dashboard-backend
npm install
npm run dev
# Server runs on http://localhost:8080
```

### 2. **Start the Frontend**
```bash
cd dashboard-frontend
npm install
npm run dev
# Client runs on http://localhost:3000
```

### 3. **Check API Connection**
- Backend will log: `🚀 Server + Sockets running on port 8080`
- Frontend will connect automatically to `http://localhost:8080`

---

## API Structure Overview

### Base URL
```
http://localhost:8080
```

### Authentication
- All requests (except `/api/auth/*`) require JWT token in header:
```
Authorization: Bearer <token>
```

### Available Endpoints

#### Auth Endpoints (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Hospital Endpoints
- `GET /api/hospital` - Get all hospitals
- `GET /api/hospital/:id` - Get hospital details
- `POST /api/hospital` - Create hospital
- `PUT /api/hospital/:id` - Update hospital
- `DELETE /api/hospital/:id` - Delete hospital
- `GET /api/hospital/:id/dashboard` - Get dashboard data
- `GET /api/hospital/:id/patients` - Get hospital patients
- `GET /api/hospital/:id/staff` - Get hospital staff
- `POST /api/hospital/:id/staff` - Add staff member

#### Monitoring Endpoints (Protected)
- `GET /api/monitoring` - Get all monitoring data
- `GET /api/monitoring/:hospitalId` - Get hospital monitoring
- `POST /api/monitoring/:hospitalId/event` - Send monitoring event
- `GET /api/monitoring/:hospitalId/metrics` - Get metrics

#### Support Endpoints
- `GET /api/support` - Get all support tickets
- `GET /api/support/:id` - Get ticket details
- `POST /api/support` - Create support ticket
- `PUT /api/support/:id` - Update ticket
- `PATCH /api/support/:id` - Partial update (e.g., close ticket)

---

## Using the API Client

### Option 1: Using the API Client Class (Recommended)

#### Basic Usage
```typescript
import { apiClient } from '@/lib/apiClient';

// Login
const response = await apiClient.login('username', 'password');
console.log(response.token); // JWT token

// Get hospitals
const hospitals = await apiClient.getHospitals();

// Get hospital details
const hospital = await apiClient.getHospital('hospital-id');

// Create support ticket
const ticket = await apiClient.createSupportTicket({
  title: 'Issue title',
  description: 'Issue description',
  priority: 'high'
});
```

#### Custom Requests
```typescript
// For endpoints not in the client
const result = await apiClient.get('/api/custom/endpoint');
const created = await apiClient.post('/api/custom/endpoint', { /* data */ });
const updated = await apiClient.put('/api/custom/id', { /* data */ });
const deleted = await apiClient.delete('/api/custom/id');
```

### Option 2: Using Hooks (In React Components)

#### useApi - For simple requests
```typescript
import { useApi } from '@/lib/useApi';

export function MyComponent() {
  const { data, loading, error, execute } = useApi();

  const handleLogin = async () => {
    const result = await execute(() => 
      apiClient.login('user', 'pass')
    );
    if (result) {
      console.log('Login successful:', result);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

#### useGetApi - For fetching data on mount
```typescript
import { useGetApi } from '@/lib/useApi';

export function HospitalList() {
  const { data, loading, error, refetch } = useGetApi(
    '/api/hospital',
    true // autoFetch on mount
  );

  return (
    <div>
      {loading && <p>Loading hospitals...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <ul>
          {data.map((hospital: any) => (
            <li key={hospital.id}>{hospital.name}</li>
          ))}
        </ul>
      )}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

#### useMutationApi - For POST/PUT/DELETE operations
```typescript
import { useMutationApi } from '@/lib/useApi';

export function CreateHospital() {
  const { loading, error, mutate } = useMutationApi();

  const handleCreate = async () => {
    const result = await mutate(() =>
      apiClient.createHospital({
        name: 'New Hospital',
        address: '123 Main St'
      })
    );
    if (result) {
      console.log('Hospital created:', result);
    }
  };

  return (
    <div>
      {loading && <p>Creating...</p>}
      {error && <p>Error: {error.message}</p>}
      <button onClick={handleCreate}>Create Hospital</button>
    </div>
  );
}
```

---

## WebSocket Integration

### Connecting to Hospital Updates
```typescript
import { useHospitalSocket } from '@/lib/useHospitalSocket';

export function DashboardWithRealtime() {
  const { events } = useHospitalSocket('hospital-id');

  useEffect(() => {
    if (events) {
      console.log('Hospital update:', events);
      // Update your dashboard
    }
  }, [events]);

  return <div>Real-time dashboard</div>;
}
```

---

## Error Handling

### Try-Catch Pattern
```typescript
try {
  const hospitals = await apiClient.getHospitals();
  console.log(hospitals);
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    // Handle error appropriately
  }
}
```

### Hook Error State
```typescript
const { data, error } = useGetApi('/api/hospital');

if (error) {
  return <div className="error">Failed to load: {error.message}</div>;
}
```

---

## Authentication Flow

### 1. Login and Store Token
```typescript
// In your login component
const handleLogin = async () => {
  const response = await apiClient.login(username, password);
  // Token is automatically stored in sessionStorage
};
```

### 2. Token Storage (lib/auth.ts)
```typescript
export function storeSession(token: string, user: User) {
  sessionStorage.setItem('auth_session', JSON.stringify({ token, user }));
}

export function readStoredSession() {
  const session = sessionStorage.getItem('auth_session');
  return session ? JSON.parse(session) : null;
}

export function clearSession() {
  sessionStorage.removeItem('auth_session');
}
```

### 3. Protected Routes
```typescript
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="hospital_director">
      <Dashboard />
    </ProtectedRoute>
  );
}
```

---

## Common Patterns

### Pattern 1: Load and Display List
```typescript
export function PatientList() {
  const { data: patients, loading, error, refetch } = useGetApi(
    '/api/hospital/123/patients'
  );

  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorMessage error={error} />}
      {patients && patients.length === 0 && <EmptyState />}
      {patients && (
        <ul>
          {patients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </ul>
      )}
      <RefreshButton onClick={refetch} />
    </div>
  );
}
```

### Pattern 2: Create with Form
```typescript
export function CreateStaffForm() {
  const { loading, error, mutate } = useMutationApi();
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await mutate(() =>
      apiClient.addStaffToHospital('hospital-id', formData)
    );
    if (result) {
      toast.success('Staff member added');
      setFormData({});
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Staff'}
      </button>
      {error && <ErrorMessage error={error} />}
    </form>
  );
}
```

### Pattern 3: Conditional Rendering Based on Role
```typescript
export function AdminPanel() {
  const session = readStoredSession();
  const isAdmin = session?.user.role === 'admin';

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <AdminDashboard />;
}
```

---

## Environment Variables

### Frontend (.env.local)
```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080

# Optional: Socket.IO configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

### Backend (.env)
```env
# Server configuration
NODE_ENV=development
PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=karte_dashboard

# JWT
JWT_SECRET=your_secret_key_here

# CORS (optional)
CORS_ORIGIN=http://localhost:3000
```

---

## Troubleshooting

### Issue: "Cannot find module" errors
```bash
# Solution: Install dependencies
npm install
```

### Issue: Backend connection refused
```bash
# Check if backend is running on port 8080
lsof -i :8080

# Kill process if needed
kill -9 <PID>

# Restart backend
npm run dev
```

### Issue: CORS errors
- Ensure backend has CORS enabled (it does in server.js)
- Check `NEXT_PUBLIC_BACKEND_URL` matches backend URL
- Clear browser cache and local storage

### Issue: Token authentication failing
```typescript
// Clear session and re-login
import { clearSession } from '@/lib/auth';
clearSession();
// Redirect to login page
```

### Issue: Real-time updates not working
- Ensure Socket.IO is properly configured
- Check WebSocket connection in browser DevTools
- Verify socket events match backend implementation

---

## Testing API Endpoints

### Using cURL
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Get hospitals (with token)
curl -X GET http://localhost:8080/api/hospital \
  -H "Authorization: Bearer <token>"
```

### Using Postman
1. Import collection from backend documentation
2. Set `{{baseUrl}}` to `http://localhost:8080`
3. Login and copy token
4. Set `Authorization: Bearer {{token}}` in requests

---

## Best Practices

1. **Always use hooks for components** - Don't call apiClient directly in render
2. **Handle loading states** - Show spinners for better UX
3. **Validate responses** - Check data structure before using
4. **Error boundaries** - Wrap critical sections
5. **Cache when possible** - Store data locally if it doesn't change often
6. **Type your API responses** - Define interfaces for type safety
7. **Test endpoints** - Use curl/Postman before implementing in UI

---

## Need Help?

- Check backend logs for API errors: `npm run dev`
- Check frontend console (DevTools) for connection errors
- Verify network requests in DevTools Network tab
- Check database connection: Backend logs will show "✅ Database connected"

