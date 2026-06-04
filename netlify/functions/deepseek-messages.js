export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: { message: "Missing DEEPSEEK_API_KEY." } }, { status: 500 });
  }

  try {
    const upstream = await fetch("https://api.deepseek.com/anthropic/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: await request.text(),
    });

    const headers = new Headers(upstream.headers);
    headers.delete("content-encoding");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (error) {
    return Response.json(
      { error: { message: error instanceof Error ? error.message : "DeepSeek proxy failed." } },
      { status: 502 },
    );
  }
};
