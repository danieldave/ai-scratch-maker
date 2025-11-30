export default async function handler(req, res) {
  try {
    console.log("Request body:", req.body);
    console.log("Using API key:", !!process.env.OPENAI_API_KEY);

    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const json = await result.json();
    console.log("OpenAI response:", JSON.stringify(json));

    if (json.choices && json.choices[0]?.message?.content) {
      res.status(200).send(json.choices[0].message.content);
    } else if (json.error) {
      res.status(200).send(`ERROR: ${json.error.message}`);
    } else {
      res.status(200).send("ERROR: Unexpected API response");
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI Proxy Failed" });
  }
}
