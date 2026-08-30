/// <reference lib="dom" />

import { createRoot } from "react-dom/client";
import { PDFViewer } from "@react-pdf/renderer";

import { DutchInvoice } from "@/app/shared/invoice.tsx";

const sampleInvoiceData = {
  sender: {
    name: "Amsterdam Tech Solutions B.V.",
    address: "Keizersgracht 421",
    location: "1016 EK Amsterdam",
    kvk: "12345678", // Mandatory in NL
    vat: "NL812345678B01", // Mandatory in NL
    iban: "NL91 ABNA 0412 3456 78",
    bic: "ABNANL2A",
  },
  client: {
    name: "Rotterdam Shipping Co.",
    address: "Coolsingel 65",
    zipCity: "3012 AC Rotterdam",
    vatNumber: "NL876543210B02", // Required if B2B
  },
  invoiceMeta: {
    number: "2026-0042", // Sequential numbering required
    date: "29-08-2026",
    dueDate: "12-09-2026",
    paymentTerms: "14",
    vatRate: 21, // Standard NL High VAT (Alternative: 9% or 0%)
  },
  items: [
    {
      description: "Frontend Development (React consulting)",
      qty: 40,
      price: 85.00,
    },
    {
      description: "Cloud Infrastructure Setup & CI/CD pipeline",
      qty: 1,
      price: 1200.00,
    },
  ],
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <PDFViewer style={{ width: "100%", height: "90vh" }} showToolbar={false}>
      <DutchInvoice data={sampleInvoiceData} />
    </PDFViewer>,
  );
}
