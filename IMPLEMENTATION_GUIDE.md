# IMPLEMENTATION GUIDE - ANSAR System Standardization

Complete step-by-step guide to fix all identified issues.

---

## PHASE 1: Fix Critical Blocker (5 minutes)

### Task 1.1: Create useAppointments Hook

**File to Create**: `src/hooks/useAppointments.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI } from '../services/api';
import { Appointment } from '../types';

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentsAPI.list();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
  };
};

export default useAppointments;
```

### Task 1.2: Export useAppointments from hooks/index.ts

**File to Modify**: `src/hooks/index.ts`

Replace content with:
```typescript
// ── Hooks — Custom React hooks for business logic ──
export { usePatients } from './usePatients';
export { useAuth } from './useAuth';
export { useInvoices } from './useInvoices';
export { useAppointments } from './useAppointments';
```

### Task 1.3: Verify Dashboard Loads

```bash
npm run dev
# Navigate to http://localhost:5173/dashboard
# Expected: Dashboard loads, shows appointment count in KPI
# Error: Should NOT see "useAppointments is not exported"
```

---

## PHASE 2: Fix Component Exports (30 minutes)

### Task 2.1: Create organisms/index.ts

**File to Create**: `src/components/organisms/index.ts`

```typescript
// ── Organisms - Complex composite components ──
export { default as Sidebar } from './Sidebar';
export { default as Odontogram } from './Odontogram';
export { default as OrthodonticGallery } from './OrthodonticGallery';

// Appointments subcomponents
export { default as AppointmentModal } from './appointments/AppointmentModal';
export { default as AppointmentGridItem } from './appointments/AppointmentGridItem';
export { default as DaySummarySidebar } from './appointments/DaySummarySidebar';
```

### Task 2.2: Update molecules/index.ts

**File to Modify**: `src/components/molecules/index.ts`

Replace content with:
```typescript
// Molecules - Composite UI components
export { default as FormField } from './FormField';
export { default as PatientCard } from './PatientCard';
export { default as SearchBar } from './SearchBar';
export { default as StatCard } from './StatCard';
export { default as EmptyState } from './EmptyState';
export { default as PageHeader } from './PageHeader';
export { default as SectionHeader } from './SectionHeader';
export { default as Tooth } from './Tooth';

// Type exports
export type { } from './FormField';
export type { } from './PatientCard';
export type { } from './SearchBar';
export type { } from './StatCard';
export type { } from './EmptyState';
export type { } from './PageHeader';
export type { } from './SectionHeader';
```

### Task 2.3: Update component imports in Dashboard.tsx

**File to Modify**: `src/pages/Dashboard.tsx`

**Change these lines**:
```typescript
// OLD (Lines 7-8)
import { PageHeader } from '../components/molecules/PageHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';

// NEW
import { PageHeader, SectionHeader } from '../components/molecules';
```

### Task 2.4: Update component imports in Billing.tsx

**File to Modify**: `src/pages/Billing.tsx`

**Change these lines**:
```typescript
// OLD (Lines 11-12)
import { PageHeader } from '../components/molecules/PageHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';

// NEW
import { PageHeader, SectionHeader } from '../components/molecules';
```

### Task 2.5: Update component imports in Appointments.tsx

**File to Modify**: `src/pages/Appointments.tsx`

**Change these lines**:
```typescript
// OLD (Lines 6-7)
import { PageHeader } from '../components/molecules/PageHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';

// NEW
import { PageHeader, SectionHeader } from '../components/molecules';
```

Also update appointment components:
```typescript
// OLD (Lines 19-21)
import DaySummarySidebar from '../components/organisms/appointments/DaySummarySidebar';
import AppointmentGridItem from '../components/organisms/appointments/AppointmentGridItem';
import AppointmentModal from '../components/organisms/appointments/AppointmentModal';

// NEW
import { DaySummarySidebar, AppointmentGridItem, AppointmentModal } from '../components/organisms';
```

### Task 2.6: Update component imports in ClinicalHistory.tsx

**File to Modify**: `src/pages/ClinicalHistory.tsx`

**Change these lines**:
```typescript
// OLD (Lines 8-9)
import { PageHeader } from '../components/molecules/PageHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';

// NEW
import { PageHeader, SectionHeader } from '../components/molecules';
```

Also update organism imports:
```typescript
// OLD (Lines 15-16)
import Odontogram from '../components/organisms/Odontogram';
import OrthodonticGallery from '../components/organisms/OrthodonticGallery';

// NEW
import { Odontogram, OrthodonticGallery } from '../components/organisms';
```

### Task 2.7: Update component imports in Settings.tsx

**File to Modify**: `src/pages/Settings.tsx`

**Change these lines**:
```typescript
// OLD
import { PageHeader } from '../components/molecules/PageHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';

// NEW
import { PageHeader, SectionHeader } from '../components/molecules';
```

