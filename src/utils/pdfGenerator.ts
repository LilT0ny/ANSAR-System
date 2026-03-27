import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PAYMENT_METHODS = [
    { id: 'cash', label: 'Efectivo' },
    { id: 'transfer', label: 'Transferencia' },
    { id: 'card', label: 'Tarjeta' },
];

export const generateInvoicePDF = (invoiceData) => {
    const {
        patient,
        invoiceNumber,
        items,
        subtotal,
        globalDiscount,
        taxAmount,
        taxRate,
        total,
        paymentMethod,
        date,
        status // 'Pagado' or 'Debiendo'
    } = invoiceData;

    const doc = new jsPDF();
    const formattedDate = new Date(date).toLocaleDateString('es-ES');
    const paymentLabel = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label || 'Desconocido';

    // Brand bar
    doc.setFillColor(140, 198, 62); // #8CC63E
    doc.rect(0, 0, 210, 8, 'F');

    // Logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(55, 55, 60);
    doc.text('AN-SAR', 20, 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(109, 110, 114);
    doc.text('Clínica Odontológica Integral', 20, 31);

    // Invoice info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(140, 198, 62);
    doc.text('FACTURA', 150, 20);
    doc.setTextColor(55, 55, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Nro: ${invoiceNumber}`, 150, 27);
    doc.text(`Fecha: ${formattedDate}`, 150, 33);
    doc.text(`Método: ${paymentLabel}`, 150, 39);

    // Payment Status Badge in PDF
    const statusColor = status === 'Pagado' ? [34, 197, 94] : [239, 68, 68]; // Green or Red
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estado: ${status?.toUpperCase() || 'PAGADO'}`, 150, 45);

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 49, 190, 49);

    // Patient info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 55, 60);
    doc.text('DATOS DEL PACIENTE', 20, 58);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(109, 110, 114);
    doc.text(`Nombre: ${patient.firstName} ${patient.lastName}`, 20, 65);
    doc.text(`Cédula: ${patient.docId}`, 20, 71);
    doc.text(`Email: ${patient.email || 'N/A'}`, 110, 65);
    doc.text(`Teléfono: ${patient.phone || 'N/A'}`, 110, 71);

    // Items table
    const tableBody = items.map((item, idx) => [
        idx + 1,
        item.description,
        item.qty,
        `$${item.price.toFixed(2)}`,
        `$${(item.price * item.qty).toFixed(2)}`,
    ]);

    doc.autoTable({
        startY: 81,
        head: [['#', 'Descripción', 'Cant.', 'Precio Unit.', 'Total']],
        body: tableBody,
        styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [55, 55, 60],
            lineColor: [229, 231, 235],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [249, 250, 251],
            textColor: [55, 55, 60],
            fontStyle: 'bold',
            lineColor: [229, 231, 235],
        },
        alternateRowStyles: { fillColor: [252, 252, 253] },
        margin: { left: 20, right: 20 },
    });

    // Summary section
    const finalY = doc.lastAutoTable.finalY + 10;
    const summaryX = 130;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(109, 110, 114);
    doc.text('Subtotal:', summaryX, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, 180, finalY, { align: 'right' });

    doc.text('Descuento:', summaryX, finalY + 7);
    doc.text(`-$${globalDiscount.toFixed(2)}`, 180, finalY + 7, { align: 'right' });

    doc.text(`IVA (${taxRate}%):`, summaryX, finalY + 14);
    doc.text(`$${taxAmount.toFixed(2)}`, 180, finalY + 14, { align: 'right' });

    doc.setDrawColor(140, 198, 62);
    doc.setLineWidth(0.5);
    doc.line(summaryX, finalY + 18, 190, finalY + 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(55, 55, 60);
    doc.text('TOTAL:', summaryX, finalY + 26);
    doc.setTextColor(140, 198, 62);
    doc.text(`$${total.toFixed(2)}`, 180, finalY + 26, { align: 'right' });

    // Footer
    const footerY = 275;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(170, 170, 170);
    doc.text('AN-SAR Clínica Odontológica · Generado automáticamente · Este documento es un comprobante de servicio.', 105, footerY, { align: 'center' });

    // Brand bar bottom
    doc.setFillColor(140, 198, 62);
    doc.rect(0, 289, 210, 8, 'F');

    doc.save(`Factura_${patient.lastName}_${invoiceNumber}.pdf`);
};
