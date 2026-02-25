// ============ NOTES MODULE ============

import { $ } from "./utils.js";
import { state } from "./state.js";

const notesScreen = $("notesScreen");
const notesContent = $("notesContent");
const notesTitle = $("notesTitle");

// Parse the raw text file into structured HTML
function parseNotesToHTML(rawText) {
  const lines = rawText.split("\n");
  let html = "";
  let inSection = false;
  let inTable = false;
  let tableRows = [];
  let inWarning = false;
  let warningLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines (but close open sections if needed)
    if (!line) {
      if (inTable && tableRows.length > 0) {
        html += buildTable(tableRows);
        tableRows = [];
        inTable = false;
      }
      if (inWarning && warningLines.length > 0) {
        html += `<div class="notes-warning">⚠ ${warningLines.join("<br>")}</div>`;
        warningLines = [];
        inWarning = false;
      }
      continue;
    }

    // Main section headers (🟢, 🔥, 🔵, 🌀, 🌪, 🌬, 🌍, 🐎, 🌧, 🧠, 🎯)
    if (
      /^[🟢🔥🔵🌀🌪🌬🌍🐎🌧🧠🎯]/.test(line) &&
      (line.includes("️") ||
        /\d️⃣/.test(line) ||
        line.startsWith("🔥") ||
        line.startsWith("🔵") ||
        line.startsWith("🧠") ||
        line.startsWith("🎯"))
    ) {
      if (inSection) html += "</div>"; // close previous section
      html += `<div class="notes-section"><div class="notes-section-title">${line}</div>`;
      inSection = true;
      continue;
    }

    // Warning lines (⚠)
    if (line.startsWith("⚠")) {
      inWarning = true;
      warningLines.push(line);
      continue;
    }

    if (
      inWarning &&
      !line.startsWith("⚠") &&
      !line.startsWith("🟢") &&
      !line.startsWith("🔥") &&
      !line.startsWith("🔵") &&
      !line.startsWith("🌀") &&
      !line.startsWith("🌪") &&
      !line.startsWith("🌬") &&
      !line.startsWith("🌍") &&
      !line.startsWith("🐎") &&
      !line.startsWith("🌧") &&
      !line.startsWith("🧠") &&
      !line.startsWith("🎯")
    ) {
      warningLines.push(line);
      continue;
    }

    // Table detection (line with tab separation)
    if (line.includes("\t")) {
      inTable = true;
      tableRows.push(line.split("\t"));
      continue;
    }

    // Highlighted concepts (📌)
    if (line.startsWith("📌")) {
      html += `<div class="notes-highlight">${line}</div>`;
      continue;
    }

    // Bullet points
    if (line.startsWith("👉") || line.startsWith("•") || line.startsWith("-")) {
      html += `<ul><li>${line.replace(/^[👉•\-]\s*/, "")}</li></ul>`;
      continue;
    }

    // Sub-headers (bold text or lines ending with colon)
    if (line.endsWith(":") || line.startsWith("Answer:")) {
      html += `<p><strong>${line}</strong></p>`;
      continue;
    }

    // Regular text
    html += `<p>${line}</p>`;
  }

  // Close any remaining open tags
  if (inTable && tableRows.length > 0) {
    html += buildTable(tableRows);
  }
  if (inWarning && warningLines.length > 0) {
    html += `<div class="notes-warning">⚠ ${warningLines.join("<br>")}</div>`;
  }
  if (inSection) html += "</div>";

  return html;
}

// Build an HTML table from rows
function buildTable(rows) {
  if (rows.length === 0) return "";
  let html = '<table class="notes-table">';

  // First row as header
  html += "<thead><tr>";
  rows[0].forEach((cell) => {
    html += `<th>${cell.trim()}</th>`;
  });
  html += "</tr></thead><tbody>";

  // Remaining rows
  for (let i = 1; i < rows.length; i++) {
    html += "<tr>";
    rows[i].forEach((cell) => {
      html += `<td>${cell.trim()}</td>`;
    });
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

// Show notes for the selected topic
export async function showNotes() {
  // Find the selected topic's notes file
  const topic = state.topicsList?.find((t) => t.id === state.selectedTopic);
  if (!topic || !topic.notes) {
    console.error("No notes available for this topic");
    return;
  }

  // Hide other screens
  $("startScreen").classList.add("hidden");
  $("quizScreen").classList.add("hidden");
  $("resultsScreen").classList.add("hidden");
  $("dashboardScreen").classList.add("hidden");
  $("reviewScreen").classList.add("hidden");
  notesScreen.classList.remove("hidden");

  // Set title
  notesTitle.textContent = `📖 ${topic.name} - Notes`;

  // Show loading
  notesContent.innerHTML =
    '<p style="text-align:center; opacity:0.6;">Loading notes...</p>';

  try {
    const response = await fetch(`/${topic.notes}`);
    if (!response.ok) throw new Error("Notes file not found");
    const rawText = await response.text();
    notesContent.innerHTML = parseNotesToHTML(rawText);
  } catch (error) {
    console.error("Error loading notes:", error);
    notesContent.innerHTML =
      '<p style="text-align:center; color: var(--accent-error);">❌ Could not load notes for this topic.</p>';
  }
}

// Hide notes and go back to start screen
export function hideNotes() {
  notesScreen.classList.add("hidden");
  $("startScreen").classList.remove("hidden");
}
