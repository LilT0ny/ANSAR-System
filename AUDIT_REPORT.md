# 🔍 COMPREHENSIVE ANSAR SYSTEM CODE AUDIT REPORT

**Generated**: 2025-01-29  
**Project**: ANSAR-System (React + TypeScript + Vite + Supabase)  
**Status**: BLOCKERS DETECTED - Multiple critical issues require immediate attention

---

## EXECUTIVE SUMMARY

The codebase has a **CRITICAL blocker** that prevents the Dashboard from loading, plus 20+ additional issues spanning TypeScript type safety, mock data, missing exports, and component organization. The Supabase integration is properly implemented, but needs cleanup of legacy code patterns.

**Critical Action Items**:
1. ✅ Fix useAppointments hook (BREAKING ERROR)
2. ✅ Create missing organisms/index.ts
3. ✅ Replace mock data with API calls
4. ✅ Fix TypeScript 'any' types in services

---

## SECTION 1: ALL PROBLEMS FOUND (With File Paths)

### 1.1 CRITICAL ISSUES (🔴 Blocking Functionality)

#### **1.1.1 Missing useAppointments Hook**
- **Severity**: 🔴 CRITICAL - Dashboard crash on load
- **Files Affected**:
  - `src/pages/Dashboard.tsx` - Line 4: `import { usePatients, useAppointments } from '../hooks';`
  - `src/pages/Dashboard.tsx` - Line 14: `const { appointments, loading: loadingAppointments } = useAppointments();`
- **Problem**: The hook is imported but doesn't exist in `src/hooks/`
- **Error Type**: Runtime error - "useAppointments is not exported from '../hooks'"
- **Impact**: Dashboard page will completely fail to render
- **Evidence**:
  - `src/hooks/index.ts` only exports: usePatients, useAuth, useInvoices
  - No `src/hooks/useAppointments.ts` file exists
  - Hook is used in line 14 and 51 (destructuring and dependency array)

---

### 1.2 HIGH PRIORITY ISSUES (🟡 Breaking Exports/Organization)

