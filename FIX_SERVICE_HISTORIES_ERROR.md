# 🚨 Solución: Crear tabla service_histories en Supabase

## El Problema
La aplicación no puede guardar ni mostrar el historial de atenciones porque la tabla `service_histories` no existe en tu base de datos Supabase.

**Error:**
```
Could not find the table 'public.service_histories' in the schema cache
```

## ✅ La Solución (5 minutos)

### Paso 1: Abre el Dashboard de Supabase
- Ve a: https://app.supabase.com
- Selecciona tu proyecto ANSAR

### Paso 2: SQL Editor
- En el menú izquierdo, busca **SQL Editor** (o **Queries**)
- Haz clic en **"New Query"**

### Paso 3: Copia el script
- Abre el archivo `CREATE_SERVICE_HISTORIES_TABLE.sql` de este proyecto
- Copia TODO el contenido

### Paso 4: Ejecuta en Supabase
- Pega el contenido en el editor de SQL de Supabase
- Haz clic en el botón **▶ Run** (o presiona Ctrl+Enter)
- Espera a que aparezca ✅ "Query executed successfully"

### Paso 5: Listo ✨
- Cierra la tab de Supabase
- Recarga tu navegador (F5)
- Ya no deberías ver errores en la consola

## 📋 Qué crea el script

✅ Tabla `service_histories` con estos campos:
   - `id` — Identificador único
   - `patient_id` — Enlace al paciente
   - `invoice_number` — Número de factura
   - `subtotal`, `discount`, `total` — Montos
   - `payment_amount`, `debt` — Pagado y deuda
   - `payment_method` — Cómo pagó (Tarjeta/Efectivo)
   - `items` — Servicios/productos (JSON)
   - `created_at`, `updated_at` — Fechas automáticas

✅ Índices para queries rápidas

✅ Seguridad RLS — Solo ves datos de TU clínica

✅ Trigger automático — `updated_at` se actualiza solo

## 🔍 Verificación

Después de ejecutar, puedes verificar que la tabla existe:

1. En Supabase, ve a **Table Editor**
2. Deberías ver `service_histories` en la lista

O visualmente en la app:

1. Ve a un paciente (Historia Clínica)
2. Busca la sección "Historial de Atenciones"
3. Si está vacía pero NO hay errores en consola → ¡Funcionando! ✅

## ⚠️ Si algo sale mal

**Error: "Role postgres does not have permissions..."**
- Supabase a veces falla en un intento. Intenta de nuevo.

**Error: "table already exists"**
- La tabla ya existe (bueno), pero algo en el código no coincide.
- En Supabase, ve a **Table Editor** → `service_histories`
- Verifica que tenga todos estos campos:
  - patient_id, invoice_number, subtotal, discount, total
  - payment_amount, debt, payment_method, items
  - created_at, updated_at

**Sigue sin funcionar:**
- Escribe exactamente qué error ves en Supabase
- Podemos eliminar la tabla y recrearla desde cero

## 📞 Próximos pasos

Una vez que la tabla exista:

1. **Confirma un pago** en la sección Billing
2. **Abre Historia Clínica** de ese paciente
3. Deberías ver el registro en "Historial de Atenciones"
4. ✨ Todo debería funcionar sin errores

¡Adelante! 🚀
