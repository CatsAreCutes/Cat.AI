/* =====================================================
   CAT.AI — COMPLETE ARCADE + CHAT SYSTEM
   ===================================================== */

/* =====================================================
   STATE
===================================================== */

let currentChat = {
  id: Date.now(),
  title: "New Chat",
  messages: []
};

let playerName =
  localStorage.getItem("catAIPlayerName") || "";

let selectedGame = "mouse";

let gameState = {
  running: false,
  score: 0,
  time: 60,
  goal: 20,
  timer: null,
  target: null,
  startedAt: 0,
  type: null
};


/* =====================================================
   ELEMENTS
===================================================== */

const input =
  document.getElementById("input");

const messages =
  document.getElementById("messages");

const historyBox =
  document.getElementById("history");

const arcade =
  document.getElementById("arcade");

const arcadeView =
  document.getElementById("arcadeView");

const nameOverlay =
  document.getElementById("nameOverlay");

const playerNameInput =
  document.getElementById("playerName");


/* =====================================================
   GAME DEFINITIONS
===================================================== */

const GAMES = {

  mouse: {
    icon: "🐭",
    title: "Catch the Mouse!",
    description: "Catch 20 mice in 1 minute!",
    time: 60,
    goal: 20,
    scoreName: "Mice"
  },

  yarn: {
    icon: "🧶",
    title: "Yarn Frenzy",
    description: "Catch as much yarn as possible!",
    time: 30,
    goal: 999,
    scoreName: "Yarn"
  },

  fish: {
    icon: "🐟",
    title: "Fish Frenzy",
    description: "Catch as many fish as possible!",
    time: 30,
    goal: 999,
    scoreName: "Fish"
  },

  shoe: {
    icon: "👟",
    title: "Shoe Destroyer",
    description: "DESTROY THE SUSPICIOUS FOOTWEAR!",
    time: 30,
    goal: 999,
    scoreName: "Shoes"
  },

  feather: {
    icon: "🪶",
    title: "Feather Chase",
    description: "Catch the feather before it escapes!",
    time: 30,
    goal: 999,
    scoreName: "Feathers"
  },

  box: {
    icon: "📦",
    title: "Box Attack",
    description: "Find the toys hiding in the boxes!",
    time: 30,
    goal: 999,
    scoreName: "Boxes"
  }

};


/* =====================================================
   CHAT
===================================================== */

function addMessage(text, type, save = true) {

  const div =
    document.createElement("div");

  div.className =
    "message " + type;

  if (type === "cat") {

    const label =
      document.createElement("div");

    label.className =
      "cat-label";

    label.textContent =
      "🐈 Cat.AI";

    div.appendChild(label);

    div.appendChild(
      document.createTextNode(text)
    );

  } else {

    div.textContent = text;

  }

  messages.appendChild(div);

  messages.scrollTop =
    messages.scrollHeight;

  if (save) {

    currentChat.messages.push({
      text,
      type
    });

    if (
      type === "user" &&
      currentChat.title === "New Chat"
    ) {

      currentChat.title =
        text.slice(0, 30) +
        (text.length > 30 ? "..." : "");

    }

    saveChat();

  }

}


function showWelcome() {

  if (!messages.children.length) {

    addMessage(
      "MEOW! New chat detected! What are we talking about?",
      "cat"
    );

  }

}


async function sendMessage() {

  const text =
    input.value.trim();

  if (!text) return;

  addMessage(text, "user");

  input.value = "";

  const thinking =
    document.createElement("div");

  thinking.className =
    "message cat";

  thinking.innerHTML = `
    <div class="cat-label">🐈 Cat.AI</div>
    Cat.AI is thinking... 🧠
  `;

  messages.appendChild(thinking);

  messages.scrollTop =
    messages.scrollHeight;

  try {

    const response =
      await fetch("/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: text
        })

      });

    const data =
      await response.json();

    const reply =
      data.reply ||
      "MRRP! My brain exploded! 🐈";

    thinking.innerHTML = `
      <div class="cat-label">🐈 Cat.AI</div>
    `;

    thinking.appendChild(
      document.createTextNode(reply)
    );

    currentChat.messages.push({
      text: reply,
      type: "cat"
    });

    saveChat();

  } catch (error) {

    thinking.innerHTML = `
      <div class="cat-label">🐈 Cat.AI</div>
      MRRP! I can't reach my brain! 🧠💥
    `;

  }

}


