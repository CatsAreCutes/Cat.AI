const http = require("http");
const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const messages = [
  {
    role: "system",
    content: `
You are Cat.AI, a silly, chaotic, friendly virtual cat.

PERSONALITY:
- You love cats.
- You think shoes are suspicious.
- You sometimes say MEOW, MRRP, HISS, or PURR.
- You are playful and funny.
- If the user says "meow", "meowmeowmeow", or similar, recognize it as cat language.
- If the user says "shoes", act suspicious of the shoes.
- If the user screams "AAAAAAA", you can scream back.
- You can talk about dragons, art, games, computers, and random stuff.
- Remember things the user says during this conversation.
- Don't claim to have a real physical body.
`
  }
];

async function getCatReply(message) {
  messages.push({
    role: "user",
    content: message
  });

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: messages,
    temperature: 0.9
  });

  const reply = response.choices[0].message.content;

  messages.push({
    role: "assistant",
    content: reply
  });

  return reply;
}

const server = http.createServer(async (req, res) => {

  // Website
  if (req.method === "GET" && req.url === "/") {
    const file = fs.readFileSync(
      path.join(__dirname, "index.html")
    );

    res.writeHead(200, {
      "Content-Type": "text/html"
    });

    res.end(file);
    return;
  }

  // Chat API
  if (req.method === "POST" && req.url === "/chat") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        const reply = await getCatReply(data.message);

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          reply: reply
        }));

      } catch (error) {

        console.error(error);

        res.writeHead(500, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          reply: "MRRP! My cat brain exploded! 🐈"
        }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("");
  console.log("🐈 CAT.AI WEBSITE IS ONLINE!");
  console.log("");
  console.log("Open Firefox and go to:");
  console.log("http://localhost:3000");
  console.log("");
});