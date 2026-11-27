/* DIS-507 Inventory tracking prototype. Static mock, one saved match for both versions. */
(function () {
  const KEY = "dis507-inventory-v1";

  const LEDGERS = {
    qbo: { id: "qbo", name: "QuickBooks Online", short: "QBO", je: "Journal entry", inv: "Inventory adjustment", canCreate: true, skuLabel: "SKU", nameLimit: 100, skuLimit: 100, forbidColon: true },
    xero: { id: "xero", name: "Xero", short: "Xero", je: "Manual journal", inv: "Inventory adjustment", canCreate: true, skuLabel: "SKU (item code)", nameLimit: 50, skuLimit: 30 },
    sage: { id: "sage", name: "Sage Intacct", short: "Sage Intacct", je: "Journal entry", inv: "Inventory adjustment", canCreate: false, warehouse: true },
    netsuite: { id: "netsuite", name: "NetSuite", short: "NetSuite", je: "Journal entry", inv: "Inventory adjustment", canCreate: false },
  };

  const PLATFORMS = {
    shopify: { name: "Shopify", letter: "S", color: "#5B4DC7" },
    stripe: { name: "Stripe", letter: "S", color: "#635BFF" },
    paypal: { name: "PayPal", letter: "P", color: "#003087" },
    amazon: { name: "Amazon", letter: "a", color: "#E47911" },
  };

  const WAREHOUSES = [
    { id: "wh-main", label: "Main (WH-01)" },
    { id: "wh-east", label: "East coast (WH-02)" },
    { id: "wh-ret", label: "Returns (WH-03)" },
  ];

  const COGS_ROWS = [
    { id: "yoav", name: "Yoav Barazani", platform: "paypal" },
    { id: "shop", name: "KINIPOP LLC", platform: "shopify" },
    { id: "safety1", name: "TrueSafety", platform: "shopify" },
    { id: "shop2", name: "KINIPOP LLC", platform: "stripe" },
    { id: "safety2", name: "TrueSafety", platform: "amazon" },
    { id: "heat", name: "Invisible Heat", platform: "shopify" },
  ];

  const PRODUCTS = [
    { id: "hoodie", name: "Kinipop Hoodie — Navy / M", sku: "KIN-HOOD-NV-M", integration: "shopify", channel: "KINIPOP LLC", cost: 18.4, category: "Apparel" },
    { id: "beanie", name: "Kinipop Beanie", sku: "KIN-BEAN", integration: "shopify", channel: "KINIPOP LLC", cost: 6.2, category: "Apparel" },
    { id: "fak", name: "TrueSafety First Aid Kit", sku: "TS-FAK-01", integration: "amazon", channel: "TrueSafety", cost: 9.1, category: "Safety" },
    { id: "helmet", name: "TrueSafety Helmet", sku: "TS-HELM-PRO", integration: "amazon", channel: "TrueSafety", cost: 22, category: "Safety" },
    { id: "pad", name: "Invisible Heat Pad", sku: "HEAT-PAD", integration: "shopify", channel: "Invisible Heat", cost: 11.5, category: "Heat" },
    { id: "mug", name: "Invisible Heat Mug", sku: "IH-MUG-12", integration: "shopify", channel: "Invisible Heat", cost: 4.8, category: "Heat" },
    { id: "gift", name: "Gift Box", sku: "GIFT-BOX", integration: "shopify", channel: "KINIPOP LLC", cost: 1.2, category: "Packaging" },
    { id: "tee", name: "Workshop Tee", sku: "TEE-WS-01", integration: "paypal", channel: "Yoav Barazani", cost: 8, category: "Apparel" },
    { id: "tote", name: "Kinipop Tote", sku: "KIN-TOTE-NAT", integration: "stripe", channel: "KINIPOP LLC", cost: 3.4, category: "Bags" },
  ];

  const ITEMS = [
    { id: "hoodie", name: "Kinipop Hoodie — Navy / M", sku: "KIN-HOOD-NV-M", type: "Inventory", qoh: 140 },
    { id: "beanie", name: "Kinipop Beanie", sku: "KIN-BEAN", type: "Inventory", qoh: 86 },
    { id: "fak", name: "TrueSafety First Aid Kit", sku: "TS-FAK-01", type: "Inventory", qoh: 54 },
    { id: "pad", name: "Invisible Heat Pad", sku: "IH-PAD", type: "Inventory", qoh: 210 },
    { id: "padxl", name: "Invisible Heat Pad XL", sku: "IH-PAD-XL", type: "Inventory", qoh: 64 },
    { id: "helm-a", name: "TrueSafety Helmet Adult", sku: "TS-HELM-A", type: "Inventory", qoh: 30 },
    { id: "helm-y", name: "TrueSafety Helmet Youth", sku: "TS-HELM-Y", type: "Inventory", qoh: 18 },
    { id: "giftsm", name: "Gift Box Small", sku: "GIFT-SM", type: "Inventory", qoh: 300 },
    { id: "giftlg", name: "Gift Box Large", sku: "GIFT-LG", type: "Inventory", qoh: 120 },
    { id: "workshop", name: "Workshop", sku: "WORKSHOP", type: "Service", qoh: null },
    { id: "shipping", name: "Shipping", sku: "SHIP", type: "Non-inventory", qoh: null },
  ];

  const MAPPINGS = [
    { id: "sales", group: "Sales", type: "Sales", category: "Sales", integration: "shopify", channel: "KINIPOP LLC", account: "Sales" },
    { id: "refunds", group: "Refunds", type: "Refunds", category: "Refunds", integration: "shopify", channel: "KINIPOP LLC", account: "Sales" },
    { id: "fees", group: "Fees", type: "Fees", category: "Fees", integration: "shopify", channel: "KINIPOP LLC", account: "" },
    { id: "payout", group: "Payouts", type: "Payout", category: "Clearing", integration: "shopify", channel: "KINIPOP LLC", account: "Shopify clearing" },
    { id: "pp", group: "Sales", type: "Sales", category: "Sales", integration: "paypal", channel: "Yoav Barazani", account: "Sales" },
    { id: "amz", group: "Sales", type: "Sales", category: "Sales", integration: "amazon", channel: "TrueSafety", account: "Sales" },
    { id: "st", group: "Fees", type: "Fees", category: "Fees", integration: "stripe", channel: "KINIPOP LLC", account: "Stripe fees" },
  ];

  const ACCOUNTS = {
    qbo: {
      asset: ["Inventory Asset", "Other Current Asset", "Stock on hand"],
      income: ["Sales of Product Income", "Sales", "Product income"],
      cogs: ["Cost of Goods Sold", "Supplies and materials — COGS", "COGS — products"],
      adjust: ["Inventory Asset", "Inventory Shrinkage", "Cost of Goods Sold"],
    },
    xero: {
      asset: ["630 — Inventory", "631 — Stock on hand", "140 — Inventory asset"],
      income: ["200 — Sales", "260 — Other revenue", "210 — Product sales"],
      cogs: ["310 — Cost of Goods Sold", "320 — Direct costs"],
      contact: ["Synder Inventory", "Kinipop LLC", "Inventory adjustment"],
    },
    sage: {
      entity: ["Kinipop LLC (top level)", "Kinipop US entity"],
      glGroup: ["Finished goods", "Merchandise", "Raw materials"],
      asset: ["1400 — Inventory", "1410 — Merchandise"],
      income: ["4000 — Sales", "4100 — Product sales"],
      cogs: ["5000 — COGS", "5100 — Purchases"],
    },
    netsuite: {
      subsidiary: ["Kinipop LLC", "Kinipop LLC : US"],
      asset: ["Inventory Asset", "Stock on hand"],
      income: ["Sales", "Product income"],
      cogs: ["Cost of Goods Sold", "Direct costs"],
    },
  };

  const MAP_ACCOUNTS = ["", "Sales", "Refunds", "Shopify clearing", "Stripe fees", "Fees", "Payment processing fees"];

  function defaultPosting() {
    return {
      qbo: { adjust: "Inventory Asset", income: "Sales of Product Income", cogs: "Cost of Goods Sold", asset: "Inventory Asset" },
      xero: { contact: "Synder Inventory", income: "200 — Sales", cogs: "310 — Cost of Goods Sold", asset: "630 — Inventory" },
      sage: { entity: "Kinipop LLC (top level)", warehouse: "wh-main", glGroup: "Finished goods", income: "4000 — Sales", cogs: "5000 — COGS", asset: "1400 — Inventory" },
      netsuite: { subsidiary: "Kinipop LLC", income: "Sales", cogs: "Cost of Goods Sold", asset: "Inventory Asset" },
    };
  }

  function defaultState() {
    return {
      version: "a",
      ledger: "qbo",
      inventoryTracking: true,
      cogs: { yoav: true, shop: true, safety1: false, shop2: true, safety2: false, heat: true },
      extras: { blockUnverified: false, autoVerify: false },
      matches: {
        beanie: { itemId: "beanie", itemName: "Kinipop Beanie", itemSku: "KIN-BEAN", itemType: "Inventory", source: "manual", warehouseId: "wh-main" },
      },
      created: { qbo: [], xero: [], sage: [], netsuite: [] },
      posting: defaultPosting(),
      customProducts: [],
      feedbackSent: {},
      createItems: true,
      lastEdit: { productId: "beanie", text: "Kinipop Beanie → Kinipop Beanie" },
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || typeof raw !== "object") return base;
      const posting = {};
      Object.keys(base.posting).forEach((k) => {
        posting[k] = Object.assign({}, base.posting[k], raw.posting && raw.posting[k]);
      });
      const created = Object.assign({}, base.created, raw.created || {});
      return Object.assign({}, base, raw, {
        cogs: Object.assign({}, base.cogs, raw.cogs || {}),
        extras: Object.assign({}, base.extras, raw.extras || {}),
        matches: raw.matches || base.matches,
        created: created,
        posting: posting,
        customProducts: Array.isArray(raw.customProducts) ? raw.customProducts : [],
        feedbackSent: raw.feedbackSent || {},
        createItems: raw.createItems === false ? false : true,
        lastEdit: raw.lastEdit || base.lastEdit,
      });
    } catch (e) {
      return base;
    }
  }

  let state = loadState();
  const ui = {
    page: "products",
    mappingTab: "accounts",
    mappingIntegration: "all",
    showUnmappedOnly: false,
    expandedMap: null,
    accounts: {},
    search: "",
    filterIntegration: "all",
    filterMatch: "all",
    selected: {},
    picker: null,
    review: null,
    create: null,
    confirm: null,
    info: null,
    add: null,
    finding: false,
    findToken: 0,
    highlightId: null,
    syncOpen: { ok: true, fail: true },
    settingsSection: "products",
    returnPage: "products",
    toast: null,
  };
  MAPPINGS.forEach((m) => { ui.accounts[m.id] = m.account; });

  let focusRestore = null;
  let toastTimer = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }
  function money(n) {
    return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }
  function ledger() { return LEDGERS[state.ledger]; }
  function neu() { return '<span class="new">New</span>'; }
  function productById(id) { return allProducts().find((p) => p.id === id); }
  function allProducts() { return PRODUCTS.concat(state.customProducts || []); }
  function allItems() { return ITEMS.concat((state.created && state.created[state.ledger]) || []); }
  function findItem(id) { return allItems().find((i) => i.id === id) || null; }
  function itemScope(id) {
    const m = /^c-(qbo|xero|sage|netsuite)-/.exec(id || "");
    return m ? m[1] : null;
  }
  function icon(platform) {
    const p = PLATFORMS[platform] || { letter: "?", color: "#6B778C" };
    return '<span class="ico" style="background:' + p.color + '">' + esc(p.letter) + "</span>";
  }
  function whLabel(id) {
    const w = WAREHOUSES.find((x) => x.id === id);
    return w ? w.label : "Main (WH-01)";
  }
  function unmatchedCount() {
    return allProducts().filter((p) => !validMatch(p.id)).length;
  }

  function rawMatch(productId) {
    const m = state.matches[productId];
    if (!m) return null;
    const item = findItem(m.itemId);
    if (item) return Object.assign({}, m, { item: item, missing: false });
    return Object.assign({}, m, { item: null, missing: true, scope: itemScope(m.itemId) });
  }
  function validMatch(productId) {
    const raw = rawMatch(productId);
    if (!raw || raw.missing || !raw.item || raw.item.type !== "Inventory") return null;
    return raw;
  }

  function autoMatch(product, items) {
    const inventory = (items || allItems()).filter((i) => i.type === "Inventory");
    const sku = norm(product.sku);
    const name = norm(product.name);
    if (sku) {
      const hits = inventory.filter((i) => norm(i.sku) === sku);
      if (hits.length === 1) return { status: "matched", via: "SKU", item: hits[0] };
      if (hits.length > 1) return { status: "multiple", via: "SKU", candidates: hits };
    }
    if (name) {
      const exact = inventory.filter((i) => norm(i.name) === name);
      if (exact.length === 1) return { status: "matched", via: "name", item: exact[0] };
      if (exact.length > 1) return { status: "multiple", via: "name", candidates: exact };
      const partial = inventory.filter((i) => {
        const n = norm(i.name);
        if (n.length < 4 || name.length < 4) return false;
        return n.includes(name) || name.includes(n);
      });
      if (partial.length > 1) return { status: "multiple", via: "name", candidates: partial };
      if (partial.length === 1) return { status: "matched", via: "name", item: partial[0] };
    }
    return { status: "none" };
  }

  function writeMatch(productId, item, source) {
    const prev = state.matches[productId];
    const wh = (prev && prev.warehouseId) || state.posting.sage.warehouse || "wh-main";
    state.matches[productId] = {
      itemId: item.id,
      itemName: item.name,
      itemSku: item.sku,
      itemType: item.type,
      source: source,
      warehouseId: wh,
    };
    const p = productById(productId);
    state.lastEdit = { productId: productId, text: (p ? p.name : "Product") + " → " + item.name };
    save();
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify({
      version: state.version,
      ledger: state.ledger,
      inventoryTracking: state.inventoryTracking,
      cogs: state.cogs,
      extras: state.extras,
      matches: state.matches,
      created: state.created,
      posting: state.posting,
      customProducts: state.customProducts,
      feedbackSent: state.feedbackSent,
      createItems: state.createItems,
      lastEdit: state.lastEdit,
    }));
  }

  function toast(msg) {
    ui.toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      ui.toast = null;
      const t = document.getElementById("toast");
      if (t) t.innerHTML = "";
    }, 3600);
  }

  function rememberFocus() {
    const el = document.activeElement;
    if (!el || !el.dataset || !el.dataset.focus) { focusRestore = null; return; }
    focusRestore = { id: el.dataset.focus, start: el.selectionStart, end: el.selectionEnd };
  }
  function restoreFocus() {
    if (!focusRestore) return;
    let el = null;
    try { el = document.querySelector('[data-focus="' + CSS.escape(focusRestore.id) + '"]'); } catch (e) { el = null; }
    if (!el) return;
    el.focus();
    if (typeof focusRestore.start === "number" && el.setSelectionRange) {
      try { el.setSelectionRange(focusRestore.start, focusRestore.end); } catch (err) { /* ignore */ }
    }
  }

  function visibleProducts() {
    const q = norm(ui.search);
    return allProducts().filter((p) => {
      if (ui.filterIntegration !== "all" && p.integration !== ui.filterIntegration) return false;
      if (q && !norm(p.name + " " + p.sku + " " + p.channel).includes(q)) return false;
      const matched = !!validMatch(p.id);
      if (ui.filterMatch === "matched" && !matched) return false;
      if (ui.filterMatch === "unmatched" && matched) return false;
      return true;
    });
  }

  function selectedIds() {
    return Object.keys(ui.selected).filter((id) => ui.selected[id] && productById(id));
  }

  function editorOn() {
    if (!state.inventoryTracking) return false;
    if (state.version === "a" && ui.page === "products") return true;
    if (state.version === "b" && ui.page === "mapping" && ui.mappingTab === "products") return true;
    return false;
  }

  function go(page) {
    ui.page = page;
    const next = "#" + page;
    if (location.hash !== next) location.hash = next;
    render();
  }

  function setQuery(key, value) {
    const url = new URL(location.href);
    url.searchParams.set(key, value);
    history.replaceState(null, "", url);
  }

  function bannerHtml(place) {
    if (!state.inventoryTracking) {
      return '<div class="banner info"><span>Inventory tracking is off, so quantities are not posted with summaries.</span><button type="button" class="btn-outline" data-act="open-settings">Turn it on in Settings</button></div>';
    }
    const n = unmatchedCount();
    if (n === 0) {
      return '<div class="banner ok">Every product is matched to an inventory item in ' + esc(ledger().name) + ". Quantities will be adjusted on the next summary.</div>";
    }
    const noun = n === 1 ? "1 product is not matched" : n + " products are not matched";
    const warn = noun + ". Their quantities won't be adjusted.";
    if (place === "editor") {
      return '<div class="banner warn"><span>' + warn + '</span><button type="button" class="btn-outline" data-act="filter-unmatched">Show not matched</button></div>';
    }
    if (place === "badge") {
      return '<div class="banner warn"><span>' + warn + '</span><button type="button" class="btn-outline" data-act="go-matcher">Match on Mapping</button></div>';
    }
    const label = state.version === "a" ? "Go to Products" : "Review products";
    const line = n + " product" + (n === 1 ? "" : "s") + " not matched. Their quantities won't be adjusted.";
    return '<div class="banner warn"><span>' + line + '</span><button type="button" class="btn-outline" data-act="go-matcher">' + label + "</button></div>";
  }

  function matchCell(p, editor) {
    const raw = rawMatch(p.id);
    const valid = validMatch(p.id);
    if (!editor) {
      if (valid) return '<span class="badge ok">Matched</span><span class="match-name">' + esc(valid.item.name) + "</span>";
      if (raw && raw.missing) {
        const where = raw.scope ? LEDGERS[raw.scope].name : "another ledger";
        return '<span class="badge warn">Not matched</span><div class="cell-warn">Saved in ' + esc(where) + ": " + esc(raw.itemName) + ". Not in " + esc(ledger().name) + ".</div>";
      }
      return '<span class="badge warn">Not matched</span>';
    }
    if (!state.inventoryTracking) return '<span class="muted">Turn on inventory tracking to match items</span>';
    if (raw && raw.item && !raw.missing) {
      const warn = raw.item.type !== "Inventory"
        ? '<div class="cell-warn">This is a ' + esc(raw.item.type) + " item, so quantity on hand will not move.</div>"
        : "";
      const qoh = raw.item.qoh == null ? "" : '<div class="muted">On hand ' + raw.item.qoh + "</div>";
      const src = raw.source === "auto" ? "Auto" : "Manual";
      return '<div class="match-edit"><button type="button" class="match-btn" data-act="open-picker" data-product="' + esc(p.id) + '" data-picker-for="' + esc(p.id) + '"><span class="nm">' + esc(raw.item.name) + '</span><span class="meta">' + esc(raw.item.sku) + " · " + esc(raw.item.type) + '</span></button><span class="badge ' + (raw.source === "auto" ? "info" : "neutral") + '">' + src + '</span><button type="button" class="icon-x" data-act="clear-one" data-product="' + esc(p.id) + '" aria-label="Clear match">×</button></div>' + qoh + warn;
    }
    if (raw && raw.missing) {
      const where = raw.scope ? LEDGERS[raw.scope].name : "another ledger";
      return '<div class="unmatched-actions"><button type="button" class="select-placeholder" data-act="open-picker" data-product="' + esc(p.id) + '" data-picker-for="' + esc(p.id) + '">Select accounting item</button>' + createLink(p.id) + '</div><div class="cell-warn">Saved in ' + esc(where) + ": " + esc(raw.itemName) + ". Not in " + esc(ledger().name) + ".</div>";
    }
    return '<div class="unmatched-actions"><button type="button" class="select-placeholder" data-act="open-picker" data-product="' + esc(p.id) + '" data-picker-for="' + esc(p.id) + '">Select accounting item</button>' + createLink(p.id) + "</div>";
  }

  function createLink(productId) {
    if (!state.createItems) return "";
    return '<button type="button" class="btn-text slim" data-act="create-one" data-product="' + esc(productId) + '">Create</button>';
  }

  function warehouseCell(p) {
    const raw = rawMatch(p.id);
    const disabled = !raw || raw.missing ? " disabled" : "";
    const value = raw && raw.warehouseId ? raw.warehouseId : (state.posting.sage.warehouse || "wh-main");
    const opts = WAREHOUSES.map((w) => '<option value="' + esc(w.id) + '"' + (w.id === value ? " selected" : "") + ">" + esc(w.label) + "</option>").join("");
    return '<select data-change="warehouse" data-product="' + esc(p.id) + '"' + disabled + ">" + opts + "</select>";
  }

  function filtersHtml() {
    const ints = Object.keys(PLATFORMS).map((id) => '<option value="' + id + '"' + (ui.filterIntegration === id ? " selected" : "") + ">" + esc(PLATFORMS[id].name) + "</option>").join("");
    return '<div class="toolbar"><label class="field grow"><span>Search</span><input type="search" class="search" placeholder="Search by name or SKU" data-input="search" data-focus="search" value="' + esc(ui.search) + '" autocomplete="off"></label>'
      + '<label class="field"><span>Integration</span><select data-change="filter-integration"><option value="all">All</option>' + ints + "</select></label>"
      + '<label class="field"><span>Match</span><select data-change="filter-match"><option value="all"' + (ui.filterMatch === "all" ? " selected" : "") + '>All</option><option value="unmatched"' + (ui.filterMatch === "unmatched" ? " selected" : "") + '>Not matched</option><option value="matched"' + (ui.filterMatch === "matched" ? " selected" : "") + ">Matched</option></select></label>"
      + '<button type="button" class="btn-text" data-act="reset-filters">Reset filters</button></div>';
  }

  function bulkHtml() {
    if (!editorOn()) return "";
    const ids = selectedIds();
    if (!ids.length) return "";
    const unmatched = ids.filter((id) => !validMatch(id));
    const createBulk = state.createItems
      ? '<button type="button" class="btn-primary" data-act="create-selected"' + (unmatched.length ? "" : " disabled") + ">Create in accounting</button>"
      : "";
    return '<div class="bulk"><span class="count">' + ids.length + " selected</span>"
      + '<button type="button" class="btn-quiet" data-act="clear-selected">Clear match</button>'
      + createBulk
      + '<button type="button" class="btn-text" data-act="clear-selection">Clear selection</button></div>';
  }

  function productTable(editor) {
    const active = editor && state.inventoryTracking;
    const rows = visibleProducts();
    const sage = active && ledger().warehouse;
    const allOn = rows.length > 0 && rows.every((p) => ui.selected[p.id]);
    let head = "<tr>";
    if (active) head += '<th style="width:36px"><input class="check" type="checkbox" data-change="select-all"' + (allOn ? " checked" : "") + ' aria-label="Select all"></th>';
    head += "<th>Name</th><th>SKU</th><th>Integration</th><th class=\"num\">Cost</th><th>Accounting item " + neu() + "</th>";
    if (sage) head += "<th>Warehouse</th>";
    head += "</tr>";
    let body = "";
    if (!rows.length) {
      const cols = 5 + (active ? 1 : 0) + (sage ? 1 : 0);
      body = '<tr><td colspan="' + cols + '" class="empty">No products match these filters. <button type="button" class="btn-text" data-act="reset-filters">Reset filters</button></td></tr>';
    } else {
      rows.forEach((p) => {
        const unmatched = state.inventoryTracking && !validMatch(p.id);
        const flash = ui.highlightId === p.id ? " flash" : "";
        const cls = (unmatched ? "row-unmatched" : "") + flash;
        body += '<tr id="prow-' + esc(p.id) + '" class="' + cls + '">';
        if (active) body += '<td><input class="check" type="checkbox" data-change="select" data-product="' + esc(p.id) + '"' + (ui.selected[p.id] ? " checked" : "") + ' aria-label="Select ' + esc(p.name) + '"></td>';
        body += '<td><div class="pname">' + esc(p.name) + '</div><div class="muted">' + esc(p.category || "") + "</div></td>";
        body += '<td class="sku">' + esc(p.sku) + "</td>";
        body += '<td><div class="who">' + icon(p.integration) + "<div>" + esc(p.channel) + '<span class="muted sub">' + esc(PLATFORMS[p.integration].name) + "</span></div></div></td>";
        body += '<td class="num">' + money(p.cost) + "</td>";
        body += "<td>" + matchCell(p, active) + "</td>";
        if (sage) body += "<td>" + warehouseCell(p) + "</td>";
        body += "</tr>";
      });
    }
    const hint = active
      ? '<p class="hint">Picking an item saves the match. Find matching products asks you to review before anything is saved. The same match shows on the other version.</p>'
      : (editor
        ? '<p class="hint">Turn on inventory tracking to match products to accounting items.</p>'
        : '<p class="hint">This page shows the match only. Edit it on Mapping → Products. Both versions read the same saved match.</p>');
    return hint + bulkHtml() + '<div class="table-wrap"><table class="grid"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }

  function productsPage() {
    const editor = state.version === "a";
    const L = ledger();
    const note = state.inventoryTracking
      ? "Quantities for matched products are posted to " + L.name + " with each summary. Products that are not matched are skipped, and the summary is marked Attention required."
      : "COGS for summaries will be calculated according to the costs of the products specified in the list below. If you want to apply costs to existing summaries use the Import option.";
    const find = editor
      ? '<button type="button" class="btn-primary" data-act="find"' + (ui.finding || !state.inventoryTracking || unmatchedCount() === 0 ? " disabled" : "") + ">" + (ui.finding ? "Looking up items…" : "Find matching products") + neu() + "</button>"
      : "";
    return '<div class="page-head"><div><h1>Products and services</h1><p class="note">' + esc(note) + '</p></div><div class="page-actions">'
      + '<button type="button" class="btn-quiet" data-act="open-import">Import</button>'
      + '<button type="button" class="btn-quiet" data-act="open-history">See import history</button>'
      + '<button type="button" class="btn-quiet" data-act="open-export">Export CSV</button>'
      + '<button type="button" class="btn-quiet" data-act="open-add">Add product</button>'
      + find + "</div></div>"
      + bannerHtml(editor ? "editor" : "badge")
      + filtersHtml()
      + productTable(editor);
  }

  function postingCard() {
    const L = ledger();
    const post = state.posting[state.ledger];
    let fields = "";
    function sel(field, label, options) {
      const opts = options.slice();
      if (opts.indexOf(post[field]) === -1) opts.unshift(post[field]);
      return '<label class="field"><span>' + esc(label) + '</span><select data-change="posting" data-field="' + field + '">'
        + opts.map((o) => '<option value="' + esc(o) + '"' + (o === post[field] ? " selected" : "") + ">" + esc(o) + "</option>").join("")
        + "</select></label>";
    }
    if (state.ledger === "qbo") {
      fields = sel("adjust", "Inventory adjustment account", ACCOUNTS.qbo.adjust)
        + sel("asset", "Asset account for new items", ACCOUNTS.qbo.asset)
        + sel("income", "Income account for new items", ACCOUNTS.qbo.income)
        + sel("cogs", "COGS account for new items", ACCOUNTS.qbo.cogs);
    } else if (state.ledger === "xero") {
      fields = sel("contact", "Contact on the adjustment", ACCOUNTS.xero.contact)
        + sel("asset", "Inventory asset account", ACCOUNTS.xero.asset)
        + sel("income", "Income account for new items", ACCOUNTS.xero.income)
        + sel("cogs", "COGS account for new items", ACCOUNTS.xero.cogs);
    } else if (state.ledger === "sage") {
      fields = sel("entity", "Entity", ACCOUNTS.sage.entity)
        + '<label class="field"><span>Default warehouse</span><select data-change="posting" data-field="warehouse">'
        + WAREHOUSES.map((w) => '<option value="' + esc(w.id) + '"' + (w.id === post.warehouse ? " selected" : "") + ">" + esc(w.label) + "</option>").join("")
        + "</select></label>"
        + sel("glGroup", "Item GL group", ACCOUNTS.sage.glGroup)
        + sel("asset", "Inventory account", ACCOUNTS.sage.asset);
    } else {
      fields = sel("subsidiary", "Subsidiary", ACCOUNTS.netsuite.subsidiary)
        + sel("asset", "Asset account", ACCOUNTS.netsuite.asset)
        + sel("income", "Income account", ACCOUNTS.netsuite.income)
        + sel("cogs", "COGS account", ACCOUNTS.netsuite.cogs);
    }
    const where = state.version === "a" ? "The product match is edited on Products." : "The product match is edited on the Products tab.";
    const extra = state.ledger === "sage"
      ? " Entity and warehouse are required for the Sage adjustment. A product can override the warehouse on its match."
      : "";
    const dev = state.createItems && !L.canCreate ? " Creating items in " + L.name + " is currently in development." : "";
    const locked = state.inventoryTracking ? "" : " These accounts are used once inventory tracking is on.";
    return '<section class="card"><h2>Inventory posting ' + neu() + '</h2><p class="desc">Accounts Synder uses when it posts the inventory adjustment to ' + esc(L.name) + ". " + where + extra + dev + locked + '</p><div class="post-grid">' + fields + "</div></section>";
  }

  function mappingAccounts() {
    const L = ledger();
    const tabs = [{ id: "all", name: "All" }].concat(Object.keys(PLATFORMS).map((id) => ({ id: id, name: PLATFORMS[id].name })));
    const tabHtml = '<div class="subtabs">' + tabs.map((t) => '<button type="button" class="chip-btn' + (ui.mappingIntegration === t.id ? " on" : "") + '" data-act="map-int" data-id="' + t.id + '">' + esc(t.name) + "</button>").join("") + "</div>";
    const rows = MAPPINGS.filter((m) => {
      if (ui.mappingIntegration !== "all" && m.integration !== ui.mappingIntegration) return false;
      if (ui.showUnmappedOnly && ui.accounts[m.id]) return false;
      return true;
    });
    const dimCol = state.ledger === "sage" ? "<th>Entity</th>" : state.ledger === "netsuite" ? "<th>Subsidiary</th>" : "";
    let body = "";
    rows.forEach((m) => {
      const acct = ui.accounts[m.id] || "";
      const opts = MAP_ACCOUNTS.map((a) => '<option value="' + esc(a) + '"' + (a === acct ? " selected" : "") + ">" + (a ? esc(a) : "Select account") + "</option>").join("");
      const dim = state.ledger === "sage"
        ? "<td>" + esc(state.posting.sage.entity) + "</td>"
        : state.ledger === "netsuite" ? "<td>" + esc(state.posting.netsuite.subsidiary) + "</td>" : "";
      const open = ui.expandedMap === m.id;
      body += '<tr class="' + (acct ? "" : "row-unmatched") + '"><td><button type="button" class="btn-text slim" data-act="expand-map" data-id="' + m.id + '" aria-expanded="' + open + '">' + (open ? "▾" : "▸") + "</button> " + esc(m.group) + "</td><td>" + esc(m.type) + "</td><td>" + esc(m.category) + '</td><td><div class="who">' + icon(m.integration) + esc(m.channel) + "</div></td><td><select data-change=\"map-account\" data-id=\"" + m.id + '">' + opts + "</select></td>" + dim + "</tr>";
      if (open) {
        const dims = dimensionHint();
        body += '<tr class="expand"><td colspan="6">' + dims + "</td></tr>";
      }
    });
    if (!rows.length) body = '<tr><td colspan="6" class="empty">No mapping rows for this filter.</td></tr>';
    const toggleClass = ui.showUnmappedOnly ? "switch on" : "switch";
    return postingCard()
      + '<div class="page-head" style="margin-top:8px"><div><h2 style="margin:0;font-size:16px;font-weight:500">Summary line mappings</h2><p class="note">Group, account, and dimensions for the money journal entry. USD.</p></div>'
      + '<div class="page-actions"><button type="button" class="btn-quiet" data-act="add-currency">Add mapping for a new currency</button><button type="button" class="btn-primary" data-act="save-mappings">Save mappings</button></div></div>'
      + tabHtml
      + '<div class="card-row" style="border:1px solid var(--grey-20);border-bottom:0;border-radius:6px 6px 0 0;margin-top:8px"><span class="grow">Show only not mapped</span><button type="button" class="' + toggleClass + '" role="switch" aria-checked="' + ui.showUnmappedOnly + '" data-act="toggle-unmapped"></button></div>'
      + '<div class="table-wrap" style="border-radius:0 0 6px 6px"><table class="grid"><thead><tr><th>Group</th><th>Type</th><th>Accounting category</th><th>Integration</th><th>Account</th>' + dimCol + "</tr></thead><tbody>" + body + "</tbody></table></div>";
  }

  function dimensionHint() {
    const L = state.ledger;
    let bits = "";
    if (L === "qbo") bits = "<span>Class — optional</span><span>Location — optional</span><span>Tax code — optional</span>";
    else if (L === "xero") bits = "<span>Tax code — optional</span><span>Tracking category — optional</span>";
    else if (L === "sage") bits = "<span>Class — optional</span><span>Item (GL dimension) — optional</span><span>Location — optional</span><span>Department — optional</span>";
    else bits = "<span>Class — optional</span><span>Department — optional</span><span>Location — optional</span>";
    const note = L === "sage"
      ? " The Item dimension here is the books' GL dimension. Quantity uses the inventory item match, stored once on the product."
      : " Optional dimensions stay as they are today.";
    return '<div class="dim-row">' + bits + '</div><div class="hint">' + note + "</div>";
  }

  function mappingProducts() {
    const findDisabled = ui.finding || !state.inventoryTracking || unmatchedCount() === 0;
    return '<div class="page-head"><div><h2 style="margin:0;font-size:18px;font-weight:500">Products ' + neu() + '</h2><p class="note">Match each sales product to an inventory item in ' + esc(ledger().name) + ". This is the same match as on the Products page in Version A.</p></div>"
      + '<div class="page-actions"><button type="button" class="btn-primary" data-act="find"' + (findDisabled ? " disabled" : "") + ">" + (ui.finding ? "Looking up items…" : "Find matching products") + "</button></div></div>"
      + bannerHtml("editor")
      + filtersHtml()
      + productTable(true);
  }

  function mappingPage() {
    const showProducts = state.version === "b";
    const tab = showProducts && ui.mappingTab === "products" ? "products" : "accounts";
    const n = unmatchedCount();
    const count = n ? ' <span class="badge warn">' + n + "</span>" : ' <span class="badge ok">0</span>';
    const tabs = '<div class="tabs"><button type="button" class="tab' + (tab === "accounts" ? " on" : "") + '" data-act="map-tab" data-tab="accounts">Accounts</button>'
      + (showProducts ? '<button type="button" class="tab' + (tab === "products" ? " on" : "") + '" data-act="map-tab" data-tab="products">Products' + count + neu() + "</button>" : "")
      + "</div>";
    const intro = state.version === "a"
      ? "Posting accounts for the inventory adjustment, plus the usual summary mappings. Product matching lives on Products."
      : "Posting accounts, summary mappings, and the product match. The Products tab edits the same match the Products page displays.";
    return '<div class="page-head"><div><h1>Mapping</h1><p class="note">' + esc(intro) + "</p></div></div>"
      + (tab === "accounts" ? bannerHtml("accounts") : "")
      + tabs
      + (tab === "products" ? mappingProducts() : mappingAccounts());
  }

  function syncPage() {
    const L = ledger();
    return '<div class="page-head"><div><h1>Summaries</h1><p class="note">Example sync results for KINIPOP LLC. Each Daily Summary posts a money ' + esc(L.je.toLowerCase()) + " and, when inventory tracking is on, an " + esc(L.inv.toLowerCase()) + " for matched products.</p></div></div>"
      + syncCard("ok")
      + syncCard("fail");
  }

  function syncCard(kind) {
    const L = ledger();
    const open = ui.syncOpen[kind];
    const ok = kind === "ok";
    const title = ok ? "Nov 18–24, 2026" : "Nov 11–17, 2026";
    const amount = ok ? "$12,930.00" : "$9,240.00";
    const status = ok
      ? '<span class="badge ok">Synced</span>'
      : '<span class="badge attn">Attention required</span>';
    const jeId = state.ledger === "xero" ? (ok ? "MJ-1842" : "MJ-1790") : (ok ? "JE-1842" : "JE-1790");
    const invId = ok ? "IA-309" : "";
    let body = "";
    if (open && ok) {
      body = '<div class="sync-body"><table class="grid"><thead><tr><th>Document</th><th>Status</th><th class="num">Amount</th></tr></thead><tbody>'
        + "<tr><td>" + esc(L.je) + " " + jeId + '</td><td class="doc-ok">Synced</td><td class="num">' + amount + "</td></tr>"
        + "<tr><td>" + esc(L.inv) + " " + invId + '</td><td class="doc-ok">Synced</td><td class="num">3 items, −42 qty</td></tr>'
        + "</tbody></table>"
        + '<p class="hint" style="margin-top:10px">Journal entry lines: Sales $14,200.00, Refunds −$860.00, Fees −$410.00, Shopify clearing −$12,930.00.</p>'
        + "<table class=\"grid\"><thead><tr><th>Item</th><th>SKU</th><th class=\"num\">Qty change</th></tr></thead><tbody>"
        + '<tr><td>Kinipop Hoodie — Navy / M</td><td class="sku">KIN-HOOD-NV-M</td><td class="num">−12</td></tr>'
        + '<tr><td>Kinipop Beanie</td><td class="sku">KIN-BEAN</td><td class="num">−8</td></tr>'
        + '<tr><td>TrueSafety First Aid Kit</td><td class="sku">TS-FAK-01</td><td class="num">−22</td></tr>'
        + "</tbody></table>"
        + '<p class="hint">Posted only for products that had a saved inventory match. Opening quantity is not changed by this adjustment.</p></div>';
    } else if (open) {
      body = '<div class="sync-body"><table class="grid"><thead><tr><th>Document</th><th>Status</th><th class="num">Amount</th></tr></thead><tbody>'
        + "<tr><td>" + esc(L.je) + " " + jeId + '</td><td class="doc-ok">Synced</td><td class="num">' + amount + "</td></tr>"
        + "<tr><td>" + esc(L.inv) + '</td><td class="doc-bad">Attention required</td><td class="num">Not posted</td></tr>'
        + "</tbody></table>"
        + '<div class="reason"><strong>Attention required.</strong> The ' + esc(L.je.toLowerCase()) + " synced. The " + esc(L.inv.toLowerCase()) + " failed because 3 products were not matched to an accounting item: TrueSafety Helmet, Invisible Heat Mug, and Workshop Tee. Their quantities were not adjusted.</div>"
        + '<p class="hint">On the next sync, products that are still not matched are skipped the same way. ' + unmatchedCount() + ' product' + (unmatchedCount() === 1 ? " is" : "s are") + ' not matched in ' + esc(L.name) + ' right now.</p>'
        + '<button type="button" class="btn-outline" data-act="go-matcher">Review unmatched products</button></div>';
    }
    return '<article class="sync-card"><button type="button" class="sync-head" data-act="toggle-sync" data-id="' + kind + '"><div class="grow"><div class="when">' + title + '</div><div class="muted">KINIPOP LLC · Shopify · ' + amount + ' net</div></div>' + status + '<span class="muted">' + (open ? "Hide" : "Show") + '</span></button>' + body + "</article>";
  }

  function shellHtml() {
    const page = ui.page === "settings" ? ui.returnPage : ui.page;
    let main = "";
    if (page === "products") main = productsPage();
    else if (page === "mapping") main = mappingPage();
    else main = syncPage();
    const side = [
      ["sync", "Summaries"],
      ["products", "Products and services"],
      ["mapping", "Mapping"],
    ].map(([id, label]) => '<button type="button" class="side-link' + (ui.page === id ? " on" : "") + '" data-act="nav" data-page="' + id + '">' + label + "</button>").join("");
    return '<header class="navbar"><div class="org">Kinipop LLC <span class="chev">▾</span></div><div class="nav-tools">'
      + '<button type="button" class="icon-btn" aria-label="Help" data-act="help">?</button>'
      + '<button type="button" class="icon-btn' + (ui.page === "settings" ? " on" : "") + '" aria-label="Settings" data-act="open-settings">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.7.9 1.2 1.6 1.3H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
      + '</button><span class="avatar" aria-hidden="true">KI</span></div></header>'
      + '<div class="shell"><nav class="sidebar"><div class="side-label">DAILY SUMMARY</div>' + side + '</nav><main class="main">' + main + "</main></div>";
  }

  function chromeHtml() {
    const versions = [["a", "A · Products page"], ["b", "B · Mapping page"]];
    const vHtml = versions.map(([id, label]) => '<button type="button" data-act="set-version" data-v="' + id + '"' + (state.version === id ? ' class="on"' : "") + ">" + label + "</button>").join("");
    const lHtml = Object.keys(LEDGERS).map((id) => '<button type="button" data-act="set-ledger" data-ledger="' + id + '"' + (state.ledger === id ? ' class="on"' : "") + ">" + esc(LEDGERS[id].short) + "</button>").join("");
    const cHtml = ["true", "false"].map((v) => '<button type="button" data-act="set-create" data-on="' + v + '"' + (state.createItems === (v === "true") ? ' class="on"' : "") + ">" + v + "</button>").join("");
    const other = state.version === "a" ? "Version B" : "Version A";
    const blurb = state.version === "a"
      ? "Version A edits the match on Products. Mapping keeps posting accounts and a banner."
      : "Version B edits the match on Mapping → Products. The Products page shows a badge.";
    const saved = state.lastEdit ? "Saved match: " + state.lastEdit.text + "." : "No match saved yet.";
    return '<div class="proto-row"><a href="../../">All prototypes</a><span class="sep"></span><span class="title">DIS-507 Inventory tracking</span>'
      + '<span class="sep"></span><span class="seg" role="group" aria-label="Version">' + vHtml + "</span>"
      + '<span class="seg" role="group" aria-label="Ledger">' + lHtml + "</span>"
      + '<span class="lbl">Create items:</span><span class="seg" role="group" aria-label="Create items">' + cHtml + "</span>"
      + '<span style="flex:1"></span><button type="button" class="textish" data-act="reset">Reset demo</button></div>'
      + '<div class="strip"><span class="grow">' + blurb + " " + esc(saved) + " Books: " + esc(ledger().name) + '.</span>'
      + '<button type="button" class="linkish" data-act="see-other">See it on ' + other + "</button></div>";
  }

  function pickerHtml() {
    if (!ui.picker) return "";
    const p = productById(ui.picker.productId);
    if (!p) return "";
    const q = norm(ui.picker.query);
    const items = allItems().filter((i) => !q || norm(i.name + " " + i.sku + " " + i.type).includes(q))
      .slice().sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        if (a.type === "Inventory") return -1;
        if (b.type === "Inventory") return 1;
        return a.name.localeCompare(b.name);
      });
    const inv = items.filter((i) => i.type === "Inventory");
    const other = items.filter((i) => i.type !== "Inventory");
    function btn(item) {
      const pill = item.type === "Inventory" ? "t-inv" : "";
      return '<button type="button" class="picker-item" data-act="pick-item" data-product="' + esc(p.id) + '" data-item="' + esc(item.id) + '"><span class="nm">' + esc(item.name) + '</span><span class="meta"><span>' + esc(item.sku) + '</span><span class="type-pill ' + pill + '">' + esc(item.type) + "</span></span></button>";
    }
    let list = "";
    if (!items.length) list = '<div class="picker-empty">No items match.</div>';
    else {
      if (inv.length) list += '<div class="picker-label">Inventory</div>' + inv.map(btn).join("");
      if (other.length) list += '<div class="picker-label">Other</div>' + other.map(btn).join("");
    }
    const raw = rawMatch(p.id);
    const clearBtn = raw && !raw.missing ? '<button type="button" class="btn-text" data-act="clear-one" data-product="' + esc(p.id) + '">Clear match</button>' : "<span></span>";
    const createBtn = state.createItems && !validMatch(p.id) ? '<button type="button" class="btn-text" data-act="create-one" data-product="' + esc(p.id) + '">Create in accounting</button>' : "";
    return '<div class="picker" role="listbox"><input data-focus="picker" data-input="picker" placeholder="Search name or SKU" value="' + esc(ui.picker.query || "") + '" autocomplete="off"><div class="picker-list">' + list + '</div><div class="picker-foot">' + clearBtn + createBtn + "</div></div>";
  }

  function selectOptions(current, options) {
    const opts = options.slice();
    if (current && opts.indexOf(current) === -1) opts.unshift(current);
    return opts.map((o) => '<option value="' + esc(o) + '"' + (o === current ? " selected" : "") + ">" + esc(o) + "</option>").join("");
  }

  function settingsModal() {
    if (ui.page !== "settings") return "";
    const section = ui.settingsSection;
    const nav = [
      ["general", "General"],
      ["mapping", "Mapping"],
      ["products", "Products and services"],
    ].map(([id, label]) => '<button type="button"' + (section === id ? ' class="on"' : "") + ' data-act="settings-nav" data-section="' + id + '">' + label + "</button>").join("");
    let content = "";
    if (section === "general") {
      content = '<h2>General</h2><p class="lead">Company name, time zone, and fiscal year. Unchanged in this prototype.</p><div class="placeholder-pane">Kinipop LLC · America/New_York · Fiscal year starts in January.</div>';
    } else if (section === "mapping") {
      content = '<h2>Mapping</h2><p class="lead">Group by SKU, group by product category, and group by region stay as they are today. Inventory posting accounts are on the Mapping page.</p><div class="placeholder-pane">Group by SKU is on. Group by product category is off. Multicurrency is off. Home currency USD.</div>';
    } else content = settingsProducts();
    return '<div class="scrim dock" style="z-index:60" data-act="scrim" data-which="settings"><div class="dialog settings" role="dialog" aria-modal="true" aria-label="Settings">'
      + '<div class="dlg-head"><button type="button" class="close-x" data-act="close-settings" aria-label="Close">×</button><h2>Settings (Kinipop LLC)</h2></div>'
      + '<div class="settings-body"><nav class="settings-nav">' + nav + '<button type="button" class="org-link" data-act="org-settings">Go to Organization settings</button></nav><div class="settings-content">' + content + "</div></div></div></div>";
  }

  function settingsProducts() {
    const on = state.inventoryTracking;
    const cogsRows = COGS_ROWS.map((row) => {
      const shown = on ? false : !!state.cogs[row.id];
      return '<div class="card-row">' + icon(row.platform) + '<div class="grow"><div>' + esc(row.name) + '</div><div class="muted">' + esc(PLATFORMS[row.platform].name) + '</div></div>'
        + '<button type="button" class="switch' + (shown ? " on" : "") + '" role="switch" aria-checked="' + shown + '" data-act="toggle-cogs" data-id="' + row.id + '"' + (on ? ' disabled title="Off while inventory tracking is on"' : "") + "></button></div>";
    }).join("");
    const hint = on
      ? '<div class="lock-hint">These toggles are off while inventory tracking is on. Cost posts through the inventory item in ' + esc(ledger().name) + ", so summary COGS lines stay off.</div>"
      : "";
    const block = !!state.extras.blockUnverified;
    const auto = !!state.extras.autoVerify;
    return '<h2>Products and services</h2><div class="lead">Use this feature to track the costs of the goods you\'re selling and map those costs to the relevant accounts in your books. <button type="button" class="btn-text" data-act="learn-more">Learn more</button></div>'
      + '<section class="card"><h2>Inventory tracking ' + neu() + '</h2><p class="desc">Post a companion inventory adjustment with each Daily Summary, so quantity on hand moves in ' + esc(ledger().name) + ". Each product is matched to an inventory item. While this is on, summary COGS lines stay off.</p>"
      + '<div class="card-row"><div class="grow">Inventory tracking' + (on ? '<div class="muted">On — quantities post to ' + esc(ledger().name) + ".</div>" : '<div class="muted">Off — summaries post the money journal entry only.</div>') + '</div>'
      + '<button type="button" class="switch' + (on ? " on" : "") + '" role="switch" aria-checked="' + on + '" data-act="toggle-tracking"></button></div></section>'
      + '<section class="card' + (on ? " locked" : "") + '"><h2>COGS</h2>' + hint + cogsRows + "</section>"
      + '<section class="card"><h2>Unverified products</h2><p class="desc">When enabled, summaries with unverified products will be flagged as \'Attention required\' and won\'t sync until those products are verified on the Products and services tab. <button type="button" class="btn-text" data-act="how-it-works">See how it works</button></p>'
      + '<div class="card-row"><div class="grow">Block sync for summaries with unverified products</div><button type="button" class="switch' + (block ? " on" : "") + '" role="switch" aria-checked="' + block + '" data-act="toggle-extra" data-key="blockUnverified"></button></div></section>'
      + '<section class="card"><h2>Auto-verify products with positive cost</h2><p class="desc">When enabled, newly imported products with a cost above 0 are automatically marked as \'Verified\'. When disabled, all imported products are assigned \'Unverified\', regardless of cost.</p>'
      + '<div class="card-row"><div class="grow">Auto-verify products with positive cost</div><button type="button" class="switch' + (auto ? " on" : "") + '" role="switch" aria-checked="' + auto + '" data-act="toggle-extra" data-key="autoVerify"></button></div></section>';
  }

  function reviewModal() {
    if (!ui.review) return "";
    const rows = ui.review.rows;
    const groups = {
      matched: rows.filter((r) => r.status === "matched"),
      multiple: rows.filter((r) => r.status === "multiple"),
      none: rows.filter((r) => r.status === "none"),
    };
    function stat(n, label, cls) {
      return '<span class="badge ' + cls + '">' + n + " " + label + "</span>";
    }
    let body = '<div class="rev-stats">' + stat(groups.matched.length, "matched", "ok") + stat(groups.multiple.length, "multiple candidates", "warn") + stat(groups.none.length, "no match", "neutral") + "</div>";
    body += "<p class=\"note\">Synder looked up inventory items in " + esc(ledger().name) + " by SKU, then by name. Nothing is saved until you confirm. Products that already have a match are left as they are.</p>";
    if (!rows.length) {
      body += '<p>Every product already has an inventory match in ' + esc(ledger().name) + ".</p>";
    }
    if (groups.matched.length) {
      body += '<div class="rev-sec"><h3>Matched</h3>';
      groups.matched.forEach((r) => {
        const p = productById(r.productId);
        body += '<label class="rev-row"><input class="check" type="checkbox" data-change="review-check" data-product="' + esc(r.productId) + '"' + (r.checked ? " checked" : "") + '><div><div class="pname">' + esc(p.name) + '</div><div class="muted">' + esc(p.sku) + '</div></div><div class="arrow">→</div><div><div class="pname">' + esc(r.item.name) + '</div><div class="muted">' + esc(r.item.sku) + " · Inventory · matched on " + esc(r.via) + "</div></div></label>";
      });
      body += "</div>";
    }
    if (groups.multiple.length) {
      body += '<div class="rev-sec"><h3>Multiple candidates</h3><p class="hint">Pick one item, or leave them unmatched.</p>';
      groups.multiple.forEach((r) => {
        const p = productById(r.productId);
        const cands = r.candidates.map((c) => '<label><input type="radio" name="cand-' + esc(r.productId) + '" data-change="review-choose" data-product="' + esc(r.productId) + '" value="' + esc(c.id) + '"' + (r.chosenId === c.id ? " checked" : "") + "> <span><span class=\"pname\">" + esc(c.name) + "</span> <span class=\"muted\">" + esc(c.sku) + " · " + esc(c.type) + "</span></span></label>").join("");
        const skip = '<label><input type="radio" name="cand-' + esc(r.productId) + '" data-change="review-choose" data-product="' + esc(r.productId) + '" value=""' + (!r.chosenId ? " checked" : "") + "> <span>Don't match</span></label>";
        body += '<div class="rev-row multi"><div><div class="pname">' + esc(p.name) + '</div><div class="muted">' + esc(p.sku) + '</div></div><div class="rev-cands">' + cands + skip + "</div><span></span></div>";
      });
      body += "</div>";
    }
    if (groups.none.length) {
      body += '<div class="rev-sec"><h3>No match</h3>';
      groups.none.forEach((r) => {
        const p = productById(r.productId);
        const createBtn = state.createItems ? '<button type="button" class="btn-outline" data-act="create-one" data-product="' + esc(p.id) + '">Create in accounting</button>' : "";
        body += '<div class="rev-row none"><div><div class="pname">' + esc(p.name) + '</div><div class="muted">' + esc(p.sku) + '</div></div><div class="muted">No accounting item with this name or SKU.</div>' + createBtn + "</div>";
      });
      body += "</div>";
    }
    const n = reviewSaveCount();
    const saveLabel = n === 0 ? "Save matches" : "Save " + n + " match" + (n === 1 ? "" : "es");
    return '<div class="scrim" style="z-index:70" data-act="scrim" data-which="review"><div class="dialog wide" role="dialog" aria-modal="true" aria-label="Review matches">'
      + '<div class="dlg-head"><h2>Review matches</h2><button type="button" class="close-x" data-act="close-review" aria-label="Close">×</button></div>'
      + '<div class="dlg-body">' + body + '</div><div class="dlg-foot"><button type="button" class="btn-quiet" data-act="close-review">Cancel</button>'
      + '<button type="button" class="btn-primary" data-act="save-review"' + (n === 0 ? " disabled" : "") + ">" + saveLabel + "</button></div></div></div>";
  }

  function reviewSaveCount() {
    if (!ui.review) return 0;
    return ui.review.rows.reduce((n, row) => {
      if (row.status === "matched" && row.checked) return n + 1;
      if (row.status === "multiple" && row.chosenId) return n + 1;
      return n;
    }, 0);
  }

  function createModal() {
    if (!ui.create) return "";
    const L = ledger();
    if (ui.create.step === "dev" || ui.create.step === "feedback" || ui.create.step === "thanks") return devModal(L);
    const ids = ui.create.productIds;
    let lines = "";
    ids.forEach((id) => {
      const f = ui.create.fields[id];
      lines += "<tr><td><input type=\"text\" data-input=\"create-name\" data-product=\"" + esc(id) + "\" data-focus=\"cname-" + esc(id) + "\" value=\"" + esc(f.name) + "\"></td>"
        + "<td><input type=\"text\" data-input=\"create-sku\" data-product=\"" + esc(id) + "\" data-focus=\"csku-" + esc(id) + "\" value=\"" + esc(f.sku) + "\"></td></tr>";
    });
    const limits = L.skuLimit
      ? '<p class="hint">' + esc(L.name) + " item name up to " + L.nameLimit + " characters. " + esc(L.skuLabel) + " up to " + L.skuLimit + " characters." + (L.forbidColon ? " Names can't include a colon." : "") + "</p>"
      : "";
    const undo = state.ledger === "qbo" ? "<p class=\"hint\">Tracking quantity can't be turned off later in QuickBooks Online.</p>" : "";
    const accounts = '<div class="form-grid" style="margin-top:12px">'
      + '<label class="field"><span>Item type</span><input type="text" value="Inventory" disabled></label><span></span>'
      + '<label class="field"><span>Asset account</span><select data-change="create-account" data-field="asset">' + selectOptions(ui.create.accounts.asset, ACCOUNTS[state.ledger].asset) + "</select></label>"
      + '<label class="field"><span>Income account</span><select data-change="create-account" data-field="income">' + selectOptions(ui.create.accounts.income, ACCOUNTS[state.ledger].income) + "</select></label>"
      + '<label class="field span2"><span>COGS account</span><select data-change="create-account" data-field="cogs">' + selectOptions(ui.create.accounts.cogs, ACCOUNTS[state.ledger].cogs) + "</select></label>"
      + "</div>";
    const err = ui.create.error ? '<div class="field-error">' + esc(ui.create.error) + "</div>" : "";
    const label = ids.length === 1 ? "Create in " + L.name : "Create " + ids.length + " items in " + L.name;
    return '<div class="scrim" style="z-index:80" data-act="scrim" data-which="create"><div class="dialog wide" role="dialog" aria-modal="true" aria-label="Create in accounting">'
      + '<div class="dlg-head"><h2>Create in ' + esc(L.name) + '</h2><button type="button" class="close-x" data-act="close-create" aria-label="Close">×</button></div>'
      + '<div class="dlg-body"><p class="note">Synder will create the item and match this product to it. Opening quantity is 0. Set opening quantities in ' + esc(L.name) + " before the first inventory sync, or on-hand can go negative.</p>"
      + '<table class="create-lines"><thead><tr><th>Name</th><th>' + esc(L.skuLabel || "SKU") + "</th></tr></thead><tbody>" + lines + "</tbody></table>"
      + limits + accounts + undo + err + '</div><div class="dlg-foot"><button type="button" class="btn-quiet" data-act="close-create">Cancel</button><button type="button" class="btn-primary" data-act="create-submit">' + esc(label) + "</button></div></div></div>";
  }

  function devModal(L) {
    const sent = state.feedbackSent[state.ledger];
    let inner = "";
    if (ui.create.step === "thanks") {
      inner = '<div class="thanks"><h2 style="margin:0 0 8px;font-size:18px;font-weight:500">Thanks. We recorded that you need this.</h2><p class="note">We\'ll use it when we plan creating items in ' + esc(L.name) + '.</p></div>'
        + '<div class="dlg-foot"><button type="button" class="btn-primary" data-act="close-create">Close</button></div>';
    } else if (ui.create.step === "feedback") {
      const f = ui.create.feedback;
      inner = '<div class="dlg-body"><p class="note">Optional. How soon do you need creating items in ' + esc(L.name) + '?</p>'
        + '<label class="field"><span>Urgency</span><select data-change="feedback-urgency"><option value=""' + (f.urgency === "" ? " selected" : "") + '>How soon do you need it? (optional)</option><option value="nice"' + (f.urgency === "nice" ? " selected" : "") + '>Nice to have</option><option value="month"' + (f.urgency === "month" ? " selected" : "") + '>Needed this month</option><option value="blocking"' + (f.urgency === "blocking" ? " selected" : "") + ">Blocking a close</option></select></label>"
        + '<label class="field" style="margin-top:12px"><span>Comment</span><textarea data-input="feedback" data-focus="feedback" placeholder="What would you use it for?">' + esc(f.comment) + "</textarea></label></div>"
        + '<div class="dlg-foot"><button type="button" class="btn-quiet" data-act="feedback-back">Back</button><button type="button" class="btn-primary" data-act="feedback-send">Send</button></div>';
    } else {
      const already = sent ? '<p class="hint">You already told us you need this. You can send another note.</p>' : "";
      inner = '<div class="dlg-body"><div class="dev-box"><div class="dev-kicker">Currently in development</div><p>Creating inventory items in ' + esc(L.name) + " from Synder is not available yet. You can match products to items that already exist in " + esc(L.name) + ".</p>" + already + "</div></div>"
        + '<div class="dlg-foot"><button type="button" class="btn-quiet" data-act="close-create">Close</button><button type="button" class="btn-primary" data-act="need-this">I need this</button></div>';
    }
    return '<div class="scrim" style="z-index:80" data-act="scrim" data-which="create"><div class="dialog" role="dialog" aria-modal="true" aria-label="Create in accounting"><div class="dlg-head"><h2>Create in ' + esc(L.name) + '</h2><button type="button" class="close-x" data-act="close-create" aria-label="Close">×</button></div>' + inner + "</div></div>";
  }

  function confirmModal() {
    if (!ui.confirm) return "";
    let title = "";
    let body = "";
    let yes = "Confirm";
    if (ui.confirm === "on") {
      title = "Turn on inventory tracking?";
      body = "Synder will post an inventory adjustment with each Daily Summary. The COGS toggles for each integration will turn off, because cost then comes from the inventory item in " + ledger().name + ".";
      yes = "Turn on";
    } else if (ui.confirm === "off") {
      title = "Turn off inventory tracking?";
      body = "Quantity adjustments will stop. The COGS toggles can be turned on again for each integration.";
      yes = "Turn off";
    } else {
      title = "Reset the prototype?";
      body = "Matches, the inventory tracking switch, created items, and feedback on this browser go back to the sample data.";
      yes = "Reset";
    }
    return '<div class="scrim" style="z-index:90" data-act="scrim" data-which="confirm"><div class="dialog" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="dlg-head"><h2>' + esc(title) + '</h2><button type="button" class="close-x" data-act="confirm-no" aria-label="Close">×</button></div><div class="dlg-body"><p>' + esc(body) + '</p></div><div class="dlg-foot"><button type="button" class="btn-quiet" data-act="confirm-no">Cancel</button><button type="button" class="btn-primary" data-act="confirm-yes">' + esc(yes) + "</button></div></div></div>";
  }

  function infoModal() {
    if (!ui.info) return "";
    return '<div class="scrim" style="z-index:85" data-act="scrim" data-which="info"><div class="dialog" role="dialog" aria-modal="true" aria-label="' + esc(ui.info.title) + '"><div class="dlg-head"><h2>' + esc(ui.info.title) + '</h2><button type="button" class="close-x" data-act="close-info" aria-label="Close">×</button></div><div class="dlg-body">' + ui.info.html + '</div><div class="dlg-foot"><button type="button" class="btn-primary" data-act="close-info">Close</button></div></div></div>';
  }

  function addModal() {
    if (!ui.add) return "";
    const a = ui.add;
    const ints = Object.keys(PLATFORMS).map((id) => '<option value="' + id + '"' + (a.integration === id ? " selected" : "") + ">" + esc(PLATFORMS[id].name) + "</option>").join("");
    const err = a.error ? '<div class="field-error">' + esc(a.error) + "</div>" : "";
    return '<div class="scrim" style="z-index:85" data-act="scrim" data-which="add"><div class="dialog" role="dialog" aria-modal="true" aria-label="Add product"><div class="dlg-head"><h2>Add product</h2><button type="button" class="close-x" data-act="close-add" aria-label="Close">×</button></div>'
      + '<div class="dlg-body"><div class="form-grid"><label class="field span2"><span>Name</span><input type="text" data-input="add-name" data-focus="add-name" value="' + esc(a.name) + '"></label>'
      + '<label class="field"><span>SKU</span><input type="text" data-input="add-sku" data-focus="add-sku" value="' + esc(a.sku) + '"></label>'
      + '<label class="field"><span>Cost</span><input type="number" min="0" step="0.01" data-input="add-cost" data-focus="add-cost" value="' + esc(a.cost) + '"></label>'
      + '<label class="field span2"><span>Integration</span><select data-change="add-integration">' + ints + "</select></label></div>"
      + '<p class="hint">The product is saved unmatched. Match it to an accounting item in the table, or with Find matching products.</p>' + err + '</div>'
      + '<div class="dlg-foot"><button type="button" class="btn-quiet" data-act="close-add">Cancel</button><button type="button" class="btn-primary" data-act="save-add">Add product</button></div></div></div>';
  }

  function modalsHtml() {
    return settingsModal() + reviewModal() + createModal() + infoModal() + addModal() + confirmModal();
  }

  function positionPicker() {
    if (!ui.picker) return;
    const pop = document.querySelector(".picker");
    const btn = document.querySelector('[data-picker-for="' + ui.picker.productId + '"]');
    if (!pop || !btn) return;
    const r = btn.getBoundingClientRect();
    const width = 320;
    let left = Math.min(r.left, window.innerWidth - width - 8);
    left = Math.max(8, left);
    let top = r.bottom + 4;
    const h = pop.offsetHeight || 280;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 4);
    pop.style.top = top + "px";
    pop.style.left = left + "px";
  }

  function render() {
    try {
      document.getElementById("chrome").innerHTML = chromeHtml();
      document.getElementById("app").innerHTML = shellHtml();
      document.getElementById("pop").innerHTML = pickerHtml();
      document.getElementById("modals").innerHTML = modalsHtml();
      const t = document.getElementById("toast");
      if (t) t.innerHTML = ui.toast ? '<div class="toast">' + esc(ui.toast) + "</div>" : "";
      restoreFocus();
      positionPicker();
      const chrome = document.getElementById("chrome");
      if (chrome) document.documentElement.style.setProperty("--chrome", chrome.offsetHeight + "px");
      if (ui.highlightId && !focusRestore) {
        const row = document.getElementById("prow-" + ui.highlightId);
        if (row) {
          row.classList.add("flash");
          ui.highlightId = null;
        }
      }
      if (ui.picker && !(focusRestore && focusRestore.id === "picker")) {
        const inp = document.querySelector('[data-focus="picker"]');
        if (inp) inp.focus();
      }
      document.title = "DIS-507 · " + (ui.page === "settings" ? "Settings" : ui.page === "mapping" ? "Mapping" : ui.page === "sync" ? "Summaries" : "Products and services");
    } catch (err) {
      console.error(err);
      document.getElementById("app").innerHTML = '<pre class="err">' + esc(err.stack || err.message) + "</pre>";
    }
  }

  function goMatcher() {
    ui.filterMatch = "unmatched";
    ui.search = "";
    ui.picker = null;
    if (state.version === "a") go("products");
    else {
      ui.mappingTab = "products";
      go("mapping");
    }
  }

  function openCreate(ids) {
    if (!state.createItems) return;
    const list = ids.filter((id) => productById(id) && !validMatch(id));
    if (!state.inventoryTracking) {
      toast("Turn on inventory tracking in Settings first.");
      return;
    }
    if (!list.length) {
      toast("Those products already have an inventory match.");
      return;
    }
    ui.picker = null;
    const L = ledger();
    if (!L.canCreate) {
      ui.create = { productIds: list, step: "dev", feedback: { urgency: "", comment: "" }, error: "" };
      return;
    }
    const fields = {};
    list.forEach((id) => {
      const p = productById(id);
      fields[id] = { name: p.name, sku: p.sku };
    });
    const post = state.posting[state.ledger];
    ui.create = {
      productIds: list,
      step: "form",
      fields: fields,
      accounts: { asset: post.asset, income: post.income, cogs: post.cogs },
      error: "",
      feedback: { urgency: "", comment: "" },
    };
  }

  function submitCreate() {
    const L = ledger();
    const ids = ui.create.productIds;
    const errors = [];
    const skus = [];
    ids.forEach((id) => {
      const f = ui.create.fields[id];
      const name = f.name.trim();
      const sku = f.sku.trim();
      if (!name || !sku) errors.push("Name and SKU are required.");
      if (L.nameLimit && name.length > L.nameLimit) errors.push(L.name + " names can be at most " + L.nameLimit + " characters.");
      if (L.skuLimit && sku.length > L.skuLimit) errors.push(L.skuLabel + " can be at most " + L.skuLimit + " characters.");
      if (L.forbidColon && name.indexOf(":") !== -1) errors.push(L.name + " item names can't include a colon.");
      const dup = allItems().some((i) => norm(i.sku) === norm(sku) || norm(i.name) === norm(name));
      if (dup) errors.push('An item named "' + name + '" or with SKU ' + sku + " already exists in " + L.name + ". Match the product to it instead.");
      skus.push(norm(sku));
    });
    if (new Set(skus).size !== skus.length) errors.push("Each new item needs its own SKU.");
    if (errors.length) {
      ui.create.error = errors[0];
      return;
    }
    ids.forEach((id) => {
      const f = ui.create.fields[id];
      const item = { id: "c-" + state.ledger + "-" + id, name: f.name.trim(), sku: f.sku.trim(), type: "Inventory", qoh: 0 };
      const bucket = state.created[state.ledger];
      const idx = bucket.findIndex((i) => i.id === item.id);
      if (idx >= 0) bucket[idx] = item;
      else bucket.push(item);
      writeMatch(id, item, "manual");
      if (ui.review) ui.review.rows = ui.review.rows.filter((r) => r.productId !== id);
    });
    const names = ids.map((id) => productById(id).name).join(", ");
    ui.create = null;
    ui.highlightId = ids[0];
    toast("Created " + names + " in " + L.name + " and matched " + (ids.length === 1 ? "it" : "them") + ". Both versions show the match.");
  }

  function startFind() {
    if (ui.finding || !state.inventoryTracking) return;
    if (unmatchedCount() === 0) {
      toast("Every product already has an inventory match.");
      return;
    }
    ui.findToken += 1;
    const token = ui.findToken;
    ui.finding = true;
    ui.picker = null;
    render();
    setTimeout(() => {
      if (token !== ui.findToken) return;
      ui.finding = false;
      const rows = [];
      allProducts().forEach((p) => {
        if (validMatch(p.id)) return;
        const result = autoMatch(p, allItems());
        rows.push(Object.assign({ productId: p.id, checked: result.status === "matched", chosenId: "" }, result));
      });
      ui.review = { rows: rows };
      render();
    }, 650);
  }

  function saveReview() {
    let n = 0;
    ui.review.rows.forEach((row) => {
      if (row.status === "matched" && row.checked) {
        writeMatch(row.productId, row.item, "auto");
        n += 1;
      } else if (row.status === "multiple" && row.chosenId) {
        const item = row.candidates.find((c) => c.id === row.chosenId);
        if (item) {
          writeMatch(row.productId, item, "auto");
          n += 1;
        }
      }
    });
    ui.review = null;
    toast(n ? "Saved " + n + " match" + (n === 1 ? "" : "es") + ". Both versions show them." : "No matches saved.");
  }

  function seeOther() {
    const other = state.version === "a" ? "b" : "a";
    state.version = other;
    setQuery("v", other);
    ui.highlightId = state.lastEdit && state.lastEdit.productId;
    ui.search = "";
    ui.filterMatch = "all";
    ui.picker = null;
    save();
    if (other === "b") {
      ui.mappingTab = "products";
      go("mapping");
    } else go("products");
  }

  function applyInput(el) {
    const key = el.dataset.input;
    if (key === "search") ui.search = el.value;
    else if (key === "picker" && ui.picker) ui.picker.query = el.value;
    else if (key === "create-name" && ui.create) ui.create.fields[el.dataset.product].name = el.value;
    else if (key === "create-sku" && ui.create) ui.create.fields[el.dataset.product].sku = el.value;
    else if (key === "add-name" && ui.add) ui.add.name = el.value;
    else if (key === "add-sku" && ui.add) ui.add.sku = el.value;
    else if (key === "add-cost" && ui.add) ui.add.cost = el.value;
    else if (key === "feedback" && ui.create) ui.create.feedback.comment = el.value;
    if (ui.create) ui.create.error = "";
    if (ui.add) ui.add.error = "";
  }

  function applyChange(el) {
    const key = el.dataset.change;
    if (key === "filter-integration") ui.filterIntegration = el.value;
    else if (key === "filter-match") ui.filterMatch = el.value;
    else if (key === "warehouse") {
      const m = state.matches[el.dataset.product];
      if (m) { m.warehouseId = el.value; save(); }
    } else if (key === "posting") {
      state.posting[state.ledger][el.dataset.field] = el.value;
      save();
      toast("Posting accounts saved. Both versions use them.");
    } else if (key === "map-account") ui.accounts[el.dataset.id] = el.value;
    else if (key === "review-check" && ui.review) {
      const row = ui.review.rows.find((r) => r.productId === el.dataset.product);
      if (row) row.checked = el.checked;
    } else if (key === "review-choose" && ui.review) {
      const row = ui.review.rows.find((r) => r.productId === el.dataset.product);
      if (row) row.chosenId = el.value;
    } else if (key === "create-account" && ui.create) ui.create.accounts[el.dataset.field] = el.value;
    else if (key === "select") ui.selected[el.dataset.product] = el.checked;
    else if (key === "select-all") {
      const on = el.checked;
      visibleProducts().forEach((p) => { ui.selected[p.id] = on; });
    } else if (key === "add-integration" && ui.add) ui.add.integration = el.value;
    else if (key === "feedback-urgency" && ui.create) ui.create.feedback.urgency = el.value;
  }

  function onClick(e) {
    const actEl = e.target.closest("[data-act]");
    const act = actEl ? actEl.dataset.act : null;
    const inPicker = e.target.closest(".picker");
    if (ui.picker && !inPicker && act !== "open-picker" && act !== "pick-item") {
      ui.picker = null;
      if (!act) { render(); return; }
    }
    if (!act) return;
    if (act === "scrim") {
      if (e.target.closest(".dialog")) return;
      const which = actEl.dataset.which;
      if (which === "settings") { go(ui.returnPage || "products"); return; }
      if (which === "review") ui.review = null;
      if (which === "create") ui.create = null;
      if (which === "confirm") ui.confirm = null;
      if (which === "info") ui.info = null;
      if (which === "add") ui.add = null;
      render();
      return;
    }
    if (act === "nav") { ui.picker = null; go(actEl.dataset.page); return; }
    if (act === "set-version") {
      state.version = actEl.dataset.v;
      setQuery("v", state.version);
      ui.picker = null;
      save();
      render();
      return;
    }
    if (act === "set-ledger") {
      state.ledger = actEl.dataset.ledger;
      setQuery("ledger", state.ledger);
      ui.picker = null;
      save();
      render();
      return;
    }
    if (act === "set-create") {
      state.createItems = actEl.dataset.on === "true";
      setQuery("create", state.createItems ? "true" : "false");
      if (!state.createItems) ui.create = null;
      ui.picker = null;
      save();
      render();
      return;
    }
    if (act === "see-other") { seeOther(); return; }
    if (act === "reset") { ui.confirm = "reset"; render(); return; }
    if (act === "open-settings") {
      ui.returnPage = ui.page === "settings" ? ui.returnPage : ui.page;
      ui.picker = null;
      go("settings");
      return;
    }
    if (act === "close-settings") { go(ui.returnPage || "products"); return; }
    if (act === "settings-nav") { ui.settingsSection = actEl.dataset.section; render(); return; }
    if (act === "org-settings") {
      ui.info = { title: "Organization settings", html: "<p>Inventory tracking for this company lives on Products and services, next to the COGS toggles. Organization-wide billing and members are unchanged in this prototype.</p>" };
      render();
      return;
    }
    if (act === "help") {
      ui.info = { title: "About this prototype", html: "<p>DIS-507 adds an inventory adjustment next to the Daily Summary journal entry. Match each sales product to an inventory item. The match is stored once, so Version A and Version B show the same result.</p>" + (state.createItems ? "<p>Create items is on. QuickBooks Online and Xero can create an item. Sage Intacct and NetSuite show Currently in development.</p>" : "<p>Create items is off. Match products from the list, or use Find matching products.</p>") };
      render();
      return;
    }
    if (act === "go-matcher" || act === "filter-unmatched") {
      if (act === "filter-unmatched") { ui.filterMatch = "unmatched"; render(); return; }
      goMatcher();
      return;
    }
    if (act === "reset-filters") {
      ui.search = ""; ui.filterIntegration = "all"; ui.filterMatch = "all"; render(); return;
    }
    if (act === "open-picker") {
      if (!state.inventoryTracking) { toast("Turn on inventory tracking in Settings first."); render(); return; }
      const id = actEl.dataset.product;
      if (ui.picker && ui.picker.productId === id) ui.picker = null;
      else ui.picker = { productId: id, query: "" };
      focusRestore = null;
      render();
      return;
    }
    if (act === "pick-item") {
      const item = allItems().find((i) => i.id === actEl.dataset.item);
      const productId = actEl.dataset.product;
      if (item) {
        writeMatch(productId, item, "manual");
        ui.highlightId = productId;
        const p = productById(productId);
        toast("Match saved. " + p.name + " → " + item.name + ". Both versions show it.");
      }
      ui.picker = null;
      render();
      return;
    }
    if (act === "clear-one") {
      const id = actEl.dataset.product;
      delete state.matches[id];
      const p = productById(id);
      state.lastEdit = { productId: id, text: "Cleared " + (p ? p.name : "product") };
      save();
      ui.picker = null;
      ui.highlightId = id;
      toast("Match cleared. Both versions update.");
      render();
      return;
    }
    if (act === "clear-selected") {
      const ids = selectedIds();
      ids.forEach((id) => { delete state.matches[id]; });
      if (ids[0]) state.lastEdit = { productId: ids[0], text: "Cleared " + ids.length + " match" + (ids.length === 1 ? "" : "es") };
      save();
      toast("Cleared " + ids.length + " match" + (ids.length === 1 ? "" : "es") + ". Both versions update.");
      render();
      return;
    }
    if (act === "clear-selection") { ui.selected = {}; render(); return; }
    if (act === "create-selected") { openCreate(selectedIds()); render(); return; }
    if (act === "create-one") { openCreate([actEl.dataset.product]); render(); return; }
    if (act === "find") { startFind(); return; }
    if (act === "save-review") { saveReview(); render(); return; }
    if (act === "close-review") { ui.review = null; render(); return; }
    if (act === "close-create") { ui.create = null; render(); return; }
    if (act === "create-submit") { submitCreate(); render(); return; }
    if (act === "need-this") { ui.create.step = "feedback"; render(); return; }
    if (act === "feedback-back") { ui.create.step = "dev"; render(); return; }
    if (act === "feedback-send") {
      state.feedbackSent[state.ledger] = { urgency: ui.create.feedback.urgency, comment: ui.create.feedback.comment, at: Date.now() };
      save();
      ui.create.step = "thanks";
      render();
      return;
    }
    if (act === "close-info") { ui.info = null; render(); return; }
    if (act === "open-import") {
      ui.info = { title: "Import", html: "<p>Supported formats: XLSX, CSV. Your products and services list will be ready within 24 hours. We will notify you via email.</p><p class=\"hint\">Import already exists on this page. A future import can include the accounting item column.</p>" };
      render();
      return;
    }
    if (act === "open-history") {
      ui.info = { title: "Import history", html: "<p>No imports are in progress. The last CSV finished yesterday. This list is unchanged by inventory tracking.</p>" };
      render();
      return;
    }
    if (act === "open-export") {
      toast("Export started. The file includes name, SKU, cost, and the accounting item.");
      render();
      return;
    }
    if (act === "open-add") { ui.add = { name: "", sku: "", integration: "shopify", cost: "0", error: "" }; render(); return; }
    if (act === "close-add") { ui.add = null; render(); return; }
    if (act === "save-add") {
      const name = ui.add.name.trim();
      const sku = ui.add.sku.trim();
      if (!name || !sku) { ui.add.error = "Name and SKU are required."; render(); return; }
      const id = "custom-" + Date.now();
      state.customProducts.push({ id: id, name: name, sku: sku, integration: ui.add.integration, channel: "KINIPOP LLC", cost: Number(ui.add.cost) || 0, category: "Custom" });
      save();
      ui.add = null;
      ui.highlightId = id;
      ui.filterMatch = "all";
      ui.search = "";
      toast(name + " added. Match it to an accounting item.");
      if (ui.page !== "products" && !(state.version === "b" && ui.mappingTab === "products")) go("products");
      else render();
      return;
    }
    if (act === "learn-more") {
      ui.info = { title: "Products and services", html: "<p>This setting tracks the cost of the goods you sell. Inventory tracking posts quantities to the inventory item in your books, and summary COGS lines stay off while it is on.</p>" };
      render();
      return;
    }
    if (act === "how-it-works") {
      ui.info = { title: "Unverified products", html: "<p>When block sync is on, a summary that includes an unverified product is marked Attention required and is not posted until those products are verified. This is separate from inventory matching.</p>" };
      render();
      return;
    }
    if (act === "save-mappings") { toast("Mappings saved."); render(); return; }
    if (act === "add-currency") {
      ui.info = { title: "Add a currency", html: "<p>Synder can copy home-currency mappings to a new currency. Multicurrency is unchanged in this prototype. Home currency is USD.</p>" };
      render();
      return;
    }
    if (act === "expand-map") {
      ui.expandedMap = ui.expandedMap === actEl.dataset.id ? null : actEl.dataset.id;
      render();
      return;
    }
    if (act === "map-int") { ui.mappingIntegration = actEl.dataset.id; render(); return; }
    if (act === "map-tab") { ui.mappingTab = actEl.dataset.tab; ui.picker = null; render(); return; }
    if (act === "toggle-unmapped") { ui.showUnmappedOnly = !ui.showUnmappedOnly; render(); return; }
    if (act === "toggle-sync") { ui.syncOpen[actEl.dataset.id] = !ui.syncOpen[actEl.dataset.id]; render(); return; }
    if (act === "toggle-tracking") { ui.confirm = state.inventoryTracking ? "off" : "on"; render(); return; }
    if (act === "toggle-cogs") {
      if (state.inventoryTracking) return;
      const id = actEl.dataset.id;
      state.cogs[id] = !state.cogs[id];
      save();
      render();
      return;
    }
    if (act === "toggle-extra") {
      const key = actEl.dataset.key;
      state.extras[key] = !state.extras[key];
      save();
      render();
      return;
    }
    if (act === "confirm-no") { ui.confirm = null; render(); return; }
    if (act === "confirm-yes") {
      if (ui.confirm === "reset") {
        localStorage.removeItem(KEY);
        location.href = location.pathname + "#products";
        return;
      }
      if (ui.confirm === "on") state.inventoryTracking = true;
      if (ui.confirm === "off") state.inventoryTracking = false;
      ui.confirm = null;
      save();
      toast(state.inventoryTracking
        ? "Inventory tracking is on. Summary COGS toggles are off."
        : "Inventory tracking is off. COGS toggles can be turned on per integration.");
      render();
      return;
    }
  }

  document.addEventListener("click", onClick);
  document.addEventListener("input", (e) => {
    const el = e.target.closest("[data-input]");
    if (!el) return;
    rememberFocus();
    applyInput(el);
    render();
  });
  document.addEventListener("change", (e) => {
    const el = e.target.closest("[data-change]");
    if (!el) return;
    applyChange(el);
    render();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (ui.confirm) ui.confirm = null;
    else if (ui.create) ui.create = null;
    else if (ui.add) ui.add = null;
    else if (ui.info) ui.info = null;
    else if (ui.review) ui.review = null;
    else if (ui.picker) ui.picker = null;
    else if (ui.page === "settings") { go(ui.returnPage || "products"); return; }
    else return;
    render();
  });
  window.addEventListener("hashchange", () => {
    const h = (location.hash || "#products").replace("#", "");
    if (["products", "mapping", "sync", "settings"].indexOf(h) !== -1 && ui.page !== h) {
      ui.page = h;
      render();
    }
  });
  window.addEventListener("scroll", () => { if (ui.picker) positionPicker(); }, true);
  window.addEventListener("resize", () => { if (ui.picker) positionPicker(); });
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    const version = state.version;
    const ledgerId = state.ledger;
    state = loadState();
    state.version = version;
    state.ledger = ledgerId;
    if (!state.createItems) ui.create = null;
    render();
  });

  function init() {
    const params = new URLSearchParams(location.search);
    if (params.get("v") === "a" || params.get("v") === "b") state.version = params.get("v");
    if (LEDGERS[params.get("ledger")]) state.ledger = params.get("ledger");
    if (params.get("create") === "true" || params.get("create") === "false") state.createItems = params.get("create") === "true";
    if (params.get("tab") === "products" && state.version === "b") ui.mappingTab = "products";
    const h = (location.hash || "").replace("#", "");
    if (["products", "mapping", "sync", "settings"].indexOf(h) !== -1) ui.page = h;
    else history.replaceState(null, "", location.pathname + location.search + "#products");
    save();
    render();
  }

  window.__ds = {
    get state() { return state; },
    get ui() { return ui; },
    autoMatch: autoMatch,
    validMatch: validMatch,
    unmatchedCount: unmatchedCount,
    allProducts: allProducts,
    PRODUCTS: PRODUCTS,
  };

  init();
})();
