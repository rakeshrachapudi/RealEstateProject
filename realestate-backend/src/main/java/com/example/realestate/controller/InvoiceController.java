package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.service.InvoiceService;
import com.example.realestate.service.PropertyService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PropertyService propertyService;

    public InvoiceController(InvoiceService invoiceService, PropertyService propertyService) {
        this.invoiceService = invoiceService;
        this.propertyService = propertyService;
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> generateInvoice(@PathVariable Long propertyId) {
        Property property = propertyService.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        try {
            byte[] pdfBytes = invoiceService.generateInvoicePdf(property);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String filename = "invoice-prop-" + property.getId() + ".pdf";
            headers.setContentDispositionFormData(filename, filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}