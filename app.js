/* ============================
   GLOBAL VARIABLES
=============================*/
let currentMode = "";
let deferredPrompt = null;

/* ============================
   MODE SELECTION
=============================*/
document.querySelectorAll(".mode-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".mode-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    currentMode = card.dataset.mode;
  });
});

/* ============================
   GENERATE CONTENT
=============================*/
const generateBtn = document.getElementById("generateBtn");
const loading = document.getElementById("loading");
const output = document.getElementById("output");
const outputSection = document.getElementById("outputSection");

generateBtn.addEventListener("click", async () => {
  const userPrompt = document.getElementById("userPrompt").value.trim();

  if (!userPrompt || !currentMode) {
    alert("Please select a mode and type your idea 🙂");
    return;
  }

  loading.classList.remove("hidden");
  output.innerHTML = "";
  outputSection.classList.remove("hidden");

  // Build AI prompt
  const finalPrompt = `
Create a premium kid-friendly ${currentMode} project for ages 7–14.

Return JSON with:
title,
summary,
characters,
scenes,
steps,
tips,
scratch_code (blocks with category, text, and indent),
bonus,
motivation
Based on: ${userPrompt}
`;

  try {
    const response = await fetch("/api/openai-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Return ONLY valid JSON." },
          { role: "user", content: finalPrompt }
        ]
      })
    });

    const text = await response.text();
    const json = JSON.parse(text);

    renderOutput(json);
    launchConfetti();

  } catch (err) {
    output.innerHTML = `<p style="color:red;">Oops! Something went wrong. Try again.</p>`;
  }

  loading.classList.add("hidden");
});

/* ============================
   RENDER OUTPUT
=============================*/
function renderOutput(data) {
  output.innerHTML = "";

  addSection("🎉 Title", data.title);
  addSection("📘 Summary", data.summary);

  if (data.characters) addListSection("🧑 Characters", data.characters);
  if (data.scenes) addListSection("🌄 Scenes", data.scenes);

  if (data.steps) addListSection("🪜 Steps", data.steps);

  if (data.scratch_code) renderScratchBlocks(data.scratch_code);

  addSection("💡 Tips", data.tips);
  addSection("⭐ Bonus Challenges", data.bonus);
  addSection("🌟 Motivation", data.motivation);
}

function addSection(title, text) {
  if (!text) return;
  output.innerHTML += `<h3>${title}</h3><p>${text}</p>`;
}

function addListSection(title, arr) {
  output.innerHTML += `<h3>${title}</h3>`;
  arr.forEach(item => {
    output.innerHTML += `<div class="list-item">• ${item}</div>`;
  });
}

/* ============================
   SCRATCH BLOCK RENDERING
=============================*/
function renderScratchBlocks(blocks) {
  output.innerHTML += `<h3>🔧 Scratch Code</h3>`;

  blocks.forEach(b => {
    const indent = b.indent ? "indent" : "";
    output.innerHTML += `
      <div class="block ${b.category} ${indent}">
        ${b.text}
      </div>
    `;
  });
}

/* ============================
   LOCALSTORAGE (MY SHELF)
=============================*/
const saveBtn = document.getElementById("saveBtn");
const shelfContainer = document.getElementById("shelfContainer");

saveBtn.addEventListener("click", () => {
  const item = output.innerHTML;
  const shelf = JSON.parse(localStorage.getItem("shelf") || "[]");
  shelf.push(item);
  localStorage.setItem("shelf", JSON.stringify(shelf));
  loadShelf();
});

function loadShelf() {
  const shelf = JSON.parse(localStorage.getItem("shelf") || "[]");
  shelfContainer.innerHTML = "";
  shelf.forEach(item => {
    shelfContainer.innerHTML += `<div class="shelf-item">${item}</div>`;
  });
}
loadShelf();

/* ============================
   READ ALOUD
=============================*/
const readBtn = document.getElementById("readBtn");
readBtn.addEventListener("click", () => {
  const text = output.innerText;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  speechSynthesis.speak(utter);
});

/* ============================
   CONFETTI
=============================*/
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = 200;

  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      ctx.fillStyle = i % 2 ? "#ffdc5c" : "#7ddc7d";
      ctx.fillRect(Math.random() * canvas.width, Math.random() * 200, 6, 12);
    }, i * 20);
  }

  setTimeout(() => ctx.clearRect(0, 0, canvas.width, 200), 2000);
}

/* ============================
   PWA INSTALL HANDLING
=============================*/
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;

  document.getElementById("floatingInstall").classList.remove("hidden");
  document.getElementById("pwaBanner").classList.remove("hidden");
});

document.getElementById("installBtn").onclick = installApp;
document.getElementById("floatingInstall").onclick = installApp;

function installApp() {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  deferredPrompt = null;

  document.getElementById("floatingInstall").classList.add("hidden");
  document.getElementById("pwaBanner").classList.add("hidden");
}

document.getElementById("closeBanner").onclick = () => {
  document.getElementById("pwaBanner").classList.add("hidden");
};
