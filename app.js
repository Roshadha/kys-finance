/* KYS Finance Desk: browser-only MVP. Data is stored in this browser's localStorage. */

const STORAGE_KEY = "kys-finance-desk-v1";
const today = new Date();
const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
const initialReportMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

const legacySampleAccounts = [
  { code: "100", name: "Petty Cash", category: "asset", side: "Debit", visibility: "Standard" },
  { code: "202", name: "People's Bank – Main Account", category: "asset", side: "Debit", visibility: "Standard" },
  { code: "351", name: "Security Service Income", category: "trade_income", side: "Credit", visibility: "Standard" },
  { code: "352", name: "Cleaning Service Income", category: "trade_income", side: "Credit", visibility: "Standard" },
  { code: "353", name: "K.Y.S. Auto Service Rent Income", category: "other_income", side: "Credit", visibility: "Standard" },
  { code: "354", name: "Pinarawa Housing Complex Rent Income", category: "other_income", side: "Credit", visibility: "Standard" },
  { code: "364", name: "Galaxy Hostel Rent Income", category: "other_income", side: "Credit", visibility: "Standard" },
  { code: "451", name: "Security & Cleaning Service Salary", category: "direct_expense", side: "Debit", visibility: "Standard" },
  { code: "454", name: "Admin Staff Salary Expenditure", category: "operational_expense", side: "Debit", visibility: "Standard" },
  { code: "501", name: "Office Expenditure", category: "operational_expense", side: "Debit", visibility: "Standard" },
  { code: "502", name: "Printing & Stationery Expenditure", category: "operational_expense", side: "Debit", visibility: "Standard" },
  { code: "507", name: "Security Items (Torch / Umbrella)", category: "operational_expense", side: "Debit", visibility: "Store only" },
  { code: "510", name: "Cleaning Items & Materials", category: "operational_expense", side: "Debit", visibility: "Store only" },
  { code: "551", name: "Electricity Charges Expenditure", category: "operational_expense", side: "Debit", visibility: "Standard" },
  { code: "554", name: "Telephone & Internet Charges", category: "operational_expense", side: "Debit", visibility: "Standard" },
  { code: "602", name: "Pinarawa Housing Complex Main. & Exp.", category: "property_expense", side: "Debit", visibility: "Standard" },
  { code: "609", name: "MD House Expenditure", category: "operational_expense", side: "Debit", visibility: "Confidential" },
  { code: "612", name: "Kottawa Prime Residence Expenditure", category: "operational_expense", side: "Debit", visibility: "Confidential" },
  { code: "302", name: "Motor Vehicles", category: "capital", side: "Debit", visibility: "Standard" },
  { code: "608", name: "WIP – Velaudam Building Investment", category: "capital", side: "Debit", visibility: "Standard" },
  { code: "610", name: "WIP – St. Bernard Tea Plantation", category: "capital", side: "Debit", visibility: "Standard" },
];

const accounts = window.KYS_ACCOUNTS;
const accountByCode = Object.fromEntries(accounts.map((account) => [account.code, account]));

const templates = [
  { id: "security-income", title: "Security income", note: "Payment from a security client", icon: "↗", account: "351", accountCodes: ["351"], kind: "income", roles: ["clerk", "data_customer", "admin"], party: "Received from", customerType: "K" },
  { id: "cleaning-income", title: "Cleaning income", note: "Payment from a cleaning client", icon: "↗", account: "352", accountCodes: ["352"], kind: "income", roles: ["clerk", "data_customer", "admin"], party: "Received from", customerType: "C" },
  { id: "rental-income", title: "Rental income", note: "Rent received from a property", icon: "⌂", account: "354", accountCodes: ["353", "354", "355", "356", "357", "358", "360", "362", "363", "364", "365", "366"], kind: "income", roles: ["clerk", "data_customer", "admin"], party: "Received from" },
  { id: "direct-salary", title: "Service salary & EPF", note: "Service staff salary, EPF, or ETF", icon: "◷", account: "451", accountCodes: ["451", "452", "453"], kind: "expense", roles: ["clerk", "data_customer", "admin"], party: "Paid to" },
  { id: "office-expense", title: "Office expense", note: "Office, utility, or routine operating cost", icon: "▤", account: "501", accountCodes: ["451A", "452A", "453A", "501", "502", "503", "504", "505", "506", "509", "510", "513", "514", "515", "516", "520", "552", "553", "554", "653", "654", "655"], kind: "expense", roles: ["clerk", "data_customer", "cashier", "admin"], party: "Paid to" },
  { id: "petty-cash", title: "Petty cash expense", note: "A small cash payment", icon: "¤", account: "501", accountCodes: ["501", "502", "503", "504", "505", "506", "509", "510", "513", "514", "515", "516", "520", "552", "553", "554"], kind: "cash_expense", roles: ["cashier", "admin"], party: "Paid to" },
  { id: "store-expense", title: "Store items", note: "Uniforms, torches, or cleaning items", icon: "▦", account: "507", accountCodes: ["507", "508", "551", "805", "806", "807", "808", "809"], kind: "expense", roles: ["store", "admin"], party: "Paid to" },
  { id: "property-expense", title: "Property maintenance", note: "Rental property repairs or upkeep", icon: "⌂", account: "602", accountCodes: ["602", "603", "604", "605", "606", "607", "609", "611", "612", "613", "616"], kind: "expense", roles: ["clerk", "data_customer", "admin"], party: "Paid to" },
  { id: "capital-expense", title: "Capital / WIP", note: "Vehicle, asset, or long-term project cost", icon: "◇", account: "302", accountCodes: ["302", "303", "304", "305", "306", "307", "308", "608", "610", "620", "630", "632", "635", "661", "662"], kind: "capital", roles: ["admin"], party: "Paid to" },
];

const roleSettings = {
  clerk: { name: "Nimali Perera", label: "Data Entry Clerk", initials: "NP" },
  data_customer: { name: "Sanduni Rathnayake", label: "Data & Customer Entry", initials: "SR" },
  cashier: { name: "Kasun Silva", label: "Petty Cashier", initials: "KS" },
  store: { name: "Chamari Jayasinghe", label: "Store Keeper", initials: "CJ" },
  admin: { name: "Ruwan Fernando", label: "Admin / Accountant", initials: "RF" },
  director: { name: "Managing Director", label: "Managing Director", initials: "MD" },
};

const cashPaymentAccountCodes = ["099", "100"];
const standardBankAccountCodes = ["202", "203", "204", "205", "206", "208", "209", "210", "211", "213"];
const pvtBankAccountCodes = ["218", "219", "220", "221", "230"];

const customers = window.KYS_CUSTOMERS || [];
const customerById = Object.fromEntries(customers.map((customer) => [customer.id, customer]));
const customerTypeLabel = { K: "Security customer", C: "Cleaning customer" };

