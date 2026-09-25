import { db } from './firebase.js'; // استيراد إعدادات قاعدة بياناتك
import { ref, set, push, onValue, remove } from 'firebase/database';

// --- 1. إرسال الطلبات إلى Firebase (لا تحفظها محلياً) ---
// هذا الكود يوضع داخل الدالة التي تتنفذ عند الضغط على "حفظ الطلب"
export function saveOrderToFirebase(userName, itemType, itemCount, itemQuantity, itemPrice) {
  if (!db) {
    console.warn('[Firebase] Database not initialized');
    return;
  }
  // تحديد مسار الطلبات في قاعدة البيانات
  const ordersRef = ref(db, 'orders');
  // إنشاء مفتاح جديد للطلب (مثل ID فريد)
  const newOrderRef = push(ordersRef);

  // إرسال البيانات إلى Firebase
  set(newOrderRef, {
    name: userName,
    type: itemType,
    count: Number(itemCount) || 1,
    quantity: itemQuantity || '-',
    price: Number(itemPrice) || 0,
    timestamp: Date.now(), // لمعرفة وقت الطلب
  })
    .then(() => {
      console.log('تم إرسال الطلب بنجاح إلى Firebase!');
      // لا تضف الطلب إلى الجدول هنا (HTML)، اتركه للدالة onValue في الأسفل
    })
    .catch((error) => {
      console.error('حدث خطأ أثناء الحفظ:', error);
    });
}

// --- 2. دالة الحذف الفوري (Instant Delete) ---
// جعل هذه الدالة متاحة للـ HTML والـ Window
export function deleteOrder(orderId) {
  if (!db) return;
  const orderToDeleteRef = ref(db, `orders/${orderId}`);
  remove(orderToDeleteRef)
    .then(() => console.log('تم الحذف بنجاح من قاعدة البيانات'))
    .catch((error) => console.error('خطأ في الحذف:', error));
  // بمجرد الحذف، ستعمل onValue تلقائياً وتزيل الصف من عند جميع المستخدمين!
}

if (typeof window !== 'undefined') {
  window.deleteOrder = deleteOrder;
  window.saveOrderToFirebase = saveOrderToFirebase;
}

// --- دالة مساعدة لتحديث جدول الملخص ---
export function updateSummaryTable(summaryData) {
  const summaryBody = document.getElementById('summary-table-body');
  if (!summaryBody) return;
  summaryBody.innerHTML = '';

  for (const [itemType, totalCount] of Object.entries(summaryData)) {
    const row = `<tr><td>${itemType}</td><td>${totalCount}</td></tr>`;
    summaryBody.insertAdjacentHTML('beforeend', row);
  }
}