### Task 2.8: Update component imports in Patients.tsx

**File to Modify**: `src/pages/Patients.tsx`

**Change these lines**:
```typescript
// OLD
import { PageHeader } from '../components/molecules/PageHeader';
import { SectionHeader } from '../components/molecules/SectionHeader';

// NEW
import { PageHeader, SectionHeader } from '../components/molecules';
```

### Task 2.9: Update Sidebar import in AdminLayout.tsx

**File to Modify**: `src/layouts/AdminLayout.tsx`

**Change this line**:
```typescript
// OLD
import Sidebar from '../components/organisms/Sidebar';

// NEW
import { Sidebar } from '../components/organisms';
```

---

## PHASE 3: Type Safety & Dead Code (45 minutes)

### Task 3.1: Remove unused icon imports

#### In `src/pages/Appointments.tsx`:
**Line 4** - Remove `Activity`:
```typescript
// OLD
import {
    CalendarDays, ChevronLeft, ChevronRight, Plus, X, User,
    ShieldCheck, Mail, Loader2, Activity
} from 'lucide-react';

// NEW
import {
    CalendarDays, ChevronLeft, ChevronRight, Plus, X, User,
    ShieldCheck, Mail, Loader2
} from 'lucide-react';
```

#### In `src/pages/Billing.tsx`:
**Line 5** - Remove `Package`:
```typescript
// OLD
import {
    Search, Plus, Trash2, Eye, Download, FileText, CreditCard, Banknote,
    ArrowRight, CheckCircle, X, Percent, DollarSign, User, ClipboardList,
    ChevronDown, Package, Mail, AlertCircle, Loader2, Receipt
} from 'lucide-react';

// NEW
import {
    Search, Plus, Trash2, Eye, Download, FileText, CreditCard, Banknote,
    ArrowRight, CheckCircle, X, Percent, DollarSign, User, ClipboardList,
    ChevronDown, Mail, AlertCircle, Loader2, Receipt
} from 'lucide-react';
```

#### In `src/pages/Dashboard.tsx`:
**Line 3** - Remove `Activity`:
```typescript
// OLD
import { Activity, Users, Calendar, DollarSign, ChevronRight, TrendingUp, BarChart2 } from 'lucide-react';

// NEW
import { Users, Calendar, DollarSign, ChevronRight, TrendingUp, BarChart2 } from 'lucide-react';
```

#### In `src/pages/ClinicalHistory.tsx`:
**Line 6** - Remove `Activity`:
```typescript
// OLD
import { Activity, Plus, Edit, Trash2, ChevronDown, ChevronUp, AlertCircle, Loader2, FileText, Download } from 'lucide-react';

// NEW
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, AlertCircle, Loader2, FileText, Download } from 'lucide-react';
```

### Task 3.2: Fix TypeScript 'any' types in services/api.ts

**Step 1**: Add type interfaces at top of file after imports

```typescript
import { supabase } from '../lib/supabase';
import { 
    Patient, 
    ClinicalHistory, 
    Appointment, 
    OrthoBlock, 
    User 
} from '../types';

// ── Error Types ────────────────────────────────────────────────
interface SupabaseError {
    message: string;
    code?: string;
    status?: number;
}

// ── API Request/Response Types ─────────────────────────────────
interface RegisterPayload {
    email: string;
    password: string;
    full_name: string;
    role?: 'doctor' | 'admin' | 'assistant';
}

interface ListAppointmentsParams {
    date?: string;
    status?: string;
    doctor_id?: string;
}

interface AppointmentListParams {
    date?: string;
    status?: string;
    doctor_id?: string;
}

interface OdontogramData {
    [key: string]: any;
}

interface NotificationPayload {
    patient_id?: string;
    type: string;
    message?: string;
    channel?: 'email' | 'whatsapp' | 'sms';
}
```

**Step 2**: Replace handleSupabase function signature

```typescript
// OLD
async function handleSupabase<T>(promise: PromiseLike<{ data: T | null; error: any }>): Promise<T> {
    const { data, error } = await promise;
    if (error) {
        console.error('Supabase Error:', error);
        const err = new Error(error.message) as any;
        err.status = error.code === 'PGRST116' ? 404 : 400;
        throw err;
    }
    return data as T;
}

// NEW
async function handleSupabase<T>(
    promise: PromiseLike<{ data: T | null; error: SupabaseError | null }>
): Promise<T> {
    const { data, error } = await promise;
    if (error) {
        console.error('Supabase Error:', error);
        const err = new Error(error.message);
        throw err;
    }
    return data as T;
}
```

**Step 3**: Fix authAPI.register

```typescript
// OLD
register: async (userData: any): Promise<any> => {

// NEW
register: async (userData: RegisterPayload): Promise<any> => {
```