if (input) {

  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {
        sendMessage();
      }

    }
  );

}


/* =====================================================
   CHAT HISTORY
===================================================== */

function saveChat() {

  if (!currentChat.messages.length)
    return;

  const chats =
    JSON.parse(
      localStorage.getItem("catAIChats") || "[]"
    );

  const index =
    chats.findIndex(
      chat => chat.id === currentChat.id
    );

  if (index >= 0) {
    chats[index] = currentChat;
  } else {
    chats.unshift(currentChat);
  }

  localStorage.setItem(
    "catAIChats",
    JSON.stringify(chats.slice(0, 30))
  );

  loadHistory();

}


function loadHistory() {

  if (!historyBox)
    return;

  const chats =
    JSON.parse(
      localStorage.getItem("catAIChats") || "[]"
    );

  historyBox.innerHTML = "";

  chats.forEach(chat => {

    const item =
      document.createElement("div");

    item.className =
      "history-item";

    item.textContent =
      "🐾 " +
      (chat.title || "Untitled Chat");

    item.onclick =
      () => loadChat(chat.id);

    historyBox.appendChild(item);

  });

}


function loadChat(id) {

  const chats =
    JSON.parse(
      localStorage.getItem("catAIChats") || "[]"
    );

  const chat =
    chats.find(c => c.id === id);

  if (!chat)
    return;

  currentChat = chat;

  messages.innerHTML = "";

  currentChat.messages.forEach(message => {

    addMessage(
      message.text,
      message.type,
      false
    );

  });

}


function newChat() {

  saveChat();

  currentChat = {
    id: Date.now(),
    title: "New Chat",
    messages: []
  };

  messages.innerHTML = "";

  showWelcome();

}


function clearHistory() {

  if (
    !confirm(
      "Delete all saved Cat.AI chats?"
    )
  ) {
    return;
  }

  localStorage.removeItem("catAIChats");

  loadHistory();

}


/* =====================================================
   THEMES
===================================================== */

function toggleThemeMenu() {

  const menu =
    document.getElementById("themeMenu");

  if (menu) {
    menu.classList.toggle("open");
  }

}


function setTheme(theme) {

  document.body.classList.remove(
    "theme-og",
    "theme-purple",
    "theme-yarn",
    "theme-pillow"
  );

  document.body.classList.add(
    "theme-" + theme
  );

  localStorage.setItem(
    "catAITheme",
    theme
  );

}


const savedTheme =
  localStorage.getItem("catAITheme");

if (savedTheme) {
  setTheme(savedTheme);
}


/* =====================================================
   PLAYER NAME
===================================================== */

function ensurePlayerName(callback) {

  if (playerName) {

    callback();

    return;

  }

  nameOverlay.classList.add("open");

  playerNameInput.value = "";

  playerNameInput.focus();

  window.pendingGame =
    callback;

}


function savePlayerName() {

  const name =
    playerNameInput.value.trim();

  if (!name)
    return;

  playerName =
    name.slice(0, 20);

  localStorage.setItem(
    "catAIPlayerName",
    playerName
  );

  nameOverlay.classList.remove("open");

  if (window.pendingGame) {

    const callback =
      window.pendingGame;

    window.pendingGame =
      null;

    callback();

  }

}


/* =====================================================
   ARCADE OPEN/CLOSE
===================================================== */

