import jsPDF from 'jspdf';

const generateCertificatePDF = (patient, certificateType = 'treatment') => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const primaryColor = [140, 198, 62];
    const textColor = [55, 55, 60];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('CERTIFICADO MÉDICO', pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.text('MedicCore - Sistema de Gestión Odontológica', pageWidth / 2, 25, { align: 'center' });

    const centerX = pageWidth / 2;
    let y = 50;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    
    const certificateTitles = {
        treatment: 'CERTIFICADO DE TRATAMIENTO',
        health: 'CERTIFICADO DE SALUD BUCAL',
        attendance: 'CERTIFICADO DE ASISTENCIA'
    };
    
    doc.text(certificateTitles[certificateType] || 'CERTIFICADO MÉDICO', centerX, y, { align: 'center' });

    y += 15;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(centerX - 50, y, centerX + 50, y);

    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    
    const today = new Date().toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });

    doc.text(`Por medio de la presente, se certifica que:`, centerX, y, { align: 'center' });

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${patient.first_name} ${patient.last_name}`, centerX, y, { align: 'center' });

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Identificación: ${patient.document_id || 'N/A'}`, centerX, y, { align: 'center' });

    y += 20;
    doc.text(`En fecha ${today}, el paciente mencionado`, centerX, y, { align: 'center' });
    y += 8;
    
    const certificateText = {
        treatment: 'recibió tratamiento odontológico en nuestra clínica.',
        health: 'presenta buen estado de salud bucal en el momento del examen.',
        attendance: 'asistió a su cita programada en nuestra clínica.'
    };
    
    doc.text(certificateText[certificateType] || 'fue atendido en nuestra clínica.', centerX, y, { align: 'center' });

    y += 25;
    doc.text('Este certificado se expide a solicitud del interesado', centerX, y, { align: 'center' });
    doc.text('para los fines que considere pertinentes.', centerX, y + 6, { align: 'center' });

    y += 30;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(centerX - 40, y, centerX + 40, y);

    y += 8;
    doc.setFontSize(10);
    doc.text('Firma y Sello del Odontólogo', centerX, y, { align: 'center' });

    y += 20;
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 20, 210, 20, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Documento generado automáticamente por MedicCore - ${today}`, centerX, pageHeight - 10, { align: 'center' });

    const fileName = `Certificado_${certificateType}_${patient.last_name}.pdf`;
    doc.save(fileName);
};

export default generateCertificatePDF;