function defaultState() {
  return {
    role: "clerk",
    selectedTemplate: "security-income",
    customers: customers.map((customer) => ({ ...customer })),
    entries: [
      makeSeed("2026-08-01", "security-income", 2450000, "Bright Guard (Pvt) Ltd", "July invoice settlement", "approved", "Nimali Perera"),
      makeSeed("2026-08-02", "cleaning-income", 580000, "Lanka Estates", "Monthly cleaning service", "approved", "Nimali Perera"),
      makeSeed("2026-08-03", "rental-income", 260000, "Pinarawa Housing Complex", "August rent", "approved", "Nimali Perera"),
      makeSeed("2026-08-04", "direct-salary", 1230000, "Security and cleaning staff", "August service salary", "approved", "Ruwan Fernando"),
      makeSeed("2026-08-05", "office-expense", 120000, "ABC Office Supplies", "Office supplies and printing", "approved", "Nimali Perera"),
      makeSeed("2026-08-06", "store-expense", 60000, "SafeTech Traders", "Torches and umbrellas", "approved", "Chamari Jayasinghe"),
      makeSeed("2026-08-07", "property-expense", 24500, "Pinarawa Repairs", "Water tank repair", "approved", "Nimali Perera", "603"),
      makeSeed("2026-08-08", "capital-expense", 264000, "City Motors", "Vehicle down payment", "approved", "Ruwan Fernando"),
      makeSeed("2026-08-10", "petty-cash", 8750, "Metro Stores", "Cleaning materials", "pending", "Kasun Silva"),
      makeSeed("2026-08-11", "office-expense", 12600, "CEB", "Electricity bill", "pending", "Nimali Perera"),
    ],
    audit: [
      { id: "a4", action: "Approved ‘Vehicle down payment’", by: "Ruwan Fernando", at: "2026-08-08T10:22:00", type: "approve" },
      { id: "a3", action: "Saved ‘Cleaning materials’ for review", by: "Kasun Silva", at: "2026-08-10T14:05:00", type: "save" },
      { id: "a2", action: "Saved ‘Electricity bill’ for review", by: "Nimali Perera", at: "2026-08-11T09:15:00", type: "save" },
      { id: "a1", action: "Generated monthly report", by: "Ruwan Fernando", at: "2026-08-11T10:15:00", type: "report" },
    ],
  };
}

function makeSeed(date, templateId, amount, person, description, status, createdBy, account) {
  const template = templates.find((item) => item.id === templateId);
  const payment = template.kind === "cash_expense" ? "100" : "202";
  return buildEntry({ date, template, account, amount, person, description, payment, status, createdBy, createdAt: `${date}T09:30:00`, id: `seed-${templateId}-${date}` });
}