function openArcade() {

  arcade.classList.add("open");

  selectedGame = "mouse";

  showArcadeTab("games");

}


function closeArcade() {

  stopGame();

  arcade.classList.remove("open");

}


function showArcadeTab(tab) {

  const gamesTab =
    document.getElementById("gamesTab");

  const leaderboardTab =
    document.getElementById("leaderboardTab");

  if (gamesTab) {

    gamesTab.classList.toggle(
      "active",
      tab === "games"
    );

  }

  if (leaderboardTab) {

    leaderboardTab.classList.toggle(
      "active",
      tab === "leaderboard"
    );

  }

  if (tab === "games") {

    stopGame();

    renderGameList();

  } else {

    stopGame();

    loadLeaderboard();

  }

}


/* =====================================================
   SIX GAME MENU
===================================================== */

function renderGameList() {

  arcadeView.innerHTML = `

    <div class="game-list">

      ${createGameCard("mouse")}

      ${createGameCard("yarn")}

      ${createGameCard("fish")}

      ${createGameCard("shoe")}

      ${createGameCard("feather")}

      ${createGameCard("box")}

    </div>

  `;

}


function createGameCard(type) {

  const game =
    GAMES[type];

  return `

    <div class="game-card">

      <div class="game-card-icon">
        ${game.icon}
      </div>

      <h3>
        ${game.title}
      </h3>

      <p>
        ${game.description}
      </p>

      <button
        class="play-button"
        onclick="startGame('${type}')">

        PLAY

      </button>

    </div>

  `;

}


/* =====================================================
   START ANY GAME
===================================================== */

function startGame(type) {

  ensurePlayerName(() => {

    selectedGame = type;

    startActualGame(type);

  });

}


function startActualGame(type) {

  stopGame();

  const game =
    GAMES[type];

  gameState = {

    running: true,

    score: 0,

    time: game.time,

    goal: game.goal,

    timer: null,

    target: null,

    startedAt: performance.now(),

    type

  };

  renderGameScreen();

  spawnTarget();

  gameState.timer =
    setInterval(() => {

      if (!gameState.running)
        return;

      gameState.time--;

      updateGameStats();

      if (gameState.time <= 0) {

        finishGame(false);

      }

    }, 1000);

}


/* =====================================================
   GAME SCREEN
===================================================== */

function renderGameScreen() {

  const game =
    GAMES[selectedGame];

  const goalText =
    selectedGame === "mouse"
      ? "Catch 20 mice in 1 minute!"
      : game.description;

  arcadeView.innerHTML = `

    <div class="game-screen">

      <div style="
        text-align:center;
        margin-bottom:5px;
      ">

        <h2>
          ${game.icon}
          ${game.title}
        </h2>

        <div style="
          color:var(--muted);
          font-size:13px;
        ">
          ${goalText}
        </div>

      </div>

      <div class="game-stats">

        <div>
          ${game.scoreName}:
          <span id="gameScore">
            0
          </span>
          ${
            selectedGame === "mouse"
              ? " / 20"
              : ""
          }
        </div>

        <div>
          Time:
          <span id="gameTime">
            ${gameState.time}
          </span>
          s
        </div>

      </div>

      <div
        id="gameBoard"
        class="game-board">
      </div>

      <div
        id="gameMessage"
        class="game-message">

        🐈 Cat.AI:
        ${gameStartMessage()}

      </div>

      <button
        class="start-game"
        onclick="stopGame(); renderGameList()">

        ← EXIT GAME

      </button>

    </div>

  `;

}


function gameStartMessage() {

  const messages = {

    mouse:
      `Ready to hunt some mice, ${playerName}?`,

    yarn:
      `GET THAT YARN, ${playerName.toUpperCase()}! 🧶`,

    fish:
      `FISH DETECTED! GO GO GO! 🐟`,

    shoe:
      `HISS! DESTROY THE SHOES! 👟`,

    feather:
      `DON'T LET THE FEATHER ESCAPE! 🪶`,

    box:
      `ATTACK THE BOXES! 📦`

  };

  return messages[selectedGame];

}


