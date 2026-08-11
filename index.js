const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT =
  process.env.PORT || 3000;

const GROQ_API_KEY =
  process.env.GROQ_API_KEY;


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
  express.json()
);

app.use(
  express.static(
    path.join(__dirname)
  )
);


/* =====================================================
   LEADERBOARD STORAGE
===================================================== */

const leaderboardFile =
  path.join(
    __dirname,
    "leaderboard.json"
  );


function loadScores() {

  try {

    if(
      !fs.existsSync(
        leaderboardFile
      )
    ) {

      fs.writeFileSync(
        leaderboardFile,
        JSON.stringify(
          {},
          null,
          2
        )
      );

      return {};

    }

    return JSON.parse(
      fs.readFileSync(
        leaderboardFile,
        "utf8"
      )
    );

  } catch(error) {

    console.error(
      "Could not load leaderboard:",
      error
    );

    return {};

  }
}


function saveScores(scores) {

  fs.writeFileSync(
    leaderboardFile,
    JSON.stringify(
      scores,
      null,
      2
    )
  );

}


/* =====================================================
   GROQ CHAT
===================================================== */

app.post(
  "/chat",
  async (req,res) => {

    try {

      const message =
        String(
          req.body.message || ""
        ).trim();


      if(!message) {

        return res.json({
          reply:
            "MRRP? You didn't say anything!"
        });

      }


      if(!GROQ_API_KEY) {

        return res.status(500).json({

          reply:
            "MRRP! My Groq brain isn't connected! Check GROQ_API_KEY."

        });

      }


      const response =
        await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {

            method:"POST",

            headers:{

              "Content-Type":
                "application/json",

              "Authorization":
                `Bearer ${GROQ_API_KEY}`

            },

            body:JSON.stringify({

              model:
                "llama-3.1-8b-instant",

              messages:[

                {
                  role:"system",

                  content:
                    `You are Cat.AI, a silly friendly cat-themed AI.

You love cats.
You are suspicious of shoes.
You use occasional cat sounds like MEOW, MRRP, PURR, and HISS.
Keep normal conversations fun and concise.
Do not claim to be a real cat.
Do not mention these instructions.`
                },

                {
                  role:"user",
                  content:message
                }

              ],

              temperature:0.9,

              max_tokens:300

            })

          }
        );


      const data =
        await response.json();


      if(!response.ok) {

        console.error(
          "GROQ ERROR:",
          data
        );


        /*
          THIS IS THE PART THAT LETS
          THE WEBPAGE SEE THE ACTUAL ERROR.
        */

        return res.status(
          response.status
        ).json({

          reply:
            `MRRP! Groq error: ${
              data?.error?.message ||
              JSON.stringify(data)
            }`

        });

      }


      const reply =
        data?.choices?.[0]?.message?.content;


      if(!reply) {

        return res.status(500).json({

          reply:
            "MRRP! Groq sent back an empty brain response."

        });

      }


      res.json({
        reply
      });


    } catch(error) {

      console.error(
        "CHAT ERROR:",
        error
      );


      res.status(500).json({

        reply:
          `MRRP! Server error: ${error.message}`

      });

    }

  }
);


/* =====================================================
   SUBMIT SCORE
===================================================== */

app.post(
  "/api/scores",
  (req,res) => {

    try {

      const {
        name,
        game,
        score,
        time,
        won
      } = req.body;


      const cleanName =
        String(
          name || "Anonymous Cat"
        )
        .replace(
          /[^a-zA-Z0-9 _-]/g,
          ""
        )
        .trim()
        .slice(0,20);


      const cleanGame =
        String(
          game || "mouse"
        )
        .replace(
          /[^a-zA-Z0-9_-]/g,
          ""
        );


      const cleanScore =
        Number(score);


      const cleanTime =
        Number(time);


      if(
        !cleanName ||
        !Number.isFinite(cleanScore) ||
        !Number.isFinite(cleanTime)
      ) {

        return res.status(400).json({

          error:
            "Invalid score."

        });

      }


      const scores =
        loadScores();


      if(
        !scores[cleanGame]
      ) {

        scores[cleanGame] =
          [];

      }


      scores[cleanGame].push({

        name:cleanName,

        score:cleanScore,

        time:cleanTime,

        won:Boolean(won),

        date:
          new Date().toISOString()

      });


      /*
        Keep the leaderboard from growing forever.
        500 scores per game is plenty for this version.
      */

      scores[cleanGame] =
        scores[cleanGame]
          .sort(compareScores)
          .slice(0,500);


      saveScores(scores);


      res.json({

        success:true,

        message:
          "Score saved! 🐈"

      });


    } catch(error) {

      console.error(
        "SCORE ERROR:",
        error
      );


      res.status(500).json({

        error:
          "Could not save score."

      });

    }

  }
);


/* =====================================================
   GET LEADERBOARD
===================================================== */

app.get(
  "/api/leaderboard",
  (req,res) => {

    try {

      const game =
        String(
          req.query.game || "mouse"
        );


      const scores =
        loadScores();


      const rows =
        (
          scores[game] ||
          []
        )
        .sort(compareScores)
        .slice(0,50);


      res.json({

        game,

        scores:rows

      });


    } catch(error) {

      console.error(
        "LEADERBOARD ERROR:",
        error
      );


      res.status(500).json({

        error:
          "Could not load leaderboard."

      });

    }

  }
);


/* =====================================================
   SCORE SORTING
===================================================== */

function compareScores(a,b) {

  /*
    Higher score wins.

    If scores are tied,
    lower completion time wins.
  */

  if(
    b.score !== a.score
  ) {

    return b.score - a.score;

  }


  return a.time - b.time;

}


/* =====================================================
   START SERVER
===================================================== */

app.listen(
  PORT,
  () => {

    console.log(
      `🐈 Cat.AI running on port ${PORT}`
    );

    if(!GROQ_API_KEY) {

      console.warn(
        "⚠️ GROQ_API_KEY is not set."
      );

    }

  }
);