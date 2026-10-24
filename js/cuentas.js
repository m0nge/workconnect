/* WorkConnect — Módulo 2: candidatos y empresas
   P06 Acceso · P07 Perfil del candidato · P08 Gestión empresarial · P09 Publicar vacante · P10 Postulaciones */

(function () {
  "use strict";
  var WC = window.WC, D = WC.D, $ = WC.$, $$ = WC.$$, esc = WC.esc, S = WC.state;
  var R = WC.rules;

  function head(id, label, title, text, extra) {
    return '<div class="page-head"><span class="eyebrow"><span class="p">' + id + "</span>" + label + "</span><h1>" + title + "</h1><p>" + text + "</p>" + (extra || "") + "</div>";
  }

  /* ===== P06 · Registro e inicio de sesión ===== */
  WC.pages.p06 = function () {
    var tab = WC.qs.get("tab") === "registro" ? "registro" : "ingresar";
    var role = WC.qs.get("rol") === "empresa" ? "empresa" : "candidato";
    var box = $("#auth-forms");

    function render() {
      box.innerHTML =
        '<div class="tabs" role="tablist"><button class="tab" role="tab" data-tab="ingresar" aria-selected="' + (tab === "ingresar") + '">Iniciar sesión</button><button class="tab" role="tab" data-tab="registro" aria-selected="' + (tab === "registro") + '">Crear cuenta</button></div>' +
        (tab === "ingresar" ? loginHTML() : registerHTML());
      $$("[data-tab]", box).forEach(function (b) { b.addEventListener("click", function () { tab = b.dataset.tab; render(); }); });
      if (tab === "ingresar") bindLogin(); else bindRegister();
    }

    function loginHTML() {
      return '<form id="login-form" novalidate class="stack"><div id="login-alert" class="form-alert" role="alert"></div>' +
        WC.field({ name: "email", type: "email", label: "Correo electrónico", req: true, autocomplete: "username", placeholder: "nombre@correo.com" }) +
        WC.field({ name: "pass", type: "password", label: "Contraseña", req: true, autocomplete: "current-password" }) +
        '<button class="btn btn-primary btn-block" type="submit">Iniciar sesión</button>' +
        '<p class="small muted">¿Aún no tienes cuenta? <button class="link" type="button" data-tab="registro">Regístrate</button></p></form>';
    }
    function bindLogin() {
      $$("[data-tab]", $("#login-form")).forEach(function (b) { b.addEventListener("click", function () { tab = "registro"; render(); }); });
      $("#login-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target, alertBox = $("#login-alert");
        alertBox.textContent = "";
        if (!WC.validate(f, [["email", R.email], ["pass", R.req("Ingresa tu contraseña.")]])) return;
        var email = f.elements.email.value.trim().toLowerCase();
        var u = S.users.filter(function (x) { return x.email.toLowerCase() === email && x.pass === f.elements.pass.value; })[0];
        if (!u) { alertBox.textContent = "Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo."; return; }
        if (u.status !== "activo") { alertBox.textContent = "Tu cuenta está desactivada. Contacta a un administrador para reactivarla."; return; }
        WC.signIn(u);
      });
    }

    function registerHTML() {
      var emp = role === "empresa";
      return '<form id="reg-form" novalidate class="stack"><div class="field"><span class="lbl">Quiero registrarme como</span><div class="role-pick"><button type="button" class="role-opt" data-role="candidato" aria-pressed="' + !emp + '"><strong>Candidato/a</strong><span>Busco empleo</span></button><button type="button" class="role-opt" data-role="empresa" aria-pressed="' + emp + '"><strong>Empresa</strong><span>Quiero contratar</span></button></div></div>' +
        WC.field({ name: "name", label: emp ? "Nombre de la empresa" : "Nombre completo", req: true, autocomplete: emp ? "organization" : "name" }) +
        (emp ? WC.field({ name: "sector", type: "select", label: "Sector", req: true, options: D.SECTORES }) : "") +
        WC.field({ name: "email", type: "email", label: "Correo electrónico", req: true, autocomplete: "email", placeholder: "nombre@correo.com" }) +
        '<div class="form-grid">' + WC.field({ name: "pass", type: "password", label: "Contraseña", req: true, autocomplete: "new-password", hint: "Mínimo 8 caracteres, con letras y números." }) + WC.field({ name: "pass2", type: "password", label: "Confirmar contraseña", req: true, autocomplete: "new-password" }) + "</div>" +
        '<div class="field"><label class="check"><input type="checkbox" name="terms"> <span>Acepto los términos de uso y la política de privacidad del portal.</span></label><span class="err-msg" role="alert"></span></div>' +
        '<button class="btn btn-primary btn-block" type="submit">Crear cuenta</button>' +
        '<p class="small muted">¿Ya tienes cuenta? <button class="link" type="button" data-tab="ingresar">Inicia sesión</button></p></form>';
    }
    function bindRegister() {
      var form = $("#reg-form");
      $$("[data-role]", form).forEach(function (b) { b.addEventListener("click", function () { role = b.dataset.role; render(); }); });
      $$("[data-tab]", form).forEach(function (b) { b.addEventListener("click", function () { tab = "ingresar"; render(); }); });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var emp = role === "empresa";
        var ok = WC.validate(form, [
          ["name", R.minLen(3, emp ? "Escribe el nombre de la empresa." : "Escribe tu nombre completo (mínimo 3 caracteres).")],
          ["sector", function (v) { return !emp || v ? "" : "Selecciona un sector."; }],
          ["email", function (v) {
            var m = R.email(v);
            if (m) return m;
            return S.users.some(function (x) { return x.email.toLowerCase() === v.toLowerCase(); }) ? "Ya existe una cuenta con este correo." : "";
          }],
          ["pass", R.pass],
          ["pass2", function (v, f) { return v === f.elements.pass.value ? "" : "Las contraseñas no coinciden."; }],
          ["terms", function (v) { return v ? "" : "Debes aceptar los términos para continuar."; }]
        ]);
        if (!ok) return;
        var user = { id: WC.uid("u"), name: form.elements.name.value.trim(), email: form.elements.email.value.trim().toLowerCase(), pass: form.elements.pass.value, role: role, status: "activo", created: WC.today() };
        if (emp) {
          var c = { id: WC.uid("c"), name: user.name, sector: form.elements.sector.value, dept: "", city: "", size: "", web: "", email: user.email, phone: "", status: "Pendiente", logo: "", desc: "" };
          S.companies.push(c);
          user.companyId = c.id;
        }
        S.users.push(user);
        WC.save();
        WC.signIn(user);
      });
    }

    $$("[data-demo-login]").forEach(function (b) { b.addEventListener("click", function () { WC.demoLogin(b.dataset.demoLogin); }); });
    render();
  };

  /* ===== P07 · Perfil del candidato ===== */
  WC.pages.p07 = function () {
    if (!WC.guard(["candidato"], "Perfil del candidato")) return;
    var u = WC.user(), p = WC.profile(u), root = $("#main");

    function myApps() { return S.applications.filter(function (a) { return a.email === u.email; }); }
    function completeness() {
      var checks = [p.name, p.headline, p.phone, p.dept && p.city, p.summary, p.studies.length, p.experience.length, p.skills.length >= 3, p.cv, p.alerts.length];
      return checks.filter(Boolean).length * 10;
    }
    function list(items, kind) {
      if (!items.length) return '<p class="muted small">Aún no has agregado información aquí.</p>';
      return '<ul class="item-list">' + items.map(function (i) {
        return '<li><div><b>' + esc(i.title) + '</b><div class="small muted">' + esc(i.place) + " · " + esc(i.period) + "</div>" + (i.desc ? '<div class="small" style="margin-top:4px">' + esc(i.desc) + "</div>" : "") + '</div><button class="btn btn-ghost btn-sm" type="button" data-act="del-' + kind + '" data-id="' + i.id + '" aria-label="Eliminar ' + esc(i.title) + '">Quitar</button></li>';
      }).join("") + "</ul>";
    }

    function render() {
      var apps = myApps().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      var pct = completeness();
      var inProcess = apps.filter(function (a) { return a.status === "En revisión" || a.status === "Entrevista"; }).length;
      var myReviews = S.reviews.filter(function (r) { return r.by === u.email; });
      root.innerHTML = '<div class="wrap"><div class="page-head" style="padding-bottom:0"><span class="eyebrow"><span class="p">P07</span>Perfil del candidato</span></div>' +
        '<div class="card" style="margin-top:20px"><div class="profile-head"><div class="avatar lg wine">' + esc(WC.initials(p.name || u.name)) + '</div><div style="flex:1;min-width:240px"><h1 style="font-size:2rem">' + esc(p.name || u.name) + '</h1><p class="muted">' + esc(p.headline || "Agrega un titular profesional") + " · " + esc([p.city, p.dept].filter(Boolean).join(", ") || "Ubicación sin definir") + '</p><div class="flex" style="margin-top:12px;flex-wrap:nowrap"><div class="progress" style="flex:1;max-width:280px" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + pct + '%"></span></div><span class="small"><strong>' + pct + '%</strong> del perfil completo</span></div></div><button class="btn btn-dark" type="button" data-act="edit-profile">Editar datos</button></div></div>' +
        '<div class="stat-row"><div class="stat"><b>' + pct + '%</b><span>Perfil completo</span></div><div class="stat"><b>' + apps.length + '</b><span>Postulaciones enviadas</span></div><div class="stat"><b>' + inProcess + '</b><span>En proceso (revisión o entrevista)</span></div><div class="stat"><b>' + p.alerts.filter(function (a) { return a.active; }).length + '</b><span>Alertas activas</span></div></div>' +
        '<div class="profile-grid"><div class="stack">' +
        '<section class="card"><div class="card-head"><h3>Información personal</h3></div><dl class="kv"><dt>Correo</dt><dd>' + esc(u.email) + "</dd><dt>Teléfono</dt><dd>" + esc(p.phone || "—") + "</dd><dt>Ubicación</dt><dd>" + esc([p.city, p.dept].filter(Boolean).join(", ") || "—") + "</dd><dt>Nacimiento</dt><dd>" + (p.birth ? WC.date(p.birth) : "—") + "</dd><dt>Resumen</dt><dd>" + esc(p.summary || "—") + "</dd></dl></section>" +
        '<section class="card"><div class="card-head"><h3>Estudios</h3><button class="btn btn-ghost btn-sm" type="button" data-act="add-study">Agregar</button></div>' + list(p.studies, "study") + "</section>" +
        '<section class="card"><div class="card-head"><h3>Experiencia laboral</h3><button class="btn btn-ghost btn-sm" type="button" data-act="add-exp">Agregar</button></div>' + list(p.experience, "exp") + "</section>" +
        '<section class="card"><div class="card-head"><h3>Habilidades</h3></div><div class="chips" style="margin-bottom:14px">' + (p.skills.length ? p.skills.map(function (s, i) { return '<span class="chip">' + esc(s) + '<button type="button" data-act="del-skill" data-i="' + i + '" aria-label="Quitar ' + esc(s) + '">×</button></span>'; }).join("") : '<span class="muted small">Agrega al menos 3 habilidades.</span>') + '</div><form id="skill-form" class="flex" style="flex-wrap:nowrap" novalidate><div class="field" style="flex:1"><label class="sr-only" for="f-skill">Nueva habilidad</label><input id="f-skill" name="skill" type="text" placeholder="Ej. Excel avanzado" maxlength="40"><span class="err-msg" role="alert"></span></div><button class="btn btn-dark" type="submit" style="align-self:flex-start">Añadir</button></form></section>' +
        '</div><div class="stack">' +
        '<section class="card"><div class="card-head"><h3>Currículum</h3></div>' + (p.cv ? '<div class="upload has-file"><div><strong>' + esc(p.cv.name) + '</strong><div class="small muted">' + Math.max(1, Math.round(p.cv.size / 1024)) + ' KB · cargado</div></div><div class="flex"><label class="btn btn-ghost btn-sm" style="cursor:pointer">Reemplazar<input type="file" class="sr-only" data-act="cv" accept=".pdf,.docx"></label><button class="btn btn-danger btn-sm" type="button" data-act="del-cv">Quitar</button></div></div>' : '<label class="upload" style="display:block;cursor:pointer"><strong>Sube tu currículum</strong><div class="small muted" style="margin:4px 0 12px">PDF o DOCX · máximo 5 MB</div><span class="btn btn-dark btn-sm">Seleccionar archivo</span><input type="file" class="sr-only" data-act="cv" accept=".pdf,.docx"></label>') + '<p class="hint" style="margin-top:8px">Carga simulada: el archivo no sale de tu navegador, solo se guarda su nombre.</p></section>' +
        '<section class="card"><div class="card-head"><h3>Historial de postulaciones</h3><a class="btn btn-ghost btn-sm" href="resultados.html">Buscar más</a></div>' +
        (apps.length ? '<div class="table-wrap" style="border:0"><table><thead><tr><th>Vacante</th><th>Fecha</th><th>Estado</th><th></th></tr></thead><tbody>' + apps.map(function (a) {
          var j = WC.job(a.jobId), c = j ? WC.company(j.companyId) : null;
          return '<tr><td><a class="cell-main" href="detalle-empleo.html?id=' + a.jobId + '">' + esc(j ? j.title : "Vacante eliminada") + '</a><div class="cell-sub">' + esc(c ? c.name : "") + "</div></td><td>" + WC.date(a.date) + "</td><td>" + WC.badge(a.status) + '</td><td>' + (a.status === "Nueva" || a.status === "En revisión" ? '<button class="btn btn-ghost btn-sm" type="button" data-act="withdraw" data-id="' + a.id + '">Retirar</button>' : "") + "</td></tr>";
        }).join("") + "</tbody></table></div>" : '<p class="muted small">Todavía no te has postulado a ninguna vacante.</p>') + "</section>" +
        '<section class="card"><div class="card-head"><h3>Alertas laborales</h3><button class="btn btn-ghost btn-sm" type="button" data-act="add-alert">Nueva alerta</button></div>' +
        (p.alerts.length ? '<ul class="item-list">' + p.alerts.map(function (a) {
          var n = S.jobs.filter(function (j) { return j.status === "activa" && j.title.toLowerCase().indexOf(a.keyword.toLowerCase()) >= 0 && (!a.dept || j.dept === a.dept); }).length;
          return '<li><div><b>' + esc(a.keyword) + '</b> <span class="small muted">· ' + esc(a.dept || "Todo el país") + " · " + a.freq + '</span><div class="small"><a class="link" href="resultados.html?q=' + encodeURIComponent(a.keyword) + (a.dept ? "&loc=" + encodeURIComponent(a.dept) : "") + '">' + n + " vacante(s) coinciden ahora</a> " + (a.active ? WC.badge("activa") : WC.badge("inactiva")) + '</div></div><div class="flex" style="flex-wrap:nowrap"><button class="btn btn-ghost btn-sm" type="button" data-act="toggle-alert" data-id="' + a.id + '">' + (a.active ? "Pausar" : "Activar") + '</button><button class="btn btn-ghost btn-sm" type="button" data-act="del-alert" data-id="' + a.id + '" aria-label="Eliminar alerta">Quitar</button></div></li>';
        }).join("") + "</ul>" : '<p class="muted small">Crea una alerta y revisa aquí cuántas vacantes coinciden.</p>') + "</section>" +
        '<section class="card"><div class="card-head"><h3>Valoraciones de empresas</h3></div>' + (myReviews.length ? myReviews.map(function (r) {
          var c = WC.company(r.companyId);
          return '<div class="review"><div class="review-head"><strong>' + esc(c ? c.name : "") + "</strong>" + WC.stars(r.rating) + "</div><p class=\"small\">" + esc(r.text) + '</p><div class="small muted" style="margin-top:4px">' + WC.date(r.date) + " · " + WC.badge(r.status) + "</div></div>";
        }).join("") : '<p class="muted small">No has valorado empresas todavía.</p>') + '<p class="hint" style="margin-top:10px">Puedes valorar a una empresa desde el detalle de cualquiera de sus vacantes.</p></section>' +
        "</div></div></div>";
      bind();
    }

    function formModal(title, fields, onSave) {
      WC.modal({
        title: title, body: '<form id="m-form" novalidate class="form-grid">' + fields.html + "</form>",
        actions: [{ label: "Cancelar" }, { label: "Guardar", cls: "btn-primary", onClick: function (m) { var f = $("#m-form", m.el); if (!WC.validate(f, fields.checks)) return false; onSave(f); WC.save(); render(); } }]
      });
    }

    function bind() {
      $("#skill-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var f = e.target, v = f.elements.skill.value.trim();
        WC.clearErrors(f);
        if (v.length < 2) { WC.setError(f.elements.skill, "Escribe una habilidad."); return; }
        if (p.skills.some(function (s) { return s.toLowerCase() === v.toLowerCase(); })) { WC.setError(f.elements.skill, "Ya agregaste esa habilidad."); return; }
        p.skills.push(v); WC.save(); render();
      });
      $$("[data-act]", root).forEach(function (el) {
        var act = el.dataset.act;
        if (act === "cv") {
          el.addEventListener("change", function () {
            var file = el.files[0];
            if (!file) return;
            if (!/\.(pdf|docx)$/i.test(file.name)) { WC.toast("Formato no permitido. Sube un archivo PDF o DOCX.", "err"); el.value = ""; return; }
            if (file.size > 5 * 1024 * 1024) { WC.toast("El archivo supera los 5 MB permitidos.", "err"); el.value = ""; return; }
            p.cv = { name: file.name, size: file.size }; WC.save(); render(); WC.toast("Currículum cargado correctamente.");
          });
          return;
        }
        if (el.tagName === "FORM") return;
        el.addEventListener("click", function () {
          var id = el.dataset.id;
          if (act === "edit-profile") {
            formModal("Editar datos personales", {
              html: WC.field({ name: "name", label: "Nombre completo", req: true, value: p.name, cls: "full" }) + WC.field({ name: "headline", label: "Titular profesional", req: true, value: p.headline, placeholder: "Ej. Contadora con 3 años de experiencia", cls: "full" }) + WC.field({ name: "phone", type: "tel", label: "Teléfono", value: p.phone, placeholder: "7000-0000" }) + WC.field({ name: "birth", type: "date", label: "Fecha de nacimiento", value: p.birth }) + WC.field({ name: "dept", type: "select", label: "Departamento", options: D.DEPARTAMENTOS, value: p.dept }) + WC.field({ name: "city", label: "Municipio", value: p.city }) + WC.field({ name: "summary", type: "textarea", label: "Resumen", value: p.summary, cls: "full", hint: "Opcional, máximo 300 caracteres." }),
              checks: [["name", R.minLen(3, "Escribe tu nombre completo.")], ["headline", R.minLen(5, "Agrega un titular de al menos 5 caracteres.")], ["phone", R.phone], ["summary", function (v) { return v.length <= 300 ? "" : "El resumen no puede superar 300 caracteres."; }]]
            }, function (f) {
              ["name", "headline", "phone", "birth", "dept", "city", "summary"].forEach(function (n) { p[n] = f.elements[n].value.trim(); });
              WC.toast("Datos personales actualizados.");
            });
          } else if (act === "add-study") {
            formModal("Agregar estudios", {
              html: WC.field({ name: "title", label: "Título o carrera", req: true, cls: "full" }) + WC.field({ name: "place", label: "Institución", req: true }) + WC.field({ name: "period", label: "Periodo", req: true, placeholder: "2018 – 2023" }),
              checks: [["title", R.req()], ["place", R.req()], ["period", R.req()]]
            }, function (f) { p.studies.push({ id: WC.uid("s"), title: f.elements.title.value.trim(), place: f.elements.place.value.trim(), period: f.elements.period.value.trim() }); WC.toast("Estudio agregado."); });
          } else if (act === "add-exp") {
            formModal("Agregar experiencia", {
              html: WC.field({ name: "title", label: "Puesto", req: true, cls: "full" }) + WC.field({ name: "place", label: "Empresa", req: true }) + WC.field({ name: "period", label: "Periodo", req: true, placeholder: "2021 – 2024" }) + WC.field({ name: "desc", type: "textarea", label: "Descripción", cls: "full", rows: 3 }),
              checks: [["title", R.req()], ["place", R.req()], ["period", R.req()]]
            }, function (f) { p.experience.push({ id: WC.uid("x"), title: f.elements.title.value.trim(), place: f.elements.place.value.trim(), period: f.elements.period.value.trim(), desc: f.elements.desc.value.trim() }); WC.toast("Experiencia agregada."); });
          } else if (act === "add-alert") {
            formModal("Nueva alerta laboral", {
              html: WC.field({ name: "keyword", label: "Cargo o palabra clave", req: true, cls: "full", placeholder: "Ej. Contador" }) + WC.field({ name: "dept", type: "select", label: "Departamento", options: D.DEPARTAMENTOS, placeholder: "Todo el país" }) + WC.field({ name: "freq", type: "select", label: "Frecuencia", options: ["Diaria", "Semanal"], value: "Semanal" }),
              checks: [["keyword", R.minLen(3, "Escribe al menos 3 caracteres.")], ["freq", R.req("Elige una frecuencia.")]]
            }, function (f) { p.alerts.push({ id: WC.uid("al"), keyword: f.elements.keyword.value.trim(), dept: f.elements.dept.value, freq: f.elements.freq.value, active: true }); WC.toast("Alerta creada."); });
          } else if (act === "del-study") { p.studies = p.studies.filter(function (x) { return x.id !== id; }); WC.save(); render(); }
          else if (act === "del-exp") { p.experience = p.experience.filter(function (x) { return x.id !== id; }); WC.save(); render(); }
          else if (act === "del-skill") { p.skills.splice(Number(el.dataset.i), 1); WC.save(); render(); }
          else if (act === "del-cv") { p.cv = null; WC.save(); render(); WC.toast("Currículum eliminado."); }
          else if (act === "del-alert") { p.alerts = p.alerts.filter(function (x) { return x.id !== id; }); WC.save(); render(); }
          else if (act === "toggle-alert") { var al = p.alerts.filter(function (x) { return x.id === id; })[0]; al.active = !al.active; WC.save(); render(); }
          else if (act === "withdraw") {
            WC.confirm({ title: "Retirar postulación", message: "¿Seguro que quieres retirar esta postulación? La empresa dejará de verla.", ok: "Retirar", danger: true }, function () {
              S.applications = S.applications.filter(function (a) { return a.id !== id; }); WC.save(); render(); WC.toast("Postulación retirada.");
            });
          }
        });
      });
    }
    render();
  };

  /* ===== P08 · Gestión empresarial ===== */
  WC.pages.p08 = function () {
    if (!WC.guard(["empresa", "admin"], "Gestión empresarial")) return;
    var c = WC.company(WC.companyId());
    var logo = c.logo;
    var root = $("#main");
    var mine = S.jobs.filter(function (j) { return j.companyId === c.id; });
    var received = S.applications.filter(function (a) { var j = WC.job(a.jobId); return j && j.companyId === c.id; }).length;

    root.innerHTML = '<div class="wrap">' + head("P08", "Gestión empresarial", "Perfil de empresa", "Así te ven los candidatos. Mantén tu información actualizada para generar confianza.") +
      '<div class="detail-layout"><form id="co-form" class="card" novalidate><div class="form-grid">' +
      '<div class="full"><span class="lbl" style="font-size:.85rem;font-weight:600">Logotipo</span><div class="logo-drop" style="margin-top:8px"><div id="logo-prev"></div><div><label class="btn btn-ghost btn-sm" style="cursor:pointer">Subir logotipo<input id="logo-file" type="file" class="sr-only" accept="image/png,image/jpeg,image/svg+xml,image/webp"></label> <button class="btn btn-ghost btn-sm" type="button" id="logo-del">Quitar</button><p class="hint" style="margin-top:6px">PNG, JPG, SVG o WebP · máximo 300 KB</p><p class="err-msg" id="logo-err"></p></div></div></div>' +
      WC.field({ name: "name", label: "Nombre comercial", req: true, value: c.name, cls: "full" }) +
      WC.field({ name: "sector", type: "select", label: "Sector", req: true, options: D.SECTORES, value: c.sector }) +
      WC.field({ name: "size", type: "select", label: "Tamaño", options: ["1–10 empleados", "11–50 empleados", "51–200 empleados", "201–500 empleados", "501–1,000 empleados", "Más de 1,000 empleados"], value: c.size }) +
      WC.field({ name: "dept", type: "select", label: "Departamento", req: true, options: D.DEPARTAMENTOS, value: c.dept }) +
      WC.field({ name: "city", label: "Municipio", req: true, value: c.city }) +
      WC.field({ name: "desc", type: "textarea", label: "Descripción de la empresa", req: true, value: c.desc, rows: 5, cls: "full", hint: "Entre 50 y 600 caracteres." }) +
      WC.field({ name: "email", type: "email", label: "Correo de contacto", req: true, value: c.email }) +
      WC.field({ name: "phone", type: "tel", label: "Teléfono", req: true, value: c.phone, placeholder: "2200-0000" }) +
      WC.field({ name: "web", type: "url", label: "Sitio web", value: c.web, placeholder: "https://", cls: "full" }) +
      '</div><div class="flex" style="margin-top:24px"><button class="btn btn-primary" type="submit">Guardar cambios</button><span class="small muted">Los cambios se reflejan en tus vacantes publicadas.</span></div></form>' +
      '<aside class="side-sticky"><div class="card"><h3>Vista previa</h3><div id="co-prev"></div></div>' +
      '<div class="card"><h3>Estado y actividad</h3><dl class="kv" style="grid-template-columns:130px 1fr"><dt>Verificación</dt><dd>' + WC.badge(c.status) + "</dd><dt>Vacantes</dt><dd>" + mine.length + " publicadas</dd><dt>Postulaciones</dt><dd>" + received + ' recibidas</dd></dl>' +
      (c.status !== "Verificada" ? '<p class="small muted" style="margin-top:12px">Tu empresa está pendiente de revisión por el equipo administrador. Podrás publicar vacantes mientras tanto, pero se mostrará la insignia de verificación al ser aprobada.</p>' : "") +
      '<div class="flex" style="margin-top:16px"><a class="btn btn-dark btn-sm" href="publicar-vacante.html">Publicar vacante</a><a class="btn btn-ghost btn-sm" href="postulaciones.html">Ver postulaciones</a></div></div></aside></div></div>';

    var form = $("#co-form");
    function preview() {
      var tmp = { name: form.elements.name.value || "Nombre de la empresa", logo: logo };
      $("#logo-prev").innerHTML = WC.logo(tmp, true);
      $("#co-prev").innerHTML = '<div class="flex" style="flex-wrap:nowrap;align-items:flex-start">' + WC.logo(tmp) + "<div><strong>" + esc(tmp.name) + '</strong><div class="small muted">' + esc(form.elements.sector.value || "Sector") + " · " + esc([form.elements.city.value, form.elements.dept.value].filter(Boolean).join(", ") || "Ubicación") + '</div></div></div><p class="small" style="margin-top:12px">' + esc(form.elements.desc.value || "Aquí aparecerá la descripción de tu empresa.") + "</p>";
    }
    form.addEventListener("input", preview);
    preview();
    $("#logo-file").addEventListener("change", function (e) {
      var f = e.target.files[0], err = $("#logo-err");
      err.textContent = "";
      if (!f) return;
      if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(f.type)) { err.textContent = "Formato no permitido."; return; }
      if (f.size > 300 * 1024) { err.textContent = "La imagen supera los 300 KB."; return; }
      var rd = new FileReader();
      rd.onload = function () { logo = rd.result; preview(); };
      rd.readAsDataURL(f);
    });
    $("#logo-del").addEventListener("click", function () { logo = ""; preview(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = WC.validate(form, [
        ["name", R.minLen(3, "Escribe el nombre de la empresa.")], ["sector", R.req("Selecciona un sector.")], ["dept", R.req("Selecciona un departamento.")], ["city", R.req("Escribe el municipio.")],
        ["desc", function (v) { return v.length < 50 ? "Describe tu empresa con al menos 50 caracteres." : v.length > 600 ? "La descripción no puede superar 600 caracteres." : ""; }],
        ["email", R.email], ["phone", function (v) { return v ? R.phone(v) : "Ingresa un teléfono de contacto."; }],
        ["web", function (v) { return !v || /^https?:\/\/.+\..+/.test(v) ? "" : "Escribe una dirección válida que inicie con http:// o https://"; }]
      ]);
      if (!ok) return;
      ["name", "sector", "size", "dept", "city", "desc", "email", "phone", "web"].forEach(function (n) { c[n] = form.elements[n].value.trim(); });
      c.logo = logo;
      WC.save();
      WC.toast("Perfil de empresa guardado.");
    });
  };

  /* ===== P09 · Publicar vacante ===== */
  WC.pages.p09 = function () {
    if (!WC.guard(["empresa", "admin"], "Publicar vacante")) return;
    var c = WC.company(WC.companyId());
    var root = $("#main");
    var BEN = ["Seguro médico", "Seguro de vida", "Aguinaldo de ley", "Transporte", "Alimentación", "Capacitación", "Trabajo híbrido", "Bonos por desempeño"];

    function lines(v) { return v.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); }
    function render() {
      root.innerHTML = '<div class="wrap">' + head("P09", "Publicar vacante", "Nueva oferta laboral", "Completa los datos. Tu vacante pasará por una revisión rápida antes de aparecer en el portal.") +
        '<div class="detail-layout"><form id="job-form" class="card" novalidate><div class="form-grid">' +
        WC.field({ name: "title", label: "Título del puesto", req: true, cls: "full", placeholder: "Ej. Contador/a General" }) +
        WC.field({ name: "sector", type: "select", label: "Sector", req: true, options: D.SECTORES, value: c.sector }) +
        WC.field({ name: "contract", type: "select", label: "Tipo de contrato", req: true, options: D.CONTRATOS }) +
        WC.field({ name: "dept", type: "select", label: "Departamento", req: true, options: D.DEPARTAMENTOS, value: c.dept }) +
        WC.field({ name: "city", label: "Municipio", req: true, value: c.city }) +
        WC.field({ name: "modality", type: "select", label: "Modalidad", req: true, options: D.MODALIDADES }) +
        WC.field({ name: "exp", type: "select", label: "Experiencia requerida", req: true, options: D.EXPERIENCIAS }) +
        WC.field({ name: "min", type: "number", label: "Salario mínimo (USD / mes)", req: true, min: 0 }) +
        WC.field({ name: "max", type: "number", label: "Salario máximo (USD / mes)", req: true, min: 0 }) +
        WC.field({ name: "vacancies", type: "number", label: "Plazas disponibles", req: true, value: 1, min: 1 }) +
        WC.field({ name: "deadline", type: "date", label: "Fecha límite de postulación", hint: "Opcional." }) +
        WC.field({ name: "description", type: "textarea", label: "Descripción del puesto", req: true, cls: "full", rows: 4, hint: "Mínimo 50 caracteres." }) +
        WC.field({ name: "functions", type: "textarea", label: "Funciones principales", req: true, cls: "full", rows: 4, hint: "Una por línea." }) +
        WC.field({ name: "requirements", type: "textarea", label: "Requisitos", req: true, cls: "full", rows: 4, hint: "Uno por línea." }) +
        '<div class="field full"><span class="lbl">Beneficios</span><div class="check-grid">' + BEN.map(function (b) { return '<label class="check"><input type="checkbox" name="ben" value="' + b + '"> <span>' + b + "</span></label>"; }).join("") + "</div></div>" +
        WC.field({ name: "benExtra", type: "textarea", label: "Otros beneficios", cls: "full", rows: 2, hint: "Opcional, uno por línea." }) +
        '</div><div id="job-alert" class="form-alert" style="margin-top:16px" role="alert"></div><div class="flex" style="margin-top:24px"><button class="btn btn-primary" type="submit">Enviar a revisión</button><a class="btn btn-ghost" href="empresas.html">Cancelar</a></div></form>' +
        '<aside class="side-sticky"><div class="card flat"><h3>Publica con claridad</h3><ul class="bullets small"><li>Indica el salario: las ofertas con rango reciben más postulaciones.</li><li>Usa un título que los candidatos buscarían.</li><li>Separa requisitos indispensables de los deseables.</li></ul></div><div class="card"><h3>Publicando como</h3><div class="flex" style="flex-wrap:nowrap">' + WC.logo(c) + "<div><strong>" + esc(c.name) + "</strong><div class=\"small\">" + WC.badge(c.status) + "</div></div></div></div></aside></div></div>";
      var form = $("#job-form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = WC.validate(form, [
          ["title", R.minLen(5, "El título debe tener al menos 5 caracteres.")], ["sector", R.req("Selecciona un sector.")], ["contract", R.req("Selecciona el tipo de contrato.")], ["dept", R.req("Selecciona un departamento.")], ["city", R.req("Escribe el municipio.")], ["modality", R.req("Selecciona la modalidad.")], ["exp", R.req("Selecciona la experiencia requerida.")],
          ["min", function (v) { return v === "" ? "Ingresa el salario mínimo." : Number(v) < 1 ? "Debe ser mayor a 0." : ""; }],
          ["max", function (v, f) { return v === "" ? "Ingresa el salario máximo." : Number(v) < Number(f.elements.min.value) ? "No puede ser menor al mínimo." : Number(v) > 20000 ? "Revisa el monto (máximo $20,000)." : ""; }],
          ["vacancies", function (v) { return Number(v) >= 1 ? "" : "Indica al menos 1 plaza."; }],
          ["deadline", function (v) { return !v || v >= WC.today() ? "" : "La fecha límite no puede estar en el pasado."; }],
          ["description", R.minLen(50, "Describe el puesto con al menos 50 caracteres.")],
          ["functions", function (v) { return lines(v).length ? "" : "Agrega al menos una función."; }],
          ["requirements", function (v) { return lines(v).length ? "" : "Agrega al menos un requisito."; }]
        ]);
        $("#job-alert").textContent = ok ? "" : "Revisa los campos marcados antes de continuar.";
        if (!ok) return;
        var ben = $$("input[name=ben]:checked", form).map(function (i) { return i.value; }).concat(lines(form.elements.benExtra.value));
        var job = {
          id: WC.uid("j"), title: form.elements.title.value.trim(), companyId: c.id, city: form.elements.city.value.trim(), dept: form.elements.dept.value, modality: form.elements.modality.value, contract: form.elements.contract.value,
          exp: Number(form.elements.exp.value), salaryMin: Number(form.elements.min.value), salaryMax: Number(form.elements.max.value), sector: form.elements.sector.value, posted: WC.today(), featured: false, status: "pendiente",
          vacancies: Number(form.elements.vacancies.value), description: form.elements.description.value.trim(), functions: lines(form.elements.functions.value), requirements: lines(form.elements.requirements.value), benefits: ben.length ? ben : ["Prestaciones de ley"]
        };
        S.jobs.push(job);
        WC.save();
        WC.modal({
          title: "Vacante enviada a revisión",
          body: '<p>Tu oferta <strong>' + esc(job.title) + "</strong> fue registrada con estado " + WC.badge("pendiente") + ' y aparecerá en el portal cuando un administrador la apruebe.</p><dl class="kv" style="margin-top:16px"><dt>Ubicación</dt><dd>' + esc(job.city + ", " + job.dept) + "</dd><dt>Salario</dt><dd>" + WC.salary(job) + "</dd><dt>Contrato</dt><dd>" + esc(job.contract) + " · " + esc(job.modality) + "</dd></dl>",
          actions: [{ label: "Publicar otra", onClick: render }, { label: "Revisar en administración", cls: "btn-ghost", onClick: function () { var u = WC.user(); if (u.role === "admin") location.href = "admin-vacantes.html"; else location.href = "empresas.html"; } }, { label: "Listo", cls: "btn-dark", onClick: function () { location.href = "empresas.html"; } }]
        });
      });
    }
    render();
  };

  /* ===== P10 · Postulaciones ===== */
  WC.pages.p10 = function () {
    if (!WC.guard(["empresa", "admin"], "Postulaciones")) return;
    var u = WC.user(), root = $("#main");
    var STATES = ["Nueva", "En revisión", "Entrevista", "Contratada", "Rechazada"];
    var fStatus = "", q = "", fJob = "";

    function scope() {
      return S.applications.filter(function (a) {
        var j = WC.job(a.jobId);
        return j && (u.role === "admin" || j.companyId === WC.companyId());
      });
    }
    function jobsOfScope() {
      return S.jobs.filter(function (j) { return u.role === "admin" || j.companyId === WC.companyId(); });
    }
    root.innerHTML = '<div class="wrap">' + head("P10", "Postulaciones", "Candidatos por vacante", "Revisa perfiles, filtra por etapa y actualiza el estado de cada solicitud.") +
      '<div class="pipeline" id="pipe"></div><div class="filter-bar"><div class="field"><label class="sr-only" for="f-q">Buscar candidato</label><input id="f-q" type="search" placeholder="Buscar por nombre o titular"></div><div class="field"><label class="sr-only" for="f-job">Vacante</label><select id="f-job"></select></div><div class="field"><label class="sr-only" for="f-st">Estado</label><select id="f-st"></select></div></div><div id="app-table"></div></div>';
    $("#f-job").innerHTML = WC.options(jobsOfScope().map(function (j) { return { v: j.id, t: j.title }; }), "", "Todas las vacantes");
    $("#f-st").innerHTML = WC.options(STATES, "", "Todos los estados");
    $("#f-q").addEventListener("input", function (e) { q = e.target.value.toLowerCase(); render(); });
    $("#f-job").addEventListener("change", function (e) { fJob = e.target.value; render(); });
    $("#f-st").addEventListener("change", function (e) { fStatus = e.target.value; render(); });

    function render() {
      var all = scope().filter(function (a) { return !fJob || a.jobId === fJob; });
      $("#pipe").innerHTML = '<button class="pipe-btn" type="button" data-s="" aria-pressed="' + (fStatus === "") + '"><b>' + all.length + "</b><span>Todas</span></button>" + STATES.map(function (s) {
        return '<button class="pipe-btn" type="button" data-s="' + s + '" aria-pressed="' + (fStatus === s) + '"><b>' + all.filter(function (a) { return a.status === s; }).length + "</b><span>" + s + "</span></button>";
      }).join("");
      $$(".pipe-btn").forEach(function (b) { b.addEventListener("click", function () { fStatus = b.dataset.s; $("#f-st").value = fStatus; render(); }); });
      var list = all.filter(function (a) { return (!fStatus || a.status === fStatus) && (!q || (a.name + " " + a.headline).toLowerCase().indexOf(q) >= 0); }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      $("#app-table").innerHTML = list.length ? '<div class="table-wrap"><table><thead><tr><th>Candidato</th><th>Vacante</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' + list.map(function (a) {
        var j = WC.job(a.jobId);
        return '<tr><td><div class="flex" style="flex-wrap:nowrap"><div class="avatar">' + esc(WC.initials(a.name)) + '</div><div><div class="cell-main">' + esc(a.name) + '</div><div class="cell-sub">' + esc(a.headline) + "</div></div></div></td><td>" + esc(j.title) + "</td><td>" + WC.date(a.date) + '</td><td><label class="sr-only" for="st-' + a.id + '">Estado de ' + esc(a.name) + '</label><select class="status-select" id="st-' + a.id + '" data-id="' + a.id + '">' + WC.options(STATES, a.status) + '</select></td><td><div class="actions"><button class="btn btn-ghost btn-sm" type="button" data-view="' + a.id + '">Ver perfil</button>' + (a.status === "Nueva" ? '<button class="btn btn-dark btn-sm" type="button" data-review="' + a.id + '">Marcar en revisión</button>' : "") + "</div></td></tr>";
      }).join("") + "</tbody></table></div>" : '<div class="empty"><strong>No hay postulaciones con esos filtros</strong>Cambia la vacante, el estado o la búsqueda.</div>';
      $$(".status-select").forEach(function (s) { s.addEventListener("change", function () { setStatus(s.dataset.id, s.value); }); });
      $$("[data-review]").forEach(function (b) { b.addEventListener("click", function () { setStatus(b.dataset.review, "En revisión"); }); });
      $$("[data-view]").forEach(function (b) { b.addEventListener("click", function () { view(b.dataset.view); }); });
    }
    function find(id) { return S.applications.filter(function (a) { return a.id === id; })[0]; }
    function setStatus(id, st) {
      var a = find(id);
      a.status = st;
      WC.save();
      render();
      WC.toast("Estado de " + a.name.split(" ")[0] + " actualizado a «" + st + "».");
    }
    function view(id) {
      var a = find(id), j = WC.job(a.jobId);
      WC.modal({
        title: a.name, size: "lg",
        body: '<div class="flex" style="flex-wrap:nowrap;margin-bottom:18px"><div class="avatar lg wine">' + esc(WC.initials(a.name)) + "</div><div><strong style=\"font-size:1.1rem\">" + esc(a.headline) + '</strong><div class="muted small">' + esc(a.city) + "</div></div></div>" +
          '<dl class="kv"><dt>Postula a</dt><dd>' + esc(j.title) + "</dd><dt>Fecha</dt><dd>" + WC.date(a.date) + "</dd><dt>Experiencia</dt><dd>" + esc(a.exp) + "</dd><dt>Correo</dt><dd>" + esc(a.email) + "</dd><dt>Estado</dt><dd>" + WC.badge(a.status) + "</dd><dt>Habilidades</dt><dd><div class=\"chips\">" + a.skills.map(function (s) { return '<span class="chip">' + esc(s) + "</span>"; }).join("") + "</div></dd><dt>Mensaje</dt><dd>" + esc(a.summary) + "</dd></dl>",
        actions: [{ label: "Rechazar", cls: "btn-danger", onClick: function () { setStatus(id, "Rechazada"); } }, { label: "Pasar a entrevista", cls: "btn-ghost", onClick: function () { setStatus(id, "Entrevista"); } }, { label: "Cerrar", cls: "btn-dark" }]
      });
    }
    render();
  };
})();
