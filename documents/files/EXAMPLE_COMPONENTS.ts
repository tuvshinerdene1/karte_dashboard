/**
 * EXAMPLE COMPONENTS FOR API INTEGRATION
 * Copy and modify these examples for your own components
 */

// ============================================
// Example 1: Login Component
// ============================================
/*
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { storeSession } from '@/lib/auth';

export function LoginExample() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(username, password);
      
      // Store the session
      storeSession(response.token, response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
*/

// ============================================
// Example 2: Hospital List with Hooks
// ============================================
/*
import { useGetApi } from '@/lib/useApi';

export function HospitalListExample() {
  const { data: hospitals, loading, error, refetch } = useGetApi<any[]>(
    '/api/hospital',
    true // Auto-fetch on component mount
  );

  if (loading) return <div>Loading hospitals...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!hospitals || hospitals.length === 0) return <div>No hospitals found</div>;

  return (
    <div>
      <h2>Hospitals</h2>
      <ul>
        {hospitals.map((hospital) => (
          <li key={hospital.id}>
            <h3>{hospital.name}</h3>
            <p>{hospital.address}</p>
          </li>
        ))}
      </ul>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
*/

// ============================================
// Example 3: Create Hospital with Form
// ============================================
/*
import { useState } from 'react';
import { useMutationApi } from '@/lib/useApi';
import { apiClient } from '@/lib/apiClient';

export function CreateHospitalExample() {
  const { loading, error, mutate } = useMutationApi();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await mutate(() =>
      apiClient.createHospital(formData)
    );

    if (result) {
      alert('Hospital created successfully!');
      setFormData({ name: '', address: '', phone: '' });
      // Optionally refresh list here
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Hospital Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label>Phone:</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>
      
      {error && <div className="error">{error.message}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Hospital'}
      </button>
    </form>
  );
}
*/

// ============================================
// Example 4: Hospital Details View
// ============================================
/*
import { useGetApi } from '@/lib/useApi';
import { useParams } from 'next/navigation';

export function HospitalDetailsExample() {
  const params = useParams();
  const hospitalId = params.id as string;

  const { data: hospital, loading, error } = useGetApi(
    `/api/hospital/${hospitalId}`,
    true
  );

  if (loading) return <div>Loading hospital details...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!hospital) return <div>Hospital not found</div>;

  return (
    <div>
      <h1>{hospital.name}</h1>
      <p>Address: {hospital.address}</p>
      <p>Phone: {hospital.phone}</p>
      <p>Established: {new Date(hospital.established_date).toLocaleDateString()}</p>
      
      <section>
        <h2>Statistics</h2>
        <div>
          <span>Total Staff: {hospital.total_staff || 0}</span>
          <span>Total Beds: {hospital.total_beds || 0}</span>
          <span>Active Patients: {hospital.active_patients || 0}</span>
        </div>
      </section>
    </div>
  );
}
*/

// ============================================
// Example 5: Hospital Staff Management
// ============================================
/*
import { useState } from 'react';
import { useGetApi, useMutationApi } from '@/lib/useApi';
import { apiClient } from '@/lib/apiClient';
import { useParams } from 'next/navigation';

export function HospitalStaffExample() {
  const params = useParams();
  const hospitalId = params.id as string;
  
  const { data: staff, loading: loadingStaff, refetch } = useGetApi<any[]>(
    `/api/hospital/${hospitalId}/staff`,
    true
  );
  
  const { loading: loadingAdd, mutate } = useMutationApi();
  const [newStaffName, setNewStaffName] = useState('');

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await mutate(() =>
      apiClient.addStaffToHospital(hospitalId, {
        name: newStaffName,
        hospital_id: hospitalId,
      })
    );

    if (result) {
      setNewStaffName('');
      await refetch(); // Refresh the staff list
    }
  };

  if (loadingStaff) return <div>Loading staff...</div>;

  return (
    <div>
      <h2>Staff Management</h2>
      
      <form onSubmit={handleAddStaff}>
        <input
          type="text"
          placeholder="Staff member name"
          value={newStaffName}
          onChange={(e) => setNewStaffName(e.target.value)}
          disabled={loadingAdd}
          required
        />
        <button type="submit" disabled={loadingAdd}>
          {loadingAdd ? 'Adding...' : 'Add Staff'}
        </button>
      </form>

      <ul>
        {staff?.map((member) => (
          <li key={member.id}>
            {member.name}
            <span>{member.position}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
*/

// ============================================
// Example 6: Real-time Monitoring with WebSocket
// ============================================
/*
import { useEffect, useState } from 'react';
import { useHospitalSocket } from '@/lib/useHospitalSocket';

export function MonitoringDashboardExample() {
  const { events } = useHospitalSocket('hospital-id');
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  useEffect(() => {
    if (events) {
      setLastUpdate(events);
      console.log('Real-time update:', events);
    }
  }, [events]);

  return (
    <div>
      <h2>Real-time Monitoring</h2>
      {lastUpdate && (
        <div>
          <p>Last Update: {new Date(lastUpdate.timestamp).toLocaleTimeString()}</p>
          <p>Status: {lastUpdate.status}</p>
          <p>Message: {lastUpdate.message}</p>
        </div>
      )}
    </div>
  );
}
*/

// ============================================
// Example 7: Support Ticket Management
// ============================================
/*
import { useState } from 'react';
import { useGetApi, useMutationApi } from '@/lib/useApi';
import { apiClient } from '@/lib/apiClient';

export function SupportTicketsExample() {
  const { data: tickets, loading, refetch } = useGetApi<any[]>(
    '/api/support',
    true
  );
  
  const { mutate: closeMutate } = useMutationApi();

  const handleCloseTicket = async (ticketId: string) => {
    await closeMutate(() => apiClient.closeSupportTicket(ticketId));
    await refetch();
  };

  if (loading) return <div>Loading tickets...</div>;

  return (
    <div>
      <h2>Support Tickets</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets?.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.title}</td>
              <td>{ticket.status}</td>
              <td>
                {ticket.status !== 'closed' && (
                  <button onClick={() => handleCloseTicket(ticket.id)}>
                    Close
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
*/

// ============================================
// Example 8: Error Handling Wrapper Component
// ============================================
/*
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error) || (
          <div className="error">
            <h2>Something went wrong</h2>
            <p>{this.state.error.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
*/

// ============================================
// Example 9: Loading Skeleton Component
// ============================================
/*
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
    </div>
  );
}
*/

// ============================================
// Example 10: API Request Interceptor Pattern
// ============================================
/*
// For logging all API calls (add to apiClient.ts)

export class ApiClientWithLogging extends ApiClient {
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    console.log(`📤 API Request: ${options.method || 'GET'} ${endpoint}`);
    
    try {
      const result = await super.request<T>(endpoint, options);
      console.log(`✅ API Success: ${endpoint}`, result);
      return result;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      throw error;
    }
  }
}
*/

export default "Example Components - See comments above for usage patterns";
