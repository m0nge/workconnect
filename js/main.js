/* WorkConnect — núcleo compartido: estado, sesión, cabecera/pie, modales, avisos y validación.
   Cada pantalla registra su lógica en WC.pages (ver portal.js, cuentas.js y admin.js). */

(function () {
  "use strict";
  var D = window.WC_DATA;
  var KEY = "workconnect_state_v1";
  var WC = (window.WC = { D: D, pages: {} });

  /* ---------- Estado y almacenamiento ---------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function fresh() {
    return { session: null, companies: clone(D.companies), jobs: clone(D.jobs), users: clone(D.users), profiles: clone(D.profiles), applications: clone(D.applications), threads: clone(D.threads), reviews: clone(D.reviews), reports: clone(D.reports), checks: {} };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === D.version) return s.d;
    } catch (e) { /* almacenamiento no disponible */ }
    return fresh();
  }
  WC.state = load();
  WC.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify({ v: D.version, d: WC.state })); } catch (e) { /* ignorar */ }
  };
  WC.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignorar */ }
    location.href = "index.html";
  };

  /* ---------- Utilidades ---------- */
  WC.$ = function (s, r) { return (r || document).querySelector(s); };
  WC.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  WC.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };
  var esc = WC.esc;
  WC.qs = new URLSearchParams(location.search);
  WC.uid = function (p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };
  WC.today = function () { return new Date().toISOString().slice(0, 10); };
  WC.money = function (n) { return "$" + Number(n).toLocaleString("en-US"); };
  WC.salary = function (j) { return WC.money(j.salaryMin) + " – " + WC.money(j.salaryMax); };
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  WC.date = function (iso) {
    if (!iso) return "";
    var p = iso.split("-");
    return Number(p[2]) + " " + MESES[Number(p[1]) - 1] + " " + p[0];
  };
  WC.initials = function (name) {
    var w = String(name).replace(/[^\wÁÉÍÓÚÑáéíóúñ ]/g, "").split(" ").filter(Boolean);
    return ((w[0] || "?")[0] + (w[1] ? w[1][0] : "")).toUpperCase();
  };
  WC.company = function (id) { return WC.state.companies.filter(function (c) { return c.id === id; })[0]; };
  WC.job = function (id) { return WC.state.jobs.filter(function (j) { return j.id === id; })[0]; };
  WC.expLabel = function (v) { var e = D.EXPERIENCIAS.filter(function (x) { return x.v === Number(v); })[0]; return e ? e.t : ""; };
  WC.stars = function (n) {
    n = Math.round(n);
    return '<span class="stars" role="img" aria-label="' + n + ' de 5 estrellas">' + "★".repeat(n) + '<span class="off">' + "★".repeat(5 - n) + "</span></span>";
  };
  WC.rating = function (companyId) {
    var r = WC.state.reviews.filter(function (x) { return x.companyId === companyId && x.status === "visible"; });
    if (!r.length) return { avg: 0, n: 0 };
    return { avg: r.reduce(function (a, x) { return a + x.rating; }, 0) / r.length, n: r.length };
  };
  WC.download = function (name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  };
  WC.options = function (list, selected, placeholder) {
    var h = placeholder ? '<option value="">' + esc(placeholder) + "</option>" : "";
    list.forEach(function (o) {
      var v = typeof o === "object" ? o.v : o, t = typeof o === "object" ? o.t : o;
      h += '<option value="' + esc(v) + '"' + (String(v) === String(selected) ? " selected" : "") + ">" + esc(t) + "</option>";
    });
    return h;
  };

  var BADGES = {
    activa: "ok", activo: "ok", visible: "ok", verificada: "ok", contratada: "ok", aprobada: "ok",
    pendiente: "wait", nueva: "wait",
    "en revisión": "info", entrevista: "info",
    inactiva: "off", inactivo: "off", oculto: "off",
    rechazada: "bad", suspendida: "bad"
  };
  var ICON = { ok: "✓ ", bad: "✕ ", off: "– ", wait: "", info: "" };
  WC.badge = function (status) {
    var k = BADGES[String(status).toLowerCase()] || "wait";
    var label = String(status).charAt(0).toUpperCase() + String(status).slice(1);
    return '<span class="badge b-' + k + '">' + ICON[k] + esc(label) + "</span>";
  };

  /* ---------- Sesión ---------- */
  WC.user = function () {
    var id = WC.state.session;
    return WC.state.users.filter(function (u) { return u.id === id; })[0] || null;
  };
  WC.companyId = function () { var u = WC.user(); return (u && u.companyId) || "c1"; };
  var HOME = { candidato: "candidato.html", empresa: "empresas.html", admin: "admin-dashboard.html" };
  WC.signIn = function (user) {
    WC.state.session = user.id;
    WC.save();
    var next = WC.qs.get("next");
    location.href = next && /^[\w-]+\.html/.test(next) ? next : HOME[user.role];
  };
  WC.demoLogin = function (role) {
    var u = WC.state.users.filter(function (x) { return x.role === role && x.email.indexOf("@workconnect.sv") > 0; })[0];
    if (u && u.status !== "activo") { u.status = "activo"; }
    if (u) WC.signIn(u);
  };
  WC.signOut = function () { WC.state.session = null; WC.save(); location.href = "index.html"; };

  /* ---------- Avisos y modales ---------- */
  WC.toast = function (msg, type) {
    var box = WC.$(".toasts");
    if (!box) { box = document.createElement("div"); box.className = "toasts"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    var t = document.createElement("div");
    t.className = "toast " + (type || "ok");
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.remove(); }, 4200);
  };

  WC.modal = function (o) {
    var ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = '<div class="dialog ' + (o.size || "") + '" role="dialog" aria-modal="true" aria-labelledby="dlg-title" tabindex="-1"><div class="dialog-head"><h2 id="dlg-title">' + esc(o.title) + '</h2><button class="dialog-close" type="button" aria-label="Cerrar">×</button></div><div class="dialog-body"></div>' + (o.actions ? '<div class="dialog-foot"></div>' : "") + "</div>";
    var dlg = WC.$(".dialog", ov), body = WC.$(".dialog-body", ov), foot = WC.$(".dialog-foot", ov);
    if (typeof o.body === "string") body.innerHTML = o.body; else if (o.body) body.appendChild(o.body);
    var prev = document.activeElement;
    var api = { el: ov, body: body, close: close };
    function close() {
      ov.remove();
      document.removeEventListener("keydown", onKey);
      if (!WC.$(".overlay")) document.body.style.overflow = "";
      if (prev && prev.focus) prev.focus();
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    (o.actions || []).forEach(function (a) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn " + (a.cls || "btn-ghost");
      b.textContent = a.label;
      b.addEventListener("click", function () {
        if (a.onClick && a.onClick(api) === false) return;
        close();
      });
      foot.appendChild(b);
    });
    ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(); });
    WC.$(".dialog-close", ov).addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";
    var first = WC.$("input:not([type=hidden]), select, textarea", body);
    (first || dlg).focus();
    return api;
  };

  WC.confirm = function (o, onOk) {
    WC.modal({
      title: o.title || "Confirmar acción", body: "<p>" + esc(o.message) + "</p>",
      actions: [{ label: "Cancelar" }, { label: o.ok || "Confirmar", cls: o.danger ? "btn-primary" : "btn-dark", onClick: function () { onOk(); } }]
    });
  };

  /* ---------- Formularios y validación ---------- */
  WC.field = function (o) {
    var id = "f-" + o.name, req = o.req ? ' <span class="req" aria-hidden="true">*</span>' : "";
    var attrs = ' id="' + id + '" name="' + o.name + '"' + (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : "") + (o.autocomplete ? ' autocomplete="' + o.autocomplete + '"' : "");
    var control;
    if (o.type === "select") control = "<select" + attrs + ">" + WC.options(o.options, o.value, o.placeholder || "Selecciona") + "</select>";
    else if (o.type === "textarea") control = "<textarea" + attrs + ' rows="' + (o.rows || 4) + '">' + esc(o.value || "") + "</textarea>";
    else control = '<input type="' + (o.type || "text") + '"' + attrs + ' value="' + esc(o.value == null ? "" : o.value) + '"' + (o.min != null ? ' min="' + o.min + '"' : "") + (o.max != null ? ' max="' + o.max + '"' : "") + ">";
    return '<div class="field ' + (o.cls || "") + '"><label for="' + id + '">' + esc(o.label) + req + "</label>" + control + (o.hint ? '<span class="hint">' + esc(o.hint) + "</span>" : "") + '<span class="err-msg" role="alert"></span></div>';
  };
  WC.clearErrors = function (form) {
    WC.$$(".field.error", form).forEach(function (f) { f.classList.remove("error"); WC.$(".err-msg", f).textContent = ""; });
  };
  WC.setError = function (input, msg) {
    var f = input.closest(".field");
    if (!f) return;
    f.classList.add("error");
    var m = WC.$(".err-msg", f);
    if (!m) { m = document.createElement("span"); m.className = "err-msg"; m.setAttribute("role", "alert"); f.appendChild(m); }
    m.textContent = msg;
    input.setAttribute("aria-invalid", "true");
  };
  /* checks: [[nombreCampo, funcion(valor, form) => mensaje|""], ...] */
  WC.validate = function (form, checks) {
    WC.clearErrors(form);
    var ok = true, first = null;
    checks.forEach(function (c) {
      var inp = form.elements[c[0]];
      if (!inp) return;
      var val = inp.type === "checkbox" ? inp.checked : String(inp.value).trim();
      var msg = c[1](val, form);
      if (msg) { WC.setError(inp, msg); ok = false; first = first || inp; }
    });
    if (first) first.focus();
    return ok;
  };
  WC.rules = {
    req: function (m) { return function (v) { return v ? "" : m || "Este campo es obligatorio."; }; },
    email: function (v) {
      if (!v) return "Ingresa tu correo electrónico.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Escribe un correo válido, por ejemplo nombre@correo.com.";
    },
    pass: function (v) {
      if (!v) return "Ingresa una contraseña.";
      if (v.length < 8) return "Debe tener al menos 8 caracteres.";
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return "Debe combinar letras y números.";
      return "";
    },
    phone: function (v) { return !v || /^\d{4}-?\d{4}$/.test(v) ? "" : "Usa 8 dígitos, por ejemplo 7812-3456."; },
    minLen: function (n, m) { return function (v) { return v.length >= n ? "" : m || "Escribe al menos " + n + " caracteres."; }; }
  };

  /* ---------- Tarjeta de vacante ---------- */
  WC.logo = function (c, big) {
    return '<div class="mono' + (big ? " lg" : "") + '" aria-hidden="true">' + (c.logo ? '<img src="' + esc(c.logo) + '" alt="">' : esc(WC.initials(c.name))) + "</div>";
  };
  WC.jobCard = function (j, list) {
    var c = WC.company(j.companyId) || { name: "Empresa", logo: "" };
    var meta = '<div class="job-meta"><span>' + esc(j.city) + ", " + esc(j.dept) + "</span><span>" + esc(j.modality) + "</span><span>" + esc(j.contract) + "</span>" + (list ? "<span>" + esc(WC.expLabel(j.exp)) + "</span>" : "") + "</div>";
    var title = '<div><h3><a href="detalle-empleo.html?id=' + j.id + '">' + esc(j.title) + '</a></h3><div class="job-company">' + esc(c.name) + "</div></div>";
    var sal = '<div class="salary">' + WC.salary(j) + ' <small>/ mes</small></div>';
    if (list) {
      return '<article class="job-card"><div class="job-main"><div class="job-top">' + WC.logo(c) + title + "</div>" + meta + '<p class="muted small">' + esc(j.description) + '</p></div><div class="job-side">' + sal + '<div><div class="small muted" style="margin-bottom:8px">Publicada el ' + WC.date(j.posted) + '</div><a class="btn btn-dark btn-sm" href="detalle-empleo.html?id=' + j.id + '">Ver detalle</a></div></div></article>';
    }
    return '<article class="job-card"><div class="job-top">' + WC.logo(c) + title + "</div>" + meta + '<div class="job-foot">' + sal + '<a class="btn btn-ghost btn-sm" href="detalle-empleo.html?id=' + j.id + '">Ver detalle</a></div></article>';
  };

  /* ---------- Páginas y navegación ---------- */
  WC.PAGES = [
    { id: "P01", f: "index.html", t: "Inicio", m: 1 }, { id: "P02", f: "resultados.html", t: "Resultados de búsqueda", m: 1 }, { id: "P03", f: "detalle-empleo.html", t: "Detalle del empleo", m: 1 }, { id: "P04", f: "recursos.html", t: "Recursos", m: 1 }, { id: "P05", f: "foros.html", t: "Foros", m: 1 },
    { id: "P06", f: "login.html", t: "Registro e inicio de sesión", m: 2 }, { id: "P07", f: "candidato.html", t: "Perfil del candidato", m: 2 }, { id: "P08", f: "empresas.html", t: "Gestión empresarial", m: 2 }, { id: "P09", f: "publicar-vacante.html", t: "Publicar vacante", m: 2 }, { id: "P10", f: "postulaciones.html", t: "Postulaciones", m: 2 },
    { id: "P11", f: "admin-dashboard.html", t: "Dashboard administrativo", m: 3 }, { id: "P12", f: "admin-usuarios.html", t: "Gestión de usuarios", m: 3 }, { id: "P13", f: "admin-empresas.html", t: "Gestión de empresas", m: 3 }, { id: "P14", f: "admin-vacantes.html", t: "Gestión de vacantes", m: 3 }, { id: "P15", f: "admin-moderacion.html", t: "Moderación de contenido", m: 3 }
  ];
  var MODULOS = { 1: "Portal público", 2: "Candidatos y empresas", 3: "Administración" };
  var file = location.pathname.split("/").pop() || "index.html";
  WC.file = file;

  function navLinks(u) {
    var l = [["resultados.html", "Empleos"], ["recursos.html", "Recursos"], ["foros.html", "Foros"]];
    if (!u) l.push(["login.html?tab=registro&rol=empresa", "Para empresas"]);
    else if (u.role === "candidato") l.push(["candidato.html", "Mi perfil"]);
    else if (u.role === "empresa") l.push(["empresas.html", "Mi empresa"], ["publicar-vacante.html", "Publicar vacante"], ["postulaciones.html", "Postulaciones"]);
    else l.push(["admin-dashboard.html", "Administración"]);
    return l;
  }
  function isCurrent(href) {
    var h = href.split("?")[0];
    if (href.indexOf("?") > 0) return false;
    if (h === file) return true;
    if (h === "resultados.html" && file === "detalle-empleo.html") return true;
    if (h === "admin-dashboard.html" && file.indexOf("admin-") === 0) return true;
    return false;
  }
  var ROLE_NAME = { candidato: "Candidato/a", empresa: "Empresa", admin: "Administrador" };

  function renderHeader() {
    var u = WC.user();
    var nav = navLinks(u).map(function (l) { return '<a href="' + l[0] + '"' + (isCurrent(l[0]) ? ' aria-current="page"' : "") + ">" + l[1] + "</a>"; }).join("");
    var auth;
    if (u) {
      var menu = (u.role === "candidato" ? [["candidato.html", "Mi perfil"]] : u.role === "empresa" ? [["empresas.html", "Mi empresa"], ["publicar-vacante.html", "Publicar vacante"], ["postulaciones.html", "Postulaciones"]] : [["admin-dashboard.html", "Dashboard"], ["admin-usuarios.html", "Usuarios"], ["admin-empresas.html", "Empresas"], ["admin-vacantes.html", "Vacantes"], ["admin-moderacion.html", "Moderación"]])
        .map(function (m) { return '<a href="' + m[0] + '">' + m[1] + "</a>"; }).join("");
      auth = '<button class="user-btn" id="user-btn" aria-haspopup="true" aria-expanded="false"><span class="avatar">' + esc(WC.initials(u.name)) + '</span><span class="nm">' + esc(u.name.split(" ")[0]) + '</span></button><div class="user-menu hidden" id="user-menu"><div class="who"><strong>' + esc(u.name) + '</strong><span class="small muted">' + ROLE_NAME[u.role] + " · " + esc(u.email) + "</span></div>" + menu + '<button type="button" id="logout-btn">Cerrar sesión</button></div>';
    } else {
      auth = '<a class="btn btn-ghost btn-sm" href="login.html?tab=ingresar">Ingresar</a><a class="btn btn-primary btn-sm" href="login.html?tab=registro">Registrarse</a>';
    }
    WC.$("#site-header").innerHTML = '<header class="site-header"><div class="wrap bar"><a class="brand" href="index.html"><img src="assets/logo.png" alt="WorkConnect — Conectando talento con oportunidades" width="214" height="38"></a><nav class="main-nav" id="main-nav" aria-label="Principal">' + nav + '</nav><div class="bar-actions"><button class="btn btn-ghost btn-sm proto-btn" id="proto-btn" type="button">P01–P15</button>' + auth + '<button class="menu-toggle" id="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false">☰</button></div></div></header>';
    WC.$("#menu-toggle").addEventListener("click", function () {
      var open = WC.$("#main-nav").classList.toggle("open");
      this.setAttribute("aria-expanded", open);
    });
    WC.$("#proto-btn").addEventListener("click", WC.protoIndex);
    if (u) {
      var btn = WC.$("#user-btn"), menuEl = WC.$("#user-menu");
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var hid = menuEl.classList.toggle("hidden");
        btn.setAttribute("aria-expanded", !hid);
      });
      document.addEventListener("click", function (e) { if (!menuEl.contains(e.target)) { menuEl.classList.add("hidden"); btn.setAttribute("aria-expanded", "false"); } });
      WC.$("#logout-btn").addEventListener("click", WC.signOut);
    }
  }

  function renderFooter() {
    var el = WC.$("#site-footer");
    if (!el) return;
    el.innerHTML = '<footer class="site-footer"><div class="wrap"><div class="foot-grid"><div><img src="assets/logo.png" alt="WorkConnect"><p class="muted small" style="max-width:300px">Portal de empleo para El Salvador. Candidatos y empresas, en un mismo lugar.</p></div><div><h4>Candidatos</h4><ul><li><a href="resultados.html">Buscar empleo</a></li><li><a href="recursos.html">Recursos</a></li><li><a href="foros.html">Foros</a></li><li><a href="candidato.html">Mi perfil</a></li></ul></div><div><h4>Empresas</h4><ul><li><a href="publicar-vacante.html">Publicar vacante</a></li><li><a href="postulaciones.html">Postulaciones</a></li><li><a href="empresas.html">Mi empresa</a></li><li><a href="login.html?tab=registro&rol=empresa">Registrar empresa</a></li></ul></div><div><h4>Portal</h4><ul><li><a href="login.html">Ingresar</a></li><li><a href="admin-dashboard.html">Administración</a></li><li><button class="link" type="button" id="foot-proto">Índice P01–P15</button></li></ul></div></div><div class="foot-bottom"><span>© 2026 WorkConnect · Conectando talento con oportunidades.</span><span>Proyecto universitario · Datos ficticios de El Salvador</span></div></div></footer>';
    WC.$("#foot-proto").addEventListener("click", WC.protoIndex);
  }

  WC.protoIndex = function () {
    var cols = [1, 2, 3].map(function (m) {
      return "<div><h3>Módulo " + m + " · " + MODULOS[m] + "</h3>" + WC.PAGES.filter(function (p) { return p.m === m; }).map(function (p) {
        return '<a href="' + p.f + '"' + (p.f === file ? ' aria-current="page"' : "") + "><b>" + p.id + "</b>" + p.t + "</a>";
      }).join("") + "</div>";
    }).join("");
    WC.modal({
      title: "Índice del prototipo", size: "lg", body: '<div class="proto-index">' + cols + "</div>",
      actions: [{ label: "Restablecer datos de demostración", cls: "btn-danger", onClick: function () { WC.confirm({ message: "Se borrarán los cambios guardados en este navegador y se cargarán los datos iniciales.", ok: "Restablecer", danger: true }, WC.reset); } }, { label: "Cerrar", cls: "btn-dark" }]
    });
  };

  /* Restringe una pantalla a ciertos roles; si no cumple muestra un acceso con atajos de demostración */
  WC.guard = function (roles, what) {
    var u = WC.user();
    if (u && roles.indexOf(u.role) >= 0) return true;
    var role = roles[0];
    var demo = roles.map(function (r) { return '<button class="btn ' + (r === role ? "btn-primary" : "btn-ghost") + '" type="button" data-demo="' + r + '">Entrar como ' + ROLE_NAME[r].toLowerCase() + " (demo)</button>"; }).join("");
    WC.$("#main").innerHTML = '<div class="wrap"><div class="gate"><span class="eyebrow">Acceso restringido</span><h1>' + esc(what) + '</h1><p class="muted">' + (u ? "Tu cuenta (" + ROLE_NAME[u.role].toLowerCase() + ") no tiene acceso a esta sección." : "Inicia sesión para continuar.") + '</p><div class="flex"><a class="btn btn-dark" href="login.html?next=' + file + '">Iniciar sesión</a>' + demo + "</div></div></div>";
    WC.$$("[data-demo]").forEach(function (b) { b.addEventListener("click", function () { WC.state.session = null; WC.demoLogin(b.dataset.demo); }); });
    return false;
  };

  WC.adminNav = function () {
    var items = WC.PAGES.filter(function (p) { return p.m === 3; }).map(function (p) { return '<a href="' + p.f + '"' + (p.f === file ? ' aria-current="page"' : "") + "><b>" + p.id + "</b>" + p.t.replace("Gestión de ", "").replace("Dashboard administrativo", "Dashboard").replace("Moderación de contenido", "Moderación") + "</a>"; }).join("");
    return '<aside class="admin-nav" aria-label="Administración"><h4>Administración</h4>' + items + "</aside>";
  };

  WC.adminTitle = function (id, title, text) {
    return '<div class="admin-title"><span class="eyebrow"><span class="p">' + id + "</span>Administración</span><h1>" + title + "</h1><p>" + text + "</p></div>";
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    var fn = WC.pages[document.body.dataset.page];
    if (fn) fn();
  });
})();
