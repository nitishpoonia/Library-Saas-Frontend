import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Linking } from "react-native";
import type { Receipt } from "@/api/types";
import { receiptHtml, receiptText } from "./receiptFormat";

export { receiptHtml, receiptText } from "./receiptFormat";

/** Makes a PDF of the receipt and opens the share sheet. */
export async function shareReceiptPdf(r: Receipt) {
  const { uri } = await Print.printToFileAsync({ html: receiptHtml(r) });
  await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `Receipt ${r.receiptNumber}`, UTI: "com.adobe.pdf" });
}

/** Opens WhatsApp with the receipt text addressed to the student. */
export async function sendReceiptOnWhatsApp(r: Receipt) {
  const phone = r.studentPhone.replace(/^\+/, "");
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(receiptText(r))}`;
  await Linking.openURL(url);
}