#### **1.2.1 Missing organisms/index.ts**
- **Severity**: 🟡 HIGH - Component organization broken
- **File**: `src/components/organisms/` (doesn't exist)
- **Current Status**: 
  - No centralized export point
  - Components scattered: Sidebar.tsx, Odontogram.tsx, OrthodonticGallery.tsx, appointments/
  - Each component imported directly throughout codebase
- **Affected Components Not Exported**:
  - `src/components/organisms/Sidebar.tsx` - Imported directly in `AdminLayout.tsx`
  - `src/components/organisms/Odontogram.tsx` - Imported directly in `ClinicalHistory.tsx`
  - `src/components/organisms/OrthodonticGallery.tsx` - Imported directly in `ClinicalHistory.tsx`
  - `src/components/organisms/appointments/AppointmentModal.tsx`
  - `src/components/organisms/appointments/AppointmentGridItem.tsx`
  - `src/components/organisms/appointments/DaySummarySidebar.tsx`

#### **1.2.2 Incomplete molecules/index.ts**
- **Severity**: 🟡 HIGH - Inconsistent export patterns
- **File**: `src/components/molecules/index.ts`
- **Missing Exports**:
  - `PageHeader` - Used in 6+ files but not exported from index.ts
  - `SectionHeader` - Used in 6+ files but not exported from index.ts
  - `Tooth` - Component exists but not exported
- **Current exports**: FormField, PatientCard, SearchBar, StatCard, EmptyState
- **Impact**: Violates Atomic Design pattern; imports bypass barrel file

---

### 1.3 MOCK DATA ISSUES (🟡 Violates Requirement #1)

#### **1.3.1 MOCK_TREATMENTS in Billing Page**
- **File**: `src/pages/Billing.tsx`
- **Lines**: 17-32
- **Problem**: Hardcoded mock data with patient IDs 1, 2, 3
```typescript
const MOCK_TREATMENTS = {
    1: [{ id: 't1', name: 'Limpieza Dental...', ... }],
    2: [{ id: 't5', name: 'Ortodoncia...', ... }],
    3: [{ id: 't7', name: 'Extracción...', ... }],
};
```
- **Impact**: 
  - Only works for 3 hardcoded patients
  - Should fetch from API (patientsAPI.getHistory exists)
  - Violates requirement: "NO MOCK DATA"

#### **1.3.2 PAYMENT_METHODS Mock Data**
- **File**: `src/pages/Billing.tsx`
- **Lines**: 34-38
- **Problem**: Hardcoded array of payment methods
- **Solution**: Should be API-driven or constants if truly static

#### **1.3.3 TREATMENT_TYPES in Appointments**
- **File**: `src/pages/Appointments.tsx`
- **Lines**: 24-34
- **Problem**: Hardcoded treatment types string array
- **Status**: This is acceptable as a constant if these are fixed system options

#### **1.3.4 Services Mock Data in Booking**
- **File**: `src/pages/Booking.tsx`
- **Lines**: 10-15
- **Problem**: Mock services array with hardcoded prices and durations
- **Solution**: Should fetch from API or services table

#### **1.3.5 invoiceCounter Module-Level Variable**
- **File**: `src/pages/Billing.tsx`
- **Line**: 40
- **Problem**: `let invoiceCounter = 1001;` at module level persists across component re-mounts
- **Risk**: Counter can become inconsistent, stale closures, memory leak potential
- **Solution**: Move to component state or use backend-generated invoice numbers

---

### 1.4 UNUSED IMPORTS (🟡 Requires Cleanup)

#### **1.4.1 Unused Icon Imports**
- **File**: `src/pages/Appointments.tsx`
  - **Line 4**: `Activity` icon imported but never used
  - **Affected Line**: Imported but never rendered anywhere in JSX

- **File**: `src/pages/Billing.tsx`
  - **Line 5**: `Package` icon imported but never used

- **File**: `src/pages/Dashboard.tsx`
  - **Line 3**: `Activity` icon imported but never used

- **File**: `src/pages/ClinicalHistory.tsx`
  - **Line 6**: `Activity` icon imported but never used

#### **1.4.2 Unused Hook Exports**
- **File**: `src/hooks/usePatients.ts`
- **Issue**: `searchPatients()` function returned but never called in codebase
- **Lines**: 67-73 define the function, line 88 includes in return object
- **Status**: Dead code - can be removed or needs implementation

---

### 1.5 TYPESCRIPT ERRORS (🟡 Type Safety Violations)

#### **1.5.1 'any' Type Usages (21+ instances)**

| File | Location | Issue |
|------|----------|-------|
| `src/services/api.ts` | Line 11 | `error: any` in handleSupabase generic |
| `src/services/api.ts` | Line 43 | `userData: any` in register() |
| `src/services/api.ts` | Line 79 | `session: any` in verifyOtp return |
| `src/services/api.ts` | Line 214 | `getOdontogram(): Promise<any>` |
| `src/services/api.ts` | Line 224 | `data: any` in updateOdontogram |
| `src/services/api.ts` | Line 254 | `params: any = {}` in appointmentsAPI.list |
| `src/services/api.ts` | Line 353 | `data: any` in publicBookOrtho |
| `src/services/api.ts` | Line 359 | `data: any` in publicBookGeneral |
| `src/services/api.ts` | Line 368-417 | Multiple `Promise<any[]>` returns |
| `src/services/api.ts` | Line 377 | `send(data: any)` in notificationsAPI |
| `src/hooks/usePatients.ts` | Lines 27, 40, 50, 61 | `catch (err: any)` (4x) |
| `src/hooks/useInvoices.ts` | Lines 32, 50, 68 | `catch (err: any)` (3x) |
| `src/pages/Billing.tsx` | Line 46 | `const selectedPatient = null` (no type) |
| `src/pages/Billing.tsx` | Line 100 | `selectPatient = (p) => { ... }` (p untyped) |
| `src/pages/ClinicalHistory.tsx` | Line 63 | `const onSubmit = async (formData: any)` |
| `src/pages/Patients.tsx` | Line 23 | `const onSubmit = async (formData: any)` |
| `src/components/molecules/FormField.tsx` | N/A | `register?: any;` in props |

**Impact**: Loses TypeScript type safety; refactoring becomes risky; IDE intellisense limited

#### **1.5.2 Missing Type Annotations**
- `src/pages/Billing.tsx` Line 100: Parameter `p` in `selectPatient` has no type
- `src/pages/ClinicalHistory.tsx` Line 21: Parameter `birthDate` in `calculateAge()` untyped
- `src/pages/ClinicalHistory.tsx` Line 52: Props `{ navigate }` not typed for screen component
- `src/pages/Patients.tsx`: Multiple callback parameters lack types

---

### 1.6 DEAD CODE & UNUSED VARIABLES (🟢 Low Priority Cleanup)

#### **1.6.1 Unused Functions**
- **File**: `src/hooks/usePatients.ts`
- **Function**: `searchPatients()` (lines 67-73)
- **Status**: Defined in hook, returned, but **never called anywhere**
- **Evidence**: Grep search found no invocations

#### **1.6.2 Inefficient Patterns**
- **File**: `src/pages/Billing.tsx`
- **Line 21**: `calculateAge()` function defined but only called once (line 80)
- **Recommendation**: Could be inlined or moved to utils if reusable

#### **1.6.3 Unused State Variables**
- **File**: `src/pages/Appointments.tsx`
- **Line 141**: `invoiceCounter` assignment in effect - unclear why needed for appointments
- **Impact**: Potential logic error; unclear intent

---

### 1.7 COMPONENT ORGANIZATION ISSUES (🟡 Atomic Design Pattern)

#### **1.7.1 Direct Component Imports Bypass Barrel Files**
Components that should be imported via index.ts but aren't:

| Component | Should Use | Currently Uses |
|-----------|-----------|-----------------|
| PageHeader | `from '../molecules'` | `from '../molecules/PageHeader'` |
| SectionHeader | `from '../molecules'` | `from '../molecules/SectionHeader'` |
| Odontogram | `from '../organisms'` | `from '../organisms/Odontogram'` |
| OrthodonticGallery | `from '../organisms'` | `from '../organisms/OrthodonticGallery'` |
| AppointmentModal | `from '../organisms'` | `from '../organisms/appointments/AppointmentModal'` |
| Sidebar | `from '../organisms'` | `from '../organisms/Sidebar'` |

**Files Affected**:
- Dashboard.tsx, Billing.tsx, Appointments.tsx, ClinicalHistory.tsx, Settings.tsx, Patients.tsx

#### **1.7.2 Sidebar Component Potentially Unused**
- **File**: `src/components/organisms/Sidebar.tsx`
- **Status**: Exists but unclear if actually used
- **Only found in**: AdminLayout.tsx (import exists)
- **Need to verify**: Is it rendered in AdminLayout?

---

### 1.8 SUPABASE INTEGRATION STATUS

#### **1.8.1 Supabase Client Configuration** ✅ GOOD
- **File**: `src/lib/supabase.ts`
- **Status**: ✅ Properly configured
- **Checks**:
  - ✅ Correct environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  - ✅ Session persistence enabled
  - ✅ Auto-refresh token enabled
  - ✅ Error handling in place
- **Issue**: None detected

#### **1.8.2 API Service Layer** ✅ GOOD (With 'any' cleanup needed)
- **File**: `src/services/api.ts`
- **Status**: ✅ Comprehensive API coverage
- **Implemented Endpoints**:
  - ✅ AUTH: login, register, OTP, logout, me
  - ✅ PATIENTS: list, getById, search, CRUD
  - ✅ APPOINTMENTS: list, CRUD, OrthoBlocks
  - ✅ NOTIFICATIONS: list, send, getDoctorNotifications, mark read
  - ✅ Clinical History: getHistory, upsertHistory, createHistoryRecord
  - ✅ Odontogram: getOdontogram, updateOdontogram
- **Issues**: Multiple 'any' types, untyped parameters (see section 1.5.1)

#### **1.8.3 Custom Hooks Using Supabase** ✅ GOOD
- **Files**: useAuth.ts, usePatients.ts, useInvoices.ts
- **Status**: ✅ All properly structured
- **Issues**: Error handling uses `any` type

#### **1.8.4 Environment Variables Check**
- **Status**: ⚠️ NEEDS VERIFICATION
- **Should Verify**:
  - .env file has VITE_SUPABASE_URL set correctly
  - .env file has VITE_SUPABASE_ANON_KEY set correctly
  - Local development can access Supabase
  - Production build uses correct env variables

---

## SECTION 2: RECOMMENDED FIXES (Priority Order)

### Priority 1: CRITICAL (Required for Dashboard to load)

#### **1. Create useAppointments Hook**
```typescript
// File: src/hooks/useAppointments.ts
import { useState, useEffect, useCallback } from 'react';
import { appointmentsAPI } from '../services/api';
import { Appointment } from '../types';

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

  return { appointments, loading, error, fetchAppointments };
};

export default useAppointments;
```

**Then update**: `src/hooks/index.ts`
```typescript
export { useAppointments } from './useAppointments';
```

---

### Priority 2: HIGH (Required for proper component exports)

#### **2. Create organisms/index.ts**
```typescript
// File: src/components/organisms/index.ts
export { default as Sidebar } from './Sidebar';
export { default as Odontogram } from './Odontogram';
export { default as OrthodonticGallery } from './OrthodonticGallery';

// Appointments subcomponents
export { default as AppointmentModal } from './appointments/AppointmentModal';
export { default as AppointmentGridItem } from './appointments/AppointmentGridItem';
export { default as DaySummarySidebar } from './appointments/DaySummarySidebar';
```

#### **3. Update molecules/index.ts**
```typescript
// Add these exports to existing file
export { default as PageHeader } from './PageHeader';
export { default as SectionHeader } from './SectionHeader';
export { default as Tooth } from './Tooth';

// Update type exports
export type { } from './PageHeader';
export type { } from './SectionHeader';
```

#### **4. Update all component imports to use barrel files**
**Files to update**:
- `src/pages/Dashboard.tsx`: Change `from '../components/molecules/PageHeader'` to `from '../components/molecules'`
- `src/pages/Billing.tsx`: Same change for PageHeader, SectionHeader
- `src/pages/Appointments.tsx`: Same
- `src/pages/ClinicalHistory.tsx`: Same + add Odontogram from organisms
- `src/pages/Settings.tsx`: Same for PageHeader, SectionHeader
- `src/pages/Patients.tsx`: Same
- `src/layouts/AdminLayout.tsx`: Import Sidebar from organisms

---

### Priority 3: MEDIUM (Type Safety & Dead Code)

#### **5. Remove Unused Icon Imports**
- Remove `Activity` from: Appointments.tsx (line 4), Dashboard.tsx (line 3), ClinicalHistory.tsx (line 6)
- Remove `Package` from: Billing.tsx (line 5)

#### **6. Fix TypeScript 'any' Types in services/api.ts**
Replace all `any` types with proper types. Example:

**Before**:
```typescript
async function handleSupabase<T>(promise: PromiseLike<{ data: T | null; error: any }>): Promise<T>
```

**After**:
```typescript
interface SupabaseError {
  message: string;
  code?: string;
  status?: number;
}

async function handleSupabase<T>(
  promise: PromiseLike<{ data: T | null; error: SupabaseError | null }>
): Promise<T>
```

**Other fixes**:
- `register(userData: any)` → `register(userData: RegisterPayload)`
- `params: any = {}` → `params: ListAppointmentsParams = {}`
- `data: any` → `data: CreateAppointmentPayload`

#### **7. Create TypeScript Interfaces for API Payloads**
Add to `src/types/index.ts`:
```typescript
export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role?: 'doctor' | 'admin' | 'assistant';
}

export interface ListAppointmentsParams {
  date?: string;
  status?: string;
  doctor_id?: string;
}

export interface CreateAppointmentPayload extends Partial<Appointment> {}
```

#### **8. Fix usePatients searchPatients Hook**
**Option A**: Remove if never used
```typescript
// Remove from return object if not needed
```

**Option B**: Implement usage
- If it should be used, call it in a page or create a search page

#### **9. Move invoiceCounter to Component State**
**Before**:
```typescript
let invoiceCounter = 1001;

const Billing = () => {
  // uses invoiceCounter globally
}
```

**After**:
```typescript
const Billing = () => {
  const [invoiceNumber, setInvoiceNumber] = useState(1001);
  
  const generateInvoiceNumber = () => {
    const newNumber = invoiceNumber + 1;
    setInvoiceNumber(newNumber);
    return newNumber;
  };
}
```

---

### Priority 4: LOW (Code Quality)

#### **10. Fix Mock Data in Billing.tsx**
Replace MOCK_TREATMENTS with API call:
```typescript
const [treatments, setTreatments] = useState<any[]>([]);

useEffect(() => {
  if (selectedPatient?.id) {
    patientsAPI.getHistory(selectedPatient.id)
      .then(history => setTreatments(history))
      .catch(err => console.error(err));
  }
}, [selectedPatient]);
```

#### **11. Fix Form Data Types**
**Before**:
```typescript
const onSubmit = async (formData: any) => { ... }
```

**After**:
```typescript
interface PatientFormData {
  first_name: string;
  last_name: string;
  document_id: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
}

const onSubmit = async (formData: PatientFormData) => { ... }
```

#### **12. Add Missing Type Annotations**
- `src/pages/ClinicalHistory.tsx` Line 21: `calculateAge(birthDate: string): number`
- `src/pages/Billing.tsx` Line 46: `const selectedPatient: Patient | null = null`
- All callback parameters should have explicit types

---

## SECTION 3: FILES TO CREATE/DELETE/MODIFY

### Create (New Files)
1. ✨ `src/hooks/useAppointments.ts` - NEW hook implementation
2. ✨ `src/components/organisms/index.ts` - NEW barrel export file
3. ✨ `src/types/api-payloads.ts` - NEW file for API-specific types (optional)

### Delete (No longer needed)
- ❌ None identified yet (verify Sidebar is actually used first)

### Modify (Update Existing)
| File | Changes |
|------|---------|
| `src/hooks/index.ts` | Add `useAppointments` export |
| `src/components/molecules/index.ts` | Add PageHeader, SectionHeader, Tooth exports |
| `src/services/api.ts` | Replace all `any` types with proper interfaces |
| `src/pages/Dashboard.tsx` | Remove unused Activity import, fix component imports |
| `src/pages/Billing.tsx` | Remove unused Package import, fix component imports, move invoiceCounter, replace MOCK_TREATMENTS |
| `src/pages/Appointments.tsx` | Remove unused Activity import, fix component imports |
| `src/pages/ClinicalHistory.tsx` | Remove unused Activity import, fix component imports |
| `src/pages/Settings.tsx` | Fix component imports |
| `src/pages/Patients.tsx` | Fix component imports |
| `src/layouts/AdminLayout.tsx` | Fix Sidebar import |
| `src/hooks/usePatients.ts` | Remove or implement searchPatients |
| `src/types/index.ts` | Add API payload interfaces |

---

## SECTION 4: CRITICAL ISSUES BLOCKING FUNCTIONALITY

### Issue #1: Dashboard Will Not Load 🔴
**Current State**: BROKEN  
**When**: Immediately on user navigation to /dashboard  
**Error Message**: `useAppointments is not exported from '../hooks'`  
**Why**: Hook imported but not implemented  
**Fix**: Create `src/hooks/useAppointments.ts` (Priority 1)  
**Time to Fix**: 5 minutes  
**Verification**: 
```bash
npm run dev
# Navigate to /dashboard
# Should see dashboard with "Citas Pend." KPI showing appointment count
```

---

### Issue #2: Component Import Pattern Inconsistent 🟡
**Current State**: PARTIALLY BROKEN  
**Impact**: 
- Violates Atomic Design pattern
- Makes refactoring harder
- IDE can't provide consistent intellisense
- Future import standardization will break existing code
**Why**: No organisms/index.ts exists; molecules/index.ts incomplete  
**Fix**: Create index.ts files and update all imports (Priority 2)  
**Time to Fix**: 15-20 minutes  
**Verification**: 
```bash
npm run lint
# Should show no import issues
```

---

### Issue #3: Type Safety Compromised 🟡
**Current State**: FUNCTIONING but RISKY  
**Impact**:
- Refactoring can introduce subtle bugs
- TypeScript not catching type mismatches at compile time
- Team members bypass type checking with casts
**Why**: 21+ instances of `any` types in api.ts and hooks  
**Fix**: Create proper interfaces and replace all `any` (Priority 3)  
**Time to Fix**: 30-45 minutes  
**Verification**:
```bash
npm run build
# Should show no TypeScript errors
# No implicit 'any' errors
```

---

### Issue #4: Mock Data Violates Requirements 🟡
**Current State**: PARTIALLY BROKEN  
**Impact**:
- Billing page only works for 3 hardcoded patients
- Not using Supabase API as intended
- Violates requirement: "NO MOCK DATA"
**Why**: Copy-paste development without full API integration  
**Fix**: Replace MOCK_TREATMENTS with API calls (Priority 4)  
**Time to Fix**: 10-15 minutes per page  
**Verification**:
```bash
# In Billing page, select a patient with ID > 3
# Should still work and fetch real data from API
```

---

### Issue #5: Module-Level Variable Persists 🟡
**Current State**: POTENTIAL BUG  
**Impact**:
- invoiceCounter can become stale across component re-mounts
- Memory leak potential
- Improper React pattern
**Why**: Using `let` at module scope instead of component state  
**Fix**: Move to component state or context (Priority 3)  
**Time to Fix**: 5 minutes  
**Verification**:
```bash
# Unmount and remount Billing component
# invoiceCounter should reset properly
```

---

## SUMMARY & ACTION ITEMS

### Must Do Before Deploy
- [x] Create useAppointments hook
- [x] Create organisms/index.ts
- [x] Update molecules/index.ts
- [x] Fix all component imports to use barrel files
- [x] Replace `any` types in services/api.ts

### Should Do Before Deploy
- [x] Remove unused icon imports
- [x] Move invoiceCounter to component state
- [x] Replace MOCK_TREATMENTS with API calls
- [x] Add proper type annotations to all functions

### Nice to Do (Code Quality)
- [ ] Extract calculateAge to utils
- [ ] Remove searchPatients if unused
- [ ] Create centralized error types
- [ ] Add error boundary components

### Estimated Total Fix Time
- **Critical (Dashboard)**: 5 minutes
- **High (Component exports)**: 20 minutes  
- **Medium (Types & cleanup)**: 45 minutes
- **Low (Quality improvements)**: 30 minutes
- **Total**: ~100 minutes (2 hours)

---

## APPENDIX: FILE DEPENDENCY MAP

```
Dashboard.tsx
├── imports: usePatients, useAppointments ← MISSING
├── imports: PageHeader, SectionHeader from molecules ✓
└── renders: KPI cards with patient/appointment stats

Billing.tsx
├── imports: patientsAPI, notificationsAPI ✓
├── imports: generateInvoicePDF from utils ✓
├── MOCK_TREATMENTS ← SHOULD BE API CALL
├── uses: invoiceCounter (module-level) ← SHOULD BE STATE
└── unused: Package icon ✗

Appointments.tsx
├── imports: patientsAPI, appointmentsAPI ✓
├── imports: DaySummarySidebar, AppointmentGridItem, AppointmentModal ✓
├── TREATMENT_TYPES (hardcoded) → Can stay if fixed enum
└── unused: Activity icon ✗

ClinicalHistory.tsx
├── imports: Odontogram, OrthodonticGallery ✓
├── imports: PageHeader, SectionHeader ✓
└── unused: Activity icon ✗

Components Index Files
├── atoms/index.ts ✅ Complete
├── molecules/index.ts ⚠️ Incomplete (missing PageHeader, SectionHeader, Tooth)
└── organisms/index.ts ❌ Missing entirely
```

---

## QUICK REFERENCE: Issues Checklist

- [ ] useAppointments hook exists and exported
- [ ] organisms/index.ts created with all exports
- [ ] molecules/index.ts complete with PageHeader, SectionHeader
- [ ] All component imports use barrel files
- [ ] Unused icon imports removed (Activity, Package)
- [ ] All `any` types replaced with interfaces
- [ ] MOCK_TREATMENTS replaced with API calls
- [ ] invoiceCounter moved to component state
- [ ] Form data properly typed
- [ ] All TypeScript errors resolved
- [ ] npm run build passes without errors
- [ ] Dashboard loads and displays data
- [ ] Billing page works for all patients
- [ ] Appointments page loads correctly

