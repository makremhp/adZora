export const AD_FORMATS = [
  { id: "native", name: "Native", description: "Content-integrated ads with a clear sponsored label.", pricing: ["CPM", "CPC"], share: { publisher: 45, platform: 55 } },
  { id: "social", name: "Social", description: "Social-style creative with brand, title, and call to action.", pricing: ["CPM", "CPC"], share: { publisher: 40, platform: 60 } },
  { id: "video", name: "Video", description: "Video placements with poster, playback, and CTA states.", pricing: ["CPM", "CPV"], share: { publisher: 50, platform: 50 } },
];

export const PRICING_MODELS = [
  { id: "CPM", label: "CPM", description: "Cost per 1,000 impressions" },
  { id: "CPC", label: "CPC", description: "Cost per valid click" },
  { id: "CPV", label: "CPV", description: "Cost per qualified view" },
  { id: "CPA", label: "CPA", description: "Future architecture — not active yet", future: true },
];

export const WEBSITE_TYPES = [
  { id: "news", label: "News & Media", arabic: "أخبار وإعلام", description: "مواقع الأخبار والمقالات والمجلات." },
  { id: "technology", label: "Technology", arabic: "تقنية", description: "منتجات وأدوات ومحتوى تقني." },
  { id: "entertainment", label: "Entertainment", arabic: "ترفيه", description: "فيديو ومحتوى ترفيهي ومجتمعات." },
  { id: "business", label: "Business", arabic: "أعمال", description: "أعمال وأسواق وخدمات مهنية." },
  { id: "sports", label: "Sports", arabic: "رياضة", description: "أخبار ونتائج ومحتوى رياضي." },
  { id: "other", label: "Other", arabic: "نوع آخر", description: "اختر هذا إذا لم يناسبك تصنيف آخر." },
];

export const AD_ZONE_REQUIREMENTS = {
  native: { title: "Native requirements", summary: "Add an image and a short content title.", fields: ["image", "title"] },
  social: { title: "Social requirements", summary: "Add an image and a social-style headline.", fields: ["image", "title"] },
  video: { title: "Video requirements", summary: "Upload an MP4 or WebM video up to 20 MB and 5–60 seconds.", fields: ["video"] },
};

export const PAYMENT_METHODS = [
  { id: "cwallet", label: "Cwallet", description: "USDT only · Account identifier · manual review", icon: "wallet" },
  { id: "web3", label: "Web3 Wallet", description: "BNB · Send to the platform address", icon: "globe" },
  { id: "binance", label: "Binance", description: "USDT · BNB Smart Chain (BEP20)", icon: "card" },
  { id: "ton", label: "TON Network", description: "Wallet SDK connection prepared", icon: "arrow-down" },
];

export const PAYMENT_ASSETS = {
  cwallet: "USDT",
  web3: "BNB",
  ton: "TON",
  binance: "USDT",
};

export const DEPOSIT_METHODS = PAYMENT_METHODS.filter(method => ["web3", "binance", "cwallet"].includes(method.id));
export const WITHDRAWAL_METHODS = PAYMENT_METHODS.filter(method => ["cwallet", "ton", "binance"].includes(method.id));
export const BNB_NETWORK = "BNB Smart Chain (BEP20)";

export const DEPOSIT_CONFIG = {
  currency: "USD",
  status: "Pending",
  statuses: ["Pending", "Processing", "Completed", "Rejected"],
  methods: DEPOSIT_METHODS.map(method => method.id),
  assets: PAYMENT_ASSETS,
  networks: [BNB_NETWORK],
  fees: { cwallet: 0, web3: 0, binance: 0 },
  minimumAmount: 1,
  // A method only shows its Transaction ID field / requires a screenshot when listed here.
  requireTxid: { web3: true, binance: true },
  requireScreenshot: { web3: true, cwallet: true, binance: true },
};

// Platform-owned deposit destinations used to live here as static values. They are now
// served by the backend (GET /api/config/payment-destinations, backed by the
// `platform_config` table) so an admin can configure them without a code change, and so
// no placeholder address ever ships in the frontend bundle. See src/api.js.

export const WITHDRAWAL_CONFIG = {
  currency: "USD",
  minimumAmount: 50,
  status: "Pending",
  statuses: ["Pending", "Processing", "Completed", "Rejected"],
  methods: WITHDRAWAL_METHODS.map(method => method.id),
  assets: PAYMENT_ASSETS,
  networks: ["TON"],
  fees: { cwallet: 0, ton: 0, binance: 0 },
};