/* =====================================================
   SPAWN TARGET
===================================================== */

function spawnTarget() {

  if (!gameState.running)
    return;

  const board =
    document.getElementById("gameBoard");

  if (!board)
    return;

  if (gameState.target) {

    gameState.target.remove();

  }

  const game =
    GAMES[selectedGame];

  const target =
    document.createElement("button");

  target.className =
    "target";

  target.type =
    "button";

  target.textContent =
    game.icon;

  const maxX =
    Math.max(
      0,
      board.clientWidth - 70
    );

  const maxY =
    Math.max(
      0,
      board.clientHeight - 70
    );

  target.style.left =
    Math.random() * maxX + "px";

  target.style.top =
    Math.random() * maxY + "px";

  target.onclick =
    hitTarget;

  board.appendChild(target);

  gameState.target =
    target;

}


/* =====================================================
   HIT TARGET
===================================================== */

function hitTarget() {

  if (!gameState.running)
    return;

  gameState.score++;

  updateGameStats();

  playMeow();

  /*
     Mouse Game:
     20 catches = instant win.

     Other games:
     Keep going until the timer runs out.
  */

  if (
    selectedGame === "mouse" &&
    gameState.score >= 20
  ) {

    finishGame(true);

    return;

  }

  updateEncouragement();

  spawnTarget();

}


/* =====================================================
   UPDATE STATS
===================================================== */

function updateGameStats() {

  const score =
    document.getElementById("gameScore");

  const time =
    document.getElementById("gameTime");

  if (score) {

    score.textContent =
      gameState.score;

  }

  if (time) {

    time.textContent =
      gameState.time;

  }

}


/* =====================================================
   CAT.AI ENCOURAGEMENT
===================================================== */

async function updateEncouragement() {

  const message =
    document.getElementById(
      "gameMessage"
    );

  if (!message)
    return;

  /*
     Don't ask Groq on every single click.
     Only encourage at certain scores.
  */

  const score =
    gameState.score;

  const shouldSpeak =
    selectedGame === "mouse"
      ? [1, 5, 10, 15, 18, 19].includes(score)
      : score === 1 ||
        score % 10 === 0;

  if (!shouldSpeak)
    return;

  message.textContent =
    "🐈 Cat.AI: MEOW! KEEP GOING!";

  try {

    const response =
      await fetch("/chat", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          message:
            `You are Cat.AI cheering for ${playerName} during the ${GAMES[selectedGame].title} minigame. They have ${score} points and ${gameState.time} seconds left. Give ONE extremely short excited cat-like encouragement. Maximum 12 words.`

        })

      });

    if (!response.ok)
      throw new Error("Chat failed");

    const data =
      await response.json();

    message.textContent =
      "🐈 Cat.AI: " +
      (
        data.reply ||
        fallbackEncouragement()
      );

  } catch {

    message.textContent =
      "🐈 Cat.AI: " +
      fallbackEncouragement();

  }

}


function fallbackEncouragement() {

  if (selectedGame === "mouse") {

    if (gameState.score >= 18)
      return "ALMOST 20! CATCH THAT MOUSE!";

    if (gameState.score >= 10)
      return "HALFWAY THERE! MEOW!";

    return "GET THE MOUSE! 🐭";

  }

  if (selectedGame === "shoe")
    return "HISS! DESTROY MORE SHOES!";

  if (selectedGame === "yarn")
    return "MORE YARN! MORE YARN! 🧶";

  if (selectedGame === "fish")
    return "CATCH THAT FISH! 🐟";

  if (selectedGame === "feather")
    return "DON'T LET IT ESCAPE! 🪶";

  if (selectedGame === "box")
    return "ATTACK THE BOX! 📦";

  return "MEOW! KEEP GOING!";

}


