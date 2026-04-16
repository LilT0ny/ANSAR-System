# QUICK FIX CHECKLIST - ANSAR System

**Time to Complete**: ~2 hours  
**Difficulty**: Medium  
**Risk Level**: Low (all changes are non-breaking)

---

## ⚡ CRITICAL FIX (Do First)

### [ ] Create src/hooks/useAppointments.ts
- Copy template from IMPLEMENTATION_GUIDE.md Phase 1, Task 1.1
- Export from src/hooks/index.ts
- **Verify**: Dashboard loads without errors

---

## 🔧 HIGH PRIORITY FIXES (30 min)

### [ ] Create src/components/organisms/index.ts
- Copy template from IMPLEMENTATION_GUIDE.md Phase 2, Task 2.1
- **Verify**: npm run lint shows no errors

### [ ] Update src/components/molecules/index.ts
- Add PageHeader, SectionHeader, Tooth exports
- See Phase 2, Task 2.2

### [ ] Fix imports in 7 files (15 min total)
- [ ] src/pages/Dashboard.tsx - use barrel imports for molecules
- [ ] src/pages/Billing.tsx - use barrel imports for molecules
- [ ] src/pages/Appointments.tsx - use barrel imports for molecules & organisms
- [ ] src/pages/ClinicalHistory.tsx - use barrel imports for molecules & organisms
- [ ] src/pages/Settings.tsx - use barrel imports for molecules
- [ ] src/pages/Patients.tsx - use barrel imports for molecules
- [ ] src/layouts/AdminLayout.tsx - use barrel import for Sidebar

---

## 🧹 CLEANUP (15 min)

### [ ] Remove unused icon imports (5 min)
- Remove `Activity` from: Appointments.tsx, Dashboard.tsx, ClinicalHistory.tsx (3 files)
- Remove `Package` from: Billing.tsx (1 file)

### [ ] Fix TypeScript 'any' errors (10 min)
- Replace 'any' types in src/services/api.ts with proper interfaces
- Fix catch blocks in usePatients.ts and useInvoices.ts
- Add types to form data in Billing.tsx, ClinicalHistory.tsx, Patients.tsx

---

## 🧪 CODE QUALITY (20 min)

### [ ] Move invoiceCounter to state
- src/pages/Billing.tsx - Move module-level var to useState
- Create generateNextInvoiceNumber() function

### [ ] Replace MOCK_TREATMENTS with API call
- Remove hardcoded mock data
- Add useEffect to fetch from patientsAPI.getHistory()
- Update render to use fetched data

### [ ] Remove unused searchPatients function
- Delete from usePatients.ts if not used

---

## ✅ VERIFICATION

After each section, run:

```bash
# After Critical Fix
npm run dev
# Navigate to /dashboard - should load without errors

# After High Priority
npm run lint
# Should show no import errors

# After Cleanup
npm run build
# Should complete without TypeScript errors

# After Quality
npm run dev
# Test all pages:
# - /dashboard (shows data)
# - /facturacion (works with any patient)
# - /citas (shows appointments)
# - /historia (loads history)
```

---

## 📋 FILES TO MODIFY

```
CREATE (2 files):
- src/hooks/useAppointments.ts
- src/components/organisms/index.ts

MODIFY (9 files):
- src/hooks/index.ts
- src/components/molecules/index.ts
- src/pages/Dashboard.tsx
- src/pages/Billing.tsx
- src/pages/Appointments.tsx
- src/pages/ClinicalHistory.tsx
- src/pages/Settings.tsx
- src/pages/Patients.tsx
- src/layouts/AdminLayout.tsx
- src/services/api.ts (fix 'any' types)
- src/hooks/usePatients.ts (fix error types)
- src/hooks/useInvoices.ts (fix error types)
```

---

## 🚀 ROLLBACK PLAN

If something breaks:
```bash
# Revert all changes
git checkout .

# Or revert specific file
git checkout src/pages/Dashboard.tsx

# Then restart from beginning
```

---

## 💡 KEY POINTS

1. **Order matters** - Do Critical Fix first
2. **Test after each phase** - Don't wait until end
3. **Use barrel files** - All imports through index.ts
4. **Type everything** - No `any` types allowed
5. **Remove mock data** - Use API calls instead

---

## 🎯 SUCCESS INDICATORS

When you're done:
- ✅ `npm run build` completes with zero errors
- ✅ Dashboard displays appointment count
- ✅ Billing works for all patients
- ✅ No console warnings or errors
- ✅ All pages load correctly
- ✅ Can navigate between all routes

---

## 📞 HELP REFERENCE

| Problem | Solution |
|---------|----------|
| Build fails | See npm output for specific error, check IMPLEMENTATION_GUIDE.md |
| Dashboard crashes | Verify useAppointments.ts created and exported |
| Import errors | Verify index.ts files created and exports match |
| Type errors | Replace 'any' with proper types from types/index.ts |
| MOCK data still showing | Verify API call added to useEffect |

---

**Status**: Ready to implement  
**Last Updated**: 2025-01-29  
**Full Details**: See AUDIT_REPORT.md and IMPLEMENTATION_GUIDE.md
