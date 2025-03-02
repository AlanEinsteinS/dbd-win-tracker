document.addEventListener("DOMContentLoaded", () => {
    // ==================== Estado da Aplicação ====================
    let killerStreak = parseInt(localStorage.getItem("killerStreak")) || 0;
    let survivorStreak = parseInt(localStorage.getItem("survivorStreak")) || 0;
    let gameLog = JSON.parse(localStorage.getItem("gameLog")) || [];
    let bestKillerStreak = parseInt(localStorage.getItem("bestKillerStreak")) || 0;
    let bestSurvivorStreak = parseInt(localStorage.getItem("bestSurvivorStreak")) || 0;
    let isDarkMode = localStorage.getItem("darkMode") === "true" || true;
    let activeCharacterType = "killer"; // padrão

    // ==================== Elementos DOM ====================
    const killerStreakDisplay = document.getElementById("killerStreak");
    const survivorStreakDisplay = document.getElementById("survivorStreak");
    const gameLogContainer = document.getElementById("gameLog");
    const modal = document.getElementById("confirmReset");
    const characterNameInput = document.getElementById("characterName");
    const perksInput = document.getElementById("perks");
    const addonsInput = document.getElementById("addons");
    const mapInput = document.getElementById("map");
    const killerModeRadio = document.getElementById("killer-mode");
    const survivorModeRadio = document.getElementById("survivor-mode");
    const themeToggle = document.querySelector(".theme-toggle");
    const statsToggle = document.querySelector(".stats-toggle");
    const statsPanel = document.querySelector(".stats-panel");
    const totalGamesDisplay = document.getElementById("totalGames");
    const totalWinsDisplay = document.getElementById("totalWins");
    const totalLossesDisplay = document.getElementById("totalLosses");
    const winRateDisplay = document.getElementById("winRate");
    const bestStreakDisplay = document.getElementById("bestStreak");
    const filterButtons = document.querySelectorAll(".log-filter");
    
    // ==================== Inicialização ====================
    initializeApp();
    
    function initializeApp() {
        // Atualizar exibição de streaks
        killerStreakDisplay.innerText = killerStreak;
        survivorStreakDisplay.innerText = survivorStreak;
        
        // Definir modo de cor
        applyTheme();
        
        // Atualizar estatísticas
        updateStatistics();
        
        // Atualizar histórico
        updateLog();
        
        // Criar modal de detalhes
        createGameDetailsModal();
        
        // Ativar animação de streak se tiver alguma ativa
        if (killerStreak > 0) {
            document.querySelector(".streak-box.killer").classList.add("streak-active");
        }
        if (survivorStreak > 0) {
            document.querySelector(".streak-box.survivor").classList.add("streak-active");
        }
        
        // Definir primeiro input como foco
        characterNameInput.focus();
    }
    
    // ==================== Event Listeners ====================
    
    // Mudar tipo de personagem
    killerModeRadio.addEventListener("change", () => {
        if (killerModeRadio.checked) {
            activeCharacterType = "killer";
            document.body.classList.remove("mode-survivor");
            document.body.classList.add("mode-killer");
        }
    });
    
    survivorModeRadio.addEventListener("change", () => {
        if (survivorModeRadio.checked) {
            activeCharacterType = "survivor";
            document.body.classList.remove("mode-killer");
            document.body.classList.add("mode-survivor");
        }
    });
    
    // Registrar vitória
    document.getElementById("submitWin").addEventListener("click", (e) => {
        addRippleEffect(e);
        addGameResult(true);
    });
    
    // Registrar derrota
    document.getElementById("submitLoss").addEventListener("click", (e) => {
        addRippleEffect(e);
        addGameResult(false);
    });
    
    // Abrir modal de confirmação para reset
    document.getElementById("resetStreak").addEventListener("click", () => {
        modal.style.display = "flex";
        modal.classList.add("active");
    });
    
    // Cancelar reset
    document.getElementById("confirmNo").addEventListener("click", () => {
        modal.style.display = "none";
        modal.classList.remove("active");
    });
    
    // Confirmar reset
    document.getElementById("confirmYes").addEventListener("click", () => {
        resetAll();
        modal.style.display = "none";
        modal.classList.remove("active");
    });
    
    // Fechar modal ao clicar fora
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            modal.classList.remove("active");
        }
    });
    
    // Alternar tema claro/escuro
    themeToggle.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem("darkMode", isDarkMode);
        applyTheme();
    });
    
    // Alternar visibilidade do painel de estatísticas
    statsToggle.addEventListener("click", () => {
        statsPanel.classList.toggle("visible");
        statsToggle.classList.toggle("active");
    });
    
    // Filtros do log
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove("active"));
            
            // Adicionar classe active ao botão clicado
            button.classList.add("active");
            
            // Aplicar filtro
            const filter = button.getAttribute("data-filter");
            applyLogFilter(filter);
        });
    });
    
    // ==================== Funções Principais ====================
    
    /**
     * Adiciona um resultado de partida ao log
     * @param {boolean} isWin - Se foi vitória ou derrota
     */
    function addGameResult(isWin) {
        const type = activeCharacterType;
        const name = characterNameInput.value.trim();
        const perks = perksInput.value.trim() || "Nenhuma";
        const addons = addonsInput.value.trim() || "Nenhum";
        const map = mapInput.value.trim() || "Desconhecido";
        
        if (!name) {
            showNotification("Digite o nome do personagem!", "error");
            characterNameInput.focus();
            return;
        }
        
        const timestamp = new Date().toLocaleString("pt-BR");
        gameLog.unshift({ 
            type, 
            name, 
            perks, 
            addons, 
            map,
            result: isWin ? "vitória" : "derrota", 
            timestamp 
        });
        
        // Limitar o log a 100 entradas para evitar problemas de desempenho
        if (gameLog.length > 100) {
            gameLog = gameLog.slice(0, 100);
        }
        
        localStorage.setItem("gameLog", JSON.stringify(gameLog));
        
        if (isWin) {
            if (type === "killer") {
                killerStreak++;
                killerStreakDisplay.innerText = killerStreak;
                localStorage.setItem("killerStreak", killerStreak);
                
                // Atualizar melhor streak se necessário
                if (killerStreak > bestKillerStreak) {
                    bestKillerStreak = killerStreak;
                    localStorage.setItem("bestKillerStreak", bestKillerStreak);
                }
                
                // Adicionar animação de streak
                document.querySelector(".streak-box.killer").classList.add("streak-active");
                
                // Criar confete para celebrar
                if (killerStreak >= 3) {
                    createConfetti();
                }
                
                showNotification("Vitória como Killer registrada! 🔪", "success");
            } else {
                survivorStreak++;
                survivorStreakDisplay.innerText = survivorStreak;
                localStorage.setItem("survivorStreak", survivorStreak);
                
                // Atualizar melhor streak se necessário
                if (survivorStreak > bestSurvivorStreak) {
                    bestSurvivorStreak = survivorStreak;
                    localStorage.setItem("bestSurvivorStreak", bestSurvivorStreak);
                }
                
                // Adicionar animação de streak
                document.querySelector(".streak-box.survivor").classList.add("streak-active");
                
                // Criar confete para celebrar
                if (survivorStreak >= 3) {
                    createConfetti();
                }
                
                showNotification("Vitória como Survivor registrada! 🏃", "success");
            }
        } else {
            if (type === "killer") {
                // Resetar streak
                killerStreak = 0;
                killerStreakDisplay.innerText = killerStreak;
                localStorage.setItem("killerStreak", killerStreak);
                
                // Remover animação de streak
                document.querySelector(".streak-box.killer").classList.remove("streak-active");
                
                showNotification("Derrota como Killer registrada.", "error");
            } else {
                // Resetar streak
                survivorStreak = 0;
                survivorStreakDisplay.innerText = survivorStreak;
                localStorage.setItem("survivorStreak", survivorStreak);
                
                // Remover animação de streak
                document.querySelector(".streak-box.survivor").classList.remove("streak-active");
                
                showNotification("Derrota como Survivor registrada.", "error");
            }
        }
        
        updateStatistics();
        updateLog();
        resetInputs();
    }
    
    /**
     * Reseta todos os dados
     */
    function resetAll() {
        localStorage.removeItem("killerStreak");
        localStorage.removeItem("survivorStreak");
        localStorage.removeItem("gameLog");
        localStorage.removeItem("bestKillerStreak");
        localStorage.removeItem("bestSurvivorStreak");
        
        killerStreak = 0;
        survivorStreak = 0;
        gameLog = [];
        bestKillerStreak = 0;
        bestSurvivorStreak = 0;
        
        killerStreakDisplay.innerText = killerStreak;
        survivorStreakDisplay.innerText = survivorStreak;
        
        // Remover animação de streak
        document.querySelector(".streak-box.killer").classList.remove("streak-active");
        document.querySelector(".streak-box.survivor").classList.remove("streak-active");
        
        updateStatistics();
        updateLog();
        
        showNotification("Todos os dados foram resetados!", "info");
    }
    
    /**
     * Limpa os campos de entrada
     */
    function resetInputs() {
        characterNameInput.value = "";
        perksInput.value = "";
        addonsInput.value = "";
        mapInput.value = "";
        characterNameInput.focus();
    }
    
    /**
     * Atualiza o histórico de partidas
     */
    function updateLog() {
        // Obter filtro ativo
        const activeFilter = document.querySelector(".log-filter.active").getAttribute("data-filter");
        applyLogFilter(activeFilter);
    }
    
    /**
     * Aplica filtro ao histórico
     * @param {string} filter - Filtro a ser aplicado (all, killer, survivor, victory, defeat)
     */
    function applyLogFilter(filter) {
        let filteredLogs = [...gameLog];
        
        if (filter === "killer") {
            filteredLogs = gameLog.filter(game => game.type === "killer");
        } else if (filter === "survivor") {
            filteredLogs = gameLog.filter(game => game.type === "survivor");
        } else if (filter === "victory") {
            filteredLogs = gameLog.filter(game => game.result === "vitória");
        } else if (filter === "defeat") {
            filteredLogs = gameLog.filter(game => game.result === "derrota");
        }
        
        renderGameLog(filteredLogs);
    }
    
    /**
     * Cria o modal para exibir detalhes da partida
     */
    function createGameDetailsModal() {
        // Verificar se já existe
        if (document.getElementById('gameDetailsModal')) {
            return;
        }
        
        // Criar o modal
        const modal = document.createElement('div');
        modal.className = 'game-details-modal';
        modal.id = 'gameDetailsModal';
        modal.innerHTML = `
            <div class="game-details-content">
                <div class="game-details-header">
                    <div class="game-details-icon">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <div class="game-details-title">
                        <h3>Nome do Personagem</h3>
                        <div class="game-result">Tipo de personagem</div>
                    </div>
                    <span class="game-details-result">Resultado</span>
                </div>
                <div class="game-details-info">
                    <div class="game-details-row">
                        <div class="game-details-icon-small">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="game-details-label">Data:</div>
                        <div class="game-details-value">00/00/0000</div>
                    </div>
                    <div class="game-details-row">
                        <div class="game-details-icon-small">
                            <i class="fas fa-map"></i>
                        </div>
                        <div class="game-details-label">Mapa:</div>
                        <div class="game-details-value">Nome do mapa</div>
                    </div>
                    <div class="game-details-row">
                        <div class="game-details-icon-small">
                            <i class="fas fa-cogs"></i>
                        </div>
                        <div class="game-details-label">Perks:</div>
                        <div class="game-details-value">Lista de perks</div>
                    </div>
                    <div class="game-details-row">
                        <div class="game-details-icon-small">
                            <i class="fas fa-toolbox"></i>
                        </div>
                        <div class="game-details-label">Addons:</div>
                        <div class="game-details-value">Lista de addons</div>
                    </div>
                </div>
                <button class="game-details-close">Fechar</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar eventos do modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        document.querySelector('.game-details-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    /**
     * Renderiza o log de partidas usando a abordagem de modal
     * @param {Array} logs - Lista de partidas para mostrar
     */
    function renderGameLog(logs) {
        if (logs.length === 0) {
            gameLogContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-info-circle"></i> Nenhuma partida registrada.
                </div>
            `;
            return;
        }
        
        // Renderizar itens do log
        gameLogContainer.innerHTML = logs.map((game, index) => {
            // Formatação da data
            const dateObj = new Date(game.timestamp);
            const formattedDate = formatDate(dateObj);
            
            // Ícone para resultado
            const resultIcon = game.result === "vitória" 
                ? '<i class="fas fa-trophy win-icon result-icon"></i>' 
                : '<i class="fas fa-skull-crossbones loss-icon result-icon"></i>';
            
            // Classe para resultado
            const resultClass = game.result === "vitória" ? "victory" : "defeat";
            
            // Adicionar badge para streak boa
            const isBestStreak = (index === 0 && (
                (game.type === "killer" && killerStreak >= 3) || 
                (game.type === "survivor" && survivorStreak >= 3)
            ));
            
            const streakBadge = isBestStreak && game.result === "vitória" 
                ? `<div class="record-badge">${game.type === "killer" ? killerStreak : survivorStreak}x Streak!</div>` 
                : '';
            
            return `<li class="${game.type} ${resultClass}" data-index="${index}">
                ${streakBadge}
                <div class="entry-details">
                    <span class="entry-name">${resultIcon} ${game.name}</span>
                    <span class="entry-time">${formattedDate}</span>
                </div>
                <span class="entry-type ${game.type}">${game.type}</span>
            </li>`;
        }).join("");
        
        // Adicionar eventos de clique para abrir modal
        document.querySelectorAll('#gameLog li').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.getAttribute('data-index'));
                const game = logs[index];
                
                // Obter o modal
                const modal = document.getElementById('gameDetailsModal');
                
                // Definir ícones e classes baseados no tipo e resultado
                const iconClass = game.type === "killer" ? "fa-skull" : "fa-running";
                const resultClass = game.result === "vitória" ? "victory" : "defeat";
                
                // Atualizar header
                const iconEl = modal.querySelector('.game-details-icon i');
                iconEl.className = `fas ${iconClass}`;
                
                const titleEl = modal.querySelector('.game-details-title h3');
                titleEl.textContent = game.name;
                
                const subtitleEl = modal.querySelector('.game-details-title .game-result');
                subtitleEl.textContent = game.type.charAt(0).toUpperCase() + game.type.slice(1);
                
                const resultEl = modal.querySelector('.game-details-result');
                resultEl.className = `game-details-result ${resultClass}`;
                resultEl.textContent = game.result.toUpperCase();
                
                // Atualizar detalhes
                const rows = modal.querySelectorAll('.game-details-row');
                
                // Data
                rows[0].querySelector('.game-details-value').textContent = game.timestamp;
                
                // Mapa
                rows[1].querySelector('.game-details-value').textContent = game.map;
                
                // Perks
                rows[2].querySelector('.game-details-value').textContent = game.perks;
                
                // Addons
                rows[3].querySelector('.game-details-value').textContent = game.addons;
                
                // Mostrar modal
                modal.style.display = 'flex';
            });
        });
    }
    
    /**
     * Atualiza as estatísticas gerais
     */
    function updateStatistics() {
        // Calcular estatísticas
        const totalGames = gameLog.length;
        const totalWins = gameLog.filter(game => game.result === "vitória").length;
        const totalLosses = gameLog.filter(game => game.result === "derrota").length;
        const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
        const bestStreak = Math.max(bestKillerStreak, bestSurvivorStreak);
        
        // Atualizar exibição
        totalGamesDisplay.textContent = totalGames;
        totalWinsDisplay.textContent = totalWins;
        totalLossesDisplay.textContent = totalLosses;
        winRateDisplay.textContent = `${winRate}%`;
        bestStreakDisplay.textContent = bestStreak;
    }
    
    /**
     * Formata a data para exibição
     * @param {Date} date - Data a ser formatada
     * @returns {string} - String formatada da data
     */
    function formatDate(date) {
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
        
        if (isToday) {
            return `Hoje ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
        } else if (isYesterday) {
            return `Ontem ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
        } else {
            return date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}) + 
                   ` ${date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
        }
    }
    
    /**
     * Aplica o tema claro ou escuro
     */
    function applyTheme() {
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
            document.body.classList.remove("light-mode");
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.classList.add("light-mode");
            document.body.classList.remove("dark-mode");
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    /**
     * Mostra uma notificação para o usuário
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de notificação (success, error, info)
     */
    function showNotification(message, type = "info") {
        // Verificar se já existe uma notificação
        let notification = document.querySelector(".notification");
        
        // Se já existir, remover
        if (notification) {
            notification.remove();
        }
        
        // Criar nova notificação
        notification = document.createElement("div");
        notification.className = "notification";
        
        // Definir ícone baseado no tipo
        let icon = "";
        if (type === "success") {
            icon = '<i class="fas fa-check-circle notification-icon"></i>';
        } else if (type === "error") {
            icon = '<i class="fas fa-exclamation-circle notification-icon"></i>';
        } else {
            icon = '<i class="fas fa-info-circle notification-icon"></i>';
        }
        
        // Criar conteúdo da notificação
        notification.innerHTML = `
            ${icon}
            <span>${message}</span>
            <div class="notification-progress"></div>
        `;
        
        // Adicionar à página
        document.body.appendChild(notification);
        
        // Mostrar com uma pequena animação
        setTimeout(() => {
            notification.classList.add("show");
        }, 10);
        
        // Ocultar após 3 segundos
        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * Adiciona efeito de ondulação ao botão
     * @param {Event} e - Evento de clique
     */
    function addRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    /**
     * Cria confetes para celebrar uma vitória
     */
    function createConfetti() {
        const colors = ['#ff4444', '#44b4ff', '#ffcc00', '#ff44aa', '#44ffcc'];
        const totalConfetti = 50;
        
        for (let i = 0; i < totalConfetti; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = `${Math.random() * 10 + 5}px`;
                confetti.style.height = `${Math.random() * 10 + 5}px`;
                confetti.style.opacity = Math.random() + 0.5;
                confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
                
                document.body.appendChild(confetti);
                
                // Remover após a animação
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }, i * 50);
        }
    }
});

// Adicionar isso à seção de inicialização do script 
function initializeApp() {
    // Atualizar exibição de streaks
    killerStreakDisplay.innerText = killerStreak;
    survivorStreakDisplay.innerText = survivorStreak;
    
    // Definir modo de cor (verificando localStorage ou padrão para escuro)
    isDarkMode = localStorage.getItem("darkMode") !== "false"; // Padrão é true se não estiver definido
    applyTheme();
    
    // Atualizar estatísticas
    updateStatistics();
    
    // Atualizar histórico
    updateLog();
    
    // Criar modal de detalhes
    createGameDetailsModal();
    
    // Ativar animação de streak se tiver alguma ativa
    if (killerStreak > 0) {
        document.querySelector(".streak-box.killer").classList.add("streak-active");
    }
    if (survivorStreak > 0) {
        document.querySelector(".streak-box.survivor").classList.add("streak-active");
    }
    
    // Definir primeiro input como foco
    characterNameInput.focus();
}

// Substituir a função applyTheme por esta versão melhorada
function applyTheme() {
    // Adicionar classe de transição para animação suave
    document.body.classList.add('theme-toggle-transition');
    
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Após a transição ser concluída, remover a classe para evitar animações não desejadas
    setTimeout(() => {
        document.body.classList.remove('theme-toggle-transition');
    }, 500);
}

// Substituir o event listener do botão de alternar tema
themeToggle.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem("darkMode", isDarkMode);
    applyTheme();
    
    // Efeito de flash na tela para a transição
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    flash.style.zIndex = '9999';
    flash.style.opacity = '0';
    flash.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0.5';
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                flash.remove();
            }, 300);
        }, 100);
    }, 10);
    
    // Mostrar notificação
    const message = isDarkMode 
        ? "Modo escuro ativado 🌙" 
        : "Modo claro ativado ☀️";
    showNotification(message, "info");
});