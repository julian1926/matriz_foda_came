const STORAGE_KEY = "foda-emprendedor-project-v1";

const initialProject = {
  title: "Análisis matriz FODA–CAME desde el rol emprendedor",
  date: "2026-10-27",
  team: ["Ángel González", "Valentina Gutiérrez"],
  foda: {
    strengths: ["Obediente", "", "", "", ""],
    opportunities: ["Conocimientos", "", "", "", ""],
    weaknesses: ["Tiempo", "", "", "", ""],
    threats: ["Mal cons.", "", "", "", ""]
  },
  came: {
    maintain: ["Escuchar", "", "", "", ""],
    exploit: ["Aplicar ideas", "", "", "", ""],
    correct: ["Plan semanal", "T.P.B. · INV. · F.E.", "", "", ""],
    confront: ["No esc.", "", "", "", ""]
  }
};

const categories = [
  { id: "strengths", name: "Fortalezas", kind: "INTERNO · +", icon: "✳", className: "strengths", cameId: "maintain" },
  { id: "opportunities", name: "Oportunidades", kind: "EXTERNO · +", icon: "↗", className: "opportunities", cameId: "exploit" },
  { id: "weaknesses", name: "Debilidades", kind: "INTERNO · △", icon: "⌁", className: "weaknesses", cameId: "correct" },
  { id: "threats", name: "Amenazas", kind: "EXTERNO · △", icon: "△", className: "threats", cameId: "confront" }
];

const strategies = {
  maintain: { title: "Mantener", symbol: "M", color: "#6d6395", tint: "#eeeaf4", image: "💪" },
  exploit: { title: "Explotar", symbol: "E", color: "#ad8443", tint: "#f5efd9", image: "💡" },
  correct: { title: "Corregir", symbol: "C", color: "#a86e5e", tint: "#f4e8e3", image: "🪫" },
  confront: { title: "Afrontar", symbol: "A", color: "#588190", tint: "#e5eef0", image: "⚠️" }
};

function readProject() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(initialProject);
    const parsed = JSON.parse(saved);
    const restored = {
      ...structuredClone(initialProject),
      ...parsed,
      team: Array.isArray(parsed.team) ? parsed.team : [...initialProject.team],
      foda: { ...structuredClone(initialProject.foda), ...parsed.foda },
      came: { ...structuredClone(initialProject.came), ...parsed.came }
    };
    const conciseDefaults = {
      foda: { opportunities: { "Conoc.": "Conocimientos" }, weaknesses: { "Gestión del tiempo": "Tiempo" } },
      came: {
        maintain: { "Haciendo caso": "Escuchar" },
        exploit: { Aplicando: "Aplicar ideas" },
        correct: { "Cronograma de actividades": "Plan semanal" }
      }
    };
    for (const [section, categories] of Object.entries(conciseDefaults)) {
      for (const [category, replacements] of Object.entries(categories)) {
        restored[section][category] = restored[section][category].map((item) => replacements[item] || item);
      }
    }
    return restored;
  } catch (error) {
    console.error("No se pudo recuperar el proyecto guardado:", error);
    return structuredClone(initialProject);
  }
}

let project = readProject();

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderPeople() {
  document.querySelector("#team-avatars").innerHTML = project.team.filter(Boolean).map((name) => {
    const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
    return `<span class="person-chip"><span class="person-avatar">${escapeHTML(initials || "•")}</span>${escapeHTML(name)}</span>`;
  }).join("");
  document.querySelector("#display-date").textContent = project.date
    ? new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${project.date}T00:00:00Z`))
    : "Fecha por definir";
  document.querySelector("#footer-project").textContent = "";
}

function renderCircleCards() {
  document.querySelector("#circle-cards").innerHTML = categories.map((category, index) => {
    const strategy = strategies[category.cameId];
    const fodaItems = project.foda[category.id];
    const cameItems = project.came[category.cameId];
    const renderFields = (items, type, label, dataCategory, startIndex, endIndex) =>
      Array.from({ length: Math.max(0, endIndex - startIndex) }, (_, itemIndex) => {
        const fieldIndex = startIndex + itemIndex;
        const value = items[fieldIndex] || "";
        return `
          <p class="circle-value ${value ? "" : "circle-value-empty"}" aria-label="${category.name}, ${label.toLowerCase()} ${fieldIndex + 1}">${value ? escapeHTML(value) : escapeHTML(label)}</p>
        `;
      }).join("");
    const hasExtraItems = fodaItems.length > 5 || cameItems.length > 5;
    return `
      <article class="circle-card ${category.className}">
        <div class="circle-card-top">
          <span class="circle-card-art" aria-hidden="true">${strategy.image}</span>
          <div class="circle-card-titles">
            <span class="circle-card-number">0${index + 1}</span>
            <h2>${category.name}</h2>
          </div>
          <span class="circle-arrow" aria-hidden="true">↗</span>
        </div>
        <div class="circle-edit-columns">
          <div class="circle-edit-column">
            <span class="mini-tag">FODA</span>
            ${renderFields(fodaItems, "foda", "Idea", category.id, 0, 5)}
          </div>
          <div class="circle-edit-column">
            <span class="mini-tag came-tag">${strategy.title}</span>
            ${renderFields(cameItems, "came", "Acción", category.cameId, 0, 5)}
          </div>
        </div>
        ${hasExtraItems ? `
          <details class="circle-more">
            <summary aria-label="Mostrar ideas y acciones adicionales">Ver más</summary>
            <div class="circle-edit-columns">
              <div class="circle-edit-column">
                <span class="mini-tag">FODA</span>
                ${renderFields(fodaItems, "foda", "Idea", category.id, 5, fodaItems.length)}
              </div>
              <div class="circle-edit-column">
                <span class="mini-tag came-tag">${strategy.title}</span>
                ${renderFields(cameItems, "came", "Acción", category.cameId, 5, cameItems.length)}
              </div>
            </div>
          </details>
        ` : ""}
      </article>
    `;
  }).join("");
}

function render() {
  renderPeople();
  renderCircleCards();
}

document.querySelector("#print-page").addEventListener("click", () => window.print());

render();
