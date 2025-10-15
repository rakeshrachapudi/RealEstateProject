package com.example.realestate.service;

import com.example.realestate.model.Property;
import com.example.realestate.model.User;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    public byte[] generateInvoicePdf(Property property) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Constants
        BigDecimal feePercentage = new BigDecimal("0.005"); // 0.5%
        BigDecimal taxRate = new BigDecimal("0.18"); // 18% GST

        // Calculations
        BigDecimal propertyPrice = property.getPrice();
        BigDecimal fee = propertyPrice.multiply(feePercentage).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = fee.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = fee.add(tax);

        // Seller Information
        User seller = property.getUser();

        // === Document Header ===
        document.add(new Paragraph("Tax Invoice")
                .setTextAlignment(TextAlignment.CENTER)
                .setBold()
                .setFontSize(20));
        document.add(new Paragraph("ZeroBrokerageHomes")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(12));

        // === Invoice Details Table ===
        Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{1, 2, 1, 2})).useAllAvailableWidth();
        detailsTable.addCell(createCell("Invoice No:", true));
        detailsTable.addCell(createCell("INV-" + property.getId() + "-" + LocalDate.now().getYear(), false));
        detailsTable.addCell(createCell("Date:", true));
        detailsTable.addCell(createCell(LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")), false));
        document.add(detailsTable.setMarginTop(20));

        // === Billed To and From ===
        Table partyTable = new Table(UnitValue.createPercentArray(new float[]{1, 1})).useAllAvailableWidth();
        // NOTE: Buyer info is a placeholder as it's not stored in the current model.
        partyTable.addCell(createPartyCell("Billed To (Buyer)", "John Doe\n123 Buyer Lane, Hyderabad\nGSTIN: 29ABCDE1234F1Z5"));
        partyTable.addCell(createPartyCell("From (Seller)",
                seller.getFirstName() + " " + seller.getLastName() + "\n" +
                        seller.getEmail() + "\n" +
                        property.getAddress()));
        document.add(partyTable.setMarginTop(20));

        // === Line Items Table ===
        Table itemsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1, 1})).useAllAvailableWidth();
        itemsTable.addHeaderCell(createHeaderCell("Description"));
        itemsTable.addHeaderCell(createHeaderCell("Amount"));
        itemsTable.addHeaderCell(createHeaderCell("Tax (18%)"));
        itemsTable.addHeaderCell(createHeaderCell("Total"));

        itemsTable.addCell(createCell("Brokerage Fee (0.5%) for property: " + property.getTitle(), false));
        itemsTable.addCell(createCell("₹ " + fee, false).setTextAlignment(TextAlignment.RIGHT));
        itemsTable.addCell(createCell("₹ " + tax, false).setTextAlignment(TextAlignment.RIGHT));
        itemsTable.addCell(createCell("₹ " + totalAmount, false).setTextAlignment(TextAlignment.RIGHT));

        // Total Row - Corrected
        Cell totalLabelCell = createCell("Grand Total", true)
                .setBold()
                .setTextAlignment(TextAlignment.RIGHT);
        //itemsTable.addCell(totalLabelCell.setColSpan(3));

        Cell totalValueCell = createCell("₹ " + totalAmount, true)
                .setBold()
                .setTextAlignment(TextAlignment.RIGHT);
        itemsTable.addCell(totalValueCell);

        document.add(itemsTable.setMarginTop(30));

        document.close();
        return baos.toByteArray();
    }

    private Cell createCell(String text, boolean isHeader) {
        Paragraph p = new Paragraph(text);
        Cell cell = new Cell().add(p);
        if (isHeader) {
            cell.setBold();
        }
        return cell;
    }

    private Cell createHeaderCell(String text) {
        return createCell(text, true).setTextAlignment(TextAlignment.CENTER);
    }

    private Cell createPartyCell(String title, String content) {
        Cell cell = new Cell();
        cell.add(new Paragraph(title).setBold().setFontSize(10).setMarginBottom(5));
        cell.add(new Paragraph(content).setFontSize(10));
        return cell;
    }
}