// --- 3. ربط أزرار الـ HTML والشروط البرمجية (Event Listeners) ---
export function setupUIBindings() {
  const itemTypeSelect = document.getElementById('item-type-select');
  const quantityField = document.getElementById('item-quantity-select');
  const saveBtn = document.getElementById('save-order-btn');

  // شرط برمجى (Event Listener) لحقل 'النوع' (Item Type):
  // إذا اختار المستخدم صنفاً لا يحتوي على كلمة 'جمبري'، قم بتعطيل (Disable) حقل 'الكمية' (Quantity).
  // إذا كان يحتوي على 'جمبري'، قم بتفعيله.
  if (itemTypeSelect && quantityField) {
    const toggleQuantityField = () => {
      const val = itemTypeSelect.value || '';
      const isShrimp = val.includes('جمبري');
      quantityField.disabled = !isShrimp;
      if (!isShrimp) {
        quantityField.value = '';
        quantityField.style.opacity = '0.5';
        quantityField.style.cursor = 'not-allowed';
      } else {
        quantityField.style.opacity = '1';
        quantityField.style.cursor = 'pointer';
        if (!quantityField.value) {
          quantityField.value = 'نصف كيلو';
        }
      }
    };

    itemTypeSelect.addEventListener('change', toggleQuantityField);
    toggleQuantityField();
  }

  // عند الضغط على زر 'حفظ الطلب' الموجود في واجهة المستخدم:
  // جمع البيانات من الحقول (الاسم، الصنف، العدد، الكمية) واستدعاء دالة saveOrderToFirebase لإرسالها
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const userNameSelect =
        document.getElementById('user-name-select') ||
        document.getElementById('user-name-input') ||
        document.querySelector('select[name="userName"]');

      const userName = userNameSelect ? userNameSelect.value : '';
      const itemType = itemTypeSelect ? itemTypeSelect.value : '';
      const itemCountSelect = document.getElementById('item-count-select');
      const itemCount = itemCountSelect ? Number(itemCountSelect.value) || 1 : 1;
      const itemQuantity = quantityField && !quantityField.disabled ? quantityField.value : '';

      let itemPrice = 0;
      if (itemTypeSelect && itemTypeSelect.selectedOptions && itemTypeSelect.selectedOptions[0]) {
        const text = itemTypeSelect.selectedOptions[0].textContent || '';
        const match = text.match(/(\d+)\s*ج\.م/);
        if (match) itemPrice = Number(match[1]) * itemCount;
      }

      if (userName && itemType) {
        saveOrderToFirebase(userName, itemType, itemCount, itemQuantity, itemPrice);
      }
    });
  }
}

// --- 4. الاستماع اللحظي (Real-time Listening) وعرض البيانات للجميع ---
// هذا هو الجزء الأهم: onValue تعمل بشكل مستمر، إذا أضاف أي جهاز طلب، ستعمل هذه الدالة فوراً عند الجميع
export function initOrdersListener() {
  if (!db) return;
  const ordersListenerRef = ref(db, 'orders');

  onValue(ordersListenerRef, (snapshot) => {
    // 1. تفريغ الجدول الحالي (HTML) أولاً لكي لا تتكرر البيانات
    const mainTableBody = document.getElementById('main-orders-table-body');
    if (mainTableBody) {
      mainTableBody.innerHTML = '';
    }

    // متغيرات لحساب الملخص الإجمالي
    let grandTotal = 0;
    const summaryCounts = {};

    const data = snapshot.val();

    if (data) {
      // المرور على كل الطلبات في قاعدة البيانات
      Object.keys(data).forEach((orderId) => {
        const order = data[orderId];

        // 2. إضافة الطلب إلى الجدول في واجهة المستخدم (HTML)
        if (mainTableBody) {
          const row = `
            <tr>
              <td>${order.name}</td>
              <td>${order.type}</td>
              <td>${order.count}</td>
              <td>${order.quantity || '-'}</td>
              <td>${order.price}</td>
              <td>
                <button onclick="deleteOrder('${orderId}')">🗑️ حذف</button>
              </td>
            </tr>
          `;
          mainTableBody.insertAdjacentHTML('beforeend', row);
        }

        // 3. حساب الملخص الإجمالي أثناء المرور على الطلبات
        grandTotal += Number(order.price || 0);

        if (summaryCounts[order.type]) {
          summaryCounts[order.type] += Number(order.count || 0);
        } else {
          summaryCounts[order.type] = Number(order.count || 0);
        }
      });
    }

    // 4. تحديث قسم "قيمة جميع الأسماء (ج.م)"
    const grandTotalDisplay = document.getElementById('grand-total-display');
    if (grandTotalDisplay) {
      grandTotalDisplay.innerText = `${grandTotal} ج.م`;
    }

    // 5. تحديث جدول "الملخص اللحظي"
    updateSummaryTable(summaryCounts);
  });
}

// تنفيذ التهيئات عند تحميل الصفحة
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupUIBindings();
      initOrdersListener();
    });
  } else {
    setupUIBindings();
    initOrdersListener();
  }
}
