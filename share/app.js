const API_URL = "https://script.google.com/macros/s/AKfycbyb7F3okADxJpkwAZahSRuGkKArYUwS8DBPAnvuSb5auQOSWNEg-4i_Ffy7y7RHFe9M/exec";
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

// LOAD LEADERBOARD
document.addEventListener("DOMContentLoaded", async () => {
  const data = await callAPI({ action: "getUserTrend" });
  if (!data) return;

  const playerParam = getPlayerFromURL();

  if (playerParam) {
    const player = data.find(p =>
      p.name.toLowerCase() === playerParam.toLowerCase()
    );

    if (player) {
      renderPlayerCard(player);
      return;
    }
  }

  window.fullData = data;
  // fallback = leaderboard
  renderLeaderboard(data);
});

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
    window.location.href = `https://maxhydell.github.io/pbtracker/?${player}`;
  } else {
    window.location.href = "https://maxhydell.github.io/pbtracker/";
  }
}