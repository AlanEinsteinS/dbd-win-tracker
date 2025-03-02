document.addEventListener("DOMContentLoaded", () => {
    let killerStreak = parseInt(localStorage.getItem("killerStreak")) || 0;
    let survivorStreak = parseInt(localStorage.getItem("survivorStreak")) || 0;
    let winLog = JSON.parse(localStorage.getItem("winLog")) || [];

    const killerStreakDisplay = document.getElementById("killerStreak");
    const survivorStreakDisplay = document.getElementById("survivorStreak");
    const winLogContainer = document.getElementById("winLog");
    const modal = document.getElementById("confirmReset");

    killerStreakDisplay.innerText = killerStreak;
    survivorStreakDisplay.innerText = survivorStreak;
    updateLog();

    document.getElementById("submitWin").addEventListener("click", () => {
        const type = document.getElementById("characterType").value;
        const name = document.getElementById("characterName").value.trim();
        const perks = document.getElementById("perks").value.trim() || "Nenhuma";
        const addons = document.getElementById("addons").value.trim() || "Nenhum";

        if (!name) {
            alert("Digite o nome!");
            return;
        }

        const timestamp = new Date().toLocaleString("pt-BR");
        winLog.push({ type, name, perks, addons, timestamp });
        localStorage.setItem("winLog", JSON.stringify(winLog));

        if (type === "killer") {
            killerStreak++;
            killerStreakDisplay.innerText = killerStreak;
            localStorage.setItem("killerStreak", killerStreak);
        } else {
            survivorStreak++;
            survivorStreakDisplay.innerText = survivorStreak;
            localStorage.setItem("survivorStreak", survivorStreak);
        }

        updateLog();
    });

    document.getElementById("resetStreak").addEventListener("click", () => {
        modal.style.display = "flex";
    });

    document.getElementById("confirmNo").addEventListener("click", () => {
        modal.style.display = "none";
    });

    document.getElementById("confirmYes").addEventListener("click", () => {
        localStorage.removeItem("killerStreak");
        localStorage.removeItem("survivorStreak");
        localStorage.removeItem("winLog");

        killerStreak = 0;
        survivorStreak = 0;
        winLog = [];

        killerStreakDisplay.innerText = killerStreak;
        survivorStreakDisplay.innerText = survivorStreak;
        winLogContainer.innerHTML = "";

        modal.style.display = "none";
    });

    function updateLog() {
        winLogContainer.innerHTML = winLog.map(win => {
            return `<li>
                ${win.type.toUpperCase()} - ${win.name}
                <div class="tooltip">
                    📅 <strong>Data:</strong> ${win.timestamp} <br>
                    🎭 <strong>Perks:</strong> ${win.perks} <br>
                    🎒 <strong>Addons:</strong> ${win.addons}
                </div>
            </li>`;
        }).join("");
    }
});
