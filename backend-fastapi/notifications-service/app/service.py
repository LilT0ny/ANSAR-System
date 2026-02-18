import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import NotificationLog
from app.config import get_settings

settings = get_settings()


async def send_email(db: AsyncSession, to: str, subject: str, body: str, html: str = None,
                     appointment_id: int = None, patient_id: int = None):
    """Send an email and log the result."""
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
        # Local development: print to console instead of sending
        print("\n" + "=" * 60)
        print(f"📧 EMAIL (Console Mode)")
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
        return log

    except Exception as e:
        log.status = "FAILED"
        log.error_detail = str(e)
        await db.commit()
        print(f"❌ Email failed to {to}: {e}")
        return log


def build_appointment_email_html(patient_name: str, date_str: str, reason: str) -> str:
    """Generate a beautiful HTML email for appointment confirmation."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }}
            .container {{ max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #8CC63E, #6aad2d); padding: 30px; text-align: center; color: white; }}
            .header h1 {{ margin: 0; font-size: 24px; }}
            .header p {{ margin: 5px 0 0; opacity: 0.8; font-size: 14px; }}
            .body {{ padding: 30px; }}
            .info-card {{ background: #f8fdf3; border: 1px solid #d4edbb; border-radius: 12px; padding: 20px; margin: 20px 0; }}
            .info-card p {{ margin: 5px 0; color: #333; }}
            .info-card .label {{ font-size: 12px; color: #999; text-transform: uppercase; font-weight: bold; }}
            .info-card .value {{ font-size: 18px; color: #2d5a0e; font-weight: bold; }}
            .footer {{ background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Clínica Dental AN-SAR</h1>
                <p>Confirmación de Cita</p>
            </div>
            <div class="body">
                <p>Hola <strong>{patient_name}</strong>,</p>
                <p>Tu cita ha sido reservada exitosamente.</p>
                <div class="info-card">
                    <p class="label">Fecha y Hora</p>
                    <p class="value">{date_str}</p>
                    <p class="label" style="margin-top: 15px;">Motivo</p>
                    <p class="value">{reason}</p>
                </div>
                <p>Si necesitas cancelar o reprogramar, contáctanos con anticipación.</p>
                <p>¡Te esperamos!</p>
            </div>
            <div class="footer">
                <p>© 2026 Clínica Dental AN-SAR. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
