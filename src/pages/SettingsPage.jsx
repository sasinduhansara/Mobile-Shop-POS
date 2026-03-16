import { useEffect, useMemo, useState } from "react";
import { currencyFormat } from "../utils/currencyFormat.js";

const panelClassName =
  "rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm";

const roleOptions = ["Admin", "Cashier", "Technician"];
const taxTypeOptions = ["Inclusive", "Exclusive"];
const languageOptions = ["English", "Sinhala", "Tamil"];
const currencyOptions = ["LKR", "USD", "INR"];
const dateFormatOptions = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"];
const themeOptions = ["Light", "Dark"];
const backupFrequencyOptions = ["Daily", "Weekly", "Monthly"];

const makeId = (prefix) =>
  `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`;

const currentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

function SectionHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-(--color-main-text)">
        {title}
      </h3>
      <p className="mt-1 text-sm text-(--color-muted-text)">{description}</p>
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-(--color-border) px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-(--color-main-text)">{label}</p>
        {description ? (
          <p className="text-xs text-(--color-muted-text)">{description}</p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsPage() {
  const [businessInfo, setBusinessInfo] = useState({
    shopName: "Mobile Shop POS",
    logoName: "",
    address: "No. 24, Main Street, Colombo 12",
    phone: "0771234567",
    email: "info@mobileshop.lk",
    website: "www.mobileshop.lk",
    taxId: "BRN-2026-5567",
  });

  const [receiptSettings, setReceiptSettings] = useState({
    headerText: "Thank you for shopping with us",
    footerText: "Goods sold are not returnable after 7 days.",
    promoMessage: "Weekend Offer: Accessories 10% Off",
    showTaxDetails: true,
    showShopLogo: true,
    autoPrintAfterSale: true,
  });

  const [posSettings, setPosSettings] = useState({
    defaultPaymentMethod: "Cash",
    enableDiscounts: true,
    enableBarcodeScanning: true,
    autoFillQuantity: true,
    enableQuickProductButtons: true,
    enableDefaultCustomer: false,
    enableOrderRemarks: true,
  });

  const [paymentMethods, setPaymentMethods] = useState([
    { id: "PM-001", name: "Cash", enabled: true, isDefault: true },
    {
      id: "PM-002",
      name: "Credit / Debit Card",
      enabled: true,
      isDefault: false,
    },
    { id: "PM-003", name: "Bank Transfer", enabled: true, isDefault: false },
    { id: "PM-004", name: "Mobile Payment", enabled: false, isDefault: false },
    { id: "PM-005", name: "Digital Wallet", enabled: false, isDefault: false },
  ]);

  const [taxSettings, setTaxSettings] = useState({
    taxName: "VAT",
    taxPercentage: 18,
    taxType: "Exclusive",
    enabled: true,
  });

  const [inventorySettings, setInventorySettings] = useState({
    lowStockThreshold: 10,
    allowSellOutOfStock: false,
    enableStockValidation: true,
    enableBatchTracking: true,
  });

  const [users, setUsers] = useState([
    {
      id: "USR-001",
      fullName: "Sasindu Admin",
      email: "admin@mobileshop.lk",
      role: "Admin",
      active: true,
      lastLogin: "2026-03-12 08:42",
    },
    {
      id: "USR-002",
      fullName: "Nuwan Cashier",
      email: "cashier@mobileshop.lk",
      role: "Cashier",
      active: true,
      lastLogin: "2026-03-12 09:01",
    },
    {
      id: "USR-003",
      fullName: "Kasun Technician",
      email: "tech@mobileshop.lk",
      role: "Technician",
      active: true,
      lastLogin: "2026-03-11 18:24",
    },
  ]);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    role: "Cashier",
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeoutMinutes: 30,
    requireLoginPin: true,
    enableActivityLogs: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlerts: true,
    warrantyExpirationAlerts: true,
    repairCompletionAlerts: true,
    emailNotifications: false,
  });

  const [hardwareDevices, setHardwareDevices] = useState([
    {
      id: "HW-001",
      name: "Receipt Printer",
      model: "Epson TM-T82",
      connected: true,
      autoConnect: true,
    },
    {
      id: "HW-002",
      name: "Barcode Scanner",
      model: "Honeywell Voyager",
      connected: true,
      autoConnect: true,
    },
    {
      id: "HW-003",
      name: "Cash Drawer",
      model: "Rongta RT-410",
      connected: false,
      autoConnect: false,
    },
    {
      id: "HW-004",
      name: "Customer Display Screen",
      model: 'Generic 10" LCD',
      connected: false,
      autoConnect: false,
    },
  ]);

  const [backupSettings, setBackupSettings] = useState({
    autoBackupEnabled: true,
    schedule: "Weekly",
    scheduleTime: "01:00",
    lastBackupAt: "2026-03-11 23:15",
  });

  const [restoreFile, setRestoreFile] = useState(null);

  const [systemPreferences, setSystemPreferences] = useState({
    language: "English",
    currency: "LKR",
    dateFormat: "YYYY-MM-DD",
    theme: "Light",
  });

  const [notice, setNotice] = useState("");
  const [activityLogs, setActivityLogs] = useState([
    {
      id: "LOG-001",
      time: "2026-03-12 09:10",
      action: "Business settings updated by Owner",
    },
    {
      id: "LOG-002",
      time: "2026-03-11 23:15",
      action: "Automatic weekly backup completed",
    },
  ]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const enabledPaymentMethodsCount = useMemo(
    () => paymentMethods.filter((method) => method.enabled).length,
    [paymentMethods],
  );

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.active).length,
    [users],
  );

  const connectedHardwareCount = useMemo(
    () => hardwareDevices.filter((device) => device.connected).length,
    [hardwareDevices],
  );

  const pushActivity = (action) => {
    setActivityLogs((prev) =>
      [{ id: makeId("LOG"), time: currentDateTime(), action }, ...prev].slice(
        0,
        20,
      ),
    );
  };

  const showNotice = (message) => {
    setNotice(message);
  };

  const onLogoUpload = (event) => {
    const file = event.target.files?.[0];
    setBusinessInfo((prev) => ({ ...prev, logoName: file ? file.name : "" }));
  };

  const onSaveBusinessInfo = (event) => {
    event.preventDefault();
    showNotice("Business information saved.");
    pushActivity("Business information updated");
  };

  const onSaveReceiptSettings = (event) => {
    event.preventDefault();
    showNotice("Receipt settings saved.");
    pushActivity("Receipt settings updated");
  };

  const onSavePosSettings = (event) => {
    event.preventDefault();
    showNotice("POS settings saved.");
    pushActivity("POS behavior settings updated");
  };

  const onTogglePaymentMethod = (methodId, nextValue) => {
    setPaymentMethods((prev) => {
      const nextMethods = prev.map((method) =>
        method.id === methodId ? { ...method, enabled: nextValue } : method,
      );

      const hasDefaultEnabled = nextMethods.some(
        (method) => method.enabled && method.isDefault,
      );

      if (!hasDefaultEnabled) {
        const firstEnabled = nextMethods.find((method) => method.enabled);
        if (firstEnabled) {
          return nextMethods.map((method) => ({
            ...method,
            isDefault: method.id === firstEnabled.id,
          }));
        }
      }

      return nextMethods;
    });
  };

  const onSetDefaultPaymentMethod = (methodId) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        enabled: method.id === methodId ? true : method.enabled,
        isDefault: method.id === methodId,
      })),
    );

    const selected = paymentMethods.find((method) => method.id === methodId);
    if (selected) {
      setPosSettings((prev) => ({
        ...prev,
        defaultPaymentMethod: selected.name,
      }));
      showNotice(`${selected.name} set as default payment.`);
      pushActivity(`Default payment method set to ${selected.name}`);
    }
  };

  const onSaveTaxSettings = (event) => {
    event.preventDefault();
    showNotice("Tax settings saved.");
    pushActivity("Tax settings updated");
  };

  const onSaveInventorySettings = (event) => {
    event.preventDefault();
    showNotice("Inventory settings saved.");
    pushActivity("Inventory settings updated");
  };

  const onAddUser = (event) => {
    event.preventDefault();

    const name = newUser.fullName.trim();
    const email = newUser.email.trim();

    if (!name || !email) {
      showNotice("User name and email are required.");
      return;
    }

    setUsers((prev) => [
      {
        id: makeId("USR"),
        fullName: name,
        email,
        role: newUser.role,
        active: true,
        lastLogin: "-",
      },
      ...prev,
    ]);

    setNewUser({ fullName: "", email: "", role: "Cashier" });
    showNotice("User added successfully.");
    pushActivity(`New user added: ${name} (${newUser.role})`);
  };

  const onToggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, active: !user.active } : user,
      ),
    );

    const targetUser = users.find((user) => user.id === userId);
    if (targetUser) {
      const nextAction = targetUser.active ? "disabled" : "enabled";
      showNotice(`User account ${nextAction}.`);
      pushActivity(`User ${targetUser.fullName} account ${nextAction}`);
    }
  };

  const onChangeUserPassword = (userId) => {
    const targetUser = users.find((user) => user.id === userId);
    if (!targetUser) return;

    const nextPassword = window.prompt(
      `Enter new password for ${targetUser.fullName}`,
    );
    if (!nextPassword) return;

    showNotice(`Password updated for ${targetUser.fullName}.`);
    pushActivity(`Password changed for user ${targetUser.fullName}`);
  };

  const onSaveSecuritySettings = (event) => {
    event.preventDefault();
    showNotice("Security settings saved.");
    pushActivity("Security settings updated");
  };

  const onRunDataBackup = () => {
    const payload = {
      generatedAt: currentDateTime(),
      businessInfo,
      receiptSettings,
      posSettings,
      paymentMethods,
      taxSettings,
      inventorySettings,
      users,
      securitySettings,
      notificationSettings,
      hardwareDevices,
      backupSettings,
      systemPreferences,
    };

    downloadFile(
      JSON.stringify(payload, null, 2),
      `mobile-shop-pos-settings-backup-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json",
    );

    setBackupSettings((prev) => ({ ...prev, lastBackupAt: currentDateTime() }));
    showNotice("Manual backup completed.");
    pushActivity("Manual backup created");
  };

  const onRestoreFromBackup = () => {
    if (!restoreFile) {
      showNotice("Select a backup file first.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const raw = typeof reader.result === "string" ? reader.result : "{}";
        const parsed = JSON.parse(raw);

        if (parsed.businessInfo)
          setBusinessInfo((prev) => ({ ...prev, ...parsed.businessInfo }));
        if (parsed.receiptSettings) {
          setReceiptSettings((prev) => ({
            ...prev,
            ...parsed.receiptSettings,
          }));
        }
        if (parsed.posSettings)
          setPosSettings((prev) => ({ ...prev, ...parsed.posSettings }));
        if (Array.isArray(parsed.paymentMethods))
          setPaymentMethods(parsed.paymentMethods);
        if (parsed.taxSettings)
          setTaxSettings((prev) => ({ ...prev, ...parsed.taxSettings }));
        if (parsed.inventorySettings) {
          setInventorySettings((prev) => ({
            ...prev,
            ...parsed.inventorySettings,
          }));
        }
        if (Array.isArray(parsed.users)) setUsers(parsed.users);
        if (parsed.securitySettings) {
          setSecuritySettings((prev) => ({
            ...prev,
            ...parsed.securitySettings,
          }));
        }
        if (parsed.notificationSettings) {
          setNotificationSettings((prev) => ({
            ...prev,
            ...parsed.notificationSettings,
          }));
        }
        if (Array.isArray(parsed.hardwareDevices))
          setHardwareDevices(parsed.hardwareDevices);
        if (parsed.backupSettings) {
          setBackupSettings((prev) => ({ ...prev, ...parsed.backupSettings }));
        }
        if (parsed.systemPreferences) {
          setSystemPreferences((prev) => ({
            ...prev,
            ...parsed.systemPreferences,
          }));
        }

        showNotice("Backup restored successfully.");
        pushActivity("Backup restored from file");
        setRestoreFile(null);
      } catch {
        showNotice("Invalid backup file format.");
      }
    };

    reader.readAsText(restoreFile);
  };

  const onSaveNotificationSettings = (event) => {
    event.preventDefault();
    showNotice("Notification settings saved.");
    pushActivity("Notification settings updated");
  };

  const onToggleHardwareConnection = (deviceId, nextValue) => {
    setHardwareDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId ? { ...device, connected: nextValue } : device,
      ),
    );
  };

  const onToggleHardwareAutoConnect = (deviceId, nextValue) => {
    setHardwareDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId ? { ...device, autoConnect: nextValue } : device,
      ),
    );
  };

  const onTestHardware = (deviceId) => {
    const target = hardwareDevices.find((device) => device.id === deviceId);
    if (!target) return;

    showNotice(`Test command sent to ${target.name}.`);
    pushActivity(`Hardware test triggered for ${target.name}`);
  };

  const onSaveSystemPreferences = (event) => {
    event.preventDefault();
    showNotice("System preferences saved.");
    pushActivity("System preferences updated");
  };

  const onSaveAll = () => {
    showNotice("All settings saved.");
    pushActivity("All settings saved by owner");
  };

  const defaultPayment = paymentMethods.find((method) => method.isDefault);

  const taxPreview = taxSettings.enabled
    ? `${taxSettings.taxName} ${taxSettings.taxPercentage}% (${taxSettings.taxType})`
    : "Tax disabled";

  return (
    <div className="space-y-6">
      <section
        className={`${panelClassName} flex flex-wrap items-start justify-between gap-4`}
      >
        <div>
          <h2 className="text-xl font-semibold text-(--color-main-text)">
            Settings & Configuration
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted-text)">
            Configure business profile, POS behavior, receipts, users, security,
            hardware, backup strategy, and system preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={onSaveAll}
          className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
        >
          Save All Settings
        </button>
      </section>

      {notice ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {notice}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Enabled Payments
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {enabledPaymentMethodsCount}
          </p>
        </article>
        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Active Users
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {activeUsersCount}
          </p>
        </article>
        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Connected Devices
          </p>
          <p className="mt-2 text-2xl font-semibold text-(--color-main-text)">
            {connectedHardwareCount}
          </p>
        </article>
        <article className={panelClassName}>
          <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
            Tax Preview
          </p>
          <p className="mt-2 text-sm font-semibold text-(--color-main-text)">
            {taxPreview}
          </p>
        </article>
      </section>

      <section className={`${panelClassName} space-y-4`}>
        <SectionHeader
          title="Business / Shop Information"
          description="Update your shop details shown in POS and printed documents."
        />

        <form
          onSubmit={onSaveBusinessInfo}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Shop Name
            <input
              type="text"
              value={businessInfo.shopName}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  shopName: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <div className="space-y-2 text-sm text-(--color-muted-text)">
            <p>Shop Logo</p>
            <div className="flex items-center gap-3 rounded-lg border border-(--color-border) px-3 py-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                {businessInfo.shopName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onLogoUpload}
                  className="w-full rounded-lg border border-(--color-border) px-2 py-1.5 text-xs text-(--color-main-text)"
                />
                <p className="mt-1 truncate text-xs text-(--color-muted-text)">
                  {businessInfo.logoName || "No logo selected"}
                </p>
              </div>
            </div>
          </div>

          <label className="space-y-1 text-sm text-(--color-muted-text) sm:col-span-2">
            Address
            <textarea
              rows={2}
              value={businessInfo.address}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  address: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Phone Number
            <input
              type="text"
              value={businessInfo.phone}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  phone: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Email Address
            <input
              type="email"
              value={businessInfo.email}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Website
            <input
              type="text"
              value={businessInfo.website}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  website: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Tax ID / Business Registration No.
            <input
              type="text"
              value={businessInfo.taxId}
              onChange={(event) =>
                setBusinessInfo((prev) => ({
                  ...prev,
                  taxId: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save Business Info
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <SectionHeader
            title="Receipt Settings"
            description="Configure printed receipt content and behavior."
          />

          <form onSubmit={onSaveReceiptSettings} className="space-y-3">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Receipt Header Text
              <input
                type="text"
                value={receiptSettings.headerText}
                onChange={(event) =>
                  setReceiptSettings((prev) => ({
                    ...prev,
                    headerText: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Receipt Footer Text
              <input
                type="text"
                value={receiptSettings.footerText}
                onChange={(event) =>
                  setReceiptSettings((prev) => ({
                    ...prev,
                    footerText: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Promotional Message
              <textarea
                rows={2}
                value={receiptSettings.promoMessage}
                onChange={(event) =>
                  setReceiptSettings((prev) => ({
                    ...prev,
                    promoMessage: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <ToggleField
              label="Show tax details"
              checked={receiptSettings.showTaxDetails}
              onChange={(checked) =>
                setReceiptSettings((prev) => ({
                  ...prev,
                  showTaxDetails: checked,
                }))
              }
            />
            <ToggleField
              label="Show shop logo"
              checked={receiptSettings.showShopLogo}
              onChange={(checked) =>
                setReceiptSettings((prev) => ({
                  ...prev,
                  showShopLogo: checked,
                }))
              }
            />
            <ToggleField
              label="Print automatically after sale"
              checked={receiptSettings.autoPrintAfterSale}
              onChange={(checked) =>
                setReceiptSettings((prev) => ({
                  ...prev,
                  autoPrintAfterSale: checked,
                }))
              }
            />

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save Receipt Settings
            </button>
          </form>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <SectionHeader
            title="POS Settings"
            description="Control checkout flow, discounts, barcode and order options."
          />

          <form onSubmit={onSavePosSettings} className="space-y-3">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Default Payment Method
              <select
                value={posSettings.defaultPaymentMethod}
                onChange={(event) =>
                  setPosSettings((prev) => ({
                    ...prev,
                    defaultPaymentMethod: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {paymentMethods
                  .filter((method) => method.enabled)
                  .map((method) => (
                    <option key={method.id} value={method.name}>
                      {method.name}
                    </option>
                  ))}
              </select>
            </label>

            <ToggleField
              label="Enable discounts"
              checked={posSettings.enableDiscounts}
              onChange={(checked) =>
                setPosSettings((prev) => ({
                  ...prev,
                  enableDiscounts: checked,
                }))
              }
            />
            <ToggleField
              label="Enable barcode scanning"
              checked={posSettings.enableBarcodeScanning}
              onChange={(checked) =>
                setPosSettings((prev) => ({
                  ...prev,
                  enableBarcodeScanning: checked,
                }))
              }
            />
            <ToggleField
              label="Auto-fill quantity"
              checked={posSettings.autoFillQuantity}
              onChange={(checked) =>
                setPosSettings((prev) => ({
                  ...prev,
                  autoFillQuantity: checked,
                }))
              }
            />
            <ToggleField
              label="Enable quick product buttons"
              checked={posSettings.enableQuickProductButtons}
              onChange={(checked) =>
                setPosSettings((prev) => ({
                  ...prev,
                  enableQuickProductButtons: checked,
                }))
              }
            />
            <ToggleField
              label="Enable default customer"
              checked={posSettings.enableDefaultCustomer}
              onChange={(checked) =>
                setPosSettings((prev) => ({
                  ...prev,
                  enableDefaultCustomer: checked,
                }))
              }
            />
            <ToggleField
              label="Enable order remarks"
              checked={posSettings.enableOrderRemarks}
              onChange={(checked) =>
                setPosSettings((prev) => ({
                  ...prev,
                  enableOrderRemarks: checked,
                }))
              }
            />

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save POS Settings
            </button>
          </form>
        </article>
      </section>

      <section className={`${panelClassName} space-y-4`}>
        <SectionHeader
          title="Payment Methods"
          description="Enable/disable methods and set default payment option."
        />

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              <tr>
                <th className="px-4 py-3">Payment Type</th>
                <th className="px-4 py-3">Enabled</th>
                <th className="px-4 py-3">Default</th>
              </tr>
            </thead>
            <tbody>
              {paymentMethods.map((method) => (
                <tr
                  key={method.id}
                  className="border-t border-(--color-border)"
                >
                  <td className="px-4 py-3 text-(--color-main-text)">
                    {method.name}
                  </td>
                  <td className="px-4 py-3">
                    <ToggleField
                      label=""
                      checked={method.enabled}
                      onChange={(checked) =>
                        onTogglePaymentMethod(method.id, checked)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center gap-2 text-sm text-(--color-main-text)">
                      <input
                        type="radio"
                        name="default-payment"
                        checked={method.isDefault}
                        onChange={() => onSetDefaultPaymentMethod(method.id)}
                        className="h-4 w-4"
                      />
                      Default
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-(--color-muted-text)">
          Current default payment:{" "}
          <span className="font-semibold text-(--color-main-text)">
            {defaultPayment?.name || "N/A"}
          </span>
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <SectionHeader
            title="Tax Settings"
            description="Set tax rule name, percentage, type and active status."
          />

          <form onSubmit={onSaveTaxSettings} className="space-y-3">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Tax Name
              <input
                type="text"
                value={taxSettings.taxName}
                onChange={(event) =>
                  setTaxSettings((prev) => ({
                    ...prev,
                    taxName: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Tax Percentage
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxSettings.taxPercentage}
                onChange={(event) =>
                  setTaxSettings((prev) => ({
                    ...prev,
                    taxPercentage: Number(event.target.value),
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Tax Type
              <select
                value={taxSettings.taxType}
                onChange={(event) =>
                  setTaxSettings((prev) => ({
                    ...prev,
                    taxType: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {taxTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <ToggleField
              label="Enable tax"
              checked={taxSettings.enabled}
              onChange={(checked) =>
                setTaxSettings((prev) => ({ ...prev, enabled: checked }))
              }
            />

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save Tax Settings
            </button>
          </form>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <SectionHeader
            title="Inventory Settings"
            description="Define stock rules, alert threshold and validation behavior."
          />

          <form onSubmit={onSaveInventorySettings} className="space-y-3">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Low Stock Alert Threshold
              <input
                type="number"
                min="0"
                value={inventorySettings.lowStockThreshold}
                onChange={(event) =>
                  setInventorySettings((prev) => ({
                    ...prev,
                    lowStockThreshold: Number(event.target.value),
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <ToggleField
              label="Allow selling out-of-stock items"
              checked={inventorySettings.allowSellOutOfStock}
              onChange={(checked) =>
                setInventorySettings((prev) => ({
                  ...prev,
                  allowSellOutOfStock: checked,
                }))
              }
            />
            <ToggleField
              label="Enable stock validation"
              checked={inventorySettings.enableStockValidation}
              onChange={(checked) =>
                setInventorySettings((prev) => ({
                  ...prev,
                  enableStockValidation: checked,
                }))
              }
            />
            <ToggleField
              label="Enable product batch tracking"
              checked={inventorySettings.enableBatchTracking}
              onChange={(checked) =>
                setInventorySettings((prev) => ({
                  ...prev,
                  enableBatchTracking: checked,
                }))
              }
            />

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save Inventory Settings
            </button>
          </form>
        </article>
      </section>

      <section className={`${panelClassName} space-y-4`}>
        <SectionHeader
          title="User Management"
          description="Add users, assign roles, change password and enable/disable accounts."
        />

        <form
          onSubmit={onAddUser}
          className="grid gap-3 sm:grid-cols-[1fr,1fr,180px,auto]"
        >
          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Full Name
            <input
              type="text"
              value={newUser.fullName}
              onChange={(event) =>
                setNewUser((prev) => ({
                  ...prev,
                  fullName: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Email
            <input
              type="email"
              value={newUser.email}
              onChange={(event) =>
                setNewUser((prev) => ({ ...prev, email: event.target.value }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            />
          </label>

          <label className="space-y-1 text-sm text-(--color-muted-text)">
            Role
            <select
              value={newUser.role}
              onChange={(event) =>
                setNewUser((prev) => ({ ...prev, role: event.target.value }))
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="self-end rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
          >
            Add User
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-(--color-border)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3">
                    <p className="font-medium text-(--color-main-text)">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-(--color-muted-text)">
                      {user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-(--color-main-text)">
                    {user.role}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        user.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {user.active ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--color-muted-text)">
                    {user.lastLogin}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onChangeUserPassword(user.id)}
                        className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-main-text)"
                      >
                        Change Password
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleUserStatus(user.id)}
                        className="rounded-lg border border-(--color-border) px-3 py-1.5 text-xs font-medium text-(--color-main-text)"
                      >
                        {user.active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <SectionHeader
            title="Security Settings"
            description="Session controls, login PIN policy, and system activity logs."
          />

          <form onSubmit={onSaveSecuritySettings} className="space-y-3">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Session Timeout (minutes)
              <input
                type="number"
                min="5"
                value={securitySettings.sessionTimeoutMinutes}
                onChange={(event) =>
                  setSecuritySettings((prev) => ({
                    ...prev,
                    sessionTimeoutMinutes: Number(event.target.value),
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <ToggleField
              label="Require login PIN"
              checked={securitySettings.requireLoginPin}
              onChange={(checked) =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  requireLoginPin: checked,
                }))
              }
            />
            <ToggleField
              label="Enable activity logs"
              checked={securitySettings.enableActivityLogs}
              onChange={(checked) =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  enableActivityLogs: checked,
                }))
              }
            />

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save Security Settings
            </button>
          </form>

          <div className="rounded-lg border border-(--color-border) px-4 py-3 text-sm text-(--color-muted-text)">
            Latest backup status:{" "}
            <span className="font-medium text-(--color-main-text)">
              {backupSettings.lastBackupAt}
            </span>
          </div>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <SectionHeader
            title="Notification Settings"
            description="Manage stock, warranty, repair, and email alerts."
          />

          <form onSubmit={onSaveNotificationSettings} className="space-y-3">
            <ToggleField
              label="Low stock alerts"
              checked={notificationSettings.lowStockAlerts}
              onChange={(checked) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  lowStockAlerts: checked,
                }))
              }
            />
            <ToggleField
              label="Warranty expiration alerts"
              checked={notificationSettings.warrantyExpirationAlerts}
              onChange={(checked) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  warrantyExpirationAlerts: checked,
                }))
              }
            />
            <ToggleField
              label="Repair completion alerts"
              checked={notificationSettings.repairCompletionAlerts}
              onChange={(checked) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  repairCompletionAlerts: checked,
                }))
              }
            />
            <ToggleField
              label="Email notifications"
              checked={notificationSettings.emailNotifications}
              onChange={(checked) =>
                setNotificationSettings((prev) => ({
                  ...prev,
                  emailNotifications: checked,
                }))
              }
            />

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save Notification Settings
            </button>
          </form>
        </article>
      </section>

      <section className={`${panelClassName} space-y-4`}>
        <SectionHeader
          title="Hardware Configuration"
          description="Configure POS devices: printer, scanner, cash drawer and customer display."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {hardwareDevices.map((device) => (
            <article
              key={device.id}
              className="rounded-xl border border-(--color-border) p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-(--color-main-text)">
                    {device.name}
                  </p>
                  <p className="text-sm text-(--color-muted-text)">
                    {device.model}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    device.connected
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {device.connected ? "Connected" : "Disconnected"}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <ToggleField
                  label="Connected"
                  checked={device.connected}
                  onChange={(checked) =>
                    onToggleHardwareConnection(device.id, checked)
                  }
                />
                <ToggleField
                  label="Auto connect"
                  checked={device.autoConnect}
                  onChange={(checked) =>
                    onToggleHardwareAutoConnect(device.id, checked)
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => onTestHardware(device.id)}
                className="mt-3 rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text)"
              >
                Test Device
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <SectionHeader
            title="Backup & Restore"
            description="Run manual backup, configure auto-backup schedule and restore from backup file."
          />

          <div className="rounded-lg border border-(--color-border) px-4 py-3 text-sm">
            <p className="text-(--color-muted-text)">Last backup</p>
            <p className="font-semibold text-(--color-main-text)">
              {backupSettings.lastBackupAt}
            </p>
          </div>

          <button
            type="button"
            onClick={onRunDataBackup}
            className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
          >
            Manual Backup
          </button>

          <div className="space-y-3 rounded-xl border border-(--color-border) p-4">
            <ToggleField
              label="Enable automatic backup schedule"
              checked={backupSettings.autoBackupEnabled}
              onChange={(checked) =>
                setBackupSettings((prev) => ({
                  ...prev,
                  autoBackupEnabled: checked,
                }))
              }
            />

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Backup Frequency
              <select
                value={backupSettings.schedule}
                onChange={(event) =>
                  setBackupSettings((prev) => ({
                    ...prev,
                    schedule: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {backupFrequencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Backup Time
              <input
                type="time"
                value={backupSettings.scheduleTime}
                onChange={(event) =>
                  setBackupSettings((prev) => ({
                    ...prev,
                    scheduleTime: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>
          </div>

          <div className="space-y-2 rounded-xl border border-(--color-border) p-4">
            <p className="text-sm font-medium text-(--color-main-text)">
              Restore Backup
            </p>
            <input
              type="file"
              accept="application/json"
              onChange={(event) =>
                setRestoreFile(event.target.files?.[0] || null)
              }
              className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-main-text)"
            />
            <button
              type="button"
              onClick={onRestoreFromBackup}
              className="rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text)"
            >
              Restore Backup
            </button>
          </div>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <SectionHeader
            title="System Preferences"
            description="Set language, currency format, date format and theme mode."
          />

          <form onSubmit={onSaveSystemPreferences} className="space-y-3">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Language
              <select
                value={systemPreferences.language}
                onChange={(event) =>
                  setSystemPreferences((prev) => ({
                    ...prev,
                    language: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Currency Format
              <select
                value={systemPreferences.currency}
                onChange={(event) =>
                  setSystemPreferences((prev) => ({
                    ...prev,
                    currency: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Date Format
              <select
                value={systemPreferences.dateFormat}
                onChange={(event) =>
                  setSystemPreferences((prev) => ({
                    ...prev,
                    dateFormat: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {dateFormatOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Theme
              <select
                value={systemPreferences.theme}
                onChange={(event) =>
                  setSystemPreferences((prev) => ({
                    ...prev,
                    theme: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {themeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-lg border border-(--color-border) bg-slate-50 px-3 py-2 text-sm text-(--color-muted-text)">
              Example currency output:{" "}
              <span className="font-semibold text-(--color-main-text)">
                {currencyFormat(125000)}
              </span>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save System Preferences
            </button>
          </form>
        </article>
      </section>

      <section className={`${panelClassName} space-y-3`}>
        <SectionHeader
          title="Activity Log"
          description="Recent configuration and security actions for auditing."
        />

        <div className="overflow-x-auto rounded-xl border border-(--color-border)">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3 text-(--color-muted-text)">
                    {log.time}
                  </td>
                  <td className="px-4 py-3 text-(--color-main-text)">
                    {log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default SettingsPage;
