import urllib.parse
from typing import Optional

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.persistence.models import NotificationLog
from app.core.config import get_settings

settings = get_settings()


# ─── HTML Templates ───────────────────────────────────────────────────────────

def _split_date_time(date_str: str):
    """Split a date+time string into (fecha, hora) tuple."""
    for sep in ('T', ' '):
        if sep in date_str:
            parts = date_str.split(sep, 1)
            fecha = parts[0]
            hora = parts[1][:5] if len(parts) > 1 else ""
            return fecha, hora
    return date_str, ""


def build_otp_email_html(otp_code: str) -> str:
    """Minimalist HTML email for OTP verification."""
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9f9f9; color: #333; padding: 40px; text-align: center; }}
        .card {{ background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #eee; max-width: 400px; margin: 0 auto; }}
        .otp {{ font-size: 32px; font-weight: bold; color: #8CC63E; letter-spacing: 5px; margin: 20px 0; }}
        .footer {{ font-size: 12px; color: #999; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class="card">
        <h2>Verificación de Acceso</h2>
        <p>Tu código de seguridad para ingresar a AN-SAR es:</p>
        <div class="otp">{otp_code}</div>
        <p>Este código expira en 10 minutos.</p>
        <div class="footer">Si no solicitaste este código, ignora este correo.</div>
    </div>
</body>
</html>"""


def build_patient_email_html(patient_name: str, date_str: str, reason: str) -> str:
    """HTML email sent to the patient confirming their appointment."""
    fecha, hora = _split_date_time(date_str)
    safe_title = urllib.parse.quote("Cita Odontológica: AN-SAR")
    safe_details = urllib.parse.quote(
        f"Cita reservada para {patient_name}.\nFecha: {fecha}\nHora: {hora}\nMotivo: {reason}"
    )
    gcal_link = (
        "https://calendar.google.com/calendar/render"
        f"?action=TEMPLATE&text={safe_title}&details={safe_details}"
    )
    cancel_subject = urllib.parse.quote(f"Cancelar Cita - {patient_name}")
    cancel_body = urllib.parse.quote(
        f"Hola, deseo cancelar mi cita del {fecha} a las {hora}."
    )

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirmación de Cita – Clínica Dental AN-SAR</title>
    <style>
        *, *::before, *::after {{ box-sizing: border-box; }}
        body {{
            margin: 0; padding: 0;
            background-color: #f2f2f2;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #222222;
        }}
        .wrapper {{ padding: 36px 16px 56px; }}
        .container {{
            max-width: 560px; margin: 0 auto; background: #ffffff;
            border-radius: 12px; overflow: hidden;
            border: 1px solid #e0e0e0;
        }}
        .header {{
            background: #8CC63E;
            padding: 32px 36px; text-align: center;
        }}
        .header h1 {{
            margin: 0 0 4px; font-size: 22px; font-weight: 700;
            color: #ffffff; letter-spacing: 0.2px;
        }}
        .header p {{
            margin: 0; font-size: 12px; color: rgba(255,255,255,0.88);
            text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600;
        }}
        .body {{ padding: 32px 36px 24px; }}
        .greeting {{ font-size: 16px; font-weight: 600; color: #222; margin: 0 0 4px; }}
        .subtitle {{ font-size: 14px; color: #777; margin: 0 0 24px; }}
        .info-card {{
            background: #f8fdf2; border: 1px solid #d4edbb;
            border-left: 4px solid #8CC63E;
            border-radius: 8px; padding: 20px 22px; margin-bottom: 28px;
        }}
        .info-card-title {{
            font-size: 10px; font-weight: 700; color: #8CC63E;
            letter-spacing: 1.2px; text-transform: uppercase; margin: 0 0 14px;
        }}
        .info-row {{
            display: flex; align-items: flex-start; gap: 12px;
            padding: 9px 0; border-bottom: 1px solid #e8f5d4;
        }}
        .info-row:last-child {{ border-bottom: none; }}
        .info-label {{
            font-size: 11px; font-weight: 700; color: #999;
            text-transform: uppercase; letter-spacing: 0.7px;
            width: 60px; flex-shrink: 0; padding-top: 1px;
        }}
        .info-value {{ font-size: 14px; font-weight: 600; color: #2a5c0a; }}
        .actions {{ text-align: center; margin-top: 24px; }}
        .btn {{
            display: inline-block;
            text-decoration: none !important;
            padding: 14px 4px;
            border-radius: 6px;
            font-family: inherit;
            font-weight: 700;
            font-size: 11px;
            text-align: center;
            color: #ffffff !important;
            border: none;
            width: 150px;
            height: 48px;
            line-height: 20px;
        }}
        .btn-gcal  {{ background-color: #8CC63E; }}
        .btn-reschedule {{ background-color: #6b7280; }}
        .btn-cancel {{ background-color: #f87171; }}
        .divider {{ height: 1px; background: #f0f0f0; margin: 28px 0 0; }}
        .footer {{ padding: 18px 36px; text-align: center; }}
        .footer p {{ margin: 4px 0; font-size: 11px; color: #b0b0b0; line-height: 1.7; }}
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Clínica Dental AN-SAR</h1>
                <p>Confirmación de Cita</p>
            </div>
            <div class="body">
                <p class="greeting">Hola, <strong>{patient_name}</strong></p>
                <p class="subtitle">Tu cita ha sido reservada exitosamente.</p>
                <div class="info-card">
                    <p class="info-card-title">Detalles de tu cita</p>
                    <div class="info-row">
                        <span class="info-label">Fecha</span>
                        <span class="info-value">{fecha}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Hora</span>
                        <span class="info-value">{hora}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Motivo</span>
                        <span class="info-value">{reason}</span>
                    </div>
                </div>
                <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                    <tr>
                        <td align="center" width="33%">
                            <a href="{gcal_link}" class="btn btn-gcal" target="_blank">Añadir a Google Calendar</a>
                        </td>
                        <td align="center" width="33%">
                            <a href="http://localhost:3000/reservar" class="btn btn-reschedule">Reprogramar mi cita</a>
                        </td>
                        <td align="center" width="34%">
                            <a href="mailto:contacto@clinicaansar.com?subject={cancel_subject}&body={cancel_body}" class="btn btn-cancel">Cancelar mi cita</a>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="divider"></div>
            <div class="footer">
                <p>¿Tienes dudas? Escríbenos a <a href="mailto:contacto@clinicaansar.com" style="color:#8CC63E;text-decoration:none;">contacto@clinicaansar.com</a></p>
                <p>© 2026 Clínica Dental AN-SAR · Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>"""


def build_doctor_email_html(patient_name: str, patient_email: str, date_str: str, reason: str) -> str:
    """HTML email sent to the doctor notifying a new appointment."""
    fecha, hora = _split_date_time(date_str)
    safe_title = urllib.parse.quote(f"Cita: {patient_name} - {reason}")
    safe_details = urllib.parse.quote(
        f"Paciente: {patient_name}\nEmail: {patient_email}\nFecha: {fecha}\nHora: {hora}\nMotivo: {reason}"
    )
    gcal_link = (
        "https://calendar.google.com/calendar/render"
        f"?action=TEMPLATE&text={safe_title}&details={safe_details}"
    )

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nueva Cita Programada – AN-SAR</title>
    <style>
        *, *::before, *::after {{ box-sizing: border-box; }}
        body {{
            margin: 0; padding: 0;
            background-color: #f2f2f2;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #222222;
        }}
        .wrapper {{ padding: 36px 16px 56px; }}
        .container {{
            max-width: 560px; margin: 0 auto; background: #ffffff;
            border-radius: 12px; overflow: hidden;
            border: 1px solid #e0e0e0;
        }}
        .header {{
            background: #8CC63E;
            padding: 32px 36px; text-align: center;
        }}
        .header h1 {{
            margin: 0 0 4px; font-size: 22px; font-weight: 700;
            color: #ffffff; letter-spacing: 0.2px;
        }}
        .header p {{
            margin: 0; font-size: 12px; color: rgba(255,255,255,0.88);
            text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600;
        }}
        .body {{ padding: 32px 36px 24px; }}
        .greeting {{ font-size: 16px; font-weight: 600; color: #222; margin: 0 0 4px; }}
        .subtitle {{ font-size: 14px; color: #777; margin: 0 0 24px; }}
        .info-card {{
            background: #f8fdf2; border: 1px solid #d4edbb;
            border-left: 4px solid #8CC63E;
            border-radius: 8px; padding: 20px 22px; margin-bottom: 28px;
        }}
        .info-card-title {{
            font-size: 10px; font-weight: 700; color: #8CC63E;
            letter-spacing: 1.2px; text-transform: uppercase; margin: 0 0 14px;
        }}
        .info-row {{
            display: flex; align-items: flex-start; gap: 12px;
            padding: 9px 0; border-bottom: 1px solid #e8f5d4;
        }}
        .info-row:last-child {{ border-bottom: none; }}
        .info-label {{
            font-size: 11px; font-weight: 700; color: #999;
            text-transform: uppercase; letter-spacing: 0.7px;
            width: 70px; flex-shrink: 0; padding-top: 1px;
        }}
        .info-value {{ font-size: 14px; font-weight: 600; color: #2a5c0a; }}
        .actions {{ text-align: center; margin-top: 24px; }}
        .btn {{
            display: inline-block;
            text-decoration: none !important;
            padding: 14px 4px;
            border-radius: 6px;
            font-family: inherit;
            font-weight: 700;
            font-size: 11px;
            text-align: center;
            color: #ffffff !important;
            border: none;
            width: 150px;
            height: 48px;
            line-height: 20px;
        }}
        .btn-gcal  {{ background-color: #8CC63E; }}
        .btn-portal {{ background-color: #6b7280; }}
        .divider {{ height: 1px; background: #f0f0f0; margin: 28px 0 0; }}
        .footer {{ padding: 18px 36px; text-align: center; }}
        .footer p {{ margin: 4px 0; font-size: 11px; color: #b0b0b0; line-height: 1.7; }}
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Clínica Dental AN-SAR</h1>
                <p>Nueva Cita Programada</p>
            </div>
            <div class="body">
                <p class="greeting">Hola, Doctor</p>
                <p class="subtitle">Se ha registrado una nueva cita en el sistema.</p>
                <div class="info-card">
                    <p class="info-card-title">Datos de la cita</p>
                    <div class="info-row">
                        <span class="info-label">Paciente</span>
                        <span class="info-value">{patient_name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email</span>
                        <span class="info-value">{patient_email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Fecha</span>
                        <span class="info-value">{fecha}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Hora</span>
                        <span class="info-value">{hora}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Motivo</span>
                        <span class="info-value">{reason}</span>
                    </div>
                </div>
                <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                    <tr>
                        <td align="center" width="50%">
                            <a href="{gcal_link}" class="btn btn-gcal" target="_blank">Añadir a Google Calendar</a>
                        </td>
                        <td align="center" width="50%">
                            <a href="http://localhost:3000/citas" class="btn btn-portal">Abrir Sistema de Citas</a>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="divider"></div>
            <div class="footer">
                <p>Mensaje generado automáticamente por el sistema AN-SAR.</p>
                <p>© 2026 Clínica Dental AN-SAR · Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>"""


async def send_email(
    db: AsyncSession,
    to: str,
    subject: str,
    body: str,
    html: Optional[str] = None,
    appointment_id: Optional[int] = None,
    patient_id: Optional[int] = None,
) -> NotificationLog:
    """Send an email and log the result to the database."""
    log = NotificationLog(
        appointment_id=appointment_id,
        patient_id=patient_id,
        recipient_email=to,
        notification_type="EMAIL",
        status="PENDING",
        subject=subject,
        message_content=body,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)

    if settings.USE_CONSOLE_EMAIL:
        print("\n" + "=" * 60)
        print("EMAIL (Console Mode)")
        print(f"   To:      {to}")
        print(f"   Subject: {subject}")
        print(f"   Body:    {body[:200]}...")
        print("=" * 60 + "\n")
        log.status = "SENT"
        await db.commit()
        return log

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to
        msg["Subject"] = subject

        msg.attach(MIMEText(body, "plain"))
        if html:
            msg.attach(MIMEText(html, "html"))

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )

        log.status = "SENT"
        await db.commit()
        print(f"✅ Email sent to {to}")

    except Exception as e:
        log.status = "FAILED"
        log.error_detail = str(e)
        await db.commit()
        print(f"❌ Email failed to {to}: {e}")

    return log