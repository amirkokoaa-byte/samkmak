import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

// بناء محتوى التقرير باللغة العربية بالكامل
export function getReportBodyHTML(type: 'detailed' | 'summary', state: AppState): string {
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

  if (type === 'detailed') {
    const userOrders = Object.values(state.orders).filter((u) => u.items.length > 0);
    const totalItemsCount = userOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + (Number(it.count) || 0), 0), 0);

    return `
      <div class="header">
        <h1>${state.config.siteTitle}</h1>
        <p class="subtitle">تقرير تفصيلي بطلبات وفواتير الأسماء المسجلة</p>
        <p class="date">تاريخ ووقت إصدار التقرير: ${dateStr}</p>
      </div>

      <div class="wallets-box">
        <div><strong>المحفظة الإلكترونية (كاش):</strong> ${state.config.walletNumber}</div>
        <div><strong>انستا باي (InstaPay):</strong> ${state.config.instapayNumber}</div>
      </div>

      ${userOrders.length === 0 ? '<p style="text-align: center; color: #64748b; margin: 30px 0; font-size: 14px;">لا توجد طلبات مسجلة حالياً</p>' : ''}

      ${userOrders.map((order) => {
        const userTotal = order.items.reduce((s, it) => s + (Number(it.price) || 0), 0);
        return `
          <div class="user-block">
            <div class="user-header">
              <span>👤 <strong>اسم العميل:</strong> ${order.userName}</span>
              <span>💰 <strong>إجمالي الحساب:</strong> ${userTotal.toLocaleString()} ج . م</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">م</th>
                  <th>الصنف (نوع السمك / المأكولات)</th>
                  <th style="width: 70px; text-align: center;">العدد</th>
                  <th style="width: 140px; text-align: center;">الكمية / الوزن</th>
                  <th style="width: 110px; text-align: left;">القيمة (السعر)</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((it, i) => `
                  <tr>
                    <td style="text-align: center; font-weight: bold;">${i + 1}</td>
                    <td><strong>${it.itemType}</strong></td>
                    <td style="text-align: center; font-weight: bold;">${it.count}</td>
                    <td style="text-align: center;">${it.weightText || '—'}</td>
                    <td style="text-align: left; font-weight: bold;">${Number(it.price).toLocaleString()} ج.م</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }).join('')}

      <div class="grand-total-box">
        <span>إجمالي عدد الأصناف والوجبات: <strong>${totalItemsCount}</strong></span>
        <span>قيمة جميع الأسماء (الإجمالي العام): <span class="price-val">${totalAllNames.toLocaleString()} ج . م</span></span>
      </div>

      <div class="footer">
        مع تحيات إدارة ${state.config.siteTitle} — برمجة وتطوير Amir Lamay
      </div>
    `;
  } else {
    // Summary
    const summary = calculateSummary(state.orders);
    const totalItemsCount = summary.reduce((acc, s) => acc + s.totalCount, 0);

    return `
      <div class="header">
        <h1>${state.config.siteTitle}</h1>
        <p class="subtitle">ملخص تجميع وتجهيز الأصناف والكميات (المطبخ والشواية)</p>
        <p class="date">تاريخ ووقت إصدار التقرير: ${dateStr}</p>
      </div>

      <div class="wallets-box">
        <div><strong>المحفظة الإلكترونية (كاش):</strong> ${state.config.walletNumber}</div>
        <div><strong>انستا باي (InstaPay):</strong> ${state.config.instapayNumber}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 45px; text-align: center;">م</th>
            <th>الصنف ونوع الطهي (المأكولات البحرية)</th>
            <th style="width: 100px; text-align: center;">إجمالي العدد</th>
            <th>تفاصيل الأوزان المسجلة (الجمبري)</th>
            <th style="width: 130px; text-align: left;">إجمالي القيمة</th>
          </tr>
        </thead>
        <tbody>
          ${summary.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #64748b;">لا توجد أصناف مطلوبة حالياً</td></tr>' : ''}
          ${summary.map((item, idx) => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
              <td><strong>${item.itemType}</strong></td>
              <td style="text-align: center; font-size: 14px; font-weight: bold; color: #1d4ed8;">${item.totalCount}</td>
              <td>${item.weights.length > 0 ? item.weights.join(' ، ') : '—'}</td>
              <td style="text-align: left; font-weight: bold;">${item.totalPrice.toLocaleString()} ج.م</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="grand-total-box">
        <span>إجمالي القطع والوجبات المطلوبة: <strong>${totalItemsCount}</strong></span>
        <span>قيمة جميع الأسماء (الإجمالي العام): <span class="price-val">${totalAllNames.toLocaleString()} ج . م</span></span>
      </div>

      <div class="footer">
        مع تحيات إدارة ${state.config.siteTitle} — برمجة وتطوير Amir Lamay
      </div>
    `;
  }
}

