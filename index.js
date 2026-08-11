```javascript
/* =====================================================
   CAT.AI — COMPLETE ARCADE JAVASCRIPT
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
  time: 0,
  startedAt: 0,
  timer: null,
  target: null,
  goal: 0,
  type: null
};


/* =====================================================
   ELEMENTS
===================================================== */

const input = document.getElementById("input");
const messages = document.getElementById("messages");
const historyBox = document.getElementById("history");

const arcade = document.getElementById("arcade");
const arcadeView = document.getElementById("arcadeView");

const nameOverlay =
  document.getElementById("nameOverlay");

const playerNameInput =
  document.getElementById("playerName");


/* =====================================================
   CHAT
===================================================== */

function addMessage(text, type, save = true) {

  const div = document.createElement("div");

  div.className = "message " + type;

  if (type === "cat") {

    const label = document.createElement("div");

    label.className = "cat-label";
    label.textContent = "🐈 Cat.AI";

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

  addMessage(
    "MEOW! New chat detected! What are we talking about?",
    "cat"
  );

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

  const label =
    document.createElement("div");

  label.className =
    "cat-label";

  label.textContent =
    "🐈 Cat.AI";

  thinking.appendChild(label);

  thinking.appendChild(
    document.createTextNode(
      "Cat.AI is thinking... 🧠"
    )
  );

  messages.appendChild(thinking);

  messages.scrollTop =
    messages.scrollHeight;

  try {

    const response =
      await fetch("/chat", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          message: text
        })
      });

    if (!response.ok)
      throw new Error("Chat request failed");

    const data =
      await response.json();

    const reply =
      data.reply ||
      "MRRP! My brain exploded! 🐈";

    thinking.innerHTML = "";

    const newLabel =
      document.createElement("div");

    newLabel.className =
      "cat-label";

    newLabel.textContent =
      "🐈 Cat.AI";

    thinking.appendChild(newLabel);

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
      <div class="cat-label">
        🐈 Cat.AI
      </div>
      MRRP! I can't reach my brain! 🧠💥
    `;

    console.error(error);
  }
}


input.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "Enter")
      sendMessage();

  }
);


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

  if (index >= 0)
    chats[index] = currentChat;
  else
    chats.unshift(currentChat);

  localStorage.setItem(
    "catAIChats",
    JSON.stringify(chats.slice(0, 30))
  );

  loadHistory();
}


function loadHistory() {

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
    chats.find(
      c => c.id === id
    );

  if (!chat)
    return;

  currentChat = chat;

  messages.innerHTML = "";

  currentChat.messages.forEach(
    message => {

      addMessage(
        message.text,
        message.type,
        false
      );

    }
  );
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
  )
    return;

  localStorage.removeItem(
    "catAIChats"
  );

  loadHistory();
}


/* =====================================================
   THEMES
===================================================== */

function toggleThemeMenu() {

  document
    .getElementById("themeMenu")
    .classList.toggle("open");

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

if (savedTheme)
  setTheme(savedTheme);


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
    name
      .replace(/[<>]/g, "")
      .slice(0, 20);

  localStorage.setItem(
    "catAIPlayerName",
    playerName
  );

  nameOverlay.classList.remove(
    "open"
  );

  if (window.pendingGame) {

    const callback =
      window.pendingGame;

    window.pendingGame =
      null;

    callback();

  }
}


playerNameInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter")
      savePlayerName();

  }
);


/* =====================================================
   ARCADE
===================================================== */

function openArcade() {

  arcade.classList.add("open");

  showArcadeTab("games");

}


function closeArcade() {

  stopGame();

  arcade.classList.remove(
    "open"
  );

}


function showArcadeTab(tab) {

  document
    .getElementById("gamesTab")
    .classList.toggle(
      "active",
      tab === "games"
    );

  document
    .getElementById("leaderboardTab")
    .classList.toggle(
      "active",
      tab === "leaderboard"
    );

  if (tab === "games")
    renderGameList();
  else
    loadLeaderboard();
}


/* =====================================================
   SIX GAMES
===================================================== */

const GAMES = {

  mouse: {
    icon: "🐭",
    title: "Catch the Mouse!",
    description:
      "Catch 20 mice in 1 minute!",
    time: 60,
    goal: 20
  },

  yarn: {
    icon: "🧶",
    title: "Yarn Frenzy",
    description:
      "Catch 50 balls of yarn!",
    time: 45,
    goal: 50
  },

  fish: {
    icon: "🐟",
    title: "Fish Frenzy",
    description:
      "Catch 30 fish!",
    time: 45,
    goal: 30
  },

  shoe: {
    icon: "👟",
    title: "Shoe Destroyer",
    description:
      "Destroy 40 suspicious shoes!",
    time: 45,
    goal: 40
  },

  feather: {
    icon: "🪶",
    title: "Feather Chase",
    description:
      "Catch 25 feathers!",
    time: 40,
    goal: 25
  },

  box: {
    icon: "📦",
    title: "Box Attack",
    description:
      "Find 20 toys hidden in boxes!",
    time: 45,
    goal: 20
  }

};


