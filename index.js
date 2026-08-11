const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const leaderboardFile = path.join(__dirname, "leaderboard.json");


// =====================================================
// LEADERBOARD STORAGE
// =====================================================

function loadLeaderboard() {
  try {
    if (!fs.existsSync(leaderboardFile)) {
      fs.writeFileSync(
        leaderboardFile,
        JSON.stringify({ mouse: [] }, null, 2)
      );
    }

    const data = JSON.parse(
      fs.readFileSync(leaderboardFile, "utf8")
    );

    if (!data.mouse) {
      data.mouse = [];
    }

    return data;
  } catch (error) {
    console.error("Leaderboard load error:", error);
    return { mouse: [] };
  }
}


function saveLeaderboard(data) {
  fs.writeFileSync(
    leaderboardFile,
    JSON.stringify(data, null, 2)
  );
}


// =====================================================
// GROQ CHAT
// =====================================================

app.post("/chat", async (req, res) => {
  const message = String(req.body.message || "").trim();

  if (!message) {
    return res.json({
      reply: "MEOW?"
    });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.json({
      reply:
        "MRRP! My Groq brain isn't connected yet! Check your GROQ_API_KEY."
    });
  }

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.GROQ_API_KEY}`
        },

        body: JSON.stringify({
          model: "llama-3.1-8b-instant",

          messages: [
            {
              role: "system",
              content: `
You are Cat.AI, a silly cat-themed AI.

You love cats.
You think shoes are suspicious.
You can say MEOW, MRRP, HISS, and PURR.
Be friendly, funny, and concise.

Do not claim to be a real cat.
Do not make every response only "MEOW".
              `.trim()
            },

            {
              role: "user",
              content: message
            }
          ],

          temperature: 0.8,
          max_tokens: 250
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", data);

      return res.json({
        reply:
          "HISS! My brain tripped over a cable! 🧠🐈"
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      "MEOW! I forgot what I was saying.";

    res.json({ reply });

  } catch (error) {
    console.error("Groq request failed:", error);

    res.json({
      reply:
        "MRRP! I can't reach my brain right now!"
    });
  }
});


// =====================================================
// SUBMIT SCORE
// =====================================================

app.post("/api/scores", (req, res) => {
  try {
    const name =
      String(req.body.name || "Anonymous")
        .trim()
        .slice(0, 20);

    const game =
      String(req.body.game || "mouse");

    const score =
      Math.max(
        0,
        Math.min(
          100000,
          Number(req.body.score) || 0
        )
      );

    const time =
      Math.max(
        0,
        Math.min(
          60,
          Number(req.body.time) || 0
        )
      );

    const won =
      Boolean(req.body.won);

    // Only Catch the Mouse exists right now.
    if (game !== "mouse") {
      return res.status(400).json({
        error: "That game does not exist."
      });
    }

    if (!name) {
      return res.status(400).json({
        error: "A player name is required."
      });
    }

    const data = loadLeaderboard();

    data.mouse.push({
      name,
      score,
      time,
      won,
      date: new Date().toISOString()
    });

    // Highest score first.
    // If tied, faster time wins.
    data.mouse.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.time - b.time;
    });

    // Keep the top 1000 scores.
    data.mouse =
      data.mouse.slice(0, 1000);

    saveLeaderboard(data);

    res.json({
      success: true
    });

  } catch (error) {
    console.error("Score save error:", error);

    res.status(500).json({
      error: "Could not save score."
    });
  }
});


// =====================================================
// GET LEADERBOARD
// =====================================================

app.get("/api/leaderboard", (req, res) => {
  const game =
    String(req.query.game || "mouse");

  if (game !== "mouse") {
    return res.json({
      scores: []
    });
  }

  const data = loadLeaderboard();

  res.json({
    scores: data.mouse.slice(0, 100)
  });
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log("");
  console.log("🐈 ===============================");
  console.log("🐈       CAT.AI IS ONLINE");
  console.log("🐈 ===============================");
  console.log(`🐈 http://localhost:${PORT}`);
  console.log("");
});