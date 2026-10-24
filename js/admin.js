/* WorkConnect — Módulo 3: administración
   P11 Dashboard · P12 Usuarios · P13 Empresas · P14 Vacantes · P15 Moderación */

(function () {
  "use strict";
  var WC = window.WC, D = WC.D, $ = WC.$, $$ = WC.$$, esc = WC.esc, S = WC.state, R = WC.rules;

  function shell(id, title, text) {
    $("#main").innerHTML = '<div class="wrap"><div class="admin-shell">' + WC.adminNav() + "<div>" + WC.adminTitle(id, title, text) + '<div id="admin-body"></div></div></div></div>';
    return $("#admin-body");
  }
  function count(list, fn) { return list.filter(fn).length; }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function roleName(r) { return r === "candidato" ? "Candidato/a" : r === "empresa" ? "Empresa" : "Administrador/a"; }
  function pendingMod() {
    return count(S.threads, function (t) { return t.status === "pendiente"; }) + count(S.reviews, function (r) { return r.status === "pendiente"; }) + count(S.reports, function (r) { return r.status === "pendiente"; });
  }

  /* ===== P11 · Dashboard ===== */
  WC.pages.p11 = function () {
    if (!WC.guard(["admin"], "Dashboard administrativo")) return;
    var body = shell("P11", "Dashboard", "Resumen del portal con datos de la sesión de demostración.");
    var activeJobs = count(S.jobs, function (j) { return j.status === "activa"; });
    var pendJobs = count(S.jobs, function (j) { return j.status === "pendiente"; });
    var pendCo = count(S.companies, function (c) { return c.status === "Pendiente"; });
    var maxM = Math.max.apply(null, D.monthly.map(function (m) { return m.v; }));

    var sectors = {};
    S.jobs.forEach(function (j) { if (j.status === "activa") sectors[j.sector] = (sectors[j.sector] || 0) + 1; });
    var secList = Object.keys(sectors).map(function (k) { return [k, sectors[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
    var maxS = secList.length ? secList[0][1] : 1;

    var states = ["Nueva", "En revisión", "Entrevista", "Contratada", "Rechazada"];
    var shades = ["#E1DDD8", "#B9B2AA", "#1F1F23", "#7A2E3A", "#8A8680"];
    var total = S.applications.length || 1, acc = 0;
    var stops = states.map(function (s, i) {
      var n = count(S.applications, function (a) { return a.status === s; });
      var from = acc / total * 100; acc += n;
      return shades[i] + " " + from + "% " + acc / total * 100 + "%";
    }).join(",");

    body.innerHTML =
      '<div class="kpi-grid"><div class="kpi"><span>Usuarios</span><b>' + S.users.length + "</b><small>" + count(S.users, function (u) { return u.status === "activo"; }) + ' activos</small></div>' +
      '<div class="kpi"><span>Empresas</span><b>' + S.companies.length + "</b><small>" + count(S.companies, function (c) { return c.status === "Verificada"; }) + ' verificadas</small></div>' +
      '<div class="kpi"><span>Vacantes</span><b>' + S.jobs.length + "</b><small>" + activeJobs + ' activas</small></div>' +
      '<div class="kpi"><span>Postulaciones</span><b>' + S.applications.length + "</b><small>" + count(S.applications, function (a) { return a.status === "Contratada"; }) + " contrataciones</small></div></div>" +
      '<div class="charts"><section class="card"><h3>Postulaciones por mes</h3><p class="small muted">Cifras históricas de ejemplo.</p><div class="col-chart" role="img" aria-label="Postulaciones mensuales">' + D.monthly.map(function (m) {
        return '<div class="col"><b>' + m.v + '</b><i style="height:' + Math.round(m.v / maxM * 140) + 'px"></i><span>' + m.m + "</span></div>";
      }).join("") + '</div></section><section class="card"><h3>Postulaciones por estado</h3><div class="donut-wrap"><div class="donut" style="background:conic-gradient(' + stops + ')" role="img" aria-label="Distribución por estado"></div><ul class="legend">' + states.map(function (s, i) {
        return '<li><i style="background:' + shades[i] + '"></i>' + s + " · <b>" + count(S.applications, function (a) { return a.status === s; }) + "</b></li>";
      }).join("") + "</ul></div></section></div>" +
      '<div class="charts" style="grid-template-columns:1fr 1fr"><section class="card"><h3>Vacantes activas por sector</h3>' + secList.map(function (s) {
        return '<div class="hbar"><div class="top"><span>' + esc(s[0]) + "</span><b>" + s[1] + '</b></div><div class="track"><i style="width:' + Math.round(s[1] / maxS * 100) + '%"></i></div></div>';
      }).join("") + '</section><section class="card"><h3>Pendientes de atención</h3><div class="queue"><a href="admin-vacantes.html">Vacantes por aprobar <span>' + pendJobs + '</span></a><a href="admin-empresas.html">Empresas por verificar <span>' + pendCo + '</span></a><a href="admin-moderacion.html">Contenido por moderar <span>' + pendingMod() + '</span></a><a href="admin-usuarios.html">Cuentas inactivas <span>' + count(S.users, function (u) { return u.status !== "activo"; }) + "</span></a></div></section></div>";
  };

  /* ===== P12 · Usuarios ===== */
  WC.pages.p12 = function () {
    if (!WC.guard(["admin"], "Gestión de usuarios")) return;
    var body = shell("P12", "Usuarios", "Busca cuentas, revisa sus datos y activa o desactiva el acceso.");
    var q = "", fr = "", fs = "";
    body.innerHTML = '<div class="toolbar"><div class="field grow"><label class="sr-only" for="u-q">Buscar</label><input id="u-q" type="search" placeholder="Buscar por nombre o correo"></div><div class="field"><label class="sr-only" for="u-r">Rol</label><select id="u-r">' + WC.options([{ v: "candidato", t: "Candidatos" }, { v: "empresa", t: "Empresas" }, { v: "admin", t: "Administración" }], "", "Todos los roles") + '</select></div><div class="field"><label class="sr-only" for="u-s">Estado</label><select id="u-s">' + WC.options([{ v: "activo", t: "Activos" }, { v: "inactivo", t: "Inactivos" }], "", "Todos los estados") + '</select></div></div><p class="small muted" id="u-count" aria-live="polite"></p><div id="u-table"></div>';
    $("#u-q").addEventListener("input", function (e) { q = e.target.value.toLowerCase(); draw(); });
    $("#u-r").addEventListener("change", function (e) { fr = e.target.value; draw(); });
    $("#u-s").addEventListener("change", function (e) { fs = e.target.value; draw(); });

    function draw() {
      var list = S.users.filter(function (u) { return (!q || (u.name + " " + u.email).toLowerCase().indexOf(q) >= 0) && (!fr || u.role === fr) && (!fs || u.status === fs); });
      $("#u-count").textContent = list.length + " de " + S.users.length + " cuentas";
      $("#u-table").innerHTML = list.length ? '<div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Rol</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' + list.map(function (u) {
        var me = WC.user().id === u.id;
        return '<tr><td><div class="flex" style="flex-wrap:nowrap"><div class="avatar">' + esc(WC.initials(u.name)) + '</div><div><div class="cell-main">' + esc(u.name) + '</div><div class="cell-sub">' + esc(u.email) + "</div></div></div></td><td>" + roleName(u.role) + "</td><td>" + WC.date(u.created) + "</td><td>" + WC.badge(u.status) + '</td><td><div class="actions"><button class="btn btn-ghost btn-sm" data-v="' + u.id + '" type="button">Ver</button><button class="btn btn-ghost btn-sm" data-e="' + u.id + '" type="button">Editar</button>' + (me ? "" : '<button class="btn btn-ghost btn-sm" data-t="' + u.id + '" type="button">' + (u.status === "activo" ? "Desactivar" : "Activar") + "</button>") + "</div></td></tr>";
      }).join("") + "</tbody></table></div>" : '<div class="empty"><strong>Sin resultados</strong>Ajusta la búsqueda o los filtros.</div>';
      $$("[data-v]").forEach(function (b) { b.addEventListener("click", function () { view(b.dataset.v); }); });
      $$("[data-e]").forEach(function (b) { b.addEventListener("click", function () { edit(b.dataset.e); }); });
      $$("[data-t]").forEach(function (b) { b.addEventListener("click", function () { toggle(b.dataset.t); }); });
    }
    function toggle(id) {
      var u = byId(S.users, id), off = u.status === "activo";
      WC.confirm({ title: off ? "Desactivar cuenta" : "Activar cuenta", message: off ? u.name + " no podrá iniciar sesión hasta que la reactives." : u.name + " podrá volver a iniciar sesión.", ok: off ? "Desactivar" : "Activar", danger: off }, function () {
        u.status = off ? "inactivo" : "activo"; WC.save(); draw(); WC.toast("Cuenta " + (off ? "desactivada" : "activada") + ".");
      });
    }
    function view(id) {
      var u = byId(S.users, id), co = u.companyId ? WC.company(u.companyId) : null;
      var apps = count(S.applications, function (a) { return a.email === u.email; });
      WC.modal({ title: u.name, body: '<dl class="kv"><dt>Correo</dt><dd>' + esc(u.email) + "</dd><dt>Rol</dt><dd>" + roleName(u.role) + "</dd><dt>Estado</dt><dd>" + WC.badge(u.status) + "</dd><dt>Registro</dt><dd>" + WC.date(u.created) + "</dd>" + (co ? "<dt>Empresa</dt><dd>" + esc(co.name) + "</dd>" : "") + (u.role === "candidato" ? "<dt>Postulaciones</dt><dd>" + apps + "</dd>" : "") + "</dl>", actions: [{ label: "Cerrar", cls: "btn-dark" }] });
    }
    function edit(id) {
      var u = byId(S.users, id);
      WC.modal({
        title: "Editar usuario", body: '<form id="u-form" novalidate class="form-grid">' + WC.field({ name: "name", label: "Nombre", req: true, value: u.name, cls: "full" }) + WC.field({ name: "email", type: "email", label: "Correo", req: true, value: u.email, cls: "full" }) + WC.field({ name: "role", type: "select", label: "Rol", options: [{ v: "candidato", t: "Candidato/a" }, { v: "empresa", t: "Empresa" }, { v: "admin", t: "Administrador/a" }], value: u.role, cls: "full" }) + "</form>",
        actions: [{ label: "Cancelar" }, {
          label: "Guardar", cls: "btn-primary", onClick: function (m) {
            var f = $("#u-form", m.el);
            if (!WC.validate(f, [["name", R.minLen(3, "Escribe el nombre.")], ["email", function (v) { var e = R.email(v); return e || (S.users.some(function (x) { return x.id !== u.id && x.email.toLowerCase() === v.toLowerCase(); }) ? "Ese correo ya está en uso." : ""); }], ["role", R.req("Selecciona un rol.")]])) return false;
            var old = u.email;
            u.name = f.elements.name.value.trim(); u.email = f.elements.email.value.trim().toLowerCase(); u.role = f.elements.role.value;
            if (old !== u.email && S.profiles[old]) { S.profiles[u.email] = S.profiles[old]; delete S.profiles[old]; }
            WC.save(); draw(); WC.toast("Usuario actualizado.");
          }
        }]
      });
    }
    draw();
  };

  /* ===== P13 · Empresas ===== */
  WC.pages.p13 = function () {
    if (!WC.guard(["admin"], "Gestión de empresas")) return;
    var body = shell("P13", "Empresas", "Revisa la información de cada empresa y gestiona su verificación.");
    var q = "", fs = "";
    body.innerHTML = '<div class="toolbar"><div class="field grow"><label class="sr-only" for="c-q">Buscar</label><input id="c-q" type="search" placeholder="Buscar empresa o sector"></div><div class="field"><label class="sr-only" for="c-s">Estado</label><select id="c-s">' + WC.options(["Verificada", "Pendiente", "Suspendida"], "", "Todos los estados") + '</select></div></div><p class="small muted" id="c-count" aria-live="polite"></p><div id="c-table"></div>';
    $("#c-q").addEventListener("input", function (e) { q = e.target.value.toLowerCase(); draw(); });
    $("#c-s").addEventListener("change", function (e) { fs = e.target.value; draw(); });

    function draw() {
      var list = S.companies.filter(function (c) { return (!q || (c.name + " " + c.sector).toLowerCase().indexOf(q) >= 0) && (!fs || c.status === fs); });
      $("#c-count").textContent = list.length + " de " + S.companies.length + " empresas";
      $("#c-table").innerHTML = list.length ? '<div class="table-wrap"><table><thead><tr><th>Empresa</th><th>Sector</th><th>Ubicación</th><th>Vacantes</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' + list.map(function (c) {
        return '<tr><td><div class="flex" style="flex-wrap:nowrap">' + WC.logo(c) + '<div><div class="cell-main">' + esc(c.name) + '</div><div class="cell-sub">' + esc(c.email) + "</div></div></div></td><td>" + esc(c.sector) + "</td><td>" + esc([c.city, c.dept].filter(Boolean).join(", ") || "—") + "</td><td>" + count(S.jobs, function (j) { return j.companyId === c.id; }) + "</td><td>" + WC.badge(c.status) + '</td><td><div class="actions"><button class="btn btn-ghost btn-sm" data-r="' + c.id + '" type="button">Revisar</button>' + (c.status !== "Verificada" ? '<button class="btn btn-dark btn-sm" data-s="' + c.id + '|Verificada" type="button">Verificar</button>' : "") + (c.status !== "Suspendida" ? '<button class="btn btn-ghost btn-sm" data-s="' + c.id + '|Suspendida" type="button">Suspender</button>' : "") + "</div></td></tr>";
      }).join("") + "</tbody></table></div>" : '<div class="empty"><strong>Sin resultados</strong>Ajusta la búsqueda o el estado.</div>';
      $$("[data-r]").forEach(function (b) { b.addEventListener("click", function () { review(b.dataset.r); }); });
      $$("[data-s]").forEach(function (b) { b.addEventListener("click", function () { var p = b.dataset.s.split("|"); setStatus(p[0], p[1]); }); });
    }
    function setStatus(id, st) {
      var c = byId(S.companies, id);
      c.status = st; WC.save(); draw();
      WC.toast(c.name + ": estado «" + st + "».");
    }
    function review(id) {
      var c = byId(S.companies, id), r = WC.rating(id);
      WC.modal({
        title: c.name, size: "lg",
        body: '<div class="flex" style="flex-wrap:nowrap;margin-bottom:16px">' + WC.logo(c, true) + "<div>" + WC.badge(c.status) + '<p class="small muted" style="margin-top:6px">' + esc(c.desc || "La empresa aún no ha completado su descripción.") + "</p></div></div>" +
          '<dl class="kv"><dt>Sector</dt><dd>' + esc(c.sector) + "</dd><dt>Tamaño</dt><dd>" + esc(c.size || "—") + "</dd><dt>Ubicación</dt><dd>" + esc([c.city, c.dept].filter(Boolean).join(", ") || "—") + "</dd><dt>Contacto</dt><dd>" + esc(c.email) + (c.phone ? " · " + esc(c.phone) : "") + "</dd><dt>Sitio web</dt><dd>" + esc(c.web || "—") + "</dd><dt>Vacantes</dt><dd>" + count(S.jobs, function (j) { return j.companyId === id; }) + "</dd><dt>Valoración</dt><dd>" + (r.n ? r.avg.toFixed(1) + " / 5 (" + r.n + ")" : "Sin valoraciones") + "</dd></dl>" +
          (!c.desc || !c.city ? '<p class="form-alert" style="display:block;margin-top:16px">Perfil incompleto: faltan descripción o ubicación.</p>' : ""),
        actions: [{ label: "Suspender", cls: "btn-ghost", onClick: function () { setStatus(id, "Suspendida"); } }, { label: "Marcar pendiente", cls: "btn-ghost", onClick: function () { setStatus(id, "Pendiente"); } }, { label: "Verificar empresa", cls: "btn-primary", onClick: function () { setStatus(id, "Verificada"); } }]
      });
    }
    draw();
  };

  /* ===== P14 · Vacantes ===== */
  WC.pages.p14 = function () {
    if (!WC.guard(["admin"], "Gestión de vacantes")) return;
    var body = shell("P14", "Vacantes", "Aprueba las nuevas publicaciones, edítalas o desactívalas.");
    var tab = "", q = "";
    function draw() {
      var tabs = [["", "Todas"], ["pendiente", "Pendientes"], ["activa", "Activas"], ["inactiva", "Inactivas"]];
      var list = S.jobs.filter(function (j) { var c = WC.company(j.companyId); return (!tab || j.status === tab) && (!q || (j.title + " " + (c ? c.name : "")).toLowerCase().indexOf(q) >= 0); }).sort(function (a, b) { return a.posted < b.posted ? 1 : -1; });
      body.innerHTML = '<div class="tabs" role="tablist">' + tabs.map(function (t) { return '<button class="tab" role="tab" data-tab="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + " (" + (t[0] ? count(S.jobs, function (j) { return j.status === t[0]; }) : S.jobs.length) + ")</button>"; }).join("") + '</div><div class="toolbar"><div class="field grow"><label class="sr-only" for="j-q">Buscar</label><input id="j-q" type="search" placeholder="Buscar por puesto o empresa" value="' + esc(q) + '"></div></div>' +
        (list.length ? '<div class="table-wrap"><table><thead><tr><th>Vacante</th><th>Salario</th><th>Publicada</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' + list.map(function (j) {
          var c = WC.company(j.companyId) || { name: "—" };
          return '<tr><td><div class="cell-main">' + esc(j.title) + '</div><div class="cell-sub">' + esc(c.name) + " · " + esc(j.city) + "</div></td><td>" + WC.salary(j) + "</td><td>" + WC.date(j.posted) + "</td><td>" + WC.badge(j.status) + '</td><td><div class="actions"><button class="btn btn-ghost btn-sm" data-v="' + j.id + '" type="button">Ver</button><button class="btn btn-ghost btn-sm" data-e="' + j.id + '" type="button">Editar</button>' + (j.status === "pendiente" ? '<button class="btn btn-dark btn-sm" data-a="' + j.id + '" type="button">Aprobar</button>' : "") + (j.status === "activa" ? '<button class="btn btn-ghost btn-sm" data-d="' + j.id + '" type="button">Desactivar</button>' : "") + (j.status === "inactiva" ? '<button class="btn btn-ghost btn-sm" data-a="' + j.id + '" type="button">Reactivar</button>' : "") + "</div></td></tr>";
        }).join("") + "</tbody></table></div>" : '<div class="empty"><strong>No hay vacantes en esta vista</strong>Prueba con otra pestaña o búsqueda.</div>');
      $$("[data-tab]", body).forEach(function (b) { b.addEventListener("click", function () { tab = b.dataset.tab; draw(); }); });
      $("#j-q").addEventListener("input", function (e) { q = e.target.value.toLowerCase(); var pos = e.target.selectionStart; draw(); var n = $("#j-q"); n.focus(); n.setSelectionRange(pos, pos); });
      $$("[data-v]", body).forEach(function (b) { b.addEventListener("click", function () { view(b.dataset.v); }); });
      $$("[data-e]", body).forEach(function (b) { b.addEventListener("click", function () { edit(b.dataset.e); }); });
      $$("[data-a]", body).forEach(function (b) { b.addEventListener("click", function () { setStatus(b.dataset.a, "activa"); }); });
      $$("[data-d]", body).forEach(function (b) { b.addEventListener("click", function () { setStatus(b.dataset.d, "inactiva"); }); });
    }
    function setStatus(id, st) {
      var j = byId(S.jobs, id); j.status = st; WC.save(); draw();
      WC.toast(st === "activa" ? "Vacante publicada en el portal." : "Vacante desactivada.");
    }
    function view(id) {
      var j = byId(S.jobs, id), c = WC.company(j.companyId) || { name: "—" };
      function ul(a) { return "<ul class=\"bullets small\">" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
      WC.modal({
        title: j.title, size: "lg",
        body: '<p class="muted small">' + esc(c.name) + " · " + esc(j.city + ", " + j.dept) + " · " + esc(j.modality) + " · " + esc(j.contract) + "</p><p style=\"margin:10px 0\"><strong>" + WC.salary(j) + "</strong> / mes · " + WC.badge(j.status) + "</p><p>" + esc(j.description) + "</p><h4 style=\"margin-top:14px\">Funciones</h4>" + ul(j.functions) + "<h4>Requisitos</h4>" + ul(j.requirements) + "<h4>Beneficios</h4>" + ul(j.benefits),
        actions: [{ label: "Cerrar", cls: "btn-ghost" }].concat(j.status === "activa" ? [{ label: "Ver en el portal", cls: "btn-dark", onClick: function () { location.href = "detalle-empleo.html?id=" + id; } }] : [{ label: "Aprobar y publicar", cls: "btn-primary", onClick: function () { setStatus(id, "activa"); } }])
      });
    }
    function edit(id) {
      var j = byId(S.jobs, id);
      WC.modal({
        title: "Editar vacante", size: "lg",
        body: '<form id="j-form" novalidate class="form-grid">' + WC.field({ name: "title", label: "Título", req: true, value: j.title, cls: "full" }) + WC.field({ name: "min", type: "number", label: "Salario mínimo", req: true, value: j.salaryMin, min: 0 }) + WC.field({ name: "max", type: "number", label: "Salario máximo", req: true, value: j.salaryMax, min: 0 }) + WC.field({ name: "modality", type: "select", label: "Modalidad", options: D.MODALIDADES, value: j.modality }) + WC.field({ name: "contract", type: "select", label: "Contrato", options: D.CONTRATOS, value: j.contract }) + WC.field({ name: "description", type: "textarea", label: "Descripción", req: true, value: j.description, cls: "full" }) + "</form>",
        actions: [{ label: "Cancelar" }, {
          label: "Guardar", cls: "btn-primary", onClick: function (m) {
            var f = $("#j-form", m.el);
            if (!WC.validate(f, [["title", R.minLen(5, "El título debe tener al menos 5 caracteres.")], ["min", function (v) { return Number(v) > 0 ? "" : "Ingresa un monto válido."; }], ["max", function (v, fm) { return Number(v) >= Number(fm.elements.min.value) ? "" : "No puede ser menor al mínimo."; }], ["modality", R.req("Selecciona la modalidad.")], ["contract", R.req("Selecciona el contrato.")], ["description", R.minLen(30, "Describe el puesto (mínimo 30 caracteres).")]])) return false;
            j.title = f.elements.title.value.trim(); j.salaryMin = Number(f.elements.min.value); j.salaryMax = Number(f.elements.max.value); j.modality = f.elements.modality.value; j.contract = f.elements.contract.value; j.description = f.elements.description.value.trim();
            WC.save(); draw(); WC.toast("Vacante actualizada.");
          }
        }]
      });
    }
    draw();
  };

  /* ===== P15 · Moderación ===== */
  WC.pages.p15 = function () {
    if (!WC.guard(["admin"], "Moderación de contenido")) return;
    var body = shell("P15", "Moderación", "Aprueba, oculta o elimina foros, comentarios, valoraciones y reportes.");
    var tab = "";
    var TYPES = [["", "Todo"], ["foro", "Foros"], ["comentario", "Comentarios"], ["valoración", "Valoraciones"], ["reporte", "Reportes"]];

    function items() {
      var out = [];
      S.threads.forEach(function (t) {
        out.push({ type: "foro", ref: t, list: S.threads, who: t.author, title: t.title, text: t.body, date: t.date });
        (t.replies || []).forEach(function (r) { out.push({ type: "comentario", ref: r, list: t.replies, who: r.author, title: "En «" + t.title + "»", text: r.text, date: r.date }); });
      });
      S.reviews.forEach(function (v) { var c = WC.company(v.companyId); out.push({ type: "valoración", ref: v, list: S.reviews, who: v.author, title: (c ? c.name : "Empresa") + " · " + v.rating + " de 5", text: v.text, date: v.date }); });
      S.reports.forEach(function (r) { out.push({ type: "reporte", ref: r, list: S.reports, who: r.reporter, title: r.target, text: r.reason, date: r.date }); });
      return out.sort(function (a, b) { var pa = a.ref.status === "pendiente" ? 0 : 1, pb = b.ref.status === "pendiente" ? 0 : 1; return pa - pb || (a.date < b.date ? 1 : -1); });
    }
    function draw() {
      var all = items(), list = all.filter(function (i) { return !tab || i.type === tab; });
      body.innerHTML = '<div class="tabs" role="tablist">' + TYPES.map(function (t) {
        var n = all.filter(function (i) { return (!t[0] || i.type === t[0]) && i.ref.status === "pendiente"; }).length;
        return '<button class="tab" role="tab" data-tab="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + (n ? " · " + n + " pend." : "") + "</button>";
      }).join("") + "</div>" + (list.length ? list.map(function (i, k) {
        var hidden = i.ref.status === "oculto", isRep = i.type === "reporte";
        return '<article class="mod-item' + (hidden ? " is-hidden" : "") + '"><div><div class="flex"><span class="chip">' + i.type + "</span>" + WC.badge(i.ref.status) + '</div><p class="mod-text">' + esc(i.text) + '</p><p class="small muted"><strong>' + esc(i.title) + "</strong> · " + esc(i.who) + " · " + WC.date(i.date) + '</p></div><div class="mod-actions"><button class="btn btn-ghost btn-sm" data-k="' + k + '" data-do="ok" type="button">' + (isRep ? "Desestimar" : "Aprobar") + '</button><button class="btn btn-ghost btn-sm" data-k="' + k + '" data-do="hide" type="button">' + (isRep ? "Ocultar contenido" : "Ocultar") + '</button><button class="btn btn-danger btn-sm" data-k="' + k + '" data-do="del" type="button">Eliminar</button></div></article>';
      }).join("") : '<div class="empty"><strong>Nada por moderar</strong>No hay contenido en esta categoría.</div>');
      $$("[data-tab]", body).forEach(function (b) { b.addEventListener("click", function () { tab = b.dataset.tab; draw(); }); });
      $$("[data-do]", body).forEach(function (b) {
        b.addEventListener("click", function () {
          var it = list[Number(b.dataset.k)], a = b.dataset.do;
          if (a === "del") {
            WC.confirm({ title: "Eliminar contenido", message: "Se eliminará de forma definitiva de la demostración. ¿Continuar?", ok: "Eliminar", danger: true }, function () {
              it.list.splice(it.list.indexOf(it.ref), 1); WC.save(); draw(); WC.toast("Contenido eliminado.");
            });
            return;
          }
          it.ref.status = a === "ok" ? "visible" : "oculto";
          WC.save(); draw();
          WC.toast(a === "ok" ? "Contenido aprobado." : "Contenido oculto del sitio público.");
        });
      });
    }
    draw();
  };
})();
