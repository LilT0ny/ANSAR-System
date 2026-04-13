import jsPDF from 'jspdf';

const generateFormPDF = (patient, clinicalData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const primaryColor = [140, 198, 62];
    const textColor = [55, 55, 60];
    const grayColor = [109, 110, 114];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...textColor);
    doc.text('FORMULARIO DE ANTECEDENTES', pageWidth / 2, 18, { align: 'center' });

    y = 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, y, { align: 'center' });

    y += 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.text('Datos del Paciente:', 15, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${patient.first_name} ${patient.last_name}`, 15, y);
    y += 6;
    doc.text(`Documento: ${patient.document_id || 'N/A'}`, 15, y);
    y += 6;
    doc.text(`Teléfono: ${patient.phone || 'N/A'}`, 15, y);
    y += 6;
    doc.text(`Email: ${patient.email || 'N/A'}`, 15, y);

    y += 15;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('ANTECEDENTES PATOLÓGICOS', 15, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    const pathologicalFields = [
        { label: 'Hipertensión Arterial', key: 'hipertension' },
        { label: 'Enfermedad Cardíaca', key: 'enfermedad_cardiaca', detail: 'enfermedad_cardiaca_cual' },
        { label: 'Diabetes', key: 'diabetes' },
        { label: 'Hemorragias', kind: 'hemorragias' },
        { label: 'Alergias', key: 'alergico', detail: 'alergico_cual' },
        { label: 'Portador de VIH', key: 'vih' },
        { label: 'Embarazo', key: 'embarazada', detail: 'embarazada_semanas' },
        { label: 'Medicamentos en uso', key: 'medicamentos_en_uso', detail: 'medicamentos_cual' },
        { label: 'Otras enfermedades', key: 'otras_enfermedades', detail: 'otras_enfermedades_cual' },
    ];

    pathologicalFields.forEach(({ label, key, detail }) => {
        const value = clinicalData?.[key] ? 'Sí' : 'No';
        doc.text(`[  ${value}  ]  ${label}`, 15, y);
        
        if (detail && clinicalData?.[key] && clinicalData?.[detail]) {
            doc.setFont('helvetica', 'italic');
            doc.text(`(${clinicalData[detail]})`, 110, y);
            doc.setFont('helvetica', 'normal');
        }
        y += 8;
    });

    y += 5;
    doc.text('Antecedentes Familiares:', 15, y);
    y += 6;
    doc.rect(15, y, 175, 20);
    y += 25;

    doc.setDrawColor(...primaryColor);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('ANTECEDENTES ESTOMATOLÓGICOS', 15, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    const stomatologicalFields = [
        { label: 'Golpes en cara o dientes', key: 'golpes_cara_dientes' },
        { label: 'Úlceras bucales', key: 'ulceras_bucales' },
        { label: 'Sangrado de encías', key: 'sangrado_encias' },
    ];

    stomatologicalFields.forEach(({ label, key }) => {
        const value = clinicalData?.[key] ? 'Sí' : 'No';
        doc.text(`[  ${value}  ]  ${label}`, 15, y);
        y += 8;
    });

    y += 5;
    doc.text('Frecuencia de cepillado:', 15, y);
    doc.rect(75, y - 4, 30, 8);
    y += 15;
    doc.text('Última visita al odontólogo:', 15, y);
    doc.rect(85, y - 4, 105, 8);
    y += 20;

    doc.setDrawColor(...primaryColor);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('OBSERVACIONES', 15, y);
    y += 6;
    doc.rect(15, y, 175, 40);
    y += 50;

    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Firma del Paciente:', 15, y);
    doc.rect(15, y + 2, 80, 25);
    doc.text('Firma del Odontólogo:', 110, y);
    doc.rect(110, y + 2, 80, 25);

    y += 35;
    doc.setFillColor(...primaryColor);
    doc.rect(0, 285, 210, 12, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Documento generado automáticamente por MedicCore', pageWidth / 2, 291, { align: 'center' });

    const fileName = `Formulario_${patient.last_name}_${patient.first_name}.pdf`;
    doc.save(fileName);
};

export default generateFormPDF;
