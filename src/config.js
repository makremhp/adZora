export const AD_FORMATS = [
  { id: "banner", name: "Image / Banner", description: "Standard display placements for high-visibility inventory.", pricing: ["CPM", "CPC"], share: { publisher: 40, platform: 60 } },
  { id: "native", name: "Native", description: "Content-integrated ads with a clear sponsored label.", pricing: ["CPM", "CPC"], share: { publisher: 45, platform: 55 } },
  { id: "social", name: "Social", description: "Social-style creative with brand, title, and call to action.", pricing: ["CPM", "CPC"], share: { publisher: 40, platform: 60 } },
  { id: "popup", name: "Popup", description: "A controlled popup placement shown through preview states.", pricing: ["CPM", "CPC"], share: { publisher: 35, platform: 65 } },
  { id: "video", name: "Video", description: "Video placements with poster, playback, and CTA states.", pricing: ["CPM", "CPV"], share: { publisher: 50, platform: 50 } },
  { id: "direct-link", name: "Direct Link", description: "A direct destination for advertiser campaigns.", pricing: ["CPC"], share: { publisher: 50, platform: 50 } },
];

export const PRICING_MODELS = [
  { id: "CPM", label: "CPM", description: "Cost per 1,000 impressions" },
  { id: "CPC", label: "CPC", description: "Cost per valid click" },
  { id: "CPV", label: "CPV", description: "Cost per qualified view" },
  { id: "CPA", label: "CPA", description: "Future architecture — not active yet", future: true },
];

export const BANNER_SIZES = ["320×50", "300×250", "336×280", "728×90", "970×250"];

export const WEBSITE_TYPES = [
  { id: "news", label: "News & Media", arabic: "أخبار وإعلام", description: "مواقع الأخبار والمقالات والمجلات." },
  { id: "technology", label: "Technology", arabic: "تقنية", description: "منتجات وأدوات ومحتوى تقني." },
  { id: "entertainment", label: "Entertainment", arabic: "ترفيه", description: "فيديو ومحتوى ترفيهي ومجتمعات." },
  { id: "business", label: "Business", arabic: "أعمال", description: "أعمال وأسواق وخدمات مهنية." },
  { id: "sports", label: "Sports", arabic: "رياضة", description: "أخبار ونتائج ومحتوى رياضي." },
  { id: "other", label: "Other", arabic: "نوع آخر", description: "اختر هذا إذا لم يناسبك تصنيف آخر." },
];

export const AD_ZONE_REQUIREMENTS = {
  banner: { title: "Banner requirements", summary: "Choose one supported banner size.", fields: ["size"] },
  native: { title: "Native requirements", summary: "Add an image and a short content title.", fields: ["image", "title"] },
  social: { title: "Social requirements", summary: "Add an image and a social-style headline.", fields: ["image", "title"] },
  popup: { title: "Popup requirements", summary: "Add the message and destination visitors will see.", fields: ["title", "destination"] },
  video: { title: "Video requirements", summary: "Upload an MP4 or WebM video up to 20 MB and 5–60 seconds.", fields: ["video"] },
  "direct-link": { title: "Direct Link requirements", summary: "Add the HTTPS destination for the promotional link.", fields: ["destination"] },
};

export const ROLE_CONFIG = {
  publisher: {
    label: "Publisher",
    arabicLabel: "ناشر",
    identity: "Inventory → Traffic → Earnings → Withdrawals",
    overviewTitle: "Publisher Overview",
    overviewDescription: "أضف موقعك، احصل على Universal AdZora Code، وتابع أرباحك من مكان واحد.",
    balanceLabel: "Available earnings",
    balanceValue: 0,
    nav: [
      { id: "overview", label: "Overview", arabic: "نظرة عامة", icon: "grid" },
      { id: "websites", label: "Websites", arabic: "المواقع", icon: "globe" },
      { id: "ad-codes", label: "Universal Ad Code", arabic: "الكود الشامل", icon: "code" },
      { id: "earnings", label: "Earnings", arabic: "الأرباح", icon: "trend" },
      { id: "transactions", label: "Transactions", arabic: "المعاملات", icon: "receipt" },
      { id: "withdrawals", label: "Withdrawals", arabic: "السحوبات", icon: "arrow-up" },
      { id: "analytics", label: "Analytics", arabic: "التحليلات", icon: "chart" },
      { id: "profile", label: "Profile", arabic: "الملف الشخصي", icon: "user" },
      { id: "settings", label: "Settings", arabic: "الإعدادات", icon: "settings" },
    ],
    metrics: [
      { label: "Available Earnings", arabic: "الأرباح المتاحة", value: "$0.00", hint: "Ready according to accounting state", icon: "wallet", tone: "gold" },
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
      { id: "earnings", label: "View Earnings", arabic: "اعرض الأرباح", icon: "trend" },
      { id: "withdrawals", label: "Withdraw Earnings", arabic: "اسحب أرباحك", icon: "arrow-up" },
    ],
  },
  advertiser: {
    label: "Advertiser",
    arabicLabel: "معلن",
    identity: "Budget → Campaigns → Delivery → Performance → Billing",
    overviewTitle: "Advertiser Overview",
    overviewDescription: "أدر الميزانية والحملات والإبداع الإعلاني وراقب الأداء من مكان واحد.",
    balanceLabel: "Available balance",
    balanceValue: 0,
    nav: [
      { id: "overview", label: "Overview", arabic: "نظرة عامة", icon: "grid" },
      { id: "campaigns", label: "Campaigns", arabic: "الحملات", icon: "megaphone" },
      { id: "create-campaign", label: "Create Campaign", arabic: "إنشاء حملة", icon: "plus" },
      { id: "creatives", label: "Creatives", arabic: "الإبداعات", icon: "image" },
      { id: "analytics", label: "Analytics", arabic: "التحليلات", icon: "chart" },
      { id: "reports", label: "Reports", arabic: "التقارير", icon: "file" },
      { id: "balance", label: "Balance", arabic: "الرصيد", icon: "wallet" },
      { id: "deposits", label: "Deposits", arabic: "الإيداعات", icon: "plus" },
      { id: "transactions", label: "Transactions", arabic: "المعاملات", icon: "receipt" },
      { id: "billing", label: "Billing", arabic: "الفوترة", icon: "card" },
      { id: "profile", label: "Profile", arabic: "الملف الشخصي", icon: "user" },
      { id: "settings", label: "Settings", arabic: "الإعدادات", icon: "settings" },
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
      { id: "deposits", label: "Add Funds", arabic: "أضف رصيدًا", icon: "plus" },
      { id: "create-campaign", label: "Create Campaign", arabic: "أنشئ حملة", icon: "megaphone" },
      { id: "creatives", label: "Add Creative", arabic: "أضف مادة إعلانية", icon: "image" },
      { id: "analytics", label: "View Analytics", arabic: "اعرض التحليلات", icon: "chart" },
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