/* =====================================================
   GAME LIST
===================================================== */

function renderGameList() {

  arcadeView.innerHTML = `

    <h2>🎮 Cat.AI Arcade</h2>

    <p style="color:var(--muted)">
      Pick a game and show the other cats
      who's best!
    </p>

    <div class="game-list">

      ${Object.entries(GAMES).map(
        ([id, game]) => `

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
            onclick="startGame('${id}')">

            PLAY

          </button>

        </div>

      `
      ).join("")}

    </div>
  `;
}


/* =====================================================
   START GAME
===================================================== */

function startGame(type) {

  ensurePlayerName(() => {

    selectedGame = type;

    const config =
      GAMES[type];

    gameState = {

      running: true,

      score: 0,

      time: config.time,

      startedAt:
        performance.now(),

      timer: null,

      target: null,

      goal: config.goal,

      type

    };

    renderGameScreen();

    spawnTarget(
      config.icon
    );

    gameState.timer =
      setInterval(
        () => {

          if (!gameState.running)
            return;

          gameState.time--;

          updateGameStats();

          if (
            gameState.time <= 0
          ) {

            finishGame(
              gameState.score >=
              gameState.goal
            );

          }

        },
        1000
      );

  });
}


/* =====================================================
   GAME SCREEN
===================================================== */

function renderGameScreen() {

  const config =
    GAMES[selectedGame];

  arcadeView.innerHTML = `

    <div class="game-screen">

      <div style="
        text-align:center;
        margin-bottom:5px;
      ">

        <h2>
          ${config.icon}
          ${config.title}
        </h2>

        <div style="
          color:var(--muted);
          font-size:13px;
        ">

          ${config.description}

        </div>

      </div>


      <div class="game-stats">

        <div>
          Score:
          <span id="gameScore">
            0
          </span>
          /
          ${config.goal}
        </div>

        <div>
          Time:
          <span id="gameTime">
            ${config.time}
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
        onclick="
          stopGame();
          renderGameList();
        ">

        ← EXIT GAME

      </button>

    </div>
  `;
}


function gameStartMessage() {

  if (selectedGame === "shoe")
    return "HISS! DESTROY THE FOOTWEAR!";

  if (selectedGame === "yarn")
    return "PURR! GET THE YARN!";

  if (selectedGame === "fish")
    return "MEOW! FISH TIME!";

  if (selectedGame === "feather")
    return "FLUFFY FEATHER DETECTED!";

  if (selectedGame === "box")
    return "OPEN THE BOXES!";

  return `GO ${playerName.toUpperCase()}! GET IT!`;
}


/* =====================================================
   TARGET
===================================================== */

function spawnTarget(icon) {

  if (!gameState.running)
    return;

  const board =
    document.getElementById(
      "gameBoard"
    );

  if (!board)
    return;

  if (gameState.target)
    gameState.target.remove();

  const target =
    document.createElement("button");

  target.className =
    "target";

  target.textContent =
    icon;

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
    Math.random() *
    maxX +
    "px";

  target.style.top =
    Math.random() *
    maxY +
    "px";

  target.style.transform =
    `rotate(${Math.random() * 30 - 15}deg)`;

  target.onclick =
    hitTarget;

  board.appendChild(
    target
  );

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

  const goal =
    gameState.goal;

  if (
    gameState.score >= goal
  ) {

    finishGame(true);

    return;

  }

  updateEncouragement();

  spawnTarget(
    GAMES[selectedGame].icon
  );
}


/* =====================================================
   GAME STATS
===================================================== */

function updateGameStats() {

  const score =
    document.getElementById(
      "gameScore"
    );

  const time =
    document.getElementById(
      "gameTime"
    );

  if (score)
    score.textContent =
      gameState.score;

  if (time)
    time.textContent =
      gameState.time;

}


/* =====================================================
   CAT.AI ENCOURAGEMENT
===================================================== */

let lastEncouragementScore = -1;


async function updateEncouragement() {

  const score =
    gameState.score;

  const milestones = {

    mouse:
      [1, 5, 10, 15, 18, 19],

    yarn:
      [5, 10, 20, 30, 40],

    fish:
      [5, 10, 20, 25],

    shoe:
      [5, 10, 20, 30, 35],

    feather:
      [5, 10, 15, 20],

    box:
      [5, 10, 15]

  };

  if (
    !milestones[selectedGame]
      .includes(score)
  )
    return;

  if (
    score ===
    lastEncouragementScore
  )
    return;

  lastEncouragementScore =
    score;

  const message =
    document.getElementById(
      "gameMessage"
    );

  if (!message)
    return;

  message.textContent =
    "🐈 Cat.AI: MEOW MEOW MEOW!";

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
            `You are Cat.AI cheering for ${playerName} during the ${GAMES[selectedGame].title} minigame. They have ${gameState.score} points and ${gameState.time} seconds left. Give ONE extremely short excited cat-like encouragement. Maximum 12 words.`

        })

      });

    if (!response.ok)
      throw new Error(
        "Encouragement failed"
      );

    const data =
      await response.json();

    if (!gameState.running)
      return;

    message.textContent =
      "🐈 Cat.AI: " +
      (
        data.reply ||
        fallbackEncouragement()
      );

  } catch {

    if (gameState.running) {

      message.textContent =
        "🐈 Cat.AI: " +
        fallbackEncouragement();

    }

  }
}


