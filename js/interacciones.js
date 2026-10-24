"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var botonMenu = document.getElementById("boton-menu");
  var menuPrincipal = document.getElementById("navegacion-principal");
  if (botonMenu && menuPrincipal) {
    botonMenu.addEventListener("click", function () {
      var abierto = menuPrincipal.classList.toggle("abierto");
      botonMenu.setAttribute("aria-expanded", abierto);
    });
  }

  var panelAvanzado = document.getElementById("panel-avanzado");
  var botonAvanzado = document.getElementById("alternador-avanzado");
  if (panelAvanzado && botonAvanzado) {
    botonAvanzado.addEventListener("click", function () {
      var visible = panelAvanzado.hidden;
      panelAvanzado.hidden = !visible;
      botonAvanzado.setAttribute("aria-expanded", visible);
      botonAvanzado.textContent = visible ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados";
    });
  }

  document.querySelectorAll('[role="tab"][data-categoria]').forEach(function (pestana) {
    pestana.addEventListener("click", function () {
      var categoria = pestana.dataset.categoria;
      document.querySelectorAll('[role="tab"][data-categoria]').forEach(function (otraPestana) {
        otraPestana.setAttribute("aria-selected", otraPestana === pestana);
      });
      document.querySelectorAll("[data-tipo]").forEach(function (elemento) {
        elemento.classList.toggle("oculto", categoria !== "todos" && elemento.dataset.tipo !== categoria);
      });
    });
  });

  document.querySelectorAll("[data-categoria-foro]").forEach(function (botonCategoria) {
    botonCategoria.addEventListener("click", function () {
      var categoria = botonCategoria.dataset.categoriaForo;
      document.querySelectorAll("[data-categoria-foro]").forEach(function (otroBoton) {
        otroBoton.setAttribute("aria-pressed", otroBoton === botonCategoria);
      });
      document.querySelectorAll("[data-categoria-tema]").forEach(function (tema) {
        tema.classList.toggle("oculto", categoria !== "todas" && tema.dataset.categoriaTema !== categoria);
      });
    });
  });

  var ventanaIndice = document.getElementById("ventana-indice");
  var ventanas = document.querySelectorAll(".fondo-ventana");
  function abrirVentana(elemento) {
    elemento.classList.remove("oculto");
    document.body.style.overflow = "hidden";
    elemento.querySelector(".ventana").focus();
  }
  function cerrarVentana(elemento) {
    elemento.classList.add("oculto");
    if (document.querySelectorAll(".fondo-ventana:not(.oculto)").length === 0) document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-abrir-ventana]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      var elemento = document.getElementById(boton.dataset.abrirVentana);
      if (elemento) abrirVentana(elemento);
    });
  });
  if (ventanaIndice) {
    ["boton-indice", "boton-pie-indice"].forEach(function (identificador) {
      var boton = document.getElementById(identificador);
      if (boton) boton.addEventListener("click", function () { abrirVentana(ventanaIndice); });
    });
  }
  ventanas.forEach(function (elemento) {
    elemento.querySelectorAll("[data-cerrar-modal]").forEach(function (boton) {
      boton.addEventListener("click", function () { cerrarVentana(elemento); });
    });
    elemento.addEventListener("mousedown", function (evento) {
      if (evento.target === elemento) cerrarVentana(elemento);
    });
  });

  document.querySelectorAll(".respuesta-estatica, .acceso-estatico, .formulario-estatico").forEach(function (formulario) {
    formulario.addEventListener("submit", function (evento) { evento.preventDefault(); });
  });
  document.querySelectorAll("[data-pestana-formulario]").forEach(function (botonPestana) {
    botonPestana.addEventListener("click", function () {
      var nombrePanel = botonPestana.dataset.pestanaFormulario;
      document.querySelectorAll('[role="tab"][data-pestana-formulario]').forEach(function (otraPestana) {
        otraPestana.setAttribute("aria-selected", otraPestana === botonPestana);
      });
      document.querySelectorAll("[data-panel-formulario]").forEach(function (panel) {
        panel.hidden = panel.dataset.panelFormulario !== nombrePanel;
      });
    });
  });
  document.querySelectorAll("[data-rol]").forEach(function (botonRol) {
    botonRol.addEventListener("click", function () {
      var esEmpresa = botonRol.dataset.rol === "empresa";
      document.querySelectorAll("[data-rol]").forEach(function (otroBoton) {
        otroBoton.setAttribute("aria-pressed", otroBoton === botonRol);
      });
      var camposEmpresa = document.querySelector(".campo-empresa");
      var etiquetaNombre = document.querySelector('label[for="nombre-registro"]');
      if (camposEmpresa) camposEmpresa.classList.toggle("oculto", !esEmpresa);
      if (etiquetaNombre) etiquetaNombre.textContent = esEmpresa ? "Nombre de la empresa" : "Nombre completo";
    });
  });
  var parametros = new URLSearchParams(window.location.search);
  var panelInicial = parametros.get("pestana") === "registro" ? "registro" : "ingresar";
  if (parametros.get("rol") === "empresa") {
    var botonEmpresa = document.querySelector('[data-rol="empresa"]');
    if (botonEmpresa) botonEmpresa.click();
  }
  var pestanaInicial = document.querySelector('[role="tab"][data-pestana-formulario="' + panelInicial + '"]');
  if (pestanaInicial) pestanaInicial.click();
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") ventanas.forEach(function (elemento) {
      if (!elemento.classList.contains("oculto")) cerrarVentana(elemento);
    });
  });
});