**Step 4**: Fix authAPI.verifyOtp

```typescript
// OLD
verifyOtp: async (email: string, token: string): Promise<{ session: any; user: User }> => {

// NEW
verifyOtp: async (email: string, token: string): Promise<{ session: any; user: User }> => {
// session: any is acceptable here as it's internal Supabase type
```

**Step 5**: Fix appointmentsAPI.list

```typescript
// OLD
list: async (params: any = {}): Promise<Appointment[]> => {
    let query = supabase.from('appointments').select('*');

    if (params.date) {
        query = query.eq('date', params.date);
    }

// NEW
list: async (params: ListAppointmentsParams = {}): Promise<Appointment[]> => {
    let query = supabase.from('appointments').select('*');

    if (params.date) {
        query = query.eq('date', params.date);
    }
```

**Step 6**: Fix patientsAPI.updateOdontogram

```typescript
// OLD
updateOdontogram: async (patientId: string, data: any): Promise<any> => {

// NEW
updateOdontogram: async (patientId: string, data: OdontogramData): Promise<OdontogramData> => {
```

**Step 7**: Fix appointmentsAPI.publicBookOrtho & publicBookGeneral

```typescript
// OLD
publicBookOrtho: async (data: any): Promise<Appointment> => {
publicBookGeneral: async (data: any): Promise<Appointment> => {

// NEW
publicBookOrtho: async (data: Partial<Appointment>): Promise<Appointment> => {
publicBookGeneral: async (data: Partial<Appointment>): Promise<Appointment> => {
```

**Step 8**: Fix notificationsAPI.send

```typescript
// OLD
send: async (data: any): Promise<any> => {

// NEW
send: async (data: NotificationPayload): Promise<any> => {
```

### Task 3.3: Fix TypeScript errors in usePatients.ts

Replace all `catch (err: any)` with `catch (err: unknown)` and proper narrowing:

```typescript
// OLD
catch (err: any) {
  setError(err.message || 'Error al cargar pacientes');
}

// NEW
catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Error al cargar pacientes';
  setError(message);
}
```

Do this in 4 places (lines 27, 40, 50, 61).

### Task 3.4: Fix TypeScript errors in useInvoices.ts

Same as above - replace all `catch (err: any)` with `catch (err: unknown)`:

```typescript
// OLD
catch (err: any) {
  setError(err.message || 'Error al cargar facturas');
}

// NEW
catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Error al cargar facturas';
  setError(message);
}
```

Do this in 3 places (lines 32, 50, 68).

### Task 3.5: Fix TypeScript errors in Billing.tsx

**Line 46** - Add type to selectedPatient:

```typescript
// OLD
const [selectedPatient, setSelectedPatient] = useState(null);

// NEW
const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
```

**Line 100** - Add type to selectPatient parameter:

```typescript
// OLD
const selectPatient = (p) => {
  setSelectedPatient(p);

// NEW
const selectPatient = (p: Patient) => {
  setSelectedPatient(p);
```

### Task 3.6: Fix TypeScript errors in ClinicalHistory.tsx

**Line 21** - Add return type and parameter type:

```typescript
// OLD
const calculateAge = (birthDate) => {
  return new Date().getFullYear() - new Date(birthDate).getFullYear();
};

// NEW
const calculateAge = (birthDate: string): number => {
  return new Date().getFullYear() - new Date(birthDate).getFullYear();
};
```

**Line 63** - Add type to formData:

```typescript
// OLD
const onSubmit = async (formData: any) => {

// NEW
interface ClinicalHistoryFormData extends Partial<ClinicalHistory> {}
const onSubmit = async (formData: ClinicalHistoryFormData) => {
```

### Task 3.7: Fix TypeScript errors in Patients.tsx

**Line 23** - Add type to formData:

```typescript
// OLD
const onSubmit = async (formData: any) => {

// NEW
interface PatientFormData extends Partial<Patient> {}
const onSubmit = async (formData: PatientFormData) => {
```

---

## PHASE 4: Code Quality & Cleanup (30 minutes)

### Task 4.1: Fix invoiceCounter in Billing.tsx

**Find** (line 40):
```typescript
let invoiceCounter = 1001;
```

**Replace in component state** (after const declarations, around line 45):

```typescript
const [invoiceNumber, setInvoiceNumber] = useState(1001);

const generateNextInvoiceNumber = (): number => {
  const newNumber = invoiceNumber + 1;
  setInvoiceNumber(newNumber);
  return newNumber;
};
```

**Then update the invoice creation** to use `generateNextInvoiceNumber()`:

```typescript
// OLD
const newInvoice: Invoice = {
  id: Date.now().toString(),
  invoice_number: `INV-${invoiceCounter++}`,
  ...
};

// NEW
const newInvoice: Invoice = {
  id: Date.now().toString(),
  invoice_number: `INV-${generateNextInvoiceNumber()}`,
  ...
};
```

