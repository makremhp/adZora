const campaignModal = document.getElementById("campaignModal");
    const campaignForm = document.getElementById("campaignForm");
    const campaignStatus = document.getElementById("campaignStatus");

    function openCampaignModal() {
      campaignModal.classList.add("show");
      campaignModal.setAttribute("aria-hidden", "false");
      campaignStatus.classList.remove("show");
      campaignStatus.textContent = "";
      document.getElementById("campaignName").focus();
    }

    function closeCampaignModal() {
      campaignModal.classList.remove("show");
      campaignModal.setAttribute("aria-hidden", "true");
    }

    campaignForm.addEventListener("submit", event => {
      event.preventDefault();
      campaignStatus.textContent = "تم التحقق من النموذج تجريبيًا. لم تُحفظ الحملة بعد لأن الربط بالخادم لم يُبنَ بعد.";
      campaignStatus.classList.add("show");
    });

    campaignModal.addEventListener("click", event => {
      if (event.target === campaignModal) closeCampaignModal();
    });

    const publisherPanelReady = document.getElementById("publisherView");
    const modal = document.getElementById("authModal");
    const landing = document.getElementById("landing");
    const dashboard = document.getElementById("dashboard");
    const modalTitle = document.getElementById("modalTitle");
    const nameField = document.getElementById("nameField");
    const roleField = document.getElementById("roleField");
    const switchText = document.getElementById("switchText");
    const switchButton = document.querySelector(".switch button");
    const authForm = document.getElementById("authForm");

    let mode = "login";

    function toggleTheme() {
      document.body.classList.toggle("dark");
      localStorage.setItem(
        "adnova-theme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    }

    if (localStorage.getItem("adnova-theme") === "dark") {
      document.body.classList.add("dark");
    }

    function openAuth(type) {
      mode = type;
      updateAuth();
      modal.classList.add("show");
    }

    function closeAuth() {
      modal.classList.remove("show");
    }

    function switchAuth() {
      mode = mode === "login" ? "register" : "login";
      updateAuth();
    }

    function updateAuth() {
      const register = mode === "register";

      modalTitle.textContent = register
        ? "إنشاء حساب جديد"
        : "تسجيل الدخول";

      nameField.style.display = register ? "block" : "none";
      roleField.style.display = register ? "block" : "none";

      switchText.textContent = register
        ? "لديك حساب بالفعل؟"
        : "ليس لديك حساب؟";

      switchButton.textContent = register
        ? "تسجيل الدخول"
        : "إنشاء حساب";
    }

    authForm.addEventListener("submit", function(event) {
      event.preventDefault();

      closeAuth();
      landing.style.display = "none";
      dashboard.classList.add("active");
      window.scrollTo({ top: 0, behavior: "instant" });
    });

    function logout() {
      showDashboardView("overview");
      dashboard.classList.remove("active");
      landing.style.display = "block";
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    modal.addEventListener("click", function(event) {
      if (event.target === modal) closeAuth();
    });

    const dashboardViews = document.querySelectorAll(".dashboard-view");
    const dashboardNavButtons = document.querySelectorAll(".side-nav button[data-dashboard-view]");
    const mobileDashboardNav = document.getElementById("dashboardMobileNav");
    const placeholderTitle = document.getElementById("placeholderTitle");
    const placeholderText = document.getElementById("placeholderText");
    const publisherNotice = document.getElementById("publisherNotice");
    const websiteModal = document.getElementById("websiteModal");
    const websiteForm = document.getElementById("websiteForm");
    const websiteStatus = document.getElementById("websiteStatus");

    const pendingSections = {
      analytics: {
        title: "الإحصائيات",
        text: "ستظهر هنا تقارير Impressions وClicks وCTR وRevenue مع فلاتر زمنية ورسوم مناسبة للهاتف."
      },
      payments: {
        title: "المدفوعات",
        text: "سيتم بناء الرصيد وعمليات الإيداع والسحب من خلال Ledger Server-Side، وليس من بيانات الواجهة."
      },
      settings: {
        title: "الإعدادات",
        text: "ستتضمن هذه الصفحة إعدادات الحساب والأمان والتفضيلات بعد إضافة المصادقة الحقيقية."
      }
    };

    function showDashboardView(view) {
      let targetId = "dashboardPlaceholderView";
      if (view === "overview" || view === "campaigns") targetId = "advertiserOverviewView";
      if (view === "publisher") targetId = "publisherView";

      dashboardViews.forEach(panel => {
        panel.classList.toggle("active", panel.id === targetId);
      });

      dashboardNavButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.dashboardView === view);
      });

      if (mobileDashboardNav) mobileDashboardNav.value = view;

      if (targetId === "dashboardPlaceholderView") {
        placeholderTitle.textContent = pendingSections[view]?.title || "القسم قيد البناء";
        placeholderText.textContent = pendingSections[view]?.text || "هذا القسم سيُبنى في خطوة مستقلة مع ربطه بالـAPI.";
      }

      if (view === "campaigns") openCampaignModal();
    }

    dashboardNavButtons.forEach(button => {
      button.addEventListener("click", () => showDashboardView(button.dataset.dashboardView));
    });

    mobileDashboardNav?.addEventListener("change", event => {
      showDashboardView(event.target.value);
    });

    function showPublisherNotice(message) {
      publisherNotice.textContent = message;
      publisherNotice.classList.add("show");
    }

    function openWebsiteModal() {
      websiteModal.classList.add("show");
      websiteModal.setAttribute("aria-hidden", "false");
      websiteStatus.className = "publisher-status field-full";
      websiteStatus.textContent = "";
      document.getElementById("websiteName").focus();
    }

    function closeWebsiteModal() {
      websiteModal.classList.remove("show");
      websiteModal.setAttribute("aria-hidden", "true");
    }

    websiteForm.addEventListener("submit", event => {
      event.preventDefault();
      const rawUrl = document.getElementById("websiteUrl").value.trim();
      let parsedUrl;
      try {
        parsedUrl = new URL(rawUrl);
      } catch (error) {
        websiteStatus.textContent = "أدخل رابطًا صحيحًا يبدأ بـ http:// أو https://.";
        websiteStatus.className = "publisher-status field-full show error";
        return;
      }

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        websiteStatus.textContent = "يسمح فقط بروابط HTTP وHTTPS، ولن يتم قبول javascript أو data.";
        websiteStatus.className = "publisher-status field-full show error";
        return;
      }

      websiteStatus.textContent = "تم التحقق من صيغة الرابط تجريبيًا. لم يُضف الموقع بعد لأن الحفظ والتحقق يحتاجان إلى Backend.";
      websiteStatus.className = "publisher-status field-full show";
    });

    websiteModal.addEventListener("click", event => {
      if (event.target === websiteModal) closeWebsiteModal();
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: .12 });

    document.querySelectorAll(".reveal").forEach(element => {
      observer.observe(element);
    });

    const mobileButton = document.querySelector(".mobile-btn");
    const navLinks = document.querySelector(".nav-links");
     const navDrawerBackdrop = document.getElementById("navDrawerBackdrop");

    function closeMobileNav() {
       navLinks.classList.remove("open");
       navDrawerBackdrop?.classList.remove("show");
       document.body.classList.remove("landing-drawer-open");
       navLinks.setAttribute("aria-hidden", "true");
       mobileButton.setAttribute("aria-expanded", "false");
       mobileButton.setAttribute("aria-label", "فتح القائمة");
     }

    mobileButton.addEventListener("click", event => {
      event.stopPropagation();
      const isOpen = navLinks.classList.toggle("open");
       navDrawerBackdrop?.classList.toggle("show", isOpen);
       document.body.classList.toggle("landing-drawer-open", isOpen);
       navLinks.setAttribute("aria-hidden", String(!isOpen));
       mobileButton.setAttribute("aria-expanded", String(isOpen));
       mobileButton.setAttribute("aria-label", isOpen ? "إغلاق القائمة" : "فتح القائمة");
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("click", event => {
      if (!navLinks.contains(event.target) && !mobileButton.contains(event.target)) {
        closeMobileNav();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMobileNav();
        closeSidebar();
        closeWalletDrawer();
        closeCampaignModal();
        closeWebsiteModal();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeMobileNav();
    });

    // Role-based dashboard, wallet drawer, and publisher zone UX.
    const roleAwareNavButtons = document.querySelectorAll("[data-dashboard-view]");
     const roleAwareGroups = document.querySelectorAll(".side-nav-group[data-role]");
    const roleAwareOptions = document.querySelectorAll("#dashboardMobileNav option[data-role]");
    const authRole = document.getElementById("authRole");
    const dashboardRoleLabel = document.getElementById("dashboardRoleLabel");
    const walletDrawer = document.getElementById("walletDrawer");
    const walletDrawerBackdrop = document.getElementById("walletDrawerBackdrop");
    const zoneModal = document.getElementById("zoneModal");
    const zoneForm = document.getElementById("zoneForm");
    const zoneStatus = document.getElementById("zoneStatus");
    let demoBalance = Number(localStorage.getItem("adzora-demo-balance") || 0);
    function formatDemoBalance() { return "$" + demoBalance.toFixed(2); }
    function renderDemoBalance() { const formatted = formatDemoBalance(); ["topBalance","walletPageBalance","drawerBalance"].forEach(id => { const element = document.getElementById(id); if (element) element.textContent = formatted; }); }
    function setDashboardRole(role) {
      const safeRole = role === "publisher" ? "publisher" : "advertiser"; dashboard.dataset.role = safeRole; localStorage.setItem("adzora-role", safeRole); dashboardRoleLabel.textContent = safeRole === "publisher" ? "ناشر" : "معلن";
      roleAwareNavButtons.forEach(button => { button.hidden = Boolean(button.dataset.role && button.dataset.role !== safeRole); }); roleAwareGroups.forEach(group => { group.hidden = group.dataset.role !== safeRole; }); roleAwareOptions.forEach(option => { option.hidden = option.dataset.role !== safeRole; });
      const rolePreview = document.getElementById("rolePreview"); if (rolePreview) rolePreview.value = safeRole; const settingsRoleCopy = document.getElementById("settingsRoleCopy"); if (settingsRoleCopy) settingsRoleCopy.textContent = safeRole === "publisher" ? "إعدادات حساب الناشر وإدارة المواقع" : "إعدادات حساب المعلن وإدارة الحملات"; const analyticsSubtitle = document.getElementById("analyticsSubtitle"); if (analyticsSubtitle) analyticsSubtitle.textContent = safeRole === "publisher" ? "تابع الظهور والنقرات والأرباح من مواقعك" : "تابع الإنفاق والظهور والنقرات والتحويلات لحملاتك";
      const metricOneLabel = document.getElementById("metricOneLabel"), metricOneValue = document.getElementById("metricOneValue"), metricFourLabel = document.getElementById("metricFourLabel"); if (safeRole === "publisher") { metricOneLabel.textContent="إجمالي الأرباح"; metricOneValue.textContent="$1,284"; document.getElementById("metricTwoLabel").textContent="الظهور"; document.getElementById("metricTwoValue").textContent="284K"; document.getElementById("metricThreeValue").textContent="12,840"; metricFourLabel.textContent="المواقع النشطة"; document.getElementById("metricFourValue").textContent="2"; } else { metricOneLabel.textContent="إجمالي الإنفاق"; metricOneValue.textContent="$48,290"; document.getElementById("metricTwoLabel").textContent="إجمالي الظهور"; document.getElementById("metricTwoValue").textContent="2.84M"; document.getElementById("metricThreeValue").textContent="128,400"; metricFourLabel.textContent="التحويلات"; document.getElementById("metricFourValue").textContent="18,492"; } renderDemoBalance();
    }
    function openAuth(type, preferredRole) { mode=type; updateAuth(); if (preferredRole && authRole) authRole.value=preferredRole; modal.classList.add("show"); if (authRole) authRole.focus(); }
    function updateAuth() { const register=mode === "register"; modalTitle.textContent=register ? "إنشاء حساب جديد" : "تسجيل الدخول"; nameField.style.display=register ? "block" : "none"; roleField.style.display="block"; switchText.textContent=register ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"; switchButton.textContent=register ? "تسجيل الدخول" : "إنشاء حساب"; if (authRole && !authRole.value) authRole.value=localStorage.getItem("adzora-role") || "advertiser"; }
    authForm.addEventListener("submit", event => { event.preventDefault(); const selectedRole=authRole?.value || "advertiser"; setDashboardRole(selectedRole); closeAuth(); landing.style.display="none"; dashboard.classList.add("active"); showDashboardView(selectedRole === "publisher" ? "publisher" : "overview"); window.scrollTo({top:0,behavior:"instant"}); });
    function showDashboardView(view) { const role=dashboard.dataset.role || localStorage.getItem("adzora-role") || "advertiser"; let effectiveView=view; if (role === "publisher" && ["overview","campaigns"].includes(view)) effectiveView="publisher"; if (role === "advertiser" && ["publisher","zones"].includes(view)) effectiveView="overview"; let targetId="dashboardPlaceholderView"; if (effectiveView === "overview") targetId="advertiserOverviewView"; if (effectiveView === "publisher") targetId="publisherView"; if (effectiveView === "analytics") targetId="analyticsView"; if (effectiveView === "wallet") targetId="walletView"; if (effectiveView === "settings") targetId="settingsView"; dashboardViews.forEach(panel => panel.classList.toggle("active", panel.id === targetId)); roleAwareNavButtons.forEach(button => button.classList.toggle("active", button.dataset.dashboardView === effectiveView && !button.hidden)); if (mobileDashboardNav) mobileDashboardNav.value=effectiveView; if (effectiveView === "campaigns") openCampaignModal(); if (effectiveView === "zones") openZoneModal(); }
    function logout() { closeSidebar(); closeWalletDrawer(); closeCampaignModal(); closeWebsiteModal(); closeZoneModal(); dashboard.classList.remove("active"); landing.style.display="block"; window.scrollTo({top:0,behavior:"instant"}); }
    function openWalletDrawer() { renderDemoBalance(); walletDrawer.classList.add("open"); walletDrawerBackdrop.classList.add("show"); walletDrawer.setAttribute("aria-hidden","false"); document.getElementById("drawerDepositAmount").focus(); }
    function closeWalletDrawer() { walletDrawer.classList.remove("open"); walletDrawerBackdrop.classList.remove("show"); walletDrawer.setAttribute("aria-hidden","true"); }
    function setDepositAmount(value) { document.getElementById("depositAmount").value=value; }
    function applyDemoDeposit(rawAmount, statusElement) { const amount=Number(rawAmount); if (!Number.isFinite(amount) || amount <= 0) { statusElement.textContent="أدخل قيمة أكبر من صفر."; statusElement.className="campaign-status show"; return false; } demoBalance += amount; localStorage.setItem("adzora-demo-balance",demoBalance.toFixed(2)); renderDemoBalance(); statusElement.textContent="تمت إضافة " + amount.toFixed(2) + "$ تجريبيًا. لا توجد عملية مالية حقيقية."; statusElement.className="campaign-status show"; return true; }
    document.getElementById("depositForm").addEventListener("submit", event => { event.preventDefault(); applyDemoDeposit(document.getElementById("depositAmount").value, document.getElementById("depositStatus")); }); document.getElementById("drawerDepositForm").addEventListener("submit", event => { event.preventDefault(); if (applyDemoDeposit(document.getElementById("drawerDepositAmount").value, document.getElementById("drawerDepositStatus"))) document.getElementById("drawerDepositAmount").value=""; });
    function openZoneModal() { if ((dashboard.dataset.role || localStorage.getItem("adzora-role")) !== "publisher") { showDashboardView("overview"); return; } zoneModal.classList.add("show"); zoneModal.setAttribute("aria-hidden","false"); zoneStatus.className="publisher-status field-full"; zoneStatus.textContent=""; document.getElementById("zoneName").focus(); }
    function closeZoneModal() { zoneModal.classList.remove("show"); zoneModal.setAttribute("aria-hidden","true"); } zoneModal.addEventListener("click", event => { if (event.target === zoneModal) closeZoneModal(); }); zoneForm.addEventListener("submit", event => { event.preventDefault(); zoneStatus.textContent="تم التحقق من Ad Zone تجريبيًا. سيُنشأ الكود الحقيقي بعد ربط الموقع والـAPI."; zoneStatus.className="publisher-status field-full show"; });
    document.querySelectorAll(".toggle").forEach(toggle => { toggle.addEventListener("click", () => toggle.classList.toggle("off")); }); function applyRolePreview() { const selectedRole=document.getElementById("rolePreview").value; setDashboardRole(selectedRole); showDashboardView(selectedRole === "publisher" ? "publisher" : "overview"); }
    roleAwareNavButtons.forEach(button => { button.addEventListener("click", () => showDashboardView(button.dataset.dashboardView)); }); renderDemoBalance(); setDashboardRole(localStorage.getItem("adzora-role") || "advertiser");


    // Final role rules for the current frontend milestone.
    const sidebarLayout = document.querySelector(".dashboard-layout");
    const sidebarToggleButton = document.getElementById("sidebarToggle");
    const mobileSidebar = document.querySelector(".dashboard .sidebar");
     const dashboardSidebarBackdrop = document.getElementById("dashboardSidebarBackdrop");
    const publisherEarningsBalance = 1284;
    function getCurrentRole() { return dashboard.dataset.role || localStorage.getItem("adzora-role") || "advertiser"; }
    function renderDemoBalance() { const role=getCurrentRole(); const formatted=role === "publisher" ? "$" + publisherEarningsBalance.toFixed(2) : formatDemoBalance(); ["topBalance","walletPageBalance","drawerBalance"].forEach(id => { const element=document.getElementById(id); if (element) element.textContent=formatted; }); }
    function openSidebar() {
       mobileSidebar.classList.add("mobile-open");
       dashboardSidebarBackdrop?.classList.add("show");
       document.body.classList.add("drawer-open");
       sidebarToggleButton.setAttribute("aria-expanded", "true");
       sidebarToggleButton.setAttribute("aria-label", "إغلاق القائمة الجانبية");
     }
     function closeSidebar() {
       mobileSidebar.classList.remove("mobile-open");
       dashboardSidebarBackdrop?.classList.remove("show");
       document.body.classList.remove("drawer-open");
       sidebarToggleButton.setAttribute("aria-expanded", "false");
       sidebarToggleButton.setAttribute("aria-label", "فتح القائمة الجانبية");
     }
     function toggleSidebar() {
       if (window.innerWidth <= 900) {
         mobileSidebar.classList.contains("mobile-open") ? closeSidebar() : openSidebar();
       } else {
         sidebarLayout.classList.toggle("nav-collapsed");
         const open = !sidebarLayout.classList.contains("nav-collapsed");
         sidebarToggleButton.setAttribute("aria-expanded", String(open));
         sidebarToggleButton.setAttribute("aria-label", open ? "إغلاق القائمة الجانبية" : "فتح القائمة الجانبية");
       }
     }
    function openWalletDrawer() { if (getCurrentRole() === "publisher") { showDashboardView("publisher"); return; } renderDemoBalance(); walletDrawer.classList.add("open"); walletDrawerBackdrop.classList.add("show"); walletDrawer.setAttribute("aria-hidden","false"); document.getElementById("drawerDepositAmount").focus(); }
    function showDashboardView(view) { const role=getCurrentRole(); let effectiveView=view; if (role === "publisher" && ["overview","campaigns","wallet"].includes(view)) effectiveView="publisher"; if (role === "advertiser" && ["publisher","zones"].includes(view)) effectiveView="overview"; let targetId="dashboardPlaceholderView"; if (effectiveView === "overview") targetId="advertiserOverviewView"; if (effectiveView === "publisher") targetId="publisherView"; if (effectiveView === "analytics") targetId="analyticsView"; if (effectiveView === "wallet") targetId="walletView"; if (effectiveView === "settings") targetId="settingsView"; dashboardViews.forEach(panel => panel.classList.toggle("active", panel.id === targetId)); roleAwareNavButtons.forEach(button => button.classList.toggle("active", button.dataset.dashboardView === effectiveView && !button.hidden)); if (mobileDashboardNav && !mobileDashboardNav.value) mobileDashboardNav.value=effectiveView; if (effectiveView === "campaigns") openCampaignModal(); if (effectiveView === "zones") openZoneModal(); if (window.innerWidth <= 900) closeSidebar(); }
    function applyAnalyticsPeriod(period) { const data={today:["$48,290","2.84M","128,400","18,492"],yesterday:["$7,820","410K","19,320","2,840"],"7d":["$31,460","1.92M","84,210","12,190"],"30d":["$48,290","2.84M","128,400","18,492"],custom:["$0.00","0","0","0"]}[period] || ["$0.00","0","0","0"]; ["metricOneValue","metricTwoValue","metricThreeValue","metricFourValue"].forEach((id,index)=>{const element=document.getElementById(id); if(element) element.textContent=data[index];}); document.querySelectorAll("[data-period]").forEach(button=>button.classList.toggle("active",button.dataset.period===period)); }
    function applyCustomRange() { const from=document.getElementById("rangeFrom").value; const to=document.getElementById("rangeTo").value; if(from && to) applyAnalyticsPeriod("custom"); }
    document.querySelectorAll("[data-period]").forEach(button=>button.addEventListener("click",()=>{ const customRange=document.getElementById("customRange"); customRange.hidden=button.dataset.period !== "custom"; if(button.dataset.period !== "custom") applyAnalyticsPeriod(button.dataset.period); }));
    window.addEventListener("resize", () => { if (window.innerWidth > 900) closeSidebar(); });
    if (window.innerWidth <= 900) closeMobileNav(); renderDemoBalance(); showDashboardView(getCurrentRole() === "publisher" ? "publisher" : "overview");