// معاينة وطباعة المستند في نافذة متصفح باللغة العربية
export function printDocument(type: 'detailed' | 'summary', state: AppState) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // إذا حجب المتصفح النافذة المنبثقة، نقوم بالتنزيل المباشر كـ PDF تلقائياً
    generateDirectJsPDF(type, state);
    return;
  }

  const bodyContent = getReportBodyHTML(type, state);

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
          margin: 12mm 12mm 12mm 12mm;
        }
        * {
          box-sizing: border-box;
          font-family: 'Cairo', system-ui, -apple-system, sans-serif;
        }
        body {
          margin: 0;
          padding: 20px;
          color: #0f172a;
          background: #ffffff;
          direction: rtl;
          text-align: right;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .header h1 {
          margin: 0 0 5px 0;
          font-size: 20px;
          color: #0f172a;
          font-weight: 800;
        }
        .subtitle {
          margin: 0 0 5px 0;
          font-size: 13px;
          color: #334155;
          font-weight: 700;
        }
        .date {
          margin: 0;
          font-size: 11px;
          color: #64748b;
        }
        .wallets-box {
          display: flex;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 12px;
          margin-bottom: 16px;
        }
        .user-block {
          margin-bottom: 16px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .user-header {
          display: flex;
          justify-content: space-between;
          background: #1e293b;
          color: #ffffff;
          padding: 7px 12px;
          font-size: 13px;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 6px 10px;
          text-align: right;
        }
        th {
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 700;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .grand-total-box {
          background: #0f172a;
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 6px;
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 700;
        }
        .grand-total-box .price-val {
          color: #38bdf8;
          font-size: 16px;
          font-weight: 800;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 11px;
          color: #64748b;
          border-top: 1px dashed #cbd5e1;
          padding-top: 10px;
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
        <span>جاهز للطباعة أو الحفظ كملف PDF باللغة العربية بالكامل</span>
        <button class="print-btn" onclick="window.print()">طباعة / حفظ PDF 🖨️</button>
      </div>
      ${bodyContent}
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

// توليد وتحميل ملف PDF فوري باللغة العربية 100% بدون أي رموز غير مفهومة
export async function generateDirectJsPDF(type: 'detailed' | 'summary', state: AppState): Promise<void> {
  const container = document.createElement('div');
  container.id = 'arabic-pdf-render-temp';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // عرض ورقة A4 بدقة 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.direction = 'rtl';
  container.style.textAlign = 'right';
  container.style.fontFamily = "'Cairo', system-ui, -apple-system, sans-serif";
  container.style.padding = '24px 20px';
  container.style.boxSizing = 'border-box';

  container.innerHTML = `
    <style>
      #arabic-pdf-render-temp * {
        box-sizing: border-box;
        font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      }
      #arabic-pdf-render-temp .header {
        text-align: center;
        border-bottom: 2px solid #0f172a;
        padding-bottom: 12px;
        margin-bottom: 14px;
      }
      #arabic-pdf-render-temp .header h1 {
        margin: 0 0 6px 0;
        font-size: 20px;
        color: #0f172a;
        font-weight: 800;
      }
      #arabic-pdf-render-temp .subtitle {
        margin: 0 0 6px 0;
        font-size: 13px;
        color: #334155;
        font-weight: 700;
      }
      #arabic-pdf-render-temp .date {
        margin: 0;
        font-size: 11px;
        color: #64748b;
      }
      #arabic-pdf-render-temp .wallets-box {
        display: flex;
        justify-content: space-between;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        padding: 8px 14px;
        border-radius: 6px;
        font-size: 12px;
        margin-bottom: 16px;
        color: #1e293b;
      }
      #arabic-pdf-render-temp .user-block {
        margin-bottom: 16px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        overflow: hidden;
      }
      #arabic-pdf-render-temp .user-header {
        display: flex;
        justify-content: space-between;
        background: #1e293b;
        color: #ffffff;
        padding: 7px 12px;
        font-size: 13px;
        font-weight: bold;
      }
      #arabic-pdf-render-temp table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
      }
      #arabic-pdf-render-temp th, #arabic-pdf-render-temp td {
        border: 1px solid #cbd5e1;
        padding: 6px 8px;
        text-align: right;
      }
      #arabic-pdf-render-temp th {
        background: #f1f5f9;
        color: #1e293b;
        font-weight: 700;
      }
      #arabic-pdf-render-temp tr:nth-child(even) {
        background: #f8fafc;
      }
      #arabic-pdf-render-temp .grand-total-box {
        background: #0f172a;
        color: #ffffff;
        padding: 10px 16px;
        border-radius: 6px;
        margin-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 700;
      }
      #arabic-pdf-render-temp .grand-total-box .price-val {
        color: #38bdf8;
        font-size: 16px;
        font-weight: 800;
      }
      #arabic-pdf-render-temp .footer {
        margin-top: 20px;
        text-align: center;
        font-size: 11px;
        color: #64748b;
        border-top: 1px dashed #cbd5e1;
        padding-top: 10px;
      }
    </style>
    ${getReportBodyHTML(type, state)}
  `;

  document.body.appendChild(container);

  try {
    if (document.fonts) {
      await document.fonts.ready;
    }

    const canvas = await html2canvas(container, {
      scale: 2, // دقة عالية لظهور الخط العربي بنقاء فائق
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const fileName = type === 'detailed' 
      ? `تقرير_الطلبات_التفصيلي_${todayDate}.pdf` 
      : `ملخص_تجهيز_الأصناف_${todayDate}.pdf`;

    pdf.save(fileName);
  } catch (err) {
    console.error('خطأ أثناء إنشاء ملف PDF العربي:', err);
    printDocument(type, state);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