### Task 4.2: Replace MOCK_TREATMENTS with API call

**In Billing.tsx**, remove (lines 17-32):
```typescript
const MOCK_TREATMENTS = {
    1: [...],
    2: [...],
    3: [...]
};
```

**Add state** (after other useState declarations):
```typescript
const [treatments, setTreatments] = useState<any[]>([]);
const [loadingTreatments, setLoadingTreatments] = useState(false);
```

**Add effect** (after existing useEffect):
```typescript
useEffect(() => {
  if (selectedPatient?.id) {
    setLoadingTreatments(true);
    patientsAPI
      .getHistory(selectedPatient.id)
      .then(history => {
        setTreatments(history || []);
        setLoadingTreatments(false);
      })
      .catch(err => {
        console.error('Error fetching treatments:', err);
        setLoadingTreatments(false);
      });
  } else {
    setTreatments([]);
  }
}, [selectedPatient]);
```

**Update render logic** to use `treatments` instead of `MOCK_TREATMENTS[selectedPatient?.id]`:

```typescript
// OLD
const availableTreatments = MOCK_TREATMENTS[selectedPatient?.id] || [];

// NEW
const availableTreatments = treatments;
```

### Task 4.3: Remove unused searchPatients from usePatients.ts

**Option**: Remove it from return object (line 88):

```typescript
// OLD
return {
  patients,
  loading,
  error,
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,  // <- REMOVE THIS
};

// NEW
return {
  patients,
  loading,
  error,
  fetchPatients,
  createPatient,
  updatePatient,
  deletePatient,
};
```

Also remove function definition (lines 67-73) if it's truly unused.

### Task 4.4: Verify all changes

```bash
npm run build
# Should complete without errors

npm run lint
# Should show no issues

npm run dev
# Should start dev server
# Navigate to each page to verify functionality
```

---

## FINAL VERIFICATION CHECKLIST

- [ ] Phase 1: Dashboard loads without "useAppointments" error
- [ ] Phase 2: No import errors in console
- [ ] Phase 2: All pages load without 404 import errors
- [ ] Phase 3: `npm run build` completes successfully
- [ ] Phase 3: No TypeScript errors in build output
- [ ] Phase 3: No implicit 'any' errors
- [ ] Phase 4: Billing page works with all patients (not just 1-3)
- [ ] Phase 4: Invoice counter increments correctly
- [ ] Phase 4: No unused variable warnings

---

## TESTING PROCEDURES

### Test Dashboard
```
1. Navigate to /dashboard
2. Should see KPI cards with data
3. Should see recent patients list
4. Should see appointment count > 0
5. No console errors
```

### Test Billing
```
1. Navigate to /facturacion
2. Search and select a patient
3. Patient with ID > 3 should work
4. Add treatments from fetched history
5. Create invoice
6. Invoice number should increment
7. No console errors
```

### Test Appointments
```
1. Navigate to /citas
2. Should see calendar view
3. Should see appointments for selected date
4. Can create new appointment
5. No console errors
```

### Test Clinical History
```
1. Navigate to /historia
2. Select patient from list
3. Should load clinical history data
4. Can edit and save history
5. No console errors
```

---

## TROUBLESHOOTING

### If npm run build fails:
```bash
npm install
npm run build
# If still fails, check output for specific errors
# Usually: missing types, wrong imports, or TypeScript errors
```

### If components still don't render:
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### If imports still show errors in IDE:
```bash
# VSCode: Cmd+Shift+P > "TypeScript: Reload Projects"
# Or restart the IDE
```

---

## ESTIMATED TIME BREAKDOWN

| Phase | Task | Time |
|-------|------|------|
| 1 | Create useAppointments + export | 5 min |
| 2 | Create organisms/index.ts | 5 min |
| 2 | Update molecules/index.ts | 3 min |
| 2 | Fix imports in 7 files | 15 min |
| 3 | Remove unused imports | 3 min |
| 3 | Fix 'any' types in api.ts | 15 min |
| 3 | Fix 'any' types in hooks | 8 min |
| 3 | Fix form data types | 5 min |
| 4 | Move invoiceCounter | 5 min |
| 4 | Replace MOCK_TREATMENTS | 8 min |
| 4 | Cleanup unused functions | 3 min |
| 4 | Final verification | 10 min |
| **Total** | | **100 min** |

---

## SUCCESS CRITERIA

✅ All tasks complete when:
1. `npm run build` passes without errors
2. Dashboard page loads and displays data
3. All pages load without import/type errors
4. Billing page works with all patients
5. No console warnings or errors
6. All TypeScript errors resolved
7. No 'any' types in critical paths

