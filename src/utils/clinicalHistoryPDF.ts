import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generateClinicalHistoryPDF = (patient, clinicalData, odontogramData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const primaryColor = [140, 198, 62];
    const textColor = [55, 55, 60];
    const grayColor = [109, 110, 114];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...textColor);
    doc.text('HISTORIA CLÍNICA ODONTOLÓGICA', pageWidth / 2, 18, { align: 'center' });

    y = 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, y, { align: 'center' });

    y = 35;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);

    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('DATOS DEL PACIENTE', 15, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    const patientInfo = [
        ['Nombre:', `${patient.first_name} ${patient.last_name}`],
        ['Documento:', patient.document_id || 'N/A'],
        ['Fecha de Nacimiento:', patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('es-ES') : 'N/A'],
        ['Género:', patient.gender || 'N/A'],
        ['Teléfono:', patient.phone || 'N/A'],
        ['Email:', patient.email || 'N/A'],
        ['Dirección:', patient.address || 'N/A'],
        ['Ciudad:', patient.city || 'N/A'],
    ];

    patientInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 55, y);
        y += 6;
    });

    y += 5;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.1);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('ANTECEDENTES PATOLÓGICOS', 15, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    const pathologicalFields = [
        { label: 'Hipertensión Arterial', key: 'hipertension' },
        { label: 'Enfermedad Cardíaca', key: 'enfermedad_cardiaca', detail: 'enfermedad_cardiaca_cual' },
        { label: 'Diabetes', key: 'diabetes' },
        { label: 'Hemorragias', key: 'hemorragias' },
        { label: 'Alergias', key: 'alergico', detail: 'alergico_cual' },
        { label: 'Portador de VIH', key: 'vih' },
        { label: 'Embarazo', key: 'embarazada', detail: 'embarazada_semanas' },
        { label: 'Medicamentos en uso', key: 'medicamentos_en_uso', detail: 'medicamentos_cual' },
        { label: 'Otras enfermedades', key: 'otras_enfermedades', detail: 'otras_enfermedades_cual' },
    ];

    pathologicalFields.forEach(({ label, key, detail }) => {
        const value = clinicalData?.[key] ? 'Sí' : 'No';
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}: `, 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, y);
        
        if (detail && clinicalData?.[key] && clinicalData?.[detail]) {
            doc.setFont('helvetica', 'italic');
            doc.text(`(${clinicalData[detail]})`, 85, y);
        }
        y += 6;
    });

    y += 4;
    if (clinicalData?.antecedentes_familiares) {
        doc.setFont('helvetica', 'bold');
        doc.text('Antecedentes Familiares:', 15, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(clinicalData.antecedentes_familiares, 175);
        doc.text(splitText, 15, y);
        y += splitText.length * 5;
    }

    y += 5;
    doc.setDrawColor(229, 231, 235);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('ANTECEDENTES ESTOMATOLÓGICOS', 15, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    const stomatologicalFields = [
        { label: 'Golpes en cara o dientes', key: 'golpes_cara_dientes' },
        { label: 'Úlceras bucales', key: 'ulceras_bucales' },
        { label: 'Sangrado de encías', key: 'sangrado_encias' },
        { label: 'Frecuencia de cepillado (veces/día)', key: 'cepillado_veces_dia' },
        { label: 'Última visita al odontólogo', key: 'ultima_visita_odontologo' },
    ];

    stomatologicalFields.forEach(({ label, key }) => {
        let value = clinicalData?.[key];
        if (value === undefined || value === null) value = 'No reportado';
        if (key === 'cepillado_veces_dia' && value) value = `${value} veces`;
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}: `, 15, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 85, y);
        y += 6;
    });

    if (clinicalData?.motivo_consulta) {
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Motivo de Consulta:', 15, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const splitText = doc.splitTextToSize(clinicalData.motivo_consulta, 175);
        doc.text(splitText, 15, y);
        y += splitText.length * 5;
    }

    y += 5;
    doc.setDrawColor(229, 231, 235);
    doc.line(15, y, 195, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('ODONTOGRAMA', 15, y);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    if (odontogramData && Object.keys(odontogramData).length > 0) {
        const teethSummary = [];
        const statusCounts = { todo: 0, done: 0 };

        Object.entries(odontogramData).forEach(([toothNum, data]) => {
            if (data.status && data.status !== 'healthy') {
                teethSummary.push({ tooth: toothNum, status: data.status });
                if (statusCounts[data.status] !== undefined) {
                    statusCounts[data.status]++;
                }
            }
            if (data.surfaces) {
                Object.values(data.surfaces).forEach(surfaceStatus => {
                    if (surfaceStatus && surfaceStatus !== 'healthy') {
                        if (statusCounts[surfaceStatus] !== undefined) {
                            statusCounts[surfaceStatus]++;
                        }
                    }
                });
            }
        });

        doc.text(`Resumen:`, 15, y);
        y += 6;
        
        const summaryText = `Por Hacer: ${statusCounts.todo} | Realizado: ${statusCounts.done}`;
        doc.text(summaryText, 15, y);
        y += 8;

        if (teethSummary.length > 0) {
            doc.text('Piezas con acciones:', 15, y);
            y += 6;
            
            const tableData = teethSummary.map(t => [t.tooth, t.status === 'todo' ? 'Por Hacer' : t.status === 'done' ? 'Realizado' : t.status]);
            
            doc.autoTable({
                startY: y,
                head: [['Diente', 'Estado']],
                body: tableData,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
                margin: { left: 15, right: 15 },
            });
            
            y = doc.lastAutoTable.finalY + 10;
        } else {
            doc.text('No hay registros de tratamientos en el odontograma.', 15, y);
            y += 10;
        }
    } else {
        doc.text('No hay odontograma registrado.', 15, y);
        y += 10;
    }

    y = Math.max(y, 250);
    doc.setFillColor(...primaryColor);
    doc.rect(0, 285, 210, 12, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Documento generado automáticamente por MedicCore', pageWidth / 2, 291, { align: 'center' });

    const fileName = `HistoriaClinica_${patient.last_name}_${patient.first_name}.pdf`;
    doc.save(fileName);
};

export default generateClinicalHistoryPDF;
