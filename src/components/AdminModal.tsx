import React, { useState } from 'react';
import {
  X,
  Lock,
  FileDown,
  Plus,
  Trash2,
  Save,
  Printer,
  Check,
  AlertCircle,
  Settings,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { AppConfig, AppState, MenuItem } from '../types/index.ts';
import { printDocument, generateDirectJsPDF } from '../services/pdfExport.ts';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (pw: string) => boolean;
  config: AppConfig;
  onSaveConfig: (cfg: Partial<AppConfig>) => void;
  menuItems: MenuItem[];
  onSaveMenu: (items: MenuItem[]) => void;
  state: AppState;
  onClearAllOrders: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  config,
  onSaveConfig,
  menuItems,
  onSaveMenu,
  state,
  onClearAllOrders,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'menu' | 'pdf' | 'danger'>('general');

  // Local form states
  const [siteTitle, setSiteTitle] = useState(config.siteTitle);
  const [walletNumber, setWalletNumber] = useState(config.walletNumber);
  const [instapayNumber, setInstapayNumber] = useState(config.instapayNumber);
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);

  // Menu items local copy for editing
  const [localMenu, setLocalMenu] = useState<MenuItem[]>(menuItems);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState<number | ''>('');
  const [newItemCategory, setNewItemCategory] = useState('أسماك');
  const [newItemIsShrimp, setNewItemIsShrimp] = useState(false);
  const [menuSaveSuccess, setMenuSaveSuccess] = useState(false);

  // Sync props when opening
  React.useEffect(() => {
    if (isOpen) {
      setSiteTitle(config.siteTitle);
      setWalletNumber(config.walletNumber);
      setInstapayNumber(config.instapayNumber);
      setLocalMenu(menuItems);
      setPasswordInput('');
      setLoginError(false);
    }
  }, [isOpen, config, menuItems]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(passwordInput);
    if (!ok) {
      setLoginError(true);
    } else {
      setLoginError(false);
    }
  };

  const handleSaveGeneralConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      siteTitle: siteTitle.trim() || config.siteTitle,
      walletNumber: walletNumber.trim() || config.walletNumber,
      instapayNumber: instapayNumber.trim() || config.instapayNumber,
    });
    setSaveConfigSuccess(true);
    setTimeout(() => setSaveConfigSuccess(false), 2500);
  };

  const handlePriceChange = (id: string, price: number) => {
    setLocalMenu((prev) =>
      prev.map((item) => (item.id === id ? { ...item, pricePerKilo: Math.max(0, price) } : item))
    );
  };

  const handleAddNewMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || newItemPrice === '') return;

    const isShrimp = newItemIsShrimp || newItemName.includes('جمبري');
    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      pricePerKilo: Number(newItemPrice) || 0,
      isShrimp,
      category: newItemCategory.trim() || (isShrimp ? 'جمبري' : 'مأكولات'),
    };

    const updated = [...localMenu, newItem];
    setLocalMenu(updated);
    onSaveMenu(updated);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemIsShrimp(false);
    setMenuSaveSuccess(true);
    setTimeout(() => setMenuSaveSuccess(false), 2000);
  };

  const handleDeleteMenuItem = (id: string) => {
    const updated = localMenu.filter((it) => it.id !== id);
    setLocalMenu(updated);
    onSaveMenu(updated);
  };

  const handleSaveMenuChanges = () => {
    onSaveMenu(localMenu);
    setMenuSaveSuccess(true);
    setTimeout(() => setMenuSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-700 flex items-center justify-center text-blue-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                لوحة تحكم المشرف (Admin Panel)
              </h2>
              <p className="text-xs text-slate-400">
                إدارة أسماء المحفظة، أسعار الأصناف، وتصدير التقارير
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isAdmin ? (
          /* Password Prompt */
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">تسجيل الدخول للمشرف</h3>
              <p className="text-xs text-slate-400 mt-1">
                يرجى إدخال كلمة المرور المخصصة للوصول إلى لوحة الإعدادات
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-3 mt-2">
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="كلمة المرور..."
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-center text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-lg font-mono-num"
                />
              </div>

              {loginError && (
                <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>كلمة المرور غير صحيحة! كلمة السر هي 0000</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors shadow"
              >
                تأكيد الدخول
              </button>
            </form>
          </div>
        ) : (
          /* Admin Main Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-800 bg-slate-950/40 px-6 gap-2 pt-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>إعدادات الموقع والتحويل</span>
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'menu'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>قائمة الأصناف والأسعار ({localMenu.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'pdf'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>تصدير PDF والطباعة</span>
              </button>

              <button
                onClick={() => setActiveTab('danger')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'danger'
                    ? 'border-rose-500 text-rose-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: General Config */}
              {activeTab === 'general' && (
                <form onSubmit={handleSaveGeneralConfig} className="space-y-4 max-w-xl mx-auto">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      اسم الموقع / عنوان المتجر (Site Title):
                    </label>
                    <input
                      type="text"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        رقم المحفظة الإلكترونية (e-Wallet):
                      </label>
                      <input
                        type="text"
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm font-mono-num text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        حساب / رقم انستا باي (InstaPay):
                      </label>
                      <input
                        type="text"
                        value={instapayNumber}
                        onChange={(e) => setInstapayNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm font-mono-num text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg text-xs transition-colors shadow"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ بيانات الموقع والمحفظة</span>
                    </button>

                    {saveConfigSuccess && (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <Check className="w-4 h-4" />
                        <span>تم الحفظ والتحديث لجميع المستخدمين فوراً!</span>
                      </span>
                    )}
                  </div>
                </form>
              )}

              {/* TAB 2: Menu Items & Price per Kilo */}
              {activeTab === 'menu' && (
                <div className="space-y-6">
                  {/* Add New Item Box */}
                  <form
                    onSubmit={handleAddNewMenuItem}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-blue-400" />
                        <span>إضافة صنف أو فئة جديدة للقائمة (Item Category / Type)</span>
                      </span>
                      {menuSaveSuccess && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>تم تحديث القائمة بنجاح!</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] text-slate-400 mb-1">اسم الصنف والطهي:</label>
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => {
                            setNewItemName(e.target.value);
                            if (e.target.value.includes('جمبري')) {
                              setNewItemIsShrimp(true);
                            }
                          }}
                          placeholder="مثال: سمك قاروص مشوي زيت وليمون"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] text-slate-400 mb-1">السعر للكيلو (ج.م):</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="مثال: 220"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono-num focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">نوع الصنف:</label>
                        <select
                          value={newItemIsShrimp ? 'جمبري' : 'أسماك'}
                          onChange={(e) => setNewItemIsShrimp(e.target.value === 'جمبري')}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="أسماك">سمك عادي</option>
                          <option value="جمبري">جمبري (يفتح الوزن)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>أضف للقائمة</span>
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* List of existing menu items with editable Price per Kilo */}
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800">
                      <span className="text-xs font-bold text-slate-300">
                        تعديل أسعار الكيلو للأصناف الحالية
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveMenuChanges}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1 rounded text-xs transition-colors flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>حفظ جميع الأسعار</span>
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                      {localMenu.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-slate-800/40 text-xs transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono-num text-slate-500 w-6 text-center">{idx + 1}</span>
                            <span className="font-medium text-slate-200">{item.name}</span>
                            {item.isShrimp && (
                              <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/60 px-1.5 py-0.5 rounded">
                                جمبري (وزن)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400 text-[11px]">سعر الكيلو:</span>
                              <input
                                type="number"
                                min="0"
                                value={item.pricePerKilo}
                                onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center font-mono-num text-slate-100 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="text-slate-400 text-[11px]">ج.م</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                              title="حذف الصنف من القائمة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PDF Export Options */}
              {activeTab === 'pdf' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-bold text-slate-100">
                      خيارات تصدير التقارير والفواتير (PDF Export)
                    </h3>
                    <p className="text-xs text-slate-400">
                      تصدير تفصيلي لكل عميل أو تصدير ملخص تجهيز وطهي المطبخ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Detailed Orders */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-blue-900/40 border border-blue-800 flex items-center justify-center text-blue-400 mb-3">
                          <Layers className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-200">
                          1. تصدير تفصيلي للطلبات
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          يتضمن أسماء العملاء، تفاصيل كل صنف، الكمية، والأسعار الفرعية مع الإجمالي العام.
                        </p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          onClick={() => printDocument('detailed', state)}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                        >
                          <Printer className="w-4 h-4" />
                          <span>معاينة وطباعة تفصيلية (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => generateDirectJsPDF('detailed', state)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>تحميل ملف jsPDF مباشر</span>
                        </button>
                      </div>
                    </div>

                    {/* Option 2: Summary of items */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-900/40 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-3">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-200">
                          2. تصدير ملخص الأصناف
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          ملخص مجمع لأصناف المطبخ والشواية (كم بلطي كبير؟ كم بوري؟ إجمالي الجمبري بالأوزان).
                        </p>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button
                          type="button"
                          onClick={() => printDocument('summary', state)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                        >
                          <Printer className="w-4 h-4" />
                          <span>معاينة وطباعة ملخص الأصناف (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => generateDirectJsPDF('summary', state)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-1.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>تحميل ملف jsPDF مباشر</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Danger Zone */}
              {activeTab === 'danger' && (
                <div className="max-w-md mx-auto p-4 bg-rose-950/20 border border-rose-900/60 rounded-xl space-y-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-rose-900/40 border border-rose-700 flex items-center justify-center text-rose-400 mx-auto">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">
                      تفريغ وإلغاء جميع الطلبات الحالية
                    </h4>
                    <p className="text-xs text-rose-400/80 mt-1">
                      سيؤدي هذا الإجراء إلى مسح طلبات جميع الأسماء وبدء وردية جديدة.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل أنت متأكد من رغبتك في تفريغ ومسح جميع طلبات اليوم؟')) {
                        onClearAllOrders();
                        onClose();
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors shadow"
                  >
                    تأكيد تفريغ كافة الطلبات
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
