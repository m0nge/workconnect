/* WorkConnect — Módulo 1: portal público (P01 Inicio, P02 Resultados, P03 Detalle, P04 Recursos, P05 Foros) */

(function () {
  "use strict";
  var WC = window.WC, D = WC.D, $ = WC.$, $$ = WC.$$, esc = WC.esc, S = WC.state;

  WC.profile = function (user) {
    if (!S.profiles[user.email]) {
      S.profiles[user.email] = { name: user.name, headline: "", phone: "", dept: "", city: "", birth: "", summary: "", studies: [], experience: [], skills: [], cv: null, alerts: [] };
      WC.save();
    }
    return S.profiles[user.email];
  };

  function activeJobs() { return S.jobs.filter(function (j) { return j.status === "activa"; }); }
  function needLogin(msg) {
    WC.modal({
      title: "Inicia sesión para continuar", body: "<p>" + esc(msg) + "</p>",
      actions: [{ label: "Ahora no" }, { label: "Crear cuenta", cls: "btn-ghost", onClick: function () { location.href = "login.html?tab=registro"; } }, { label: "Iniciar sesión", cls: "btn-primary", onClick: function () { location.href = "login.html?next=" + encodeURIComponent(WC.file + location.search); } }]
    });
  }

  /* ===== P01 · Inicio ===== */
  WC.pages.p01 = function () {
    $("#f-loc").innerHTML = WC.options(D.DEPARTAMENTOS, "", "Todo El Salvador");
    $("#f-sal").innerHTML = WC.options([{ v: 400, t: "Desde $400" }, { v: 600, t: "Desde $600" }, { v: 900, t: "Desde $900" }, { v: 1200, t: "Desde $1,200" }], "", "Cualquiera");
    $("#f-exp").innerHTML = WC.options(D.EXPERIENCIAS, "", "Cualquiera");
    $("#f-con").innerHTML = WC.options(D.CONTRATOS, "", "Cualquiera");
    var toggle = $("#adv-toggle"), panel = $("#adv-panel");
    toggle.addEventListener("click", function () {
      var hide = panel.classList.toggle("hidden");
      toggle.setAttribute("aria-expanded", !hide);
      toggle.textContent = hide ? "Mostrar filtros avanzados" : "Ocultar filtros avanzados";
    });
    $("#search-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target, p = new URLSearchParams();
      ["q", "loc", "sal", "exp", "con"].forEach(function (n) { if (f.elements[n].value.trim()) p.set(n, f.elements[n].value.trim()); });
      location.href = "resultados.html" + (p.toString() ? "?" + p : "");
    });
    $("#sector-links").innerHTML = ["Tecnología", "Finanzas", "Logística", "Salud", "Comercio"].map(function (s) { return '<a href="resultados.html?sector=' + encodeURIComponent(s) + '">' + s + "</a>"; }).join("");

    var m = [
      [activeJobs().length, "Vacantes activas"],
      [S.companies.filter(function (c) { return c.status === "Verificada"; }).length, "Empresas verificadas"],
      [S.users.filter(function (u) { return u.role === "candidato"; }).length, "Candidatos registrados"],
      [S.applications.length, "Postulaciones enviadas"]
    ];
    $("#metrics").innerHTML = m.map(function (x) { return '<div class="metric"><b>' + x[0] + "</b><span>" + x[1] + "</span></div>"; }).join("");
    var feat = activeJobs().filter(function (j) { return j.featured; }).slice(0, 6);
    $("#featured-jobs").innerHTML = feat.map(function (j) { return WC.jobCard(j); }).join("");
  };

  /* ===== P02 · Resultados ===== */
  WC.pages.p02 = function () {
    var form = $("#filters");
    form.elements.loc.innerHTML = WC.options(D.DEPARTAMENTOS, "", "Todo el país");
    form.elements.exp.innerHTML = WC.options(D.EXPERIENCIAS, "", "Cualquiera");
    form.elements.sal.innerHTML = WC.options([{ v: 400, t: "Desde $400" }, { v: 600, t: "Desde $600" }, { v: 900, t: "Desde $900" }, { v: 1200, t: "Desde $1,200" }], "", "Cualquiera");
    form.elements.sector.innerHTML = WC.options(D.SECTORES, "", "Todos los sectores");
    form.elements.modality.innerHTML = WC.options(D.MODALIDADES, "", "Todas");
    form.elements.contract.innerHTML = WC.options(D.CONTRATOS, "", "Todos");
    ["q", "loc", "exp", "sal", "sector", "modality", "contract"].forEach(function (n) {
      var v = WC.qs.get(n === "modality" ? "mod" : n === "contract" ? "con" : n);
      if (v) form.elements[n].value = v;
    });
    var LABEL = { q: "Palabra", loc: "Ubicación", exp: "Experiencia", sal: "Salario", sector: "Sector", modality: "Modalidad", contract: "Contrato" };

    function values() {
      var o = {};
      Object.keys(LABEL).forEach(function (n) { o[n] = form.elements[n].value.trim(); });
      return o;
    }
    function render() {
      var f = values(), q = f.q.toLowerCase();
      var list = activeJobs().filter(function (j) {
        var c = WC.company(j.companyId);
        if (q && (j.title + " " + (c ? c.name : "") + " " + j.sector + " " + j.description + " " + j.city).toLowerCase().indexOf(q) < 0) return false;
        if (f.loc && j.dept !== f.loc) return false;
        if (f.exp !== "" && j.exp !== Number(f.exp)) return false;
        if (f.sal && j.salaryMax < Number(f.sal)) return false;
        if (f.sector && j.sector !== f.sector) return false;
        if (f.modality && j.modality !== f.modality) return false;
        if (f.contract && j.contract !== f.contract) return false;
        return true;
      });
      var sort = $("#sort").value;
      list.sort(function (a, b) {
        if (sort === "sal") return b.salaryMax - a.salaryMax;
        return a.posted < b.posted ? 1 : -1;
      });
      $("#count").textContent = list.length + (list.length === 1 ? " vacante encontrada" : " vacantes encontradas");
      $("#results").innerHTML = list.length ? list.map(function (j) { return WC.jobCard(j, true); }).join("") : '<div class="empty"><strong>No encontramos vacantes con esos filtros</strong>Prueba quitando algún filtro o buscando otra palabra clave.<div style="margin-top:16px"><button class="btn btn-dark btn-sm" type="button" id="empty-clear">Limpiar filtros</button></div></div>';
      var ec = $("#empty-clear");
      if (ec) ec.addEventListener("click", clear);
      var chips = Object.keys(f).filter(function (n) { return f[n] !== ""; }).map(function (n) {
        var val = f[n];
        if (n === "exp") val = WC.expLabel(val);
        if (n === "sal") val = "Desde $" + Number(val).toLocaleString("en-US");
        return '<span class="chip">' + LABEL[n] + ": " + esc(val) + '<button type="button" data-clear="' + n + '" aria-label="Quitar filtro ' + LABEL[n] + '">×</button></span>';
      });
      $("#active-filters").innerHTML = chips.join("");
      $$("[data-clear]").forEach(function (b) { b.addEventListener("click", function () { form.elements[b.dataset.clear].value = ""; render(); }); });
      try {
        var p = new URLSearchParams();
        Object.keys(f).forEach(function (n) { if (f[n]) p.set(n === "modality" ? "mod" : n === "contract" ? "con" : n, f[n]); });
        history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
      } catch (e) { /* abierto como archivo local */ }
    }
    function clear() { form.reset(); Object.keys(LABEL).forEach(function (n) { form.elements[n].value = ""; }); render(); }
    form.addEventListener("input", render);
    form.addEventListener("submit", function (e) { e.preventDefault(); render(); });
    $("#clear-filters").addEventListener("click", clear);
    $("#sort").addEventListener("change", render);
    render();
  };

  /* ===== P03 · Detalle del empleo ===== */
  WC.pages.p03 = function () {
    var j = WC.job(WC.qs.get("id"));
    var root = $("#job-view");
    if (!j) {
      root.innerHTML = '<div class="empty"><strong>Esta vacante no existe</strong>Puede que el enlace sea incorrecto.<div style="margin-top:16px"><a class="btn btn-dark btn-sm" href="resultados.html">Ver todas las vacantes</a></div></div>';
      return;
    }
    document.title = j.title + " · WorkConnect";
    var c = WC.company(j.companyId);
    var rt = WC.rating(c.id);
    var available = j.status === "activa";

    function reviewsHTML() {
      var list = S.reviews.filter(function (r) { return r.companyId === c.id && r.status === "visible"; });
      return list.length ? list.map(function (r) {
        return '<div class="review"><div class="review-head"><strong>' + esc(r.author) + "</strong>" + WC.stars(r.rating) + '</div><p>' + esc(r.text) + '</p><div class="small muted" style="margin-top:6px">' + WC.date(r.date) + "</div></div>";
      }).join("") : '<p class="muted">Aún no hay valoraciones publicadas para esta empresa.</p>';
    }
    function bullets(a) { return '<ul class="bullets">' + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
    var similar = activeJobs().filter(function (x) { return x.id !== j.id && (x.sector === j.sector || x.dept === j.dept); }).slice(0, 3);

    root.innerHTML =
      '<div class="detail-layout"><div>' +
      '<a class="small link" href="resultados.html">← Volver a resultados</a>' +
      '<div class="detail-head" style="margin-top:20px">' + WC.logo(c, true) + "<div><span class=\"eyebrow\">" + esc(j.sector) + "</span><h1 style=\"margin-top:8px\">" + esc(j.title) + '</h1><p class="muted" style="margin-top:6px">' + esc(c.name) + " · " + esc(j.city) + ", " + esc(j.dept) + "</p></div></div>" +
      '<div class="chips" style="margin-top:20px"><span class="chip">' + esc(j.modality) + '</span><span class="chip">' + esc(j.contract) + '</span><span class="chip">' + esc(WC.expLabel(j.exp)) + '</span><span class="chip">Publicada el ' + WC.date(j.posted) + "</span>" + (available ? "" : WC.badge(j.status)) + "</div>" +
      (available ? "" : '<div class="form-alert" style="margin-top:20px">Esta vacante no está disponible para postulaciones en este momento.</div>') +
      '<section class="detail-block"><h2>Descripción del puesto</h2><p>' + esc(j.description) + "</p></section>" +
      '<section class="detail-block"><h2>Funciones</h2>' + bullets(j.functions) + "</section>" +
      '<section class="detail-block"><h2>Requisitos</h2>' + bullets(j.requirements) + "</section>" +
      '<section class="detail-block"><h2>Beneficios</h2>' + bullets(j.benefits) + "</section>" +
      '<section class="detail-block" id="reviews"><div class="card-head"><h2>Valoraciones de ' + esc(c.name) + '</h2><button class="btn btn-ghost btn-sm" type="button" id="review-btn">Escribir valoración</button></div>' +
      '<div class="flex" style="margin-bottom:8px"><span class="rating-big">' + (rt.n ? rt.avg.toFixed(1) : "–") + "</span><div>" + WC.stars(rt.avg) + '<div class="small muted">' + rt.n + " valoraciones publicadas</div></div></div><div id=\"review-list\">" + reviewsHTML() + "</div></section>" +
      '</div><aside class="side-sticky">' +
      '<div class="card"><div class="salary" style="font-size:1.4rem">' + WC.salary(j) + ' <small>/ mes</small></div><p class="small muted" style="margin:6px 0 18px">' + j.vacancies + ' plaza(s) · ' + esc(j.contract) + '</p><button class="btn btn-primary btn-block" type="button" id="apply-btn"' + (available ? "" : " disabled") + ">Aplicar a esta vacante</button>" +
      '<button class="btn btn-ghost btn-block btn-sm" type="button" id="report-btn" style="margin-top:10px">Reportar vacante</button></div>' +
      '<div class="card"><h3>Sobre la empresa</h3><div class="flex" style="flex-wrap:nowrap;margin-bottom:12px">' + WC.logo(c) + "<div><strong>" + esc(c.name) + '</strong><div class="small muted">' + esc(c.sector) + "</div></div></div>" +
      '<p class="small" style="margin-bottom:14px">' + esc(c.desc) + '</p><dl class="kv" style="grid-template-columns:90px 1fr"><dt>Ubicación</dt><dd>' + esc(c.city) + ", " + esc(c.dept) + "</dd><dt>Tamaño</dt><dd>" + esc(c.size) + "</dd><dt>Estado</dt><dd>" + WC.badge(c.status) + "</dd></dl></div>" +
      (similar.length ? '<div class="card"><h3>Vacantes similares</h3>' + similar.map(function (s) { return '<p style="margin-bottom:10px"><a class="link" href="detalle-empleo.html?id=' + s.id + '">' + esc(s.title) + '</a><br><span class="small muted">' + esc(WC.company(s.companyId).name) + " · " + WC.salary(s) + "</span></p>"; }).join("") + "</div>" : "") +
      "</aside></div>";

    $("#apply-btn").addEventListener("click", function () {
      var u = WC.user();
      if (!u) return needLogin("Necesitas una cuenta de candidato para postularte a esta vacante.");
      if (u.role !== "candidato") return WC.toast("Solo las cuentas de candidato pueden postularse.", "err");
      var already = S.applications.some(function (a) { return a.jobId === j.id && a.email === u.email; });
      if (already) return WC.toast("Ya te postulaste a esta vacante. Revisa su estado en tu perfil.", "err");
      var p = WC.profile(u);
      WC.modal({
        title: "Postular a " + j.title,
        body: '<form id="apply-form" novalidate class="stack"><p class="muted small">Se enviará tu perfil a ' + esc(c.name) + ". " + (p.cv ? "CV adjunto: <strong>" + esc(p.cv.name) + "</strong>." : '<strong>Aún no has cargado un currículum.</strong> Puedes hacerlo desde <a class="link" href="candidato.html">tu perfil</a>.') + "</p>" +
          WC.field({ name: "msg", type: "textarea", label: "Mensaje para el reclutador", req: true, rows: 5, hint: "Cuéntale por qué eres buen candidato (mínimo 30 caracteres)." }) +
          '<div class="field"><label class="check"><input type="checkbox" name="ok"> <span>Confirmo que la información de mi perfil es veraz y autorizo su envío.</span></label><span class="err-msg" role="alert"></span></div></form>',
        actions: [{ label: "Cancelar" }, {
          label: "Enviar postulación", cls: "btn-primary", onClick: function (m) {
            var form = $("#apply-form", m.el);
            if (!WC.validate(form, [["msg", WC.rules.minLen(30, "Escribe un mensaje de al menos 30 caracteres.")], ["ok", function (v) { return v ? "" : "Debes confirmar para continuar."; }]])) return false;
            S.applications.push({ id: WC.uid("a"), jobId: j.id, name: p.name || u.name, email: u.email, headline: p.headline || "Candidato/a", city: [p.city, p.dept].filter(Boolean).join(", ") || "El Salvador", exp: p.experience.length ? p.experience.length + " puesto(s)" : "Sin registrar", skills: p.skills.slice(0, 5), summary: form.elements.msg.value.trim(), status: "Nueva", date: WC.today() });
            WC.save();
            WC.toast("Postulación enviada. Puedes seguir su estado en tu perfil.");
          }
        }]
      });
    });

    $("#report-btn").addEventListener("click", function () {
      var u = WC.user();
      if (!u) return needLogin("Inicia sesión para reportar una vacante.");
      WC.modal({
        title: "Reportar vacante", body: '<form id="rep-form" novalidate>' + WC.field({ name: "reason", type: "textarea", label: "Motivo del reporte", req: true, rows: 4 }) + "</form>",
        actions: [{ label: "Cancelar" }, {
          label: "Enviar reporte", cls: "btn-primary", onClick: function (m) {
            var f = $("#rep-form", m.el);
            if (!WC.validate(f, [["reason", WC.rules.minLen(15, "Describe el motivo con al menos 15 caracteres.")]])) return false;
            S.reports.push({ id: WC.uid("rp"), reporter: u.name, target: "Vacante: " + j.title + " (" + c.name + ")", reason: f.elements.reason.value.trim(), date: WC.today(), status: "pendiente" });
            WC.save();
            WC.toast("Reporte enviado al equipo de moderación.");
          }
        }]
      });
    });

    $("#review-btn").addEventListener("click", function () {
      var u = WC.user();
      if (!u) return needLogin("Inicia sesión para valorar a esta empresa.");
      if (u.role !== "candidato") return WC.toast("Solo los candidatos pueden valorar empresas.", "err");
      WC.modal({
        title: "Valorar a " + c.name,
        body: '<form id="rev-form" novalidate class="stack">' + WC.field({ name: "rating", type: "select", label: "Calificación", req: true, options: [{ v: 5, t: "5 · Excelente" }, { v: 4, t: "4 · Muy buena" }, { v: 3, t: "3 · Regular" }, { v: 2, t: "2 · Mala" }, { v: 1, t: "1 · Muy mala" }], placeholder: "Selecciona" }) + WC.field({ name: "text", type: "textarea", label: "Tu experiencia", req: true, hint: "Mínimo 20 caracteres. Evita datos personales de terceros." }) + "</form>",
        actions: [{ label: "Cancelar" }, {
          label: "Publicar valoración", cls: "btn-primary", onClick: function (m) {
            var f = $("#rev-form", m.el);
            if (!WC.validate(f, [["rating", WC.rules.req("Elige una calificación.")], ["text", WC.rules.minLen(20, "Cuéntanos un poco más (mínimo 20 caracteres).")]])) return false;
            S.reviews.push({ id: WC.uid("v"), companyId: c.id, by: u.email, author: u.name.split(" ")[0] + " " + (u.name.split(" ")[1] || " ")[0] + ".", rating: Number(f.elements.rating.value), text: f.elements.text.value.trim(), date: WC.today(), status: "pendiente" });
            WC.save();
            WC.toast("Gracias. Tu valoración se publicará cuando sea aprobada por moderación.");
          }
        }]
      });
    });
  };

  /* ===== P04 · Recursos ===== */
  var CV_TEMPLATE = "NOMBRE APELLIDO\nCorreo: nombre@correo.com · Teléfono: 7000-0000 · San Salvador, El Salvador\n\nRESUMEN PROFESIONAL\n[Tres líneas: quién eres, tu especialidad y qué buscas.]\n\nEXPERIENCIA\nPuesto — Empresa (Mes año – Mes año)\n- Logro medible con verbo de acción.\n- Logro medible con verbo de acción.\n\nESTUDIOS\nTítulo — Institución (Año)\n\nHABILIDADES\n[Herramientas, idiomas y habilidades clave]\n\nREFERENCIAS\nDisponibles a solicitud.\n";

  WC.pages.p04 = function () {
    var type = "Todos";
    var types = ["Todos", "Artículo", "Consejo", "Tutorial", "Noticia"];
    function renderTabs() {
      $("#res-tabs").innerHTML = types.map(function (t) {
        var n = t === "Todos" ? D.articles.length : D.articles.filter(function (a) { return a.type === t; }).length;
        return '<button class="tab" role="tab" aria-selected="' + (t === type) + '" data-t="' + t + '">' + (t === "Todos" ? t : t + "s") + '<span class="n">' + n + "</span></button>";
      }).join("");
      $$("#res-tabs .tab").forEach(function (b) { b.addEventListener("click", function () { type = b.dataset.t; renderTabs(); renderCards(); }); });
    }
    function renderCards() {
      var list = D.articles.filter(function (a) { return type === "Todos" || a.type === type; });
      $("#res-grid").innerHTML = list.map(function (a) {
        return '<button class="res-card" type="button" data-id="' + a.id + '"><span class="badge b-wait" style="align-self:flex-start">' + a.type + "</span><h3>" + esc(a.title) + "</h3><p>" + esc(a.summary) + '</p><div class="res-meta"><span>Lectura de ' + a.read + '</span><span class="link">Leer →</span></div></button>';
      }).join("");
      $$(".res-card").forEach(function (b) {
        b.addEventListener("click", function () {
          var a = D.articles.filter(function (x) { return x.id === b.dataset.id; })[0];
          WC.modal({ title: a.title, size: "lg", body: '<span class="badge b-wait" style="margin-bottom:14px">' + a.type + " · " + a.read + '</span><div class="article-body">' + a.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>", actions: [{ label: "Cerrar", cls: "btn-dark" }] });
        });
      });
    }
    renderTabs();
    renderCards();

    function renderChecklist() {
      var done = S.checks.interview || [];
      $("#tips").innerHTML = D.interviewTips.map(function (t, i) {
        return '<li><label class="check"><input type="checkbox" data-i="' + i + '"' + (done.indexOf(i) >= 0 ? " checked" : "") + "> <span>" + esc(t) + "</span></label></li>";
      }).join("");
      var pct = Math.round((done.length / D.interviewTips.length) * 100);
      $("#tips-progress").style.width = pct + "%";
      $("#tips-label").textContent = done.length + " de " + D.interviewTips.length + " pasos listos";
      $$("#tips input").forEach(function (cb) {
        cb.addEventListener("change", function () {
          var arr = S.checks.interview || [], i = Number(cb.dataset.i);
          S.checks.interview = cb.checked ? arr.concat([i]) : arr.filter(function (x) { return x !== i; });
          WC.save();
          renderChecklist();
        });
      });
    }
    renderChecklist();
    $("#cv-download").addEventListener("click", function () { WC.download("Plantilla_CV_WorkConnect.txt", CV_TEMPLATE); WC.toast("Plantilla de currículum descargada."); });
  };

  /* ===== P05 · Foros ===== */
  WC.pages.p05 = function () {
    var cat = "todas";
    function visible(t) { return t.status === "visible"; }
    function renderCats() {
      var all = S.threads.filter(visible);
      var items = [{ id: "todas", name: "Todas las categorías" }].concat(D.forumCats);
      $("#cats").innerHTML = items.map(function (c) {
        var n = c.id === "todas" ? all.length : all.filter(function (t) { return t.cat === c.id; }).length;
        return '<button class="cat-btn" type="button" data-c="' + c.id + '" aria-pressed="' + (c.id === cat) + '"><span>' + esc(c.name) + '</span><span class="n">' + n + "</span></button>";
      }).join("");
      $$(".cat-btn").forEach(function (b) { b.addEventListener("click", function () { cat = b.dataset.c; renderCats(); renderThreads(); }); });
    }
    function catName(id) { return D.forumCats.filter(function (c) { return c.id === id; })[0].name; }
    function renderThreads() {
      var list = S.threads.filter(function (t) { return visible(t) && (cat === "todas" || t.cat === cat); }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      $("#threads").innerHTML = list.length ? list.map(function (t) {
        var n = t.replies.filter(visible).length;
        return '<article class="thread"><div class="avatar">' + esc(WC.initials(t.author)) + '</div><div><h3><button type="button" data-t="' + t.id + '">' + esc(t.title) + '</button></h3><div class="thread-meta">' + esc(t.author) + " · " + WC.date(t.date) + " · " + esc(catName(t.cat)) + " · " + n + (n === 1 ? " respuesta" : " respuestas") + "</div></div></article>";
      }).join("") : '<div class="empty"><strong>Aún no hay temas en esta categoría</strong>Sé la primera persona en abrir uno.</div>';
      $$("#threads [data-t]").forEach(function (b) { b.addEventListener("click", function () { openThread(b.dataset.t); }); });
    }
    function openThread(id) {
      var t = S.threads.filter(function (x) { return x.id === id; })[0];
      function body() {
        var rs = t.replies.filter(visible);
        return '<p class="thread-meta" style="margin:0 0 12px">' + esc(t.author) + " · " + WC.date(t.date) + " · " + esc(catName(t.cat)) + "</p><p>" + esc(t.body) + '</p><h3 style="margin:24px 0 4px">' + rs.length + " respuesta(s)</h3>" +
          rs.map(function (r) { return '<div class="reply"><div class="avatar">' + esc(WC.initials(r.author)) + '</div><div><strong>' + esc(r.author) + ' <span class="small muted" style="font-weight:400">· ' + WC.date(r.date) + "</span></strong><p>" + esc(r.text) + "</p></div></div>"; }).join("") +
          '<form id="reply-form" novalidate style="margin-top:12px;border-top:1px solid var(--sand);padding-top:18px">' + WC.field({ name: "text", type: "textarea", label: "Tu respuesta", rows: 3 }) + '<div class="flex" style="margin-top:12px"><button class="btn btn-primary btn-sm" type="submit">Responder</button><button class="btn btn-ghost btn-sm" type="button" id="rep-thread">Reportar tema</button></div></form>';
      }
      var m = WC.modal({ title: t.title, size: "lg", body: body(), actions: [{ label: "Cerrar", cls: "btn-dark" }] });
      function bind() {
        $("#reply-form", m.el).addEventListener("submit", function (e) {
          e.preventDefault();
          var u = WC.user();
          if (!u) { WC.toast("Inicia sesión para responder.", "err"); return; }
          if (!WC.validate(e.target, [["text", WC.rules.minLen(5, "Escribe una respuesta de al menos 5 caracteres.")]])) return;
          t.replies.push({ id: WC.uid("r"), author: u.name, text: e.target.elements.text.value.trim(), date: WC.today(), status: "visible" });
          WC.save();
          m.body.innerHTML = body();
          bind();
          renderThreads();
          renderCats();
          WC.toast("Respuesta publicada.");
        });
        $("#rep-thread", m.el).addEventListener("click", function () {
          var u = WC.user();
          if (!u) { WC.toast("Inicia sesión para reportar contenido.", "err"); return; }
          S.reports.push({ id: WC.uid("rp"), reporter: u.name, target: "Foro: " + t.title, reason: "Contenido reportado por un usuario.", date: WC.today(), status: "pendiente" });
          WC.save();
          WC.toast("Reporte enviado a moderación.");
        });
      }
      bind();
    }
    $("#new-thread").addEventListener("click", function () {
      var u = WC.user();
      if (!u) return needLogin("Para crear un tema necesitas iniciar sesión.");
      WC.modal({
        title: "Nuevo tema", size: "lg",
        body: '<form id="thread-form" novalidate class="stack">' + WC.field({ name: "cat", type: "select", label: "Categoría", req: true, options: D.forumCats.map(function (c) { return { v: c.id, t: c.name }; }), value: cat === "todas" ? "" : cat }) + WC.field({ name: "title", label: "Título", req: true, placeholder: "Resume tu pregunta o tema" }) + WC.field({ name: "body", type: "textarea", label: "Mensaje", req: true, rows: 5 }) + "</form>",
        actions: [{ label: "Cancelar" }, {
          label: "Publicar tema", cls: "btn-primary", onClick: function (m) {
            var f = $("#thread-form", m.el);
            if (!WC.validate(f, [["cat", WC.rules.req("Elige una categoría.")], ["title", WC.rules.minLen(10, "El título debe tener al menos 10 caracteres.")], ["body", WC.rules.minLen(20, "Describe tu tema con al menos 20 caracteres.")]])) return false;
            S.threads.push({ id: WC.uid("t"), cat: f.elements.cat.value, title: f.elements.title.value.trim(), author: u.name, body: f.elements.body.value.trim(), date: WC.today(), status: "visible", replies: [] });
            WC.save();
            renderCats();
            renderThreads();
            WC.toast("Tu tema fue publicado.");
          }
        }]
      });
    });
    renderCats();
    renderThreads();
  };
})();
