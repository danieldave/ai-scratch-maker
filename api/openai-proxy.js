export default async function handler(req, res) {
  try {
    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const json = await result.json();
    res.status(200).send(json.choices[0].message.content);

  } catch (err) {
    res.status(500).json({ error: "OpenAI Proxy Failed" });
  }
}
