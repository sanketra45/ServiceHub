package com.servicehub.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.servicehub.model.Booking;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    public byte[] generateBookingReceipt(Booking booking) throws Exception {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24);
            Paragraph title = new Paragraph("ServiceHub Receipt", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Receipt Info
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            Paragraph bookingId = new Paragraph("Booking ID: #" + booking.getId(), normalFont);
            Paragraph status = new Paragraph("Status: " + booking.getStatus().name(), normalFont);
            Paragraph date = new Paragraph("Date: " + booking.getBookingDate().toString() + " at " + booking.getTimeSlot(), normalFont);
            
            document.add(bookingId);
            document.add(status);
            document.add(date);
            document.add(new Paragraph(" "));

            // Provider Info
            document.add(new Paragraph("Provider Information", boldFont));
            document.add(new Paragraph("Name: " + booking.getProvider().getUser().getName(), normalFont));
            document.add(new Paragraph("Service: " + booking.getServiceType(), normalFont));
            document.add(new Paragraph(" "));

            // Customer Info
            document.add(new Paragraph("Customer Information", boldFont));
            document.add(new Paragraph("Name: " + booking.getCustomer().getName(), normalFont));
            document.add(new Paragraph("Address: " + booking.getAddress(), normalFont));
            document.add(new Paragraph(" "));

            // Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            PdfPCell cell1 = new PdfPCell(new Phrase("Description", boldFont));
            PdfPCell cell2 = new PdfPCell(new Phrase("Amount", boldFont));
            cell1.setPadding(10);
            cell2.setPadding(10);
            table.addCell(cell1);
            table.addCell(cell2);

            table.addCell(new Phrase(booking.getServiceType() + " Service", normalFont));
            table.addCell(new Phrase("Rs. " + booking.getTotalAmount(), normalFont));

            document.add(table);

            // Total
            Paragraph total = new Paragraph("Total Paid: Rs. " + booking.getTotalAmount(), boldFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            document.close();
            return out.toByteArray();
        }
    }
}
