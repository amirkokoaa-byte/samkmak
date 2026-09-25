import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AppState, OrderItem } from '../types/index.ts';

export interface ItemSummaryAggregation {
  itemType: string;
  totalCount: number;
  weights: string[];
  totalPrice: number;
}

export function calculateSummary(orders: Record<string, { userName: string; items: OrderItem[] }>): ItemSummaryAggregation[] {
  const map = new Map<string, ItemSummaryAggregation>();

  Object.values(orders).forEach((order) => {
    order.items.forEach((item) => {
      if (!map.has(item.itemType)) {
        map.set(item.itemType, {
          itemType: item.itemType,
          totalCount: 0,
          weights: [],
          totalPrice: 0,
        });
      }
      const current = map.get(item.itemType)!;
      current.totalCount += Number(item.count) || 0;
      current.totalPrice += Number(item.price) || 0;
      if (item.weightText && item.weightText.trim()) {
        current.weights.push(item.weightText.trim());
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => b.totalCount - a.totalCount);
}

// Generate printable HTML document for 100% crystal-clear Arabic rendering and PDF printing
export function printDocument(type: 'detailed' | 'summary', state: AppState) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة للطباعة أو تحميل الـ PDF');
    return;
  }

  const dateStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalAllNames = Object.values(state.orders).reduce((acc, order) => {
    return acc + order.items.reduce((s, it) => s + (Number(it.price) || 0), 0);
  }, 0);

  let bodyContent = '';

  if (type === 'detailed') {
    const userOrders = Object.values(state.orders).filter((u) => u.items.length > 0);

    bodyContent = `
      <div class="header">
        <h1>${state.config.siteTitle}</h1>
        <p class="subtitle">تقرير تفصيلي بطلبات وفواتير الأسماء المسجلة</p>
        <p class="date">تاريخ التقرير: ${dateStr}</p>
      </div>

      <div class="wallets-box">
        <div><strong>المحفظة الإلكترونية:</strong> ${state.config.walletNumber}</div>
        <div><strong>انستا باي (InstaPay):</strong> ${state.config.instapayNumber}</div>
      </div>

      ${userOrders.length === 0 ? '<p style="text-align: center; color: #666; margin: 30px 0;">لا توجد طلبات مسجلة حالياً</p>' : ''}

      ${userOrders.map((order, idx) => {
        const userTotal = order.items.reduce((s, it) => s + (Number(it.price) || 0), 0);
        return `
          <div class="user-block">
            <div class="user-header">
              <span><strong>العميل / الاسم:</strong> ${order.userName}</span>
              <span><strong>إجمالي حساب الاسم:</strong> ${userTotal.toLocaleString()} ج . م</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>الصنف (النوع)</th>
                  <th style="width: 70px;">العدد</th>
                  <th style="width: 140px;">الكمية / الوزن</th>
                  <th style="width: 100px;">القيمة (السعر)</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((it, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td><strong>${it.itemType}</strong></td>
                    <td style="text-align:center;">${it.count}</td>
                    <td>${it.weightText || '—'}</td>
                    <td style="text-align:left; font-weight:bold;">${Number(it.price).toLocaleString()} ج.م</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}

      <div class="grand-total-box">
        <span>قيمة جميع الأسماء (الإجمالي العام):</span>
        <span class="price-val">${totalAllNames.toLocaleString()} (ج . م)</span>
      </div>

      <div class="footer">
        مع تحيات المطور Amir Lamay
      </div>
    `;
  } else {
    // Summary
    const summary = calculateSummary(state.orders);
    const totalItemsCount = summary.reduce((acc, s) => acc + s.totalCount, 0);

    bodyContent = `
      <div class="header">
        <h1>${state.config.siteTitle}</h1>
        <p class="subtitle">ملخص تجميع وتجهيز الأصناف والكميات (المطبخ والشواية)</p>
        <p class="date">تاريخ التقرير: ${dateStr}</p>
      </div>

      <div class="wallets-box">
        <div><strong>المحفظة الإلكترونية:</strong> ${state.config.walletNumber}</div>
        <div><strong>انستا باي (InstaPay):</strong> ${state.config.instapayNumber}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 45px;">م</th>
            <th>الصنف (نوع السمك / المأكولات)</th>
            <th style="width: 100px;">إجمالي العدد</th>
            <th>تفاصيل الأوزان المسجلة</th>
            <th style="width: 130px;">إجمالي القيمة</th>
          </tr>
        </thead>
        <tbody>
          ${summary.length === 0 ? '<tr><td colspan="5" style="text-align:center;">لا توجد أصناف في الطلبات</td></tr>' : ''}
          ${summary.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${item.itemType}</strong></td>
              <td style="text-align:center; font-size: 16px; font-weight: bold;">${item.totalCount}</td>
              <td>${item.weights.length > 0 ? item.weights.join(' ، ') : '—'}</td>
              <td style="text-align:left; font-weight:bold;">${item.totalPrice.toLocaleString()} ج.م</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="grand-total-box">
        <span>إجمالي عدد القطع/الوجبات: <strong>${totalItemsCount}</strong></span>
        <span>قيمة جميع الأسماء: <span class="price-val">${totalAllNames.toLocaleString()} (ج . م)</span></span>
      </div>

      <div class="footer">
        مع تحيات المطور Amir Lamay
      </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>تصدير PDF - ${type === 'detailed' ? 'التقرير التفصيلي' : 'ملخص الأصناف'}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4;
          margin: 15mm 12mm 15mm 12mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Cairo', system-ui, sans-serif;
          margin: 0;
          padding: 20px;
          color: #0f172a;
          background: #ffffff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        .header h1 {
          margin: 0 0 5px 0;
          font-size: 22px;
          color: #0f172a;
        }
        .subtitle {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #475569;
          font-weight: 600;
        }
        .date {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }
        .wallets-box {
          display: flex;
          justify-content: space-between;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .user-block {
          margin-bottom: 22px;
          page-break-inside: avoid;
        }
        .user-header {
          display: flex;
          justify-content: space-between;
          background: #1e293b;
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 6px 6px 0 0;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
          font-size: 13px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 7px 10px;
          text-align: right;
        }
        th {
          background-color: #f8fafc;
          color: #1e293b;
          font-weight: 700;
        }
        tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        .grand-total-box {
          margin-top: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
        }
        .price-val {
          font-size: 20px;
          color: #38bdf8;
        }
        .footer {
          margin-top: 35px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px dashed #cbd5e1;
          padding-top: 12px;
        }
        .print-btn-bar {
          background: #0f172a;
          color: #fff;
          padding: 12px 20px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 8px;
        }
        .print-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          font-family: inherit;
          font-weight: bold;
          cursor: pointer;
        }
        @media print {
          .print-btn-bar {
            display: none !important;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-btn-bar">
        <span>جاهز للطباعة أو الحفظ كملف PDF (اضغط طباعة ثم اختر Save as PDF)</span>
        <button class="print-btn" onclick="window.print()">طباعة / حفظ PDF 🖨️</button>
      </div>
      ${bodyContent}
      <script>
        // Auto trigger print after render
        setTimeout(() => {
          // window.print();
        }, 600);
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

// Fallback jsPDF direct download
export function generateDirectJsPDF(type: 'detailed' | 'summary', state: AppState) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const title = type === 'detailed' ? 'Detailed Orders Report' : 'Items Summary Report';
  doc.setFontSize(16);
  doc.text(title, 105, 18, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 24, { align: 'center' });
  doc.text(`Wallet: ${state.config.walletNumber} | InstaPay: ${state.config.instapayNumber}`, 105, 30, { align: 'center' });

  if (type === 'detailed') {
    const tableData: any[] = [];
    Object.values(state.orders).forEach((order) => {
      order.items.forEach((it, idx) => {
        tableData.push([
          idx === 0 ? order.userName : '',
          idx + 1,
          it.itemType,
          it.count,
          it.weightText || '—',
          `${it.price} EGP`,
        ]);
      });
    });

    autoTable(doc, {
      startY: 36,
      head: [['User', '#', 'Item', 'Qty', 'Weight', 'Price']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { font: 'helvetica', fontSize: 9 },
    });
  } else {
    const summary = calculateSummary(state.orders);
    const tableData = summary.map((s, i) => [
      i + 1,
      s.itemType,
      s.totalCount,
      s.weights.join(', ') || '—',
      `${s.totalPrice} EGP`,
    ]);

    autoTable(doc, {
      startY: 36,
      head: [['#', 'Item Type', 'Total Count', 'Weights', 'Total Price']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { font: 'helvetica', fontSize: 9 },
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text('مع تحيات المطور Amir Lamay', 105, 290, { align: 'center' });
  }

  doc.save(`${type === 'detailed' ? 'orders_detailed' : 'orders_summary'}_${Date.now()}.pdf`);
}