/* =====================================================
   FINISH GAME
===================================================== */

async function finishGame(won) {

  if (!gameState.running)
    return;

  gameState.running =
    false;

  clearInterval(
    gameState.timer
  );

  gameState.timer =
    null;

  if (gameState.target) {

    gameState.target.remove();

    gameState.target =
      null;

  }

  const message =
    document.getElementById(
      "gameMessage"
    );

  const score =
    gameState.score;

  const game =
    GAMES[selectedGame];

  if (message) {

    if (won) {

      message.textContent =
        `🐈 Cat.AI: MEOW!!! ${playerName.toUpperCase()} DID IT! 🎉`;

      playWinSound();

    } else {

      message.textContent =
        `🐈 Cat.AI: TIME'S UP! ${playerName.toUpperCase()} GOT ${score} ${game.scoreName.toLowerCase()}!`;

    }

  }

  await submitScore(
    score,
    gameState.time,
    won
  );

  const button =
    document.querySelector(
      ".start-game"
    );

  if (button) {

    button.textContent =
      "🏆 VIEW LEADERBOARD";

    button.onclick =
      () => showArcadeTab("leaderboard");

  }

}


/* =====================================================
   SUBMIT SCORE TO SERVER
===================================================== */

async function submitScore(
  score,
  time,
  won
) {

  try {

    const response =
      await fetch(
        "/api/scores",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            name: playerName,

            game: selectedGame,

            score: score,

            time: time,

            won: won

          })

        }
      );

    if (!response.ok) {

      console.error(
        "Server rejected score."
      );

    }

  } catch (error) {

    console.error(
      "Score submission failed:",
      error
    );

  }

}


/* =====================================================
   LEADERBOARD
===================================================== */

async function loadLeaderboard() {

  arcadeView.innerHTML = `

    <h2>🏆 Leaderboard</h2>

    <p style="color:var(--muted)">
      Loading the world's cats...
    </p>

    <div style="
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin:15px 0;
    ">

      ${leaderboardGameButtons()}

    </div>

  `;

  try {

    const response =
      await fetch(
        "/api/leaderboard?game=" +
        encodeURIComponent(
          selectedGame
        )
      );

    if (!response.ok)
      throw new Error("Leaderboard failed");

    const data =
      await response.json();

    const rows =
      Array.isArray(data.scores)
        ? data.scores
        : [];

    renderLeaderboardRows(rows);

  } catch (error) {

    arcadeView.innerHTML += `

      <p>
        MRRP! The leaderboard server
        isn't responding yet. 🐈
      </p>

    `;

  }

}


function leaderboardGameButtons() {

  return Object.keys(GAMES)
    .map(type => {

      const game =
        GAMES[type];

      return `

        <button
          class="arcade-tab ${
            selectedGame === type
              ? "active"
              : ""
          }"
          onclick="selectLeaderboardGame('${type}')">

          ${game.icon}
          ${game.title}

        </button>

      `;

    })
    .join("");

}


function selectLeaderboardGame(type) {

  selectedGame = type;

  loadLeaderboard();

}


function renderLeaderboardRows(rows) {

  const game =
    GAMES[selectedGame];

  const existing =
    arcadeView.querySelector(
      ".leaderboard-results"
    );

  const html = `

    <div class="leaderboard-results">

      <h2>
        ${game.icon}
        ${game.title}
        — 🏆
      </h2>

      <p style="color:var(--muted)">
        Global Cat.AI Arcade leaderboard
      </p>

      <table class="leaderboard-table">

        <thead>

          <tr>

            <th>#</th>
            <th>PLAYER</th>
            <th>SCORE</th>
            <th>TIME</th>

          </tr>

        </thead>

        <tbody>

          ${
            rows.length

              ? rows
                  .map(
                    (row, index) => `

                      <tr>

                        <td>
                          ${
                            index === 0
                              ? "👑"
                              : index + 1
                          }
                        </td>

                        <td>
                          ${escapeHtml(
                            String(
                              row.name ||
                              "Anonymous Cat"
                            )
                          )}
                        </td>

                        <td>
                          ${Number(
                            row.score || 0
                          )}
                        </td>

                        <td>
                          ${Number(
                            row.time || 0
                          )}s
                        </td>

                      </tr>

                    `
                  )
                  .join("")

              : `

                  <tr>

                    <td colspan="4">

                      No scores yet.
                      Be the first cat! 🐈

                    </td>

                  </tr>

                `
          }

        </tbody>

      </table>

    </div>

  `;

  if (existing) {

    existing.outerHTML =
      html;

  } else {

    arcadeView.insertAdjacentHTML(
      "beforeend",
      html
    );

  }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}


