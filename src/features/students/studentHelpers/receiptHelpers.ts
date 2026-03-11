import { ReceiptData } from '../components/ReceiptModal'; // adjust path as needed

// ─── Format Helpers ───────────────────────────────────────────────────────────

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatCurrency = (amount: number): string =>
  `₹${Number(amount).toLocaleString('en-IN')}`;

// ─── WhatsApp Message Builder ─────────────────────────────────────────────────

export const buildWhatsAppMessage = (data: ReceiptData): string => {
  const lines = [
    `📄 *Payment Receipt*`,
    `Receipt No: ${data.receipt_number}`,
    ``,
    `👤 *Student:* ${data.student_name}`,
    `📞 *Phone:* ${data.student_phone}`,
    ``,
    `💺 *Seat:* ${data.seat_number}`,
    `🕐 *Timing:* ${data.timing}`,
    `📅 *From:* ${formatDate(data.membership_start)}`,
    `📅 *To:* ${formatDate(data.membership_end)}`,
    ``,
    `💰 *Total Fee:* ${formatCurrency(data.total_fee)}`,
    `✅ *Amount Paid:* ${formatCurrency(data.amount_paid)}`,
  ];

  if (data.pending_amount > 0) {
    lines.push(`⚠️ *Pending Amount:* ${formatCurrency(data.pending_amount)}`);
  }

  lines.push(``);
  lines.push(`💳 *Payment Mode:* ${data.payment_mode}`);
  lines.push(`🗓 *Payment Date:* ${formatDate(data.payment_date)}`);
  lines.push(``);
  lines.push(`🏛 ${data.library_name}`);
  lines.push(`📍 ${data.library_address}`);

  return lines.join('\n');
};

// ─── PDF HTML Generator ───────────────────────────────────────────────────────

export const generateReceiptHTML = (data: ReceiptData): string => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background: #F3F4F6;
        padding: 32px 16px;
        color: #1F2937;
      }
      .card {
        background: #ffffff;
        border-radius: 16px;
        padding: 28px 24px;
        max-width: 480px;
        margin: 0 auto;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      }
      .library-header { text-align: center; margin-bottom: 20px; }
      .library-name { font-size: 20px; font-weight: 700; color: #1F2937; }
      .library-address { font-size: 13px; color: #6B7280; margin-top: 4px; }
      .receipt-badge {
        background: #EEF2FF;
        border-radius: 10px;
        padding: 12px 0;
        text-align: center;
        margin-bottom: 20px;
      }
      .receipt-badge-label {
        font-size: 10px; font-weight: 700; color: #6366F1;
        letter-spacing: 2px; text-transform: uppercase;
      }
      .receipt-badge-number { font-size: 18px; font-weight: 700; color: #4338CA; margin-top: 4px; }
      .divider { height: 1px; background: #F3F4F6; margin: 16px 0; }
      .section-title {
        font-size: 10px; font-weight: 700; color: #9CA3AF;
        letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;
      }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 4px; }
      .info-label { font-size: 11px; color: #9CA3AF; font-weight: 500; }
      .info-value { font-size: 14px; color: #1F2937; font-weight: 600; margin-top: 3px; }
      .fee-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; }
      .fee-label { font-size: 14px; color: #6B7280; }
      .fee-value { font-size: 14px; font-weight: 600; color: #1F2937; }
      .fee-value.green { color: #10B981; }
      .fee-row.pending-row {
        background: #FEF2F2; border-radius: 8px; padding: 8px 10px; margin-top: 4px;
      }
      .fee-row.pending-row .fee-label,
      .fee-row.pending-row .fee-value { color: #EF4444; font-weight: 700; }
      .footer-note {
        text-align: center; font-size: 11px; color: #D1D5DB;
        margin-top: 20px; padding-top: 16px; border-top: 1px dashed #E5E7EB;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="library-header">
        <div class="library-name">${data.library_name}</div>
        <div class="library-address">${data.library_address}</div>
      </div>

      <div class="receipt-badge">
        <div class="receipt-badge-label">Payment Receipt</div>
        <div class="receipt-badge-number">${data.receipt_number}</div>
      </div>

      <div class="divider"></div>

      <div class="section-title">Student Details</div>
      <div class="info-grid">
        <div>
          <div class="info-label">Name</div>
          <div class="info-value">${data.student_name}</div>
        </div>
        <div>
          <div class="info-label">Phone</div>
          <div class="info-value">${data.student_phone}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title">Seat & Membership</div>
      <div class="info-grid">
        <div>
          <div class="info-label">Seat Number</div>
          <div class="info-value">${data.seat_number}</div>
        </div>
        <div>
          <div class="info-label">Timing</div>
          <div class="info-value">${data.timing}</div>
        </div>
        <div>
          <div class="info-label">Start Date</div>
          <div class="info-value">${formatDate(data.membership_start)}</div>
        </div>
        <div>
          <div class="info-label">End Date</div>
          <div class="info-value">${formatDate(data.membership_end)}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title">Payment Summary</div>
      <div class="fee-row">
        <span class="fee-label">Total Fee</span>
        <span class="fee-value">${formatCurrency(data.total_fee)}</span>
      </div>
      <div class="fee-row">
        <span class="fee-label">Amount Paid</span>
        <span class="fee-value green">${formatCurrency(data.amount_paid)}</span>
      </div>
      ${
        data.pending_amount > 0
          ? `
      <div class="fee-row pending-row">
        <span class="fee-label">Pending Amount</span>
        <span class="fee-value">${formatCurrency(data.pending_amount)}</span>
      </div>`
          : ''
      }

      <div class="divider"></div>

      <div class="info-grid">
        <div>
          <div class="info-label">Payment Mode</div>
          <div class="info-value">${data.payment_mode}</div>
        </div>
        <div>
          <div class="info-label">Payment Date</div>
          <div class="info-value">${formatDate(data.payment_date)}</div>
        </div>
      </div>

      <div class="footer-note">Thank you! This is a computer generated receipt.</div>
    </div>
  </body>
</html>
`;

// ─── Map API response → ReceiptData ───────────────────────────────────────────

/**
 * Call this after createStudent or addPayment API success
 * to build the ReceiptData object for the modal.
 */
export const mapApiResponseToReceiptData = (
  apiReceipt: any,
  studentPhone: string,
  libraryName: string,
  libraryAddress: string,
): ReceiptData => ({
  receipt_number: apiReceipt.receipt_number,
  student_name: apiReceipt.student_name,
  student_phone: studentPhone,
  seat_number: apiReceipt.seat_number,
  timing: apiReceipt.timing,
  membership_start: apiReceipt.membership_start,
  membership_end: apiReceipt.membership_end,
  library_name: libraryName,
  library_address: libraryAddress,
  total_fee: apiReceipt.total_fee,
  amount_paid: apiReceipt.amount_paid,
  pending_amount: apiReceipt.pending_amount,
  payment_mode: apiReceipt.payment_mode,
  payment_date: apiReceipt.payment_date,
});
