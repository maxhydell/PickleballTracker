const API_URL = "https://script.google.com/macros/s/AKfycbyb7F3okADxJpkwAZahSRuGkKArYUwS8DBPAnvuSb5auQOSWNEg-4i_Ffy7y7RHFe9M/exec";

const resultsParam = getResultsFromURL();

function getResultsFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("r");
}
console.log("URL player:", playerParam);
console.log("Data:", data);

function getPlayerFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("p");
}

async function callAPI(params) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}?${query}`);
    const text = await res.text();
    return JSON.parse(text);
  } catch (err) {
    console.error("API ERROR:", err);
    return null;
  }
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

document.addEventListener("mousemove", (e) => {
  document.querySelectorAll("[data-tilt-target='glare']").forEach(el => {
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    el.style.setProperty("--x", `${x}%`);
    el.style.setProperty("--y", `${y}%`);
  });
});


// LOAD LEADERBOARD
document.addEventListener("DOMContentLoaded", async () => {

  const resultsParam = getResultsFromURL();

  // 🔥 NEW: Shared Results Mode
  if (resultsParam) {
    renderSharedResults(resultsParam);
    return; // stop everything else
  }

  // NORMAL FLOW
  const data = await callAPI({ action: "getUserTrend" });
  window.fullData = data;
  if (!data) return;

  const playerParam = getPlayerFromURL();

  if (playerParam) {
    const player = data.find(p =>
      p.name.toLowerCase() === playerParam.toLowerCase()
    );


// 🔥 Update page title with player name
if (playerParam) {
  const formattedName = capitalize(playerParam);

  const titleEl = document.getElementById("dynamicTitle");
  const subtitleEl = document.getElementById("dynamicSubtitle");

  if (titleEl) {
    titleEl.innerHTML = `
      <img src="share/transparent.png" class="logo">
      pbTracker
    `;
  }

  if (subtitleEl) {
    subtitleEl.innerText = `Welcome to pbTracker, ${formattedName}`;
  }
}


    if (player) {
      renderPlayerCard(player);
      return;
    }
  }

  window.fullData = data;
  // fallback = leaderboard
  renderLeaderboard(data);
});


function renderSharedResults(id) {
  const container = document.getElementById("leaderboard");

  const data = callAPI({ action: "getSharedResults", id });

  if (!data) {
    container.innerHTML = "<div class='card'>No results found.</div>";
    return;
  }

  if (resultsParam) {
    renderSharedResults(resultsParam);

    const features = document.getElementById("featuresSection");
    if (features) features.style.display = "none";

    return;
  }

  const parsed = JSON.parse(data);

  container.innerHTML = `
    <div class="card">
      <div class="card-title">Shared Results</div>

      ${parsed.map((p,i)=>`
        <div class="result-row">
          <span>${i+1}. ${capitalize(p.name)}</span>
          <span>${p.change}%</span>
        </div>
      `).join("")}
    </div>
  `;
}


function renderPlayerCard(player) {
  document.getElementById("leaderboard").innerHTML = `
    <div class="player-card">

      <div class="player-name">
        ${capitalize(player.name)}
      </div>

      <div class="stats-row">
        <div class="stat-box win">
          <div class="stat-value">${Math.round(player.winPct * 100)}%</div>
          <div class="stat-label">Win Rate</div>
        </div>

        <div class="stat-box points">
          <div class="stat-value">${player.pointsAvg.toFixed(1)}</div>
          <div class="stat-label">Avg Points</div>
        </div>
      </div>

      <div class="trend">
        📈 Trending Up
      </div>

      <div class="mini-leaderboard">
        <div class="mini-title">Leaderboard</div>
        ${window.fullData
          .sort((a,b)=>b.winPct - a.winPct)
          .map((p,i)=>`
            <div class="mini-row ${p.name === player.name ? 'highlight' : ''}">
              <span>#${i+1}</span>
              <span>${capitalize(p.name)}</span>
              <span>${Math.round(p.winPct*100)}%</span>
            </div>
          `).join("")}
      </div>

    </div>
  `;
}

function renderLeaderboard(data) {
  const top = [...data]
    .filter(p => p.winPct > 0)
    .sort((a,b) => b.winPct - a.winPct)
    .slice(0, 5);

  document.getElementById("leaderboard").innerHTML = `
    <div class="card-title">Top Players</div>
    ${top.map((p,i)=>`
      <div>${i+1}. ${capitalize(p.name)} — ${Math.round(p.winPct*100)}%</div>
    `).join("")}
  `;
}


// INSTALL GUIDE
function showInstallGuide() {
  if (/iphone|ipad/i.test(navigator.userAgent)) {
    alert("📲 Tap Share → 'Add to Home Screen'");
  } else {
    alert("📲 Use your browser menu → 'Install App'");
  }
}

function enterApp() {
  const player = getPlayerFromURL();
  if (player) {
    window.location.href = `https://maxhydell.github.io/pbtracker/?p=${player}`;
  } else {
    window.location.href = "https://maxhydell.github.io/pbtracker/";
  }
}