/* =====================================================
   STOP GAME
===================================================== */

function stopGame() {

  gameState.running =
    false;

  if (gameState.timer) {

    clearInterval(
      gameState.timer
    );

  }

  gameState.timer =
    null;

  if (gameState.target) {

    gameState.target.remove();

    gameState.target =
      null;

  }

}


/* =====================================================
   SOUND
===================================================== */

function playMeow() {

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext)
    return;

  const audio =
    new AudioContext();

  const osc =
    audio.createOscillator();

  const gain =
    audio.createGain();

  osc.type =
    "sine";

  osc.frequency.setValueAtTime(
    650,
    audio.currentTime
  );

  osc.frequency.exponentialRampToValueAtTime(
    900,
    audio.currentTime + 0.08
  );

  osc.frequency.exponentialRampToValueAtTime(
    420,
    audio.currentTime + 0.22
  );

  gain.gain.setValueAtTime(
    0.001,
    audio.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.18,
    audio.currentTime + 0.02
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audio.currentTime + 0.22
  );

  osc.connect(gain);

  gain.connect(
    audio.destination
  );

  osc.start();

  osc.stop(
    audio.currentTime + 0.22
  );

}


/* =====================================================
   WIN SOUND
===================================================== */

function playWinSound() {

  const AudioContext =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContext)
    return;

  const audio =
    new AudioContext();

  const notes =
    [523, 659, 784];

  notes.forEach(
    (frequency, index) => {

      const osc =
        audio.createOscillator();

      const gain =
        audio.createGain();

      const start =
        audio.currentTime +
        index * 0.12;

      osc.type =
        "sine";

      osc.frequency.value =
        frequency;

      gain.gain.setValueAtTime(
        0.001,
        start
      );

      gain.gain.exponentialRampToValueAtTime(
        0.2,
        start + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        start + 0.18
      );

      osc.connect(gain);

      gain.connect(
        audio.destination
      );

      osc.start(start);

      osc.stop(
        start + 0.18
      );

    }
  );

}


/* =====================================================
   SECRET CAT
===================================================== */

function secretMeow() {

  const cat =
    document.querySelector(
      ".secret-cat"
    );

  if (cat) {

    cat.classList.remove(
      "meowing"
    );

    void cat.offsetWidth;

    cat.classList.add(
      "meowing"
    );

  }

  playMeow();

  const bubble =
    document.createElement("div");

  bubble.textContent =
    "MEOW! 🐈";

  bubble.style.cssText = `

    position:fixed;

    right:70px;
    bottom:70px;

    padding:10px 15px;

    border-radius:15px;

    background:var(--panel);

    color:var(--text);

    border:1px solid var(--border);

    z-index:1000;

    font-weight:bold;

  `;

  document.body.appendChild(
    bubble
  );

  setTimeout(
    () => bubble.remove(),
    1200
  );

}


/* =====================================================
   STARTUP
===================================================== */

loadHistory();

showWelcome();


/* =====================================================
   DEBUG
===================================================== */

console.log(
  "🐈 Cat.AI Arcade loaded!"
);

console.log(
  "Games loaded:",
  Object.keys(GAMES)
);