export const ROLE_CONFIG = {
  publisher: {
    label: "Publisher",
    arabicLabel: "ناشر",
    identity: "Inventory → Traffic → Earnings → Withdrawals",
    overviewTitle: "Publisher Overview",
    overviewDescription: "أضف موقعك، احصل على Universal AdZora Code، وتابع أرباحك من مكان واحد.",
    balanceLabel: "أرباح الناشر",
    balanceValue: 0,
    heroAction: { id: "withdrawals", label: "Withdraw earnings" },
    nav: [
      { id: "overview", label: "Overview", arabic: "نظرة عامة", icon: "grid" },
      { id: "websites", label: "Websites", arabic: "المواقع", icon: "globe", group: "Monetization" },
      { id: "ad-codes", label: "Universal Ad Code", arabic: "الكود الشامل", icon: "code", group: "Monetization" },
      { id: "analytics", label: "Analytics", arabic: "التحليلات", icon: "chart", group: "Performance" },
      { id: "earnings", label: "Earnings", arabic: "الأرباح", icon: "trend", group: "Performance" },
      { id: "withdrawals", label: "Withdrawals", arabic: "السحوبات", icon: "arrow-up", group: "Funds" },
      { id: "transactions", label: "Transactions", arabic: "المعاملات", icon: "receipt", group: "Funds" },
      { id: "profile", label: "Profile", arabic: "الملف الشخصي", icon: "user", group: "Account" },
      { id: "settings", label: "Settings", arabic: "الإعدادات", icon: "settings", group: "Account" },
    ],
    metrics: [
      { label: "Available Earnings", arabic: "الأرباح المتاحة", value: "$0.00", hint: "Ready to withdraw", icon: "wallet", tone: "gold" },
      { label: "Pending Earnings", arabic: "الأرباح المعلّقة", value: "$0.00", hint: "Awaiting validation", icon: "clock", tone: "blue" },
      { label: "Total Earned", arabic: "إجمالي الأرباح", value: "$0.00", hint: "Lifetime approved revenue", icon: "trend", tone: "green" },
      { label: "Total Withdrawn", arabic: "إجمالي المسحوب", value: "$0.00", hint: "Completed withdrawals", icon: "arrow-up", tone: "purple" },
    ],
    performance: [
      { label: "Impressions", value: "0" },
      { label: "Clicks", value: "0" },
      { label: "CTR", value: "--" },
      { label: "eCPM / RPM", value: "--" },
    ],
    quickActions: [
      { id: "websites", label: "Add Website", arabic: "أضف موقعًا", icon: "plus" },
      { id: "ad-codes", label: "Get Universal Ad Code", arabic: "احصل على الكود الشامل", icon: "code" },
      { id: "analytics", label: "View Analytics", arabic: "اعرض التحليلات", icon: "chart" },
    ],
  },
  advertiser: {
    label: "Advertiser",
    arabicLabel: "معلن",
    identity: "Budget → Campaigns → Delivery → Performance → Billing",
    overviewTitle: "Advertiser Overview",
    overviewDescription: "أدر الميزانية والحملات والإبداع الإعلاني وراقب الأداء من مكان واحد.",
    balanceLabel: "رصيد المعلن",
    balanceValue: 0,
    heroAction: { id: "deposits", label: "Add Funds" },
    nav: [
      { id: "overview", label: "Overview", arabic: "نظرة عامة", icon: "grid" },
      { id: "campaigns", label: "Campaigns", arabic: "الحملات", icon: "megaphone", group: "Campaigns" },
      { id: "create-campaign", label: "Create Campaign", arabic: "إنشاء حملة", icon: "plus", group: "Campaigns" },
      { id: "analytics", label: "Analytics", arabic: "التحليلات", icon: "chart", group: "Performance" },
      { id: "reports", label: "Reports", arabic: "التقارير", icon: "file", group: "Performance" },
      { id: "deposits", label: "Deposits", arabic: "الإيداعات", icon: "plus", group: "Funds" },
      { id: "balance", label: "Balance", arabic: "الرصيد", icon: "wallet", group: "Funds" },
      { id: "transactions", label: "Transactions", arabic: "المعاملات", icon: "receipt", group: "Funds" },
      { id: "billing", label: "Billing", arabic: "الفوترة", icon: "card", group: "Funds" },
      { id: "profile", label: "Profile", arabic: "الملف الشخصي", icon: "user", group: "Account" },
      { id: "settings", label: "Settings", arabic: "الإعدادات", icon: "settings", group: "Account" },
    ],
    metrics: [
      { label: "Available Balance", arabic: "الرصيد المتاح", value: "$0.00", hint: "Funds available for campaigns", icon: "wallet", tone: "gold" },
      { label: "Reserved Balance", arabic: "الرصيد المحجوز", value: "$0.00", hint: "Allocated to active campaigns", icon: "lock", tone: "blue" },
      { label: "Total Spent", arabic: "إجمالي الإنفاق", value: "$0.00", hint: "Advertising spend to date", icon: "trend", tone: "green" },
      { label: "Total Deposited", arabic: "إجمالي الإيداعات", value: "$0.00", hint: "Funds added to the account", icon: "arrow-down", tone: "purple" },
    ],
    performance: [
      { label: "Impressions", value: "0" },
      { label: "Clicks", value: "0" },
      { label: "CTR", value: "--" },
      { label: "Spend", value: "$0.00" },
    ],
    quickActions: [
      { id: "create-campaign", label: "Create Campaign", arabic: "أنشئ حملة", icon: "megaphone" },
      { id: "campaigns", label: "Campaigns", arabic: "الحملات", icon: "receipt" },
      { id: "analytics", label: "Analytics", arabic: "التحليلات", icon: "chart" },
    ],
  },
};

export const formatMoney = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(value);

export const RECENT_ITEMS = {
  publisher: [
    { title: "No earnings yet", detail: "Add a website to receive your universal code", status: "Empty" },
  ],
  advertiser: [
    { title: "No campaigns yet", detail: "Create a campaign to start delivery", status: "Empty" },
  ],
};
