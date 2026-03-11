import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import { generatePDF } from 'react-native-html-to-pdf';
import { fontFamily } from '../../../constants/fonts';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReceiptData {
  receipt_number: string;
  student_name: string;
  student_phone: string;
  seat_number: string | number;
  timing: string;
  membership_start: string | Date;
  membership_end: string | Date;
  library_name: string;
  library_address: string;
  total_fee: number;
  amount_paid: number;
  pending_amount: number;
  payment_mode: string;
  payment_date: string | Date;
}

interface ReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  data: ReceiptData;
}

// ─── Local Helpers ────────────────────────────────────────────────────────────

const fmt = {
  date: (date: string | Date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  currency: (amount: number) => `₹${Number(amount).toLocaleString('en-IN')}`,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Divider = () => <View style={styles.divider} />;

const InfoRow = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>
      {value}
    </Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  visible,
  onClose,
  data,
}) => {
  const captureRef = useRef<any>(null);
  const [waLoading, setWaLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const isPending = data.pending_amount > 0;
  const pendingColor = isPending ? '#EF4444' : '#10B981';

  // ── WhatsApp ───────────────────────────────────────────────────────────────
  const handleWhatsApp = async () => {
    try {
      setWaLoading(true);

      const uri: string = await captureRef.current.capture();

      const message = [
        `*Payment Receipt*`,
        `Receipt No: ${data.receipt_number}`,
        ``,
        `*Student:* ${data.student_name}`,
        `*Phone:* ${data.student_phone}`,
        ``,
        `*Seat:* ${data.seat_number}  🕐 *Timing:* ${data.timing}`,
        `*From:* ${fmt.date(data.membership_start)}  ➜  ${fmt.date(
          data.membership_end,
        )}`,
        ``,
        `*Total Fee:* ${fmt.currency(data.total_fee)}`,
        `*Amount Paid:* ${fmt.currency(data.amount_paid)}`,
        isPending
          ? `*Pending:* ${fmt.currency(data.pending_amount)}`
          : `*Fully Paid*`,
        ``,
        `*Mode:* ${data.payment_mode}`,
        `*Date:* ${fmt.date(data.payment_date)}`,
        ``,
        `${data.library_name}`,
        `${data.library_address}`,
      ]
        .filter(Boolean)
        .join('\n');

      await Share.shareSingle({
        title: `Receipt ${data.receipt_number}`,
        message,
        url: `file://${uri}`,
        type: 'image/png',
        social: Share.Social.WHATSAPP,
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        Alert.alert(
          'Error',
          'Could not share on WhatsApp. Make sure WhatsApp is installed.',
        );
      }
    } finally {
      setWaLoading(false);
    }
  };

  // ── Save PDF ───────────────────────────────────────────────────────────────
  const handleSavePDF = async () => {
    try {
      setPdfLoading(true);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8"/>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Helvetica, Arial, sans-serif; background: #f7f6f2; padding: 32px 16px; color: #1F2937; }
              .card { background: #fff; border-radius: 16px; padding: 28px 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e0ddd6; }
              .center { text-align: center; }
              .library-name { font-size: 20px; font-weight: 700; }
              .library-address { font-size: 13px; color: #6B7280; margin-top: 4px; }
              .receipt-badge { background: #EEF2FF; border-radius: 10px; padding: 12px; text-align: center; margin: 16px 0; }
              .receipt-label { font-size: 10px; font-weight: 700; color: #526ea8; letter-spacing: 2px; text-transform: uppercase; }
              .receipt-number { font-size: 18px; font-weight: 700; color: #526ea8; margin-top: 4px; }
              .divider { height: 1px; background: #e0ddd6; margin: 16px 0; }
              .section-title { font-size: 10px; font-weight: 700; color: #9CA3AF; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
              .info-label { font-size: 11px; color: #9CA3AF; }
              .info-value { font-size: 14px; font-weight: 600; color: #1F2937; margin-top: 2px; }
              .fee-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
              .fee-label { color: #6B7280; }
              .fee-value { font-weight: 600; }
              .green { color: #10B981; }
              .red { color: #EF4444; }
              .pending-row { background: #FEF2F2; border-radius: 8px; padding: 8px 10px; margin-top: 4px; }
              .footer-note { text-align: center; font-size: 11px; color: #9CA3AF; margin-top: 20px; padding-top: 16px; border-top: 1px dashed #e0ddd6; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="center">
                <div class="library-name">${data.library_name}</div>
                <div class="library-address">${data.library_address}</div>
              </div>

              <div class="receipt-badge">
                <div class="receipt-label">Payment Receipt</div>
                <div class="receipt-number">${data.receipt_number}</div>
              </div>

              <div class="divider"></div>

              <div class="section-title">Student Details</div>
              <div class="info-grid">
                <div><div class="info-label">Name</div><div class="info-value">${
                  data.student_name
                }</div></div>
                <div><div class="info-label">Phone</div><div class="info-value">${
                  data.student_phone
                }</div></div>
              </div>

              <div class="divider"></div>

              <div class="section-title">Seat & Membership</div>
              <div class="info-grid">
                <div><div class="info-label">Seat Number</div><div class="info-value">#${
                  data.seat_number
                }</div></div>
                <div><div class="info-label">Timing</div><div class="info-value">${
                  data.timing
                }</div></div>
                <div><div class="info-label">Start Date</div><div class="info-value">${fmt.date(
                  data.membership_start,
                )}</div></div>
                <div><div class="info-label">End Date</div><div class="info-value">${fmt.date(
                  data.membership_end,
                )}</div></div>
              </div>

              <div class="divider"></div>

              <div class="section-title">Payment Summary</div>
              <div class="fee-row"><span class="fee-label">Total Fee</span><span class="fee-value">${fmt.currency(
                data.total_fee,
              )}</span></div>
              <div class="fee-row"><span class="fee-label">Amount Paid</span><span class="fee-value green">${fmt.currency(
                data.amount_paid,
              )}</span></div>
              ${
                isPending
                  ? `
              <div class="fee-row pending-row">
                <span class="fee-label red">Pending Amount</span>
                <span class="fee-value red">${fmt.currency(
                  data.pending_amount,
                )}</span>
              </div>`
                  : ''
              }

              <div class="divider"></div>

              <div class="info-grid">
                <div><div class="info-label">Payment Mode</div><div class="info-value">${
                  data.payment_mode
                }</div></div>
                <div><div class="info-label">Payment Date</div><div class="info-value">${fmt.date(
                  data.payment_date,
                )}</div></div>
              </div>

              <div class="footer-note">Thank you! This is a computer generated receipt.</div>
            </div>
          </body>
        </html>
      `;

      const pdf = await generatePDF({
        html,
        fileName: data.receipt_number,
        directory: Platform.OS === 'ios' ? 'Documents' : 'Downloads',
      });
      console.log('Generated pdf', pdf);

      if (!pdf.filePath) throw new Error('PDF path missing');
      const destPath = `${RNFS.DownloadDirectoryPath}/${data.receipt_number}.pdf`;

      console.log('Destpath', destPath);
      await RNFS.copyFile(pdf.filePath, destPath);
      await RNFS.scanFile(destPath);
      onClose();
      Toast.show({
        type: 'success',
        text1: 'PDF Generated',
        text2: 'Your receipt has been saved.',
      });

      // await Share.open({
      //   url: `file://${pdf.filePath}`,
      //   type: 'application/pdf',
      //   title: `Save ${data.receipt_number}.pdf`,
      //   saveToFiles: true,
      // });
    } catch (error: any) {
      console.log('PDF error', error);

      if (error?.message !== 'User did not share') {
        Alert.alert('Error', 'Could not generate PDF. Please try again.');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Receipt</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Receipt Card — captured as image for WhatsApp */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ViewShot ref={captureRef} options={{ format: 'png', quality: 1 }}>
            <View style={styles.card}>
              {/* Library */}
              <Text style={styles.libraryName}>{data.library_name}</Text>
              <Text style={styles.libraryAddress}>{data.library_address}</Text>

              <Divider />

              {/* Receipt number */}
              <View style={styles.receiptBadge}>
                <Text style={styles.receiptLabel}>PAYMENT RECEIPT</Text>
                <Text style={styles.receiptNumber}>{data.receipt_number}</Text>
              </View>

              <Divider />

              {/* Student */}
              <Text style={styles.sectionTitle}>STUDENT</Text>
              <InfoRow label="Name" value={data.student_name} />
              <InfoRow label="Phone" value={data.student_phone} />

              <Divider />

              {/* Membership */}
              <Text style={styles.sectionTitle}>MEMBERSHIP</Text>
              <InfoRow label="Seat" value={`#${data.seat_number}`} />
              <InfoRow label="Timing" value={data.timing} />
              <InfoRow label="From" value={fmt.date(data.membership_start)} />
              <InfoRow label="To" value={fmt.date(data.membership_end)} />

              <Divider />

              {/* Payment */}
              <Text style={styles.sectionTitle}>PAYMENT</Text>
              <InfoRow label="Total Fee" value={fmt.currency(data.total_fee)} />
              <InfoRow
                label="Amount Paid"
                value={fmt.currency(data.amount_paid)}
                valueColor="#10B981"
              />
              <InfoRow
                label="Pending"
                value={fmt.currency(data.pending_amount)}
                valueColor={pendingColor}
              />

              {/* Paid / Due badge */}
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isPending ? '#FEF2F2' : '#F0FDF4' },
                ]}
              >
                <Text style={[styles.badgeText, { color: pendingColor }]}>
                  {isPending
                    ? `Due: ${fmt.currency(data.pending_amount)}`
                    : 'Fully Paid ✓'}
                </Text>
              </View>

              <Divider />

              <InfoRow label="Payment Mode" value={data.payment_mode} />
              <InfoRow
                label="Payment Date"
                value={fmt.date(data.payment_date)}
              />

              <Text style={styles.footerNote}>
                This is a computer-generated receipt.
              </Text>
            </View>
          </ViewShot>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerBtn, styles.whatsappBtn]}
            onPress={handleWhatsApp}
            disabled={waLoading || pdfLoading}
          >
            {waLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.footerBtnText}>Share on WhatsApp</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerBtn, styles.pdfBtn]}
            onPress={handleSavePDF}
            disabled={waLoading || pdfLoading}
          >
            {pdfLoading ? (
              <ActivityIndicator color="#526ea8" size="small" />
            ) : (
              <>
                <Text style={[styles.footerBtnText, styles.pdfBtnText]}>
                  Save PDF
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReceiptModal;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f6f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0ddd6',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#1F2937',
  },
  closeBtn: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: fontFamily.MONTSERRAT.regular,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e0ddd6',
  },
  libraryName: {
    fontSize: 18,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#1F2937',
    textAlign: 'center',
  },
  libraryAddress: {
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0ddd6',
    marginVertical: 16,
  },
  receiptBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 10,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#526ea8',
    letterSpacing: 2,
  },
  receiptNumber: {
    fontSize: 16,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#526ea8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.regular,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: fontFamily.MONTSERRAT.semiBold,
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  badge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fontFamily.MONTSERRAT.bold,
  },
  footerNote: {
    fontSize: 11,
    fontFamily: fontFamily.MONTSERRAT.regular,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0ddd6',
    backgroundColor: '#fff',
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: 12,
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
  },
  pdfBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#526ea8',
  },
  footerBtnIcon: {
    fontSize: 16,
  },
  footerBtnText: {
    fontSize: 14,
    fontFamily: fontFamily.MONTSERRAT.bold,
    color: '#fff',
  },
  pdfBtnText: {
    color: '#526ea8',
  },
});
