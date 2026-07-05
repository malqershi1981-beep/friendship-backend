import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { updateSettings } from "../lib/api";

const SettingsAdmin: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) {
    return <div>⚠️ Context غير متوفر</div>;
  }

  const { settings, setSettings, t } = context;
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSettings(prev => ({
      ...prev,
      quotationValidityDays: parseInt(e.target.value) || prev.quotationValidityDays,
    }));
  };

  const handleSave = async () => {
    try {
      // هنا تستدعي updateSettings من api.ts
      const saved = await updateSettings(localSettings);
      setSettings(saved);
      alert("✅ تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("خطأ أثناء حفظ الإعدادات:", error);
      alert("❌ حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {t("إعدادات النظام", "System Settings")}
      </h2>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">
          {t("فترة صلاحية عرض السعر (أيام)", "Quotation Validity (days)")}
        </label>
        <input
          type="number"
          min={1}
          value={localSettings.quotationValidityDays}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-32"
        />
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {t("حفظ", "Save")}
      </button>
    </div>
  );
};

export default SettingsAdmin;