function buildEntry({ date, template, amount, person, description, payment, status, createdBy, createdAt, id, account = template.account }) {
  const isIncome = template.kind === "income";
  return {
    id: id || `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date,
    templateId: template.id,
    title: template.title,
    primaryAccount: account,
    debitAccount: isIncome ? payment : account,
    creditAccount: isIncome ? account : payment,
    payment,
    amount: Number(amount),
    person,
    description: description || "—",
    status,
    createdBy,
    createdAt: createdAt || new Date().toISOString(),
  };
}

let state = loadState();
let activePage = "dashboard";
let activeReport = "pnl";

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : defaultState();
    if (!parsed.customers || !parsed.customers.length) parsed.customers = customers.map((customer) => ({ ...customer }));
    return parsed;
  } catch {
    return defaultState();
  }
}

function customerStatus(id) { const found = state.customers.find((customer) => customer.id === id); return found ? found.active : false; }
function customersByType(type) { return state.customers.filter((customer) => customer.type === type); }
function activeCustomersByType(type) { return state.customers.filter((customer) => customer.type === type && customer.active).sort((a, b) => a.id.localeCompare(b.id)); }
function canPickCustomer() { return state.role === "data_customer"; }
function toggleCustomerStatus(id) {
  if (!isAdmin()) return;
  const customer = state.customers.find((item) => item.id === id);
  if (!customer) return;
  customer.active = !customer.active;
  addAudit(`${customer.active ? "Activated" : "Deactivated"} customer ‘${customer.id} — ${customer.name}’`, "customer");
  saveState();
  renderCustomers();
  showToast(`${customer.id} marked ${customer.active ? "active" : "inactive"}.`);
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function money(value) { return `Rs. ${Number(value || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function shortMoney(value) { return `Rs. ${(Number(value || 0) / 1000000).toLocaleString("en-LK", { maximumFractionDigits: 2 })}m`; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function formattedDate(value) { return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
function currentRole() { return roleSettings[state.role]; }
function isAdmin() { return state.role === "admin"; }
function isDirector() { return state.role === "director"; }
function canViewFinance() { return isAdmin() || isDirector(); }
function canUseCashBook() { return isAdmin() || state.role === "cashier"; }
function entriesForRole() { return canViewFinance() ? state.entries : state.entries.filter((entry) => entry.createdBy === currentRole().name); }
function approvedEntries() { return state.entries.filter((entry) => entry.status === "approved"); }
function addAudit(action, type = "save") {
  state.audit.unshift({ id: `audit-${Date.now()}`, action, by: currentRole().name, at: new Date().toISOString(), type });
}

function accountName(code) { return accountByCode[code] ? accountByCode[code].name : code; }
function accountLabel(code) { return `<span class="account-code">${code}</span>${escapeHtml(accountName(code))}`; }
function canUseAccount(account) {
  if (isAdmin()) return true;
  if (account.visibility === "Standard") return true;
  return state.role === "store" && account.visibility === "Store only";
}

function paymentAccountsForCurrentRole(template) {
  let codes = cashPaymentAccountCodes;
  if (template.kind !== "cash_expense" && !["cashier", "store"].includes(state.role)) codes = [...cashPaymentAccountCodes, ...standardBankAccountCodes];
  if (template.kind !== "cash_expense" && isAdmin()) codes = [...codes, ...pvtBankAccountCodes];
  return codes.map((code) => accountByCode[code]).filter(Boolean);
}

function paymentOptionsHtml(paymentAccounts) {
  const groups = [
    { label: "Cash", codes: cashPaymentAccountCodes },
    { label: "K.Y.S. Security Service & Enterprise – bank accounts", codes: standardBankAccountCodes },
    { label: "K.Y.S. Pvt Ltd – bank accounts", codes: pvtBankAccountCodes },
  ];
  return groups.map((group) => {
    const groupAccounts = group.codes.map((code) => paymentAccounts.find((account) => account.code === code)).filter(Boolean);
    if (!groupAccounts.length) return "";
    return `<optgroup label="${group.label}">${groupAccounts.map((account) => `<option value="${account.code}">${account.code} — ${escapeHtml(account.name)}</option>`).join("")}</optgroup>`;
  }).join("");
}

function showToast(message, kind = "success") {
  const toast = document.createElement("div");
  toast.className = `toast${kind === "error" ? " error" : ""}`;
  toast.textContent = message;
  document.querySelector("#toast-region").append(toast);
  window.setTimeout(() => toast.remove(), 3300);
}

function emptyState() { return document.querySelector("#empty-state-template").content.cloneNode(true); }

function setPage(page) {
  const restricted = ["approvals", "accounts", "audit", "customers"];
  if (restricted.includes(page) && !isAdmin()) page = "dashboard";
  if (page === "reports" && !canViewFinance()) page = "dashboard";
  if (page === "cashbook" && !canUseCashBook()) page = "dashboard";
  activePage = page;
  document.querySelectorAll(".page").forEach((section) => section.classList.toggle("active-page", section.id === page));
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  const titles = {
    dashboard: `Good morning, ${currentRole().name.split(" ")[0]}`,
    "new-entry": "Add a new entry",
    entries: "Entry history",
    cashbook: "Cash book",
    approvals: "Approval queue",
    reports: "Financial reports",
    accounts: "Chart of accounts",
    customers: "Customers",
    audit: "Activity log",
  };
  document.querySelector("#page-title").textContent = titles[page];
  if (page === "new-entry") renderEntryForm();
  if (page === "entries") renderEntries();
  if (page === "cashbook") renderCashBook();
  if (page === "approvals") renderApprovals();
  if (page === "reports") renderReports();
  if (page === "accounts") renderAccounts();
  if (page === "customers") renderCustomers();
  if (page === "audit") renderAudit();
}

function renderRole() {
  const role = currentRole();
  document.querySelector("#user-name").textContent = role.name;
  document.querySelector("#user-role").textContent = role.label;
  document.querySelector(".avatar").textContent = role.initials;
  document.querySelector("#profile-button").textContent = role.initials;
  document.querySelector("#role-switcher").value = state.role;
  document.querySelectorAll(".admin-only").forEach((item) => { item.style.display = isAdmin() ? "" : "none"; });
  document.querySelectorAll(".cashbook-nav").forEach((item) => { item.style.display = canUseCashBook() ? "" : "none"; });
  const reportsNav = document.querySelector('[data-page="reports"]');
  if (reportsNav) reportsNav.style.display = canViewFinance() ? "" : "none";
  document.querySelector("#backup-btn").style.display = isAdmin() ? "" : "none";
  document.querySelector("#pending-badge").textContent = state.entries.filter((entry) => entry.status === "pending").length;
  if ((activePage === "reports" && !canViewFinance()) || (["approvals", "accounts", "audit", "customers"].includes(activePage) && !isAdmin()) || (activePage === "cashbook" && !canUseCashBook())) activePage = "dashboard";
  setPage(activePage);
  renderDashboard();
}

function renderDashboard() {
  const visibleEntries = entriesForRole();
  const approved = approvedEntries();
  const thisMonth = approved.filter((entry) => entry.date.slice(0, 7) === initialReportMonth);
  const balances = calculateBalances(thisMonth);
  const tradeIncome = groupTotal(balances, "trade_income");
  const otherIncome = groupTotal(balances, "other_income");
  const operating = groupTotal(balances, "operational_expense") + groupTotal(balances, "property_expense");
  const direct = groupTotal(balances, "direct_expense");
  const netProfit = tradeIncome + otherIncome - direct - operating;
  const ownPending = visibleEntries.filter((entry) => entry.status === "pending").length;
  const statGrid = document.querySelector("#stat-grid");
  if (canViewFinance()) {
    statGrid.innerHTML = statCard("Total income", money(tradeIncome + otherIncome), "Approved income this month", "income")
      + statCard("Operating expenses", money(direct + operating), "Approved service & office costs", "expense")
      + statCard("Awaiting approval", `${state.entries.filter((entry) => entry.status === "pending").length} entries`, "Not included in reports yet", "pending")
      + statCard("Net profit / loss", money(netProfit), "Before capital expenditure", "profit");
  } else {
    statGrid.innerHTML = statCard("My saved entries", `${visibleEntries.length} entries`, "Your entry history", "income")
      + statCard("Awaiting approval", `${ownPending} entries`, "Supervisor review required", "pending")
      + statCard("Approved this month", `${visibleEntries.filter((entry) => entry.status === "approved" && entry.date.slice(0, 7) === initialReportMonth).length} entries`, "Included in reports", "income")
      + statCard("Financial reports", "Restricted", "Available to management", "profit");
  }
  renderChart();
  const tasks = isAdmin()
    ? [{ icon: "✓", title: `${state.entries.filter((entry) => entry.status === "pending").length} entries need approval`, note: "Review the latest entries", action: "Approvals", page: "approvals" }, { icon: "▥", title: "Review the August report", note: "Approved entries are ready", action: "Reports", page: "reports" }, { icon: "⇩", title: "Take a backup", note: "Keep a safe daily copy", action: "Backup", page: "backup" }]
    : [{ icon: "＋", title: "Add today's transactions", note: "Choose a simple transaction type", action: "New entry", page: "new-entry" }, { icon: "▤", title: `${ownPending} entry${ownPending === 1 ? "" : "ies"} awaiting review`, note: "Your supervisor will approve them", action: "View", page: "entries" }, { icon: "?", title: "Keep the receipt", note: "Add an invoice number in the short note", action: "Learn", page: "new-entry" }];
  document.querySelector("#task-list").innerHTML = tasks.map((task) => `<div class="task"><div class="task-icon">${task.icon}</div><div><strong>${task.title}</strong><span>${task.note}</span></div><button data-task-page="${task.page}">${task.action} →</button></div>`).join("");
  const recent = visibleEntries.slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentBody = document.querySelector("#recent-entries");
  recentBody.innerHTML = recent.length ? recent.map((entry) => entryRow(entry, true)).join("") : "";
  if (!recent.length) recentBody.append(emptyState());
}

function statCard(label, value, caption, variant) { return `<article class="stat-card ${variant}"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-caption">${caption}</div></article>`; }

function renderChart() {
  const chart = document.querySelector("#income-chart");
  const chartKey = document.querySelector(".chart-key");
  const reportLink = document.querySelector(".profit-panel .link-button");
  const chartHeading = document.querySelector(".profit-panel h2");
  if (!canViewFinance()) {
    chartHeading.textContent = "Financial data is restricted";
    chart.className = "restricted-chart";
    chart.innerHTML = "Management reports are hidden for your role.<br>Use <strong>New entry</strong> to record today's work.";
    chartKey.style.display = "none";
    reportLink.style.display = "none";
    return;
  }
  chartHeading.textContent = "Income vs spending";
  chart.className = "income-chart";
  chartKey.style.display = "flex";
  reportLink.style.display = "";
  const sample = [
    { month: "Mar", income: 265, expense: 189 }, { month: "Apr", income: 218, expense: 163 }, { month: "May", income: 281, expense: 191 }, { month: "Jun", income: 248, expense: 177 }, { month: "Jul", income: 276, expense: 202 }, { month: "Aug", income: 329, expense: 144 },
  ];
  const max = Math.max(...sample.flatMap((item) => [item.income, item.expense]));
  chart.innerHTML = sample.map((item) => `<div class="chart-group" data-month="${item.month}"><div class="chart-bar income" title="Income" style="height:${(item.income / max) * 92}%"></div><div class="chart-bar expense" title="Expenses" style="height:${(item.expense / max) * 92}%"></div></div>`).join("");
}

function renderEntryForm() {
  const allowed = templates.filter((template) => template.roles.includes(state.role));
  if (!allowed.some((template) => template.id === state.selectedTemplate)) state.selectedTemplate = allowed[0]?.id || null;
  const grid = document.querySelector("#template-grid");
  if (!allowed.length) {
    grid.innerHTML = "<p class=\"subtle\">Your role has view-only access. Please ask an Admin to record a transaction.</p>";
    document.querySelector("#entry-fields").classList.add("hidden");
    return;
  }
  document.querySelector("#entry-fields").classList.remove("hidden");
  grid.innerHTML = allowed.map((template) => `<button type="button" class="template-option ${template.id === state.selectedTemplate ? "selected" : ""}" data-template="${template.id}"><span class="template-icon">${template.icon}</span><strong>${template.title}</strong><span>${template.note}</span></button>`).join("");
  const selected = templates.find((template) => template.id === state.selectedTemplate);
  const accountSelect = document.querySelector("#entry-account");
  const detailedAccounts = (selected.accountCodes || [selected.account]).map((code) => accountByCode[code]).filter(Boolean).filter(canUseAccount);
  accountSelect.innerHTML = detailedAccounts.map((account) => `<option value="${account.code}">${account.code} — ${escapeHtml(account.name)}</option>`).join("");
  accountSelect.value = detailedAccounts.some((account) => account.code === selected.account) ? selected.account : detailedAccounts[0]?.code;
  document.querySelector("#entry-account-label").style.display = detailedAccounts.length > 1 ? "grid" : "none";
  document.querySelector("#payee-label").childNodes[0].nodeValue = selected.party;
  document.querySelector("#entry-date").value = document.querySelector("#entry-date").value || todayISO;
  document.querySelector("#entry-payee").placeholder = selected.kind === "income" ? "Customer, property, or person" : "Supplier, employee, or person";
  const payment = document.querySelector("#entry-payment");
  const paymentLabel = document.querySelector("#payment-label");
  const previousPayment = payment.value;
  if (selected.kind === "cash_expense") {
    paymentLabel.childNodes[0].nodeValue = "Paid from";
    const paymentAccounts = paymentAccountsForCurrentRole(selected);
    payment.innerHTML = paymentOptionsHtml(paymentAccounts);
    payment.value = paymentAccounts.some((account) => account.code === previousPayment) ? previousPayment : "100";
  } else if (selected.kind === "income") {
    paymentLabel.childNodes[0].nodeValue = "Money received to";
    const paymentAccounts = paymentAccountsForCurrentRole(selected);
    payment.innerHTML = paymentOptionsHtml(paymentAccounts);
    payment.value = paymentAccounts.some((account) => account.code === previousPayment) ? previousPayment : "202";
  } else {
    paymentLabel.childNodes[0].nodeValue = "Paid from";
    const paymentAccounts = paymentAccountsForCurrentRole(selected);
    payment.innerHTML = paymentOptionsHtml(paymentAccounts);
    payment.value = paymentAccounts.some((account) => account.code === previousPayment) ? previousPayment : "202";
  }
  setupCustomerPicker(selected);
  updateEntryPreview();
}

function setupCustomerPicker(selected) {
  const block = document.querySelector("#customer-select-block");
  const payeeLabel = document.querySelector("#payee-label");
  const payeeInput = document.querySelector("#entry-payee");
  const showPicker = canPickCustomer() && !!selected.customerType;
  block.classList.toggle("hidden", !showPicker);
  if (!showPicker) {
    payeeLabel.classList.remove("hidden");
    payeeInput.required = true;
    return;
  }
  payeeLabel.classList.add("hidden");
  payeeInput.required = false;
  const typeSelect = document.querySelector("#entry-customer-type");
  typeSelect.value = selected.customerType;
  populateCustomerOptions();
}

function populateCustomerOptions() {
  const type = document.querySelector("#entry-customer-type").value;
  const list = activeCustomersByType(type);
  const customerSelect = document.querySelector("#entry-customer");
  customerSelect.innerHTML = list.length
    ? list.map((customer) => `<option value="${customer.id}">${customer.id} — ${escapeHtml(customer.name)}</option>`).join("")
    : `<option value="">No active ${customerTypeLabel[type].toLowerCase()}s found</option>`;
  syncCustomerToPayee();
}

function syncCustomerToPayee() {
  const customerSelect = document.querySelector("#entry-customer");
  const chosen = customerById[customerSelect.value] || state.customers.find((customer) => customer.id === customerSelect.value);
  document.querySelector("#entry-payee").value = chosen ? `${chosen.id} — ${chosen.name}` : "";
}

function updateEntryPreview() {
  const selected = templates.find((template) => template.id === state.selectedTemplate);
  if (!selected) return;
  const payment = document.querySelector("#entry-payment").value || (selected.kind === "cash_expense" ? "100" : "202");
  const primaryAccount = document.querySelector("#entry-account").value || selected.account;
  const amount = Number(document.querySelector("#entry-amount").value || 0);
  const debit = selected.kind === "income" ? payment : primaryAccount;
  const credit = selected.kind === "income" ? primaryAccount : payment;
  document.querySelector("#accounting-preview").innerHTML = `<strong>System rule applied automatically</strong><br><span>Debit: ${accountName(debit)} &nbsp;•&nbsp; Credit: ${accountName(credit)}${amount ? ` &nbsp;•&nbsp; ${money(amount)}` : ""}</span>`;
}

function renderEntries() {
  const search = document.querySelector("#entry-search").value.trim().toLowerCase();
  const filter = document.querySelector("#entry-status-filter").value;
  const items = entriesForRole().filter((entry) => {
    const haystack = `${entry.title} ${entry.person} ${entry.description} ${entry.primaryAccount} ${accountName(entry.primaryAccount)}`.toLowerCase();
    return (!search || haystack.includes(search)) && (filter === "all" || entry.status === filter);
  }).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const body = document.querySelector("#entry-list");
  body.innerHTML = items.map((entry) => entryRow(entry)).join("");
  if (!items.length) body.append(emptyState());
}

function renderCashBook() {
  const monthInput = document.querySelector("#cashbook-month");
  const month = monthInput.value || initialReportMonth;
  monthInput.value = month;
  const openingEntries = state.entries.filter((entry) => cashPaymentAccountCodes.includes(entry.payment) && entry.date.slice(0, 7) < month && entry.status === "approved");
  const openingBalance = openingEntries.reduce((balance, entry) => balance + (entry.debitAccount === entry.payment ? entry.amount : -entry.amount), 0);
  const entries = state.entries.filter((entry) => cashPaymentAccountCodes.includes(entry.payment) && entry.date.slice(0, 7) === month).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt));
  let balance = openingBalance;
  let received = 0;
  let paid = 0;
  const lines = entries.map((entry) => {
    const incoming = entry.debitAccount === entry.payment;
    const effectiveAmount = entry.status === "approved" ? entry.amount : 0;
    if (incoming) { balance += effectiveAmount; received += effectiveAmount; } else { balance -= effectiveAmount; paid += effectiveAmount; }
    return { entry, incoming, runningBalance: balance };
  });
  document.querySelector("#cashbook-summary").innerHTML = statCard("Cash received", money(received), "Approved receipts for this month", "income")
    + statCard("Cash paid", money(paid), "Approved payments for this month", "expense")
    + statCard("Closing cash balance", money(balance), `Opening balance ${money(openingBalance)}`, "profit");
  const body = document.querySelector("#cashbook-list");
  body.innerHTML = lines.map(({ entry, incoming, runningBalance }) => `<tr><td>${formattedDate(entry.date)}</td><td><strong>${escapeHtml(entry.title)}</strong><br><span class="subtle">${escapeHtml(entry.description)} · ${escapeHtml(entry.person)}</span></td><td class="cashbook-source">${escapeHtml(accountName(entry.payment))}</td><td class="amount">${incoming ? money(entry.amount) : "—"}</td><td class="amount">${incoming ? "—" : money(entry.amount)}</td><td class="amount cashbook-balance">${entry.status === "approved" ? money(runningBalance) : "Pending"}</td><td><span class="status ${entry.status}">${entry.status === "approved" ? "Approved" : entry.status === "pending" ? "Pending" : "Rejected"}</span></td></tr>`).join("");
  if (!lines.length) body.append(emptyState());
}

function entryRow(entry, simple = false) {
  const category = accountByCode[entry.primaryAccount];
  return `<tr><td>${formattedDate(entry.date)}</td><td><strong>${escapeHtml(entry.title)}</strong>${simple ? "" : `<br><span class="subtle">${escapeHtml(entry.description)}</span>`}</td><td>${simple ? `<span class="subtle">${escapeHtml(category.name)}</span>` : escapeHtml(entry.person)}</td>${simple ? "" : `<td>${accountLabel(entry.primaryAccount)}</td>`}<td class="amount">${money(entry.amount)}</td><td><span class="status ${entry.status}">${entry.status === "approved" ? "Approved" : entry.status === "pending" ? "Pending" : "Rejected"}</span></td></tr>`;
}

function renderApprovals() {
  const entries = state.entries.filter((entry) => entry.status === "pending").sort((a, b) => b.date.localeCompare(a.date));
  document.querySelector("#approval-count").textContent = `${entries.length} pending`;
  const target = document.querySelector("#approval-list");
  target.innerHTML = entries.map((entry) => `<article class="approval-item"><div class="approval-icon">${templates.find((template) => template.id === entry.templateId)?.icon || "•"}</div><div class="approval-copy"><strong>${escapeHtml(entry.title)} — ${money(entry.amount)}</strong><span>${formattedDate(entry.date)} · ${escapeHtml(entry.person)} · entered by ${escapeHtml(entry.createdBy)} · ${accountLabel(entry.primaryAccount)}</span></div><div class="approval-actions"><button class="reject-btn" data-reject="${entry.id}">Reject</button><button class="approve-btn" data-approve="${entry.id}">Approve</button></div></article>`).join("");
  if (!entries.length) target.append(emptyState());
}

function calculateBalances(entries) {
  const balances = Object.fromEntries(accounts.map((account) => [account.code, { debit: 0, credit: 0 }]));
  entries.forEach((entry) => {
    if (balances[entry.debitAccount]) balances[entry.debitAccount].debit += entry.amount;
    if (balances[entry.creditAccount]) balances[entry.creditAccount].credit += entry.amount;
  });
  return balances;
}

function accountReportBalance(code, balances) {
  const account = accountByCode[code];
  const item = balances[code] || { debit: 0, credit: 0 };
  return ["trade_income", "other_income"].includes(account.category) ? item.credit - item.debit : item.debit - item.credit;
}

function groupTotal(balances, category) { return accounts.filter((account) => account.category === category).reduce((sum, account) => sum + Math.max(0, accountReportBalance(account.code, balances)), 0); }
function linesForCategory(category, balances) { return accounts.filter((account) => account.category === category).map((account) => ({ account, amount: Math.max(0, accountReportBalance(account.code, balances)) })); }
function periodEntries(month, ytd = false) { return approvedEntries().filter((entry) => ytd ? entry.date.slice(0, 4) === month.slice(0, 4) && entry.date.slice(0, 7) <= month : entry.date.slice(0, 7) === month); }

function reportGroup(label, category, monthBalances, ytdBalances) {
  const monthLines = linesForCategory(category, monthBalances);
  const ytdLines = linesForCategory(category, ytdBalances);
  const codeSet = new Set([...monthLines, ...ytdLines].map((line) => line.account.code));
  const lines = [...codeSet].map((code) => ({ account: accountByCode[code], month: Math.max(0, accountReportBalance(code, monthBalances)), ytd: Math.max(0, accountReportBalance(code, ytdBalances)) }));
  if (!lines.length) return "";
  return `<tr class="group-row"><td colspan="3">${label}</td></tr>${lines.map((line) => `<tr><td class="indent">${accountLabel(line.account.code)}</td><td>${money(line.month)}</td><td>${money(line.ytd)}</td></tr>`).join("")}`;
}

function reportTotal(label, month, ytd) { return `<tr class="total-row"><td>${label}</td><td>${money(month)}</td><td>${money(ytd)}</td></tr>`; }

function renderReports() {
  const month = document.querySelector("#report-month").value || initialReportMonth;
  document.querySelector("#report-month").value = month;
  const dates = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const monthBalances = calculateBalances(periodEntries(month));
  const ytdBalances = calculateBalances(periodEntries(month, true));
  const tradeMonth = groupTotal(monthBalances, "trade_income"); const tradeYtd = groupTotal(ytdBalances, "trade_income");
  const otherMonth = groupTotal(monthBalances, "other_income"); const otherYtd = groupTotal(ytdBalances, "other_income");
  const directMonth = groupTotal(monthBalances, "direct_expense"); const directYtd = groupTotal(ytdBalances, "direct_expense");
  const opMonth = groupTotal(monthBalances, "operational_expense") + groupTotal(monthBalances, "property_expense"); const opYtd = groupTotal(ytdBalances, "operational_expense") + groupTotal(ytdBalances, "property_expense");
  const profitTradeMonth = tradeMonth - directMonth; const profitTradeYtd = tradeYtd - directYtd;
  const netMonth = profitTradeMonth + otherMonth - opMonth; const netYtd = profitTradeYtd + otherYtd - opYtd;
  document.querySelector("#pnl-report").innerHTML = `<div class="report-header"><p>K.Y.S. SECURITY SERVICE & ENTERPRISE</p><h2>Monthly Profit &amp; Loss Statement</h2><p>For the month ending ${dates}</p></div><div class="table-wrap"><table class="report-table"><thead><tr><th>Description</th><th>Month (Rs.)</th><th>Year to date (Rs.)</th></tr></thead><tbody>${reportGroup("Trade income", "trade_income", monthBalances, ytdBalances)}${reportTotal("Total trade income", tradeMonth, tradeYtd)}${reportGroup("Less: Direct expenses", "direct_expense", monthBalances, ytdBalances)}${reportTotal("Profit on trade", profitTradeMonth, profitTradeYtd)}${reportGroup("Additional other income", "other_income", monthBalances, ytdBalances)}${reportGroup("Less: Operational & overhead expenditure", "operational_expense", monthBalances, ytdBalances)}${reportGroup("Less: Property maintenance expenditure", "property_expense", monthBalances, ytdBalances)}${reportTotal("Net profit / (loss)", netMonth, netYtd)}</tbody></table></div><div class="report-note">Only entries approved by an Admin are included. Year-to-date means entries in the selected calendar year through the selected month.</div>`;
  renderTrialBalance(month, dates);
  renderCapitalReport(month, dates, monthBalances, ytdBalances, netMonth, netYtd);
  showActiveReport();
}

function renderTrialBalance(month, dates) {
  const balances = calculateBalances(periodEntries(month, true));
  const items = accounts.map((account) => {
    const line = balances[account.code];
    const net = line.debit - line.credit;
    return { account, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 };
  }).filter((item) => item.debit || item.credit);
  const totalDebit = items.reduce((sum, item) => sum + item.debit, 0);
  const totalCredit = items.reduce((sum, item) => sum + item.credit, 0);
  document.querySelector("#trial-balance-report").innerHTML = `<div class="report-header"><p>K.Y.S. SECURITY SERVICE & ENTERPRISE</p><h2>Trial Balance</h2><p>As at ${dates}</p></div><div class="table-wrap"><table class="report-table"><thead><tr><th>Description of account</th><th>Debit (Rs.)</th><th>Credit (Rs.)</th></tr></thead><tbody>${items.map((item) => `<tr><td>${accountLabel(item.account.code)}</td><td>${item.debit ? money(item.debit) : "—"}</td><td>${item.credit ? money(item.credit) : "—"}</td></tr>`).join("")}${reportTotal("Total", totalDebit, totalCredit)}</tbody></table></div><div class="report-note">The debit and credit totals must be equal. This is generated from the double-entry rule behind each approved form.</div>`;
}

function renderCapitalReport(month, dates, monthBalances, ytdBalances, netMonth, netYtd) {
  const capMonth = groupTotal(monthBalances, "capital"); const capYtd = groupTotal(ytdBalances, "capital");
  document.querySelector("#capital-report").innerHTML = `<div class="report-header"><p>K.Y.S. SECURITY SERVICE & ENTERPRISE</p><h2>Capital Expenditure &amp; WIP</h2><p>For the month ending ${dates}</p></div><div class="table-wrap"><table class="report-table"><thead><tr><th>Investment / asset</th><th>Month (Rs.)</th><th>Year to date (Rs.)</th></tr></thead><tbody>${reportGroup("Capital expenditure and work in progress", "capital", monthBalances, ytdBalances)}${reportTotal("Total capital expenditure", capMonth, capYtd)}${reportTotal("Profit / (loss) after capital investment", netMonth - capMonth, netYtd - capYtd)}</tbody></table></div><div class="report-note">Capital costs are reported separately from operating expenses, exactly as in the monthly manual report.</div>`;
}

function showActiveReport() {
  document.querySelectorAll(".report-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.report === activeReport));
  document.querySelector("#pnl-report").classList.toggle("hidden", activeReport !== "pnl");
  document.querySelector("#trial-balance-report").classList.toggle("hidden", activeReport !== "trial-balance");
  document.querySelector("#capital-report").classList.toggle("hidden", activeReport !== "capital");
}

function renderAccounts() {
  const query = document.querySelector("#account-search").value.trim().toLowerCase();
  const visible = accounts.filter((account) => `${account.code} ${account.name} ${account.category}`.toLowerCase().includes(query));
  const body = document.querySelector("#account-list");
  body.innerHTML = visible.map((account) => `<tr><td><strong>${account.code}</strong></td><td>${escapeHtml(account.name)}</td><td>${categoryLabel(account.category)}</td><td>${account.side}</td><td>${account.visibility}</td></tr>`).join("");
  if (!visible.length) body.append(emptyState());
}

function categoryLabel(category) { return ({ asset: "Asset", liability: "Liability", equity: "Equity", trade_income: "Trade income", other_income: "Other income", direct_expense: "Direct expense", operational_expense: "Operational expense", property_expense: "Property expense", capital: "Capital / WIP" }[category] || category); }

function renderCustomers() {
  const search = document.querySelector("#customer-search").value.trim().toLowerCase();
  const typeFilter = document.querySelector("#customer-type-filter").value;
  const statusFilter = document.querySelector("#customer-status-filter").value;
  const items = state.customers.filter((customer) => {
    const haystack = `${customer.id} ${customer.name}`.toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesType = typeFilter === "all" || customer.type === typeFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? customer.active : !customer.active);
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => a.id.localeCompare(b.id));
  const body = document.querySelector("#customer-list");
  body.innerHTML = items.slice(0, 400).map((customer) => `<tr><td><strong>${customer.id}</strong></td><td>${escapeHtml(customer.name)}</td><td>${customerTypeLabel[customer.type] || customer.type}</td><td><span class="status ${customer.active ? "approved" : "rejected"}">${customer.active ? "Active" : "Deactive"}</span></td><td>${isAdmin() ? `<button class="ghost-button small toggle-customer-btn" data-toggle-customer="${customer.id}">${customer.active ? "Deactivate" : "Activate"}</button>` : ""}</td></tr>`).join("");
  if (!items.length) body.append(emptyState());
  const countNote = document.querySelector("#customer-count-note");
  if (countNote) countNote.textContent = items.length > 400 ? `Showing first 400 of ${items.length} matching customers. Refine your search to see more.` : `${items.length} customer${items.length === 1 ? "" : "s"}`;
}

function renderAudit() {
  const target = document.querySelector("#audit-list");
  target.innerHTML = state.audit.slice().sort((a, b) => b.at.localeCompare(a.at)).map((item) => `<div class="audit-item"><div class="audit-dot"></div><div class="audit-copy"><strong>${escapeHtml(item.action)}</strong><span>by ${escapeHtml(item.by)}</span></div><time class="audit-time">${new Date(item.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time></div>`).join("");
  if (!state.audit.length) target.append(emptyState());
}

function handleEntrySubmit(event) {
  event.preventDefault();
  const selected = templates.find((template) => template.id === state.selectedTemplate);
  if (!selected) return;
  const amount = Number(document.querySelector("#entry-amount").value);
  if (!amount || amount <= 0) return showToast("Enter an amount greater than zero.", "error");
  const entry = buildEntry({ date: document.querySelector("#entry-date").value, template: selected, account: document.querySelector("#entry-account").value || selected.account, amount, person: document.querySelector("#entry-payee").value.trim(), description: document.querySelector("#entry-description").value.trim(), payment: document.querySelector("#entry-payment").value, status: "pending", createdBy: currentRole().name });
  state.entries.push(entry);
  addAudit(`Saved ‘${entry.description === "—" ? entry.title : entry.description}’ for review`);
  saveState();
  document.querySelector("#entry-form").reset();
  document.querySelector("#entry-date").value = todayISO;
  renderRole();
  showToast("Saved for approval. It will appear in reports after review.");
  setPage("entries");
}

function approveEntry(id, status) {
  const entry = state.entries.find((item) => item.id === id);
  if (!entry) return;
  entry.status = status;
  addAudit(`${status === "approved" ? "Approved" : "Rejected"} ‘${entry.description === "—" ? entry.title : entry.description}’`, status === "approved" ? "approve" : "reject");
  saveState();
  renderRole();
  renderApprovals();
  showToast(status === "approved" ? "Entry approved and added to reports." : "Entry rejected. The audit record is kept.");
}

function downloadBackup() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data: state }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = `kys-finance-backup-${todayISO}.json`; link.click(); URL.revokeObjectURL(url);
  addAudit("Downloaded a browser data backup", "backup"); saveState(); showToast("Backup downloaded successfully.");
}

function exportReport() {
  const month = document.querySelector("#report-month").value || initialReportMonth;
  const dates = new Date(`${month}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const workbook = XLSX.utils.book_new();
  const reportRows = [];

  if (activeReport === "pnl") {
    const monthBalances = calculateBalances(periodEntries(month));
    const ytdBalances = calculateBalances(periodEntries(month, true));
    const tradeMonth = groupTotal(monthBalances, "trade_income");
    const tradeYtd = groupTotal(ytdBalances, "trade_income");
    const otherMonth = groupTotal(monthBalances, "other_income");
    const otherYtd = groupTotal(ytdBalances, "other_income");
    const directMonth = groupTotal(monthBalances, "direct_expense");
    const directYtd = groupTotal(ytdBalances, "direct_expense");
    const opMonth = groupTotal(monthBalances, "operational_expense") + groupTotal(monthBalances, "property_expense");
    const opYtd = groupTotal(ytdBalances, "operational_expense") + groupTotal(ytdBalances, "property_expense");
    const netMonth = tradeMonth - directMonth + otherMonth - opMonth;
    const netYtd = tradeYtd - directYtd + otherYtd - opYtd;

    reportRows.push(["K.Y.S. Security Service & Enterprise", "", "", "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["Profit & Loss Statement", "", "", "", "", "", "", "", "", "", "", ""]);
    reportRows.push([`For the month ending ${dates}`, "", "", "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["Description", "Month (Rs.)", "Year to date (Rs.)", "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["Trade income", "", "", "", "", "", "", "", "", "", "", ""]);
    accounts.filter((account) => account.category === "trade_income").forEach((account) => {
      reportRows.push([account.name, Math.max(0, accountReportBalance(account.code, monthBalances)), Math.max(0, accountReportBalance(account.code, ytdBalances)), "", "", "", "", "", "", "", "", ""]);
    });
    reportRows.push(["Total trade income", tradeMonth, tradeYtd, "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["Less: Direct expenses", "", "", "", "", "", "", "", "", "", "", ""]);
    accounts.filter((account) => account.category === "direct_expense").forEach((account) => {
      reportRows.push([account.name, Math.max(0, accountReportBalance(account.code, monthBalances)), Math.max(0, accountReportBalance(account.code, ytdBalances)), "", "", "", "", "", "", "", "", ""]);
    });
    reportRows.push(["Profit on trade", tradeMonth - directMonth, tradeYtd - directYtd, "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["Additional other income", "", "", "", "", "", "", "", "", "", "", ""]);
    accounts.filter((account) => account.category === "other_income").forEach((account) => {
      reportRows.push([account.name, Math.max(0, accountReportBalance(account.code, monthBalances)), Math.max(0, accountReportBalance(account.code, ytdBalances)), "", "", "", "", "", "", "", "", ""]);
    });
    reportRows.push(["Less: Operational & overhead expenditure", "", "", "", "", "", "", "", "", "", "", ""]);
    accounts.filter((account) => account.category === "operational_expense").forEach((account) => {
      reportRows.push([account.name, Math.max(0, accountReportBalance(account.code, monthBalances)), Math.max(0, accountReportBalance(account.code, ytdBalances)), "", "", "", "", "", "", "", "", ""]);
    });
    reportRows.push(["Less: Property maintenance expenditure", "", "", "", "", "", "", "", "", "", "", ""]);
    accounts.filter((account) => account.category === "property_expense").forEach((account) => {
      reportRows.push([account.name, Math.max(0, accountReportBalance(account.code, monthBalances)), Math.max(0, accountReportBalance(account.code, ytdBalances)), "", "", "", "", "", "", "", "", ""]);
    });
    reportRows.push(["Net profit / (loss)", netMonth, netYtd, "", "", "", "", "", "", "", "", ""]);
  } else if (activeReport === "trial-balance") {
    const balances = calculateBalances(periodEntries(month, true));
    const items = accounts.map((account) => {
      const line = balances[account.code];
      const net = (line?.debit || 0) - (line?.credit || 0);
      return { account, debit: net > 0 ? net : 0, credit: net < 0 ? -net : 0 };
    }).filter((item) => item.debit || item.credit);
    const totalDebit = items.reduce((sum, item) => sum + item.debit, 0);
    const totalCredit = items.reduce((sum, item) => sum + item.credit, 0);

    reportRows.push(["K.Y.S. Security Service & Enterprise", "", "", "", "", "", "", "", "", "", "", ""]);
    reportRows.push([`Trial Balance as at ${dates}`, "", "", "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["S/N", "Description of Accounts", "CODE", "30th Apr Balance", "Dr", "Cr", "Current Month", "Dr", "Cr", "Balance", "Dr", "Cr"]);
    items.forEach((item, index) => {
      reportRows.push([index + 1, item.account.name, item.account.code, "", item.debit || "", item.credit || "", "", "", "", "", item.debit || "", item.credit || ""]);
    });
    reportRows.push(["", "", "", "", "", "", "", "", "", "Total", totalDebit, totalCredit]);
  } else {
    const monthBalances = calculateBalances(periodEntries(month));
    const ytdBalances = calculateBalances(periodEntries(month, true));
    const capMonth = groupTotal(monthBalances, "capital");
    const capYtd = groupTotal(ytdBalances, "capital");
    const netMonth = (groupTotal(monthBalances, "trade_income") - groupTotal(monthBalances, "direct_expense") + groupTotal(monthBalances, "other_income") - (groupTotal(monthBalances, "operational_expense") + groupTotal(monthBalances, "property_expense"))) - capMonth;
    const netYtd = (groupTotal(ytdBalances, "trade_income") - groupTotal(ytdBalances, "direct_expense") + groupTotal(ytdBalances, "other_income") - (groupTotal(ytdBalances, "operational_expense") + groupTotal(ytdBalances, "property_expense"))) - capYtd;

    reportRows.push(["K.Y.S. Security Service & Enterprise", "", "", "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["Capital Expenditure & WIP", "", "", "", "", "", "", "", "", "", "", ""]);
    reportRows.push([`For the month ending ${dates}`, "", "", "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["Investment / asset", "Month (Rs.)", "Year to date (Rs.)", "", "", "", "", "", "", "", "", ""]);
    accounts.filter((account) => account.category === "capital").forEach((account) => {
      reportRows.push([account.name, Math.max(0, accountReportBalance(account.code, monthBalances)), Math.max(0, accountReportBalance(account.code, ytdBalances)), "", "", "", "", "", "", "", "", ""]);
    });
    reportRows.push(["Total capital expenditure", capMonth, capYtd, "", "", "", "", "", "", "", "", ""]);
    reportRows.push(["Profit / (loss) after capital investment", netMonth, netYtd, "", "", "", "", "", "", "", "", ""]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(reportRows);
  sheet['!cols'] = [{ wch: 5 }, { wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
  sheet['!rows'] = [{ hpx: 24 }, { hpx: 22 }, { hpx: 20 }, { hpx: 22 }];

  const sheetName = activeReport === "pnl" ? "P&L" : activeReport === "trial-balance" ? "Trial Balance" : "Capital";
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  XLSX.writeFile(workbook, `kys-${activeReport}-${month}.xlsx`);

  addAudit(`Exported ${activeReport} report for ${month}`, "report");
  saveState();
  showToast("Excel report downloaded.");
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => setPage(button.dataset.page)));
  document.addEventListener("click", (event) => {
    const goTo = event.target.closest("[data-goto]"); if (goTo) setPage(goTo.dataset.goto);
    const task = event.target.closest("[data-task-page]"); if (task) task.dataset.taskPage === "backup" ? downloadBackup() : setPage(task.dataset.taskPage);
    const option = event.target.closest("[data-template]"); if (option) { state.selectedTemplate = option.dataset.template; renderEntryForm(); }
    const approve = event.target.closest("[data-approve]"); if (approve) approveEntry(approve.dataset.approve, "approved");
    const reject = event.target.closest("[data-reject]"); if (reject) approveEntry(reject.dataset.reject, "rejected");
    const tab = event.target.closest(".report-tab"); if (tab) { activeReport = tab.dataset.report; showActiveReport(); }
    const toggleCustomer = event.target.closest("[data-toggle-customer]"); if (toggleCustomer) toggleCustomerStatus(toggleCustomer.dataset.toggleCustomer);
  });
  document.querySelector("#entry-form").addEventListener("submit", handleEntrySubmit);
  document.querySelector("#entry-amount").addEventListener("input", updateEntryPreview);
  document.querySelector("#entry-payment").addEventListener("change", updateEntryPreview);
  document.querySelector("#entry-account").addEventListener("change", updateEntryPreview);
  document.querySelector("#entry-customer-type").addEventListener("change", populateCustomerOptions);
  document.querySelector("#entry-customer").addEventListener("change", syncCustomerToPayee);
  document.querySelector("#entry-search").addEventListener("input", renderEntries);
  document.querySelector("#entry-status-filter").addEventListener("change", renderEntries);
  document.querySelector("#account-search").addEventListener("input", renderAccounts);
  document.querySelector("#customer-search").addEventListener("input", renderCustomers);
  document.querySelector("#customer-type-filter").addEventListener("change", renderCustomers);
  document.querySelector("#customer-status-filter").addEventListener("change", renderCustomers);
  document.querySelector("#cashbook-month").addEventListener("change", renderCashBook);
  document.querySelector("#report-month").addEventListener("change", renderReports);
  document.querySelector("#role-switcher").addEventListener("change", (event) => { state.role = event.target.value; saveState(); renderRole(); });
  document.querySelector("#backup-btn").addEventListener("click", downloadBackup);
  document.querySelector("#export-report").addEventListener("click", exportReport);
  document.querySelector("#print-report").addEventListener("click", () => window.print());
  document.querySelector("#reset-demo").addEventListener("click", () => {
    if (!window.confirm("Reset all demonstration entries and restore the original sample data?")) return;
    state = defaultState(); saveState(); activePage = "dashboard"; renderRole(); showToast("Demonstration data reset.");
  });
}

function start() {
  document.querySelector("#today-label").textContent = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();
  document.querySelector("#entry-date").value = todayISO;
  document.querySelector("#cashbook-month").value = initialReportMonth;
  document.querySelector("#report-month").value = initialReportMonth;
  bindEvents();
  renderRole();
}

start();