function fallbackEncouragement() {

  if (selectedGame === "shoe")
    return "HISS! DESTROY MORE SHOES!";

  if (selectedGame === "yarn")
    return "PURRRR! MORE YARN!";

  if (selectedGame === "fish")
    return "MEOW! CATCH THAT FISH!";

  if (selectedGame === "feather")
    return "GET THE FEATHER! FLUFF FLUFF!";

  if (selectedGame === "box")
    return "OPEN THAT BOX!";

  if (gameState.score >= 18)
    return "MRRP! ALMOST THERE!";

  if (gameState.score >= 10)
    return "MEOW! KEEP GOING!";

  return "PURR! NICE CATCH!";
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

  const completionTime =
    Math.max(
      1,
      Math.round(
        (
          performance.now() -
          gameState.startedAt
        ) / 1000
      )
    );

  const message =
    document.getElementById(
      "gameMessage"
    );

  if (won) {

    message.textContent =
      `🐈 Cat.AI: MEOW!!! ${playerName.toUpperCase()} DID IT! 🎉`;

    playWinSound();

  } else {

    message.textContent =
      `🐈 Cat.AI: TIME'S UP! ${playerName.toUpperCase()} GOT ${gameState.score}!`;

  }

  await submitScore(
    gameState.score,
    completionTime,
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
      () => showArcadeTab(
        "leaderboard"
      );

  }
}


/* =====================================================
   SUBMIT SCORE
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

    if (!response.ok)
      throw new Error(
        "Score submission failed"
      );

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

  const game =
    selectedGame || "mouse";

  arcadeView.innerHTML = `

    <h2>
      🏆 ${gameTitle(game)}
    </h2>

    <p style="color:var(--muted)">
      Loading the world's cats...
    </p>

  `;

  try {

    const response =
      await fetch(
        "/api/leaderboard?game=" +
        encodeURIComponent(game)
      );

    if (!response.ok)
      throw new Error(
        "Leaderboard failed"
      );

    const data =
      await response.json();

    const rows =
      Array.isArray(data.scores)
        ? data.scores
        : [];

    arcadeView.innerHTML = `

      <h2>
        🏆 ${gameTitle(game)}
      </h2>

      <p style="color:var(--muted)">
        Global Cat.AI Arcade leaderboard
      </p>

      <div style="
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        margin-bottom:15px;
      ">

        ${Object.entries(GAMES)
          .map(
            ([id, info]) => `

              <button
                class="arcade-tab ${
                  id === game
                    ? "active"
                    : ""
                }"
                onclick="
                  selectedGame='${id}';
                  loadLeaderboard();
                ">

                ${info.icon}
                ${info.title}

              </button>

            `
          )
          .join("")}

      </div>

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

              ? rows.map(
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
                ).join("")

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

    `;

  } catch (error) {

    console.error(error);

    arcadeView.innerHTML = `

      <h2>
        🏆 ${gameTitle(game)}
      </h2>

      <p>
        MRRP! The leaderboard server
        isn't responding yet. 🐈
      </p>

      <p style="
        color:var(--muted);
        font-size:13px;
      ">

        Make sure your Node.js server
        is running and has the
        <code>/api/leaderboard</code>
        endpoint.

      </p>

    `;

  }
}


/* =====================================================
   GAME TITLES
===================================================== */

function gameTitle(game) {

  return GAMES[game]
    ? GAMES[game].title
    : "Cat.AI Arcade";

}


/* =====================================================
   HTML ESCAPING
===================================================== */

function escapeHtml(text) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text;

  return div.innerHTML;

}


/* =====================================================
   GAME CONTROL
===================================================== */

function stopGame() {

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

  [523, 659, 784, 1046]
    .forEach(
      (frequency, index) => {

        const osc =
          audio.createOscillator();

        const gain =
          audio.createGain();

        const start =
          audio.currentTime +
          index * 0.11;

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
          start + 0.2
        );

        osc.connect(gain);

        gain.connect(
          audio.destination
        );

        osc.start(start);

        osc.stop(
          start + 0.2
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

  if (!cat)
    return;

  cat.classList.remove(
    "meowing"
  );

  void cat.offsetWidth;

  cat.classList.add(
    "meowing"
  );

  playMeow();

  const bubble =
    document.createElement(
      "div"
    );

  bubble.textContent =
    "MEOW!";

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
```
