package com.management.supplierpo.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.management.supplierpo.model.OrderItem;
import com.management.supplierpo.model.PurchaseOrder;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGenerationService {

    public byte[] generatePurchaseOrderPdf(PurchaseOrder po) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Color Palette
            Color primaryColor = new Color(30, 64, 175); // Blue 800
            Color headerBg = new Color(241, 245, 249); // Slate 100
            Color borderColor = new Color(203, 213, 225); // Slate 300
            Color darkText = new Color(15, 23, 42); // Slate 900
            Color mutedText = new Color(100, 116, 139); // Slate 500

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryColor);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, darkText);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkText);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkText);
            Font smallMutedFont = FontFactory.getFont(FontFactory.HELVETICA, 8, mutedText);

            // 1. Top Header Table (Company Branding + PO Details)
            PdfPTable topTable = new PdfPTable(2);
            topTable.setWidthPercentage(100);
            topTable.setWidths(new float[]{60f, 40f});
            topTable.setSpacingAfter(15);

            // Left: Title & Subtitle
            PdfPCell leftHeader = new PdfPCell();
            leftHeader.setBorder(Rectangle.NO_BORDER);
            Paragraph brandTitle = new Paragraph("PURCHASE ORDER", titleFont);
            Paragraph brandSub = new Paragraph("SUPPLIER & PROCUREMENT MANAGEMENT SYSTEM", smallMutedFont);
            leftHeader.addElement(brandTitle);
            leftHeader.addElement(brandSub);
            topTable.addCell(leftHeader);

            // Right: Order Number, Date, Status
            PdfPCell rightHeader = new PdfPCell();
            rightHeader.setBorder(Rectangle.NO_BORDER);
            rightHeader.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph poNumPara = new Paragraph("PO #: " + po.getOrderNumber(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, primaryColor));
            poNumPara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(poNumPara);

            String createdDateStr = po.getCreatedAt() != null
                    ? po.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"))
                    : "N/A";
            Paragraph datePara = new Paragraph("Issued: " + createdDateStr, regularFont);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(datePara);

            Paragraph statusPara = new Paragraph("Status: " + po.getStatus().name(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryColor));
            statusPara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(statusPara);

            Paragraph currencyPara = new Paragraph("Currency: " + po.getCurrencyCode(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkText));
            currencyPara.setAlignment(Element.ALIGN_RIGHT);
            rightHeader.addElement(currencyPara);

            topTable.addCell(rightHeader);
            document.add(topTable);

            // Divider line
            document.add(new Paragraph(" "));

            // 2. Buyer & Supplier Details Table
            PdfPTable partiesTable = new PdfPTable(2);
            partiesTable.setWidthPercentage(100);
            partiesTable.setWidths(new float[]{50f, 50f});
            partiesTable.setSpacingAfter(15);

            // Buyer Card
            PdfPCell buyerCell = new PdfPCell();
            buyerCell.setBackgroundColor(headerBg);
            buyerCell.setBorderColor(borderColor);
            buyerCell.setPadding(10);
            buyerCell.addElement(new Paragraph("BUYER / REQUISITIONER", headerFont));
            buyerCell.addElement(new Paragraph(po.getBuyer().getFullName(), boldFont));
            buyerCell.addElement(new Paragraph("Email: " + po.getBuyer().getEmail(), regularFont));
            buyerCell.addElement(new Paragraph("Ship To:", boldFont));
            buyerCell.addElement(new Paragraph(po.getDeliveryAddress() != null ? po.getDeliveryAddress() : "Standard Warehouse Dock", regularFont));
            partiesTable.addCell(buyerCell);

            // Supplier Card
            PdfPCell supplierCell = new PdfPCell();
            supplierCell.setBackgroundColor(headerBg);
            supplierCell.setBorderColor(borderColor);
            supplierCell.setPadding(10);
            supplierCell.addElement(new Paragraph("VENDOR / SUPPLIER", headerFont));
            supplierCell.addElement(new Paragraph(po.getSupplier().getCompanyName(), boldFont));
            supplierCell.addElement(new Paragraph("Contact: " + po.getSupplier().getName(), regularFont));
            supplierCell.addElement(new Paragraph("Email: " + po.getSupplier().getContactEmail(), regularFont));
            supplierCell.addElement(new Paragraph("Phone: " + (po.getSupplier().getPhone() != null ? po.getSupplier().getPhone() : "N/A"), regularFont));
            supplierCell.addElement(new Paragraph("Address: " + (po.getSupplier().getAddress() != null ? po.getSupplier().getAddress() : "N/A"), regularFont));
            partiesTable.addCell(supplierCell);

            document.add(partiesTable);

            // 3. Line Items Table
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{8f, 52f, 12f, 14f, 14f});
            itemsTable.setSpacingAfter(15);

            // Table Header
            String[] headers = {"#", "Item Description", "Qty", "Unit Price (" + po.getCurrencyCode() + ")", "Subtotal (" + po.getCurrencyCode() + ")"};
            for (String h : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                headerCell.setBackgroundColor(primaryColor);
                headerCell.setPadding(6);
                headerCell.setHorizontalAlignment(h.contains("Item Description") ? Element.ALIGN_LEFT : Element.ALIGN_RIGHT);
                if (h.equals("#")) headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                itemsTable.addCell(headerCell);
            }

            int index = 1;
            for (OrderItem item : po.getItems()) {
                PdfPCell cIndex = new PdfPCell(new Phrase(String.valueOf(index++), regularFont));
                cIndex.setHorizontalAlignment(Element.ALIGN_CENTER);
                cIndex.setPadding(6);
                itemsTable.addCell(cIndex);

                PdfPCell cDesc = new PdfPCell(new Phrase(item.getItemDescription(), regularFont));
                cDesc.setPadding(6);
                itemsTable.addCell(cDesc);

                PdfPCell cQty = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), regularFont));
                cQty.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cQty.setPadding(6);
                itemsTable.addCell(cQty);

                PdfPCell cPrice = new PdfPCell(new Phrase(formatPdfCurrency(item.getUnitPrice(), po.getCurrencyCode()), regularFont));
                cPrice.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cPrice.setPadding(6);
                itemsTable.addCell(cPrice);

                PdfPCell cSub = new PdfPCell(new Phrase(formatPdfCurrency(item.getSubtotal(), po.getCurrencyCode()), regularFont));
                cSub.setHorizontalAlignment(Element.ALIGN_RIGHT);
                cSub.setPadding(6);
                itemsTable.addCell(cSub);
            }

            document.add(itemsTable);

            // 4. Totals and Summary Table
            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(45);
            totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalsTable.setSpacingAfter(20);

            addTotalRow(totalsTable, "Subtotal:", formatPdfCurrency(po.getTotalAmount(), po.getCurrencyCode()), regularFont, regularFont);
            addTotalRow(totalsTable, "Tax (8%):", formatPdfCurrency(po.getTaxAmount(), po.getCurrencyCode()), regularFont, regularFont);
            addTotalRow(totalsTable, "Grand Total:", formatPdfCurrency(po.getGrandTotal(), po.getCurrencyCode()), boldFont, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryColor));

            if ("USD".equalsIgnoreCase(po.getCurrencyCode()) && po.getExchangeRateToInr() != null) {
                java.math.BigDecimal inrEquiv = po.getGrandTotal().multiply(po.getExchangeRateToInr());
                addTotalRow(totalsTable, "Exchange Rate:", String.format("1 USD = %.2f INR", po.getExchangeRateToInr()), smallMutedFont, smallMutedFont);
                addTotalRow(totalsTable, "Est. INR Value:", String.format("INR %,.2f", inrEquiv), smallMutedFont, smallMutedFont);
            }

            document.add(totalsTable);

            // 5. Notes & Rejection (if any)
            if (po.getNotes() != null && !po.getNotes().isEmpty()) {
                Paragraph notesPara = new Paragraph("Order Notes / Instructions:\n" + po.getNotes(), regularFont);
                notesPara.setSpacingAfter(10);
                document.add(notesPara);
            }

            if (po.getRejectionReason() != null && !po.getRejectionReason().isEmpty()) {
                Paragraph rejectPara = new Paragraph("Rejection Reason:\n" + po.getRejectionReason(),
                        FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.RED));
                rejectPara.setSpacingAfter(10);
                document.add(rejectPara);
            }

            // 6. Signatures Section
            document.add(new Paragraph(" "));
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.setWidths(new float[]{50f, 50f});
            signTable.setSpacingBefore(30);

            PdfPCell leftSign = new PdfPCell();
            leftSign.setBorder(Rectangle.NO_BORDER);
            leftSign.addElement(new Paragraph("____________________________________", smallMutedFont));
            leftSign.addElement(new Paragraph("Authorized Procurement Signatory", boldFont));
            leftSign.addElement(new Paragraph("Date: ________________________", regularFont));
            signTable.addCell(leftSign);

            PdfPCell rightSign = new PdfPCell();
            rightSign.setBorder(Rectangle.NO_BORDER);
            rightSign.addElement(new Paragraph("____________________________________", smallMutedFont));
            rightSign.addElement(new Paragraph("Vendor Acceptance / Fulfillment", boldFont));
            rightSign.addElement(new Paragraph("Date: ________________________", regularFont));
            signTable.addCell(rightSign);

            document.add(signTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF for order: " + po.getOrderNumber(), e);
        }
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        PdfPCell cLabel = new PdfPCell(new Phrase(label, labelFont));
        cLabel.setBorder(Rectangle.NO_BORDER);
        cLabel.setPadding(4);
        table.addCell(cLabel);

        PdfPCell cVal = new PdfPCell(new Phrase(value, valFont));
        cVal.setBorder(Rectangle.NO_BORDER);
        cVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cVal.setPadding(4);
        table.addCell(cVal);
    }

    private String formatPdfCurrency(java.math.BigDecimal amount, String currencyCode) {
        if (amount == null) amount = java.math.BigDecimal.ZERO;
        if ("USD".equalsIgnoreCase(currencyCode)) {
            return String.format("$%,.2f", amount);
        } else {
            return String.format("INR %,.2f", amount);
        }
    }
}
