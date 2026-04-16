# Crear tabla service_histories en Supabase

## 🚀 Instrucciones Rápidas

1. Abre el dashboard de **Supabase**: https://app.supabase.com
2. Selecciona tu proyecto ANSAR
3. Ve a **SQL Editor** (en el menu izquierdo)
4. Abre una nueva query
5. Copia todo el contenido de `CREATE_SERVICE_HISTORIES_TABLE.sql`
6. Pega en el editor de SQL de Supabase
7. Haz clic en **▶ Run** o presiona `Ctrl+Enter`

## ✅ Qué hace el script

✓ Crea tabla `service_histories` con todos los campos necesarios  
✓ Agrega índices para queries rápidas (patient_id, created_at, invoice_number)  
✓ Configura Row Level Security (RLS) para proteger los datos  
✓ Crea trigger automático para `updated_at`  
✓ Valida que los números sean positivos  

## 📊 Estructura de la tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `patient_id` | UUID | Referencia al paciente |
| `invoice_number` | VARCHAR(50) | Número de factura |
| `subtotal` | DECIMAL(10,2) | Subtotal sin descuento |
| `discount` | DECIMAL(10,2) | Monto de descuento |
| `total` | DECIMAL(10,2) | Total a pagar |
| `payment_amount` | DECIMAL(10,2) | Monto pagado |
| `debt` | DECIMAL(10,2) | Deuda restante (puede ser negativo = crédito) |
| `payment_method` | VARCHAR(50) | Método de pago (Tarjeta, Efectivo, etc.) |
| `items` | JSONB | Servicios/productos facturados |
| `notes` | TEXT | Notas adicionales |
| `created_at` | TIMESTAMP | Fecha/hora de creación |
| `updated_at` | TIMESTAMP | Fecha/hora de última actualización |

## 🔒 Seguridad RLS

Las políticas de RLS garantizan que:
- Solo usuarios de la clínica pueden ver atenciones de SUS pacientes
- No se puede ver datos de otras clínicas
- Los datos se eliminan automáticamente si se elimina el paciente

## ⚠️ Importante

Si la tabla ya existe y tienes datos, el script NO la elimina gracias a `IF NOT EXISTS`.

Si necesitas hacer reset: borra la tabla manualmente desde Supabase antes de ejecutar el script.

## ✨ Después de ejecutar

La aplicación debería:
1. ✅ Guardar atenciones al confirmar pago
2. ✅ Mostrar historial en Historia Clínica del paciente
3. ✅ Sin errores en la consola del navegador
