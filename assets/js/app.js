(() => {
  "use strict";

  /*
   * AdZora frontend business layer.
   * All values in this file are demo state. Money is kept in integer cents so
   * the UI can be replaced by a server-authoritative ledger later.
   */
  const CONFIG = Object.freeze({
    currency: "USD",
    demo: true,
    minDepositCents: null,
    minWithdrawalCents: null,
    revenueShare: Object.freeze({
      banner: 0.40,
      native: 0.45,
      social: 0.40,
      popup: 0.35,
      video: 0.50,
      "direct-link": 0.50
    }),
    bannerSizes: ["320×50", "300×250", "728×90", "336×280", "970×250"],
    adTypes: Object.freeze({
      banner: "Banner",
      native: "Native",
      social: "Social",
      popup: "Popup",
      video: "Video",
      "direct-link": "Direct Link"
    }),
    pricingModels: Object.freeze({
      cpm: "CPM",
      cpc: "CPC",
      cpv: "CPV",
      cpa: "CPA"
    })
  });

  const demoState = {
    role: "advertiser",
    advertiser: {
      totalDepositedCents: 50000,
      reservedCents: 15350,
      spentCents: 4650,
      campaigns: [
        {
          id: "campaign-001",
          name: "حملة متجر التقنية",
          adType: "banner",
          pricingModel: "cpm",
          budgetCents: 12000,
          spentCents: 3200,
          impressions: 16200,
          clicks: 420,
          status: "active",
          destinationUrl: "https://example.com"
        },
        {
          id: "campaign-002",
          name: "إطلاق التطبيق الجديد",
          adType: "native",
          pricingModel: "cpc",
          budgetCents: 8000,
          spentCents: 1450,
          impressions: 7800,
          clicks: 230,
          status: "active",
          destinationUrl: "https://example.com/app"
        },
        {
          id: "campaign-003",
          name: "مسودة حملة موسمية",
          adType: "social",
          pricingModel: "cpc",
          budgetCents: 5000,
          spentCents: 0,
          impressions: 0,
          clicks: 0,
          status: "draft",
          destinationUrl: ""
        }
      ],
      transactions: [
        { label: "إيداع تجريبي", type: "deposit", amountCents: 50000, status: "demo" },
        { label: "إنفاق حملة متجر التقنية", type: "campaign-spend", amountCents: -3200, status: "demo" },
        { label: "إنفاق إطلاق التطبيق", type: "campaign-spend", amountCents: -1450, status: "demo" }
      ]
    },
    publisher: {
      pendingCents: 1284,
      availableCents: 4842,
      totalEarnedCents: 7480,
      withdrawnCents: 1400,
      impressions: 28400,
      clicks: 1280,
      websites: [
        {
          name: "متجر تجريبي",
          url: "https://demo-store.example",
          category: "تجارة إلكترونية",
          status: "pending",
          zones: 2
        }
      ],
      zones: [
        { name: "Header Leaderboard", type: "banner", size: "728×90", status: "active" },
        { name: "Sidebar Rectangle", type: "banner", size: "300×250", status: "active" }
      ],
      recentEarnings: [
        { date: "اليوم", source: "حملة متجر التقنية", adType: "Banner", amountCents: 620, status: "pending" },
        { date: "أمس", source: "إطلاق التطبيق الجديد", adType: "Native", amountCents: 840, status: "approved" },
        { date: "12 سبتمبر", source: "حملة موسمية", adType: "Video", amountCents: 460, status: "available" }
      ]
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const cents = value => Math.round(Number(value || 0) * 100);
  const money = value => {
    const amount = typeof value === "number" ? value / 100 : Number(value || 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: CONFIG.currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  const integer = value => new Intl.NumberFormat("en-US").format(Number(value || 0));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));

  function getAdvertiserAvailableCents() {
    return Math.max(
      0,
      demoState.advertiser.totalDepositedCents -
      demoState.advertiser.reservedCents -
      demoState.advertiser.spentCents
    );
  }

  function getCurrentRole() {
    return demoState.role === "publisher" ? "publisher" : "advertiser";
  }

  function statusLabel(status) {
    return {
      draft: "مسودة",
      pending: "قيد المراجعة",
      active: "نشطة",
      paused: "متوقفة",
      completed: "مكتملة",
      rejected: "مرفوضة",
      approved: "معتمدة",
      available: "متاحة",
      demo: "تجريبية"
    }[status] || status;
  }

  function adTypeLabel(type) {
    return CONFIG.adTypes[type] || type;
  }

  function calculateEventFinancials({ adType = "banner", pricingModel = "cpm", rate = 0, quantity = 0 }) {
    const numericRate = Number(rate) || 0;
    const numericQuantity = Number(quantity) || 0;
    let advertiserCostCents = 0;

    if (pricingModel === "cpm") advertiserCostCents = cents((numericQuantity / 1000) * numericRate);
    if (pricingModel === "cpc" || pricingModel === "cpv" || pricingModel === "cpa") {
      advertiserCostCents = cents(numericQuantity * numericRate);
    }

    const publisherShare = CONFIG.revenueShare[adType] ?? 0;
    const publisherRevenueCents = Math.round(advertiserCostCents * publisherShare);
    return {
      advertiserCostCents,
      publisherRevenueCents,
      platformRevenueCents: advertiserCostCents - publisherRevenueCents,
      publisherShare
    };
  }

  // This is intentionally an in-memory calculation. A future backend should
  // validate the event before applying any balance or earnings mutation.
  window.adzoraBusinessLogic = Object.freeze({
    config: CONFIG,
    calculateEventFinancials
  });

  const landing = $("#landing");
  const dashboard = $("#dashboard");
  const authModal = $("#authModal");
  const authForm = $("#authForm");
  const authRole = $("#authRole");
  const campaignModal = $("#campaignModal");
  const campaignForm = $("#campaignForm");
  const websiteModal = $("#websiteModal");
  const websiteForm = $("#websiteForm");
  const zoneModal = $("#zoneModal");
  const zoneForm = $("#zoneForm");
  const walletDrawer = $("#walletDrawer");
  const walletDrawerBackdrop = $("#walletDrawerBackdrop");
  const sidebar = $(".dashboard .sidebar");
  const sidebarBackdrop = $("#dashboardSidebarBackdrop");
  const sidebarLayout = $(".dashboard-layout");
  const sidebarToggle = $("#sidebarToggle");
  const navLinks = $(".nav-links");
  const mobileButton = $(".mobile-btn");
  const navDrawerBackdrop = $("#navDrawerBackdrop");
  let authMode = "login";

  function renderTopBalance() {
    const value = getCurrentRole() === "publisher"
      ? demoState.publisher.availableCents
      : getAdvertiserAvailableCents();
    ["topBalance", "walletPageBalance", "drawerBalance"].forEach(id => {
      const node = document.getElementById(id);
      if (node) node.textContent = money(value);
    });
  }

  function renderAdvertiserOverview() {
    const root = $("#advertiserOverviewView");
    const stats = $("#advertiserStatsGrid") || $(".stats-grid", root);
    const activeCampaigns = demoState.advertiser.campaigns.filter(campaign => campaign.status === "active").length;
    if (stats) {
      stats.innerHTML = `
        <div class="stat-card"><small>الرصيد المتاح</small><strong>${money(getAdvertiserAvailableCents())}</strong><span>متاح للحملات</span></div>
        <div class="stat-card"><small>الرصيد المحجوز</small><strong>${money(demoState.advertiser.reservedCents)}</strong><span>للحملات النشطة</span></div>
        <div class="stat-card"><small>إجمالي الإنفاق</small><strong>${money(demoState.advertiser.spentCents)}</strong><span>من أحداث موثقة تجريبيًا</span></div>
        <div class="stat-card"><small>الحملات النشطة</small><strong>${activeCampaigns}</strong><span>${demoState.advertiser.campaigns.length} حملات إجمالًا</span></div>
      `;
    }

    const body = $("#campaignTableBody") || $("tbody", root);
    if (!body) return;
    body.innerHTML = demoState.advertiser.campaigns.map(campaign => {
      const ctr = campaign.impressions ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : "0.00";
      return `
        <tr>
          <td data-label="اسم الحملة">${escapeHtml(campaign.name)}</td>
          <td data-label="النوع">${escapeHtml(adTypeLabel(campaign.adType))}</td>
          <td data-label="الميزانية">${money(campaign.budgetCents)}</td>
          <td data-label="الإنفاق">${money(campaign.spentCents)}</td>
          <td data-label="الظهور">${integer(campaign.impressions)}</td>
          <td data-label="النقرات">${integer(campaign.clicks)}</td>
          <td data-label="CTR">${ctr}%</td>
          <td data-label="الحالة"><span class="badge-status">${escapeHtml(statusLabel(campaign.status))}</span></td>
        </tr>
      `;
    }).join("");
  }

  function renderPublisherOverview() {
    const root = $("#publisherView");
    const stats = $("#publisherStatsGrid") || $(".stats-grid", root);
    const publisher = demoState.publisher;
    if (stats) {
      stats.innerHTML = `
        <div class="stat-card"><small>قيد الاعتماد</small><strong>${money(publisher.pendingCents)}</strong><span>لم تصبح متاحة بعد</span></div>
        <div class="stat-card"><small>الأرباح المتاحة</small><strong>${money(publisher.availableCents)}</strong><span>قابلة للسحب لاحقًا</span></div>
        <div class="stat-card"><small>إجمالي الأرباح</small><strong>${money(publisher.totalEarnedCents)}</strong><span>قبل السحوبات</span></div>
        <div class="stat-card"><small>المواقع</small><strong>${publisher.websites.length}</strong><span>${publisher.zones.length} Ad Zones</span></div>
      `;
    }

    const publisherGrid = $(".publisher-grid", root);
    if (publisherGrid && !$("#publisherEarningsCard")) {
      publisherGrid.insertAdjacentHTML("afterend", `
        <div class="table-card publisher-card" id="publisherEarningsCard" style="margin-top:18px">
          <div class="table-title"><h2>الأرباح الأخيرة</h2><span class="badge-status">Demo</span></div>
          <div class="zone-list" id="recentEarningsList"></div>
          <p class="campaign-help">تمر الأرباح مستقبلًا بالمراحل: Ad Event → Validation → Pending → Approved → Available.</p>
        </div>
      `);
    }
    const earningsList = $("#recentEarningsList");
    if (earningsList) {
      earningsList.innerHTML = publisher.recentEarnings.map(earning => `
        <div class="zone-row">
          <div><strong>${escapeHtml(earning.source)}</strong><small>${escapeHtml(earning.date)} · ${escapeHtml(earning.adType)}</small></div>
          <span class="badge-status">${money(earning.amountCents)} · ${escapeHtml(statusLabel(earning.status))}</span>
        </div>
      `).join("");
    }

    const websitesList = $("#publisherWebsitesList");
    if (websitesList) {
      websitesList.innerHTML = publisher.websites.map(website => `
        <div class="website-card-top">
          <div>
            <h3>${escapeHtml(website.name)}</h3>
            <p class="website-domain">${escapeHtml(website.url.replace(/^https?:\/\//, ""))}</p>
          </div>
          <span class="badge-status">${escapeHtml(statusLabel(website.status))}</span>
        </div>
        <div class="website-metrics">
          <div class="website-metric"><small>Ad Zones</small><strong>${website.zones}</strong></div>
          <div class="website-metric"><small>Impressions</small><strong>${integer(publisher.impressions)}</strong></div>
          <div class="website-metric"><small>Clicks</small><strong>${integer(publisher.clicks)}</strong></div>
          <div class="website-metric"><small>Revenue</small><strong>${money(publisher.totalEarnedCents)}</strong></div>
        </div>
        <div class="website-actions">
          <button class="btn btn-outline" type="button" onclick="showPublisherNotice('التحقق الحقيقي سيُربط بالخادم في الخطوة القادمة.')">التحقق من الموقع</button>
          <button class="btn btn-primary" type="button" onclick="openZoneModal()">Ad Zones (${website.zones})</button>
        </div>
      `).join("");
    }

    const zonesList = $("#publisherZonesList");
    if (zonesList) {
      zonesList.innerHTML = publisher.zones.map(zone => `
        <div class="zone-row">
          <div><strong>${escapeHtml(zone.name)}</strong><small>${escapeHtml(zone.size)} · ${escapeHtml(adTypeLabel(zone.type))}</small></div>
          <span class="badge-status">${escapeHtml(statusLabel(zone.status))}</span>
        </div>
      `).join("");
    }
    renderPublisherWithdrawals();
  }

  function renderPublisherWithdrawals() {
    const stats = $("#publisherWithdrawalStats");
    if (!stats) return;
    const publisher = demoState.publisher;
    stats.innerHTML = `
      <div class="stat-card"><small>الأرباح المتاحة</small><strong>${money(publisher.availableCents)}</strong><span>تخضع لحد السحب من الخادم</span></div>
      <div class="stat-card"><small>الأرباح المعلقة</small><strong>${money(publisher.pendingCents)}</strong><span>غير قابلة للسحب</span></div>
      <div class="stat-card"><small>إجمالي المسحوب</small><strong>${money(publisher.withdrawnCents)}</strong><span>بيانات Demo</span></div>
      <div class="stat-card"><small>حالة الحساب</small><strong>جاهز للربط</strong><span>لا توجد دفعة فعلية</span></div>
    `;
  }

  function renderWallet() {
    const hero = $(".balance-hero");
    if (hero) {
      hero.innerHTML = `
        <small>الرصيد المتاح للحملات</small>
        <strong id="walletPageBalance">${money(getAdvertiserAvailableCents())}</strong>
        <div class="traffic-row"><span>إجمالي الإيداع</span><strong>${money(demoState.advertiser.totalDepositedCents)}</strong></div>
        <div class="traffic-row"><span>الرصيد المحجوز</span><strong>${money(demoState.advertiser.reservedCents)}</strong></div>
        <div class="traffic-row"><span>إجمالي الإنفاق</span><strong>${money(demoState.advertiser.spentCents)}</strong></div>
        <p>هذه أرقام Demo داخل الواجهة فقط، وليست Ledger أو مصدرًا ماليًا حقيقيًا.</p>
      `;
    }
    const transactionsCard = $("#walletView .table-card");
    if (transactionsCard) {
      transactionsCard.innerHTML = `
        <div class="table-title"><h2>آخر العمليات</h2><span class="badge-status">${demoState.advertiser.transactions.length} تجريبية</span></div>
        <div class="zone-list">
          ${demoState.advertiser.transactions.map(transaction => `
            <div class="zone-row">
              <div><strong>${escapeHtml(transaction.label)}</strong><small>${escapeHtml(transaction.type)}</small></div>
              <span class="badge-status">${money(transaction.amountCents)} · ${escapeHtml(statusLabel(transaction.status))}</span>
            </div>
          `).join("")}
        </div>
        <p class="campaign-help">لن تُنشأ معاملات فعلية قبل ربط المصادقة وPayment Gateway وLedger على الخادم.</p>
      `;
    }
  }

  function renderAnalytics(period = "today") {
    const advertiserData = {
      today: [money(demoState.advertiser.spentCents), integer(24000), integer(650), "0"],
      yesterday: [money(820), integer(4100), integer(130), "0"],
      "7d": [money(3140), integer(19200), integer(480), "0"],
      "30d": [money(demoState.advertiser.spentCents), integer(28400), integer(650), "0"],
      custom: [money(0), "0", "0", "0"]
    };
    const publisherData = {
      today: [money(demoState.publisher.totalEarnedCents), integer(demoState.publisher.impressions), integer(demoState.publisher.clicks), integer(demoState.publisher.websites.length)],
      yesterday: [money(310), integer(4100), integer(170), "1"],
      "7d": [money(2380), integer(19200), integer(840), "1"],
      "30d": [money(demoState.publisher.totalEarnedCents), integer(demoState.publisher.impressions), integer(demoState.publisher.clicks), integer(demoState.publisher.websites.length)],
      custom: [money(0), "0", "0", "0"]
    };
    const data = (getCurrentRole() === "publisher" ? publisherData : advertiserData)[period] || advertiserData.today;
    ["metricOneValue", "metricTwoValue", "metricThreeValue", "metricFourValue"].forEach((id, index) => {
      const node = document.getElementById(id);
      if (node) node.textContent = data[index];
    });
    $$("[data-period]").forEach(button => button.classList.toggle("active", button.dataset.period === period));
  }

  function showPublisherNotice(message) {
    const notice = $("#publisherNotice");
    if (notice) {
      notice.textContent = message;
      notice.classList.add("show");
    }
  }

  function applyCustomRange() {
    const from = $("#rangeFrom")?.value;
    const to = $("#rangeTo")?.value;
    if (from && to) renderAnalytics("custom");
  }

  function renderAll() {
    renderAdvertiserOverview();
    renderPublisherOverview();
    renderWallet();
    renderTopBalance();
    renderAnalytics();
    applyRoleToUi();
  }

  function applyRoleToUi() {
    const role = getCurrentRole();
    if (dashboard) dashboard.dataset.role = role;
    const roleLabel = $("#dashboardRoleLabel");
    if (roleLabel) roleLabel.textContent = role === "publisher" ? "ناشر" : "معلن";
    $$("[data-role]").forEach(node => {
      node.hidden = Boolean(node.dataset.role && node.dataset.role !== role);
    });
    const settingsRoleCopy = $("#settingsRoleCopy");
    if (settingsRoleCopy) settingsRoleCopy.textContent = role === "publisher"
      ? "إعدادات حساب الناشر وإدارة المواقع"
      : "إعدادات حساب المعلن وإدارة الحملات";
    const analyticsSubtitle = $("#analyticsSubtitle");
    if (analyticsSubtitle) analyticsSubtitle.textContent = role === "publisher"
      ? "تابع الظهور والنقرات والأرباح من مواقعك"
      : "تابع الإنفاق والظهور والنقرات للحملات";
    const metricLabels = role === "publisher"
      ? ["إجمالي الأرباح", "الظهور", "النقرات", "المواقع النشطة"]
      : ["إجمالي الإنفاق", "الظهور", "النقرات", "التحويلات"];
    ["metricOneLabel", "metricTwoLabel", "metricThreeLabel", "metricFourLabel"].forEach((id, index) => {
      const node = document.getElementById(id);
      if (node) node.textContent = metricLabels[index];
    });
    renderAnalytics();
  }

  function showDashboardView(view) {
    const role = getCurrentRole();
    let effectiveView = view;
    if (role === "publisher" && ["overview", "campaigns", "wallet"].includes(view)) effectiveView = "publisher";
    if (role === "advertiser" && ["publisher", "zones", "withdrawals"].includes(view)) effectiveView = "overview";
    const targetId = {
      overview: "advertiserOverviewView",
      publisher: "publisherView",
      withdrawals: "publisherWithdrawalsView",
      analytics: "analyticsView",
      wallet: "walletView",
      settings: "settingsView"
    }[effectiveView] || "dashboardPlaceholderView";
    $$(".dashboard-view").forEach(panel => panel.classList.toggle("active", panel.id === targetId));
    $$("[data-dashboard-view]").forEach(button => {
      button.classList.toggle("active", button.dataset.dashboardView === effectiveView && !button.hidden);
    });
    if (effectiveView === "campaigns") openCampaignModal();
    if (effectiveView === "zones") openZoneModal();
    if (window.innerWidth <= 900) closeSidebar();
    renderAnalytics();
  }

  function openAuth(type = "login", preferredRole) {
    authMode = type;
    const register = authMode === "register";
    $("#modalTitle").textContent = register ? "إنشاء حساب جديد" : "تسجيل الدخول";
    $("#nameField").style.display = register ? "block" : "none";
    if ($("#roleField")) $("#roleField").style.display = "block";
    $("#switchText").textContent = register ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟";
    $(".switch button").textContent = register ? "تسجيل الدخول" : "إنشاء حساب";
    if (preferredRole && authRole) authRole.value = preferredRole;
    authModal.classList.add("show");
  }

  function closeAuth() {
    authModal.classList.remove("show");
  }

  function switchAuth() {
    openAuth(authMode === "login" ? "register" : "login");
  }

  function openCampaignModal() {
    campaignModal.classList.add("show");
    campaignModal.setAttribute("aria-hidden", "false");
    $("#campaignStatus").textContent = "";
    $("#campaignStatus").className = "campaign-status field-full";
    updateCreativeFields();
    $("#campaignName").focus();
  }

  function closeCampaignModal() {
    campaignModal.classList.remove("show");
    campaignModal.setAttribute("aria-hidden", "true");
  }

  function fieldHtml(id, label, type = "text", placeholder = "", extra = "") {
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}" ${extra}></div>`;
  }

  function updateCreativeFields() {
    const type = $("#adFormat")?.value || "banner";
    const container = $("#creativeFields");
    if (!container) return;
    const commonUrl = fieldHtml("destinationUrl", "Destination URL", "url", "https://example.com", "required");
    const creativeUrl = fieldHtml("creativeUrl", "رابط الـCreative", "url", "https://cdn.example.com/creative", "");
    let html = "";
    if (type === "banner") {
      html = `${creativeUrl}<div class="field"><label for="bannerSize">حجم الـAd Zone</label><select id="bannerSize">${CONFIG.bannerSizes.map(size => `<option>${size}</option>`).join("")}</select></div>${commonUrl}`;
    } else if (type === "native") {
      html = `${fieldHtml("creativeTitle", "عنوان الإعلان", "text", "عنوان Native")} ${fieldHtml("creativeDescription", "وصف الإعلان", "text", "وصف قصير")} ${fieldHtml("creativeImage", "رابط الصورة", "url", "https://.../image.jpg")} ${fieldHtml("creativeLogo", "رابط الشعار", "url", "https://.../logo.png")} ${fieldHtml("creativeCta", "نص CTA", "text", "اكتشف الآن")} ${commonUrl}`;
    } else if (type === "social") {
      html = `${creativeUrl}${fieldHtml("creativeTitle", "عنوان المنشور", "text", "عنوان الإعلان")}${fieldHtml("creativeCta", "نص CTA", "text", "اعرف المزيد")}${commonUrl}`;
    } else if (type === "popup") {
      html = `${creativeUrl}${commonUrl}<div class="field"><label for="frequency">Frequency</label><select id="frequency"><option>مرة كل جلسة</option><option>مرة كل 24 ساعة</option><option>بدون حد تجريبي</option></select></div>`;
    } else if (type === "video") {
      html = `${fieldHtml("creativeUrl", "رابط الفيديو", "url", "https://cdn.example.com/video.mp4", "required")}${commonUrl}<div class="field field-full"><label for="videoPreview">Preview</label><video id="videoPreview" controls muted style="width:100%;max-height:160px;background:#07111f"></video></div>`;
    } else {
      html = `${commonUrl}<p class="campaign-help field-full">Direct Link لا يعتمد على زيارة الواجهة وحدها كحدث مالي موثوق؛ سيأتي التحقق من الخادم.</p>`;
    }
    container.innerHTML = html;
    const preview = $("#creativePreview");
    if (preview) {
      preview.hidden = false;
      preview.innerHTML = `<strong>معاينة ${escapeHtml(adTypeLabel(type))}</strong><br><span>ستظهر المعاينة بعد إدخال بيانات الـCreative. لا يتم تشغيل إعلان حقيقي في هذه المرحلة.</span>`;
    }
    $("#creativeUrl")?.addEventListener("input", event => {
      const video = $("#videoPreview");
      if (video && type === "video") video.src = event.target.value;
    });
  }

  function setCampaignStatus(message, isError = false) {
    const status = $("#campaignStatus");
    status.textContent = message;
    status.className = `campaign-status field-full show${isError ? " error" : ""}`;
  }

  function createCampaign(event) {
    event.preventDefault();
    const form = new FormData(campaignForm);
    const name = String(form.get("campaignName") || "").trim();
    const budgetCents = cents(form.get("totalBudget"));
    const dailyBudgetCents = cents(form.get("dailyBudget"));
    const pricingModel = String(form.get("pricingModel") || "cpm");
    const adType = String(form.get("adFormat") || "banner");
    if (!name || budgetCents <= 0 || dailyBudgetCents <= 0) {
      setCampaignStatus("أدخل اسم الحملة وميزانية صحيحة أكبر من صفر.", true);
      return;
    }
    if (dailyBudgetCents > budgetCents) {
      setCampaignStatus("الميزانية اليومية لا يمكن أن تتجاوز الميزانية الإجمالية.", true);
      return;
    }
    const hasInsufficientBalance = budgetCents > getAdvertiserAvailableCents();
    const isCpa = pricingModel === "cpa";
    demoState.advertiser.campaigns.unshift({
      id: `campaign-${Date.now()}`,
      name,
      adType,
      pricingModel,
      budgetCents,
      spentCents: 0,
      impressions: 0,
      clicks: 0,
      status: "draft",
      destinationUrl: String(form.get("destinationUrl") || "").trim(),
      startDate: String(form.get("startDate") || ""),
      endDate: String(form.get("endDate") || ""),
      targeting: {
        countries: String(form.get("targetCountry") || "").trim(),
        devices: String(form.get("targetDevices") || "all")
      }
    });
    renderAll();
    if (isCpa) {
      setCampaignStatus("حُفظت كمسودة. CPA مدعوم معماريًا فقط ولم يُفعّل كنظام فعلي.", false);
    } else if (hasInsufficientBalance) {
      setCampaignStatus(`حُفظت كمسودة. Insufficient Balance — المتاح ${money(getAdvertiserAvailableCents())}.`, true);
    } else {
      setCampaignStatus("حُفظت كمسودة Demo. لم يُحجز رصيد ولم يبدأ إنفاق فعلي.", false);
    }
    campaignForm.reset();
    updateCreativeFields();
  }

  function openWebsiteModal() {
    websiteModal.classList.add("show");
    websiteModal.setAttribute("aria-hidden", "false");
    $("#websiteStatus").textContent = "";
    $("#websiteStatus").className = "publisher-status field-full";
    $("#websiteName").focus();
  }

  function closeWebsiteModal() {
    websiteModal.classList.remove("show");
    websiteModal.setAttribute("aria-hidden", "true");
  }

  function createWebsite(event) {
    event.preventDefault();
    const rawUrl = $("#websiteUrl").value.trim();
    let parsedUrl;
    try { parsedUrl = new URL(rawUrl); } catch {
      $("#websiteStatus").textContent = "أدخل رابطًا صحيحًا يبدأ بـ http:// أو https://.";
      $("#websiteStatus").className = "publisher-status field-full show error";
      return;
    }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      $("#websiteStatus").textContent = "يسمح فقط بروابط HTTP وHTTPS.";
      $("#websiteStatus").className = "publisher-status field-full show error";
      return;
    }
    demoState.publisher.websites.push({
      name: $("#websiteName").value.trim(),
      url: parsedUrl.toString(),
      category: $("#websiteCategory").value,
      status: "pending",
      zones: 0
    });
    renderPublisherOverview();
    $("#websiteStatus").textContent = "أُضيف الموقع إلى حالة مراجعة Demo. التحقق الحقيقي سيكون Server-Side.";
    $("#websiteStatus").className = "publisher-status field-full show";
    websiteForm.reset();
  }

  function openZoneModal() {
    if (getCurrentRole() !== "publisher") {
      showDashboardView("overview");
      return;
    }
    zoneModal.classList.add("show");
    zoneModal.setAttribute("aria-hidden", "false");
    $("#zoneStatus").textContent = "";
    $("#zoneStatus").className = "publisher-status field-full";
    $("#zoneName").focus();
  }

  function closeZoneModal() {
    zoneModal.classList.remove("show");
    zoneModal.setAttribute("aria-hidden", "true");
  }

  function createZone(event) {
    event.preventDefault();
    demoState.publisher.zones.push({
      name: $("#zoneName").value.trim(),
      type: $("#zoneFormat").value.toLowerCase(),
      size: $("#zoneSize").value,
      status: "active"
    });
    if (demoState.publisher.websites[0]) demoState.publisher.websites[0].zones += 1;
    renderPublisherOverview();
    $("#zoneStatus").textContent = "تم حفظ Ad Zone تجريبيًا. لن يتم توليد Ad Code حقيقي قبل ربط الخادم.";
    $("#zoneStatus").className = "publisher-status field-full show";
    zoneForm.reset();
  }

  function setDepositAmount(value) {
    const input = $("#depositAmount");
    if (input) input.value = value;
  }

  function applyDemoDeposit(rawAmount, statusElement) {
    const amountCents = cents(rawAmount);
    if (amountCents <= 0) {
      statusElement.textContent = "أدخل قيمة أكبر من صفر.";
      statusElement.className = "campaign-status show error";
      return;
    }
    demoState.advertiser.totalDepositedCents += amountCents;
    demoState.advertiser.transactions.unshift({
      label: "إيداع تجريبي جديد",
      type: "deposit",
      amountCents,
      status: "demo"
    });
    renderAll();
    statusElement.textContent = `تمت إضافة ${money(amountCents)} تجريبيًا. لا توجد عملية مالية حقيقية.`;
    statusElement.className = "campaign-status show";
  }

  function openWalletDrawer() {
    if (getCurrentRole() === "publisher") {
      showDashboardView("publisher");
      return;
    }
    renderTopBalance();
    walletDrawer.classList.add("open");
    walletDrawerBackdrop.classList.add("show");
    walletDrawer.setAttribute("aria-hidden", "false");
    $("#drawerDepositAmount").focus();
  }

  function closeWalletDrawer() {
    walletDrawer.classList.remove("open");
    walletDrawerBackdrop.classList.remove("show");
    walletDrawer.setAttribute("aria-hidden", "true");
  }

  function openSidebar() {
    sidebar.classList.add("mobile-open");
    sidebarBackdrop?.classList.add("show");
    document.body.classList.add("drawer-open");
    sidebarToggle?.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    sidebar.classList.remove("mobile-open");
    sidebarBackdrop?.classList.remove("show");
    document.body.classList.remove("drawer-open");
    sidebarToggle?.setAttribute("aria-expanded", "false");
  }

  function toggleSidebar() {
    if (window.innerWidth <= 900) {
      sidebar.classList.contains("mobile-open") ? closeSidebar() : openSidebar();
    } else {
      sidebarLayout.classList.toggle("nav-collapsed");
    }
  }

  function closeMobileNav() {
    navLinks?.classList.remove("open");
    navDrawerBackdrop?.classList.remove("show");
    document.body.classList.remove("landing-drawer-open");
    mobileButton?.setAttribute("aria-expanded", "false");
  }

  function toggleTheme() {
    document.body.classList.toggle("dark");
    try { localStorage.setItem("adzora-theme", document.body.classList.contains("dark") ? "dark" : "light"); } catch {}
  }

  function logout() {
    closeSidebar();
    closeWalletDrawer();
    closeCampaignModal();
    closeWebsiteModal();
    closeZoneModal();
    dashboard.classList.remove("active");
    landing.style.display = "block";
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function applyRolePreview() {
    demoState.role = $("#rolePreview").value;
    renderAll();
    showDashboardView(demoState.role === "publisher" ? "publisher" : "overview");
  }

  function wireEvents() {
    $("#adFormat")?.addEventListener("change", updateCreativeFields);
    campaignForm?.addEventListener("submit", createCampaign);
    websiteForm?.addEventListener("submit", createWebsite);
    zoneForm?.addEventListener("submit", createZone);
    authForm?.addEventListener("submit", event => {
      event.preventDefault();
      demoState.role = authRole?.value === "publisher" ? "publisher" : "advertiser";
      closeAuth();
      landing.style.display = "none";
      dashboard.classList.add("active");
      renderAll();
      showDashboardView(demoState.role === "publisher" ? "publisher" : "overview");
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    $("#depositForm")?.addEventListener("submit", event => {
      event.preventDefault();
      applyDemoDeposit($("#depositAmount").value, $("#depositStatus"));
    });
    $("#drawerDepositForm")?.addEventListener("submit", event => {
      event.preventDefault();
      applyDemoDeposit($("#drawerDepositAmount").value, $("#drawerDepositStatus"));
      $("#drawerDepositAmount").value = "";
    });
    $("[data-period]") && $$("[data-period]").forEach(button => button.addEventListener("click", () => {
      const customRange = $("#customRange");
      if (customRange) customRange.hidden = button.dataset.period !== "custom";
      if (button.dataset.period !== "custom") renderAnalytics(button.dataset.period);
    }));
    $("#applyCustomRange")?.addEventListener("click", () => renderAnalytics("custom"));
    $$("[data-dashboard-view]").forEach(button => button.addEventListener("click", () => showDashboardView(button.dataset.dashboardView)));
    $(".switch button")?.addEventListener("click", switchAuth);
    authModal?.addEventListener("click", event => { if (event.target === authModal) closeAuth(); });
    campaignModal?.addEventListener("click", event => { if (event.target === campaignModal) closeCampaignModal(); });
    websiteModal?.addEventListener("click", event => { if (event.target === websiteModal) closeWebsiteModal(); });
    zoneModal?.addEventListener("click", event => { if (event.target === zoneModal) closeZoneModal(); });
    mobileButton?.addEventListener("click", event => {
      event.stopPropagation();
      const open = navLinks.classList.toggle("open");
      navDrawerBackdrop?.classList.toggle("show", open);
      mobileButton.setAttribute("aria-expanded", String(open));
    });
    navLinks?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMobileNav));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMobileNav();
        closeSidebar();
        closeWalletDrawer();
        closeCampaignModal();
        closeWebsiteModal();
        closeZoneModal();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeMobileNav();
        closeSidebar();
      }
    });
    $$(".toggle").forEach(toggle => toggle.addEventListener("click", () => toggle.classList.toggle("off")));
    $("#rolePreview")?.addEventListener("change", applyRolePreview);
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        }), { threshold: 0.12 })
      : null;
    $$(".reveal").forEach(element => observer ? observer.observe(element) : element.classList.add("visible"));
  }

  Object.assign(window, {
    openAuth,
    closeAuth,
    switchAuth,
    toggleTheme,
    logout,
    openCampaignModal,
    closeCampaignModal,
    openWebsiteModal,
    closeWebsiteModal,
    openZoneModal,
    closeZoneModal,
    openWalletDrawer,
    closeWalletDrawer,
    setDepositAmount,
    toggleSidebar,
    closeSidebar,
    closeMobileNav,
    showDashboardView,
    applyRolePreview,
    showPublisherNotice,
    applyCustomRange
  });

  try {
    if (localStorage.getItem("adzora-theme") === "dark") document.body.classList.add("dark");
  } catch {}
  wireEvents();
  renderAll();
  updateCreativeFields();
  showDashboardView("overview");
})();