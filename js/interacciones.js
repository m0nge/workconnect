"use strict";

document.addEventListener("DOMContentLoaded", function () {
  function alHacerClick(selector, accion) {
    document.querySelectorAll(selector).forEach(function (elemento) {
      elemento.addEventListener("click", function (evento) { accion(elemento, evento); });
    });
  }
  function marcarActivo(selector, atributo, activo) {
    document.querySelectorAll(selector).forEach(function (elemento) {
      elemento.setAttribute(atributo, elemento === activo);
    });
  }

  var botonMenu = document.getElementById("boton-menu"), menu = document.getElementById("navegacion-principal");
  if (botonMenu && menu) botonMenu.addEventListener("click", function () {
    botonMenu.setAttribute("aria-expanded", menu.classList.toggle("abierto"));
  });

  var panelAvanzado = document.getElementById("panel-avanzado"), alternadorAvanzado = document.getElementById("alternador-avanzado");
  if (panelAvanzado && alternadorAvanzado) alternadorAvanzado.addEventListener("click", function () {
    panelAvanzado.hidden = !panelAvanzado.hidden;
    alternadorAvanzado.setAttribute("aria-expanded", !panelAvanzado.hidden);
    alternadorAvanzado.textContent = panelAvanzado.hidden ? "Mostrar filtros avanzados" : "Ocultar filtros avanzados";
  });
  alHacerClick('[role="tab"][data-categoria]', function (pestana) {
    var categoria = pestana.dataset.categoria;
    marcarActivo('[role="tab"][data-categoria]', "aria-selected", pestana);
    document.querySelectorAll("[data-tipo]").forEach(function (elemento) {
      elemento.classList.toggle("oculto", categoria !== "todos" && elemento.dataset.tipo !== categoria);
    });
  });
  alHacerClick("[data-categoria-foro]", function (boton) {
    var categoria = boton.dataset.categoriaForo;
    marcarActivo("[data-categoria-foro]", "aria-pressed", boton);
    document.querySelectorAll("[data-categoria-tema]").forEach(function (tema) {
      tema.classList.toggle("oculto", categoria !== "todas" && tema.dataset.categoriaTema !== categoria);
    });
  });
  var ventanas = document.querySelectorAll(".fondo-ventana");
  function abrirVentana(ventana) {
    ventana.classList.remove("oculto");
    document.body.style.overflow = "hidden";
    ventana.querySelector(".ventana").focus();
  }
  function cerrarVentana(ventana) {
    ventana.classList.add("oculto");
    if (!document.querySelector(".fondo-ventana:not(.oculto)")) document.body.style.overflow = "";
  }
  alHacerClick("[data-abrir-ventana]", function (boton) {
    var ventana = document.getElementById(boton.dataset.abrirVentana);
    if (ventana) abrirVentana(ventana);
  });
  var ventanaIndice = document.getElementById("ventana-indice");
  if (ventanaIndice) ["boton-indice", "boton-pie-indice"].forEach(function (id) {
    var boton = document.getElementById(id);
    if (boton) boton.addEventListener("click", function () { abrirVentana(ventanaIndice); });
  });
  ventanas.forEach(function (ventana) {
    ventana.querySelectorAll("[data-cerrar-modal]").forEach(function (boton) {
      boton.addEventListener("click", function () { cerrarVentana(ventana); });
    });
    ventana.addEventListener("mousedown", function (evento) {
      if (evento.target === ventana) cerrarVentana(ventana);
    });
  });
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") ventanas.forEach(function (ventana) {
      if (!ventana.classList.contains("oculto")) cerrarVentana(ventana);
    });
  });
  document.querySelectorAll(".respuesta-estatica, .acceso-estatico:not(#formulario-acceso), .formulario-estatico").forEach(function (formulario) {
    formulario.addEventListener("submit", function (evento) { evento.preventDefault(); });
  });
  var formularioAcceso = document.getElementById("formulario-acceso");
  if (formularioAcceso) {
    var cuentasDemo = [
      { rol: "candidato", correo: "candidato@workconnect.sv", clave: "Demo1234", destino: "candidato.html" },
      { rol: "empresa", correo: "empresa@workconnect.sv", clave: "Demo1234", destino: "empresas.html" },
      { rol: "administrador", correo: "admin@workconnect.sv", clave: "Admin1234", destino: "admin-dashboard.html" }
    ];
    var correoAcceso = document.getElementById("correo-acceso"), claveAcceso = document.getElementById("clave-acceso"), mensajeAcceso = document.getElementById("mensaje-acceso");
    formularioAcceso.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var correo = correoAcceso.value.trim().toLowerCase();
      var cuenta = cuentasDemo.find(function (item) { return item.correo === correo && item.clave === claveAcceso.value; });
      if (!cuenta) {
        mensajeAcceso.textContent = "El correo o la contraseña no son correctos. Usa una cuenta de demostración válida.";
        return;
      }
      window.location.href = cuenta.destino;
    });
    alHacerClick("[data-acceso-demo]", function (boton) {
      var cuenta = cuentasDemo.find(function (item) { return item.rol === boton.dataset.accesoDemo; });
      if (!cuenta) return;
      var pestanaIngresar = document.querySelector('[data-pestana-formulario="ingresar"]');
      if (pestanaIngresar) pestanaIngresar.click();
      correoAcceso.value = cuenta.correo; claveAcceso.value = cuenta.clave; mensajeAcceso.textContent = "";
      formularioAcceso.requestSubmit();
    });
  }
  alHacerClick("[data-pestana-formulario]", function (boton) {
    var nombrePanel = boton.dataset.pestanaFormulario;
    marcarActivo('[role="tab"][data-pestana-formulario]', "aria-selected", boton);
    document.querySelectorAll("[data-panel-formulario]").forEach(function (panel) {
      panel.hidden = panel.dataset.panelFormulario !== nombrePanel;
    });
  });
  alHacerClick("[data-rol]", function (boton) {
    var esEmpresa = boton.dataset.rol === "empresa";
    marcarActivo("[data-rol]", "aria-pressed", boton);
    var camposEmpresa = document.querySelector(".campo-empresa");
    var etiquetaNombre = document.querySelector('label[for="nombre-registro"]');
    if (camposEmpresa) camposEmpresa.classList.toggle("oculto", !esEmpresa);
    if (etiquetaNombre) etiquetaNombre.textContent = esEmpresa ? "Nombre de la empresa" : "Nombre completo";
  });
  var parametros = new URLSearchParams(window.location.search);
  var panelInicial = parametros.get("pestana") === "registro" ? "registro" : "ingresar";
  if (parametros.get("rol") === "empresa") {
    var botonEmpresa = document.querySelector('[data-rol="empresa"]');
    if (botonEmpresa) botonEmpresa.click();
  }
  var pestanaInicial = document.querySelector('[role="tab"][data-pestana-formulario="' + panelInicial + '"]');
  if (pestanaInicial) pestanaInicial.click();
});
