export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();

        const response = await fetch(
          "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${env.QWEN_API_KEY}`
            },
            body: JSON.stringify({
              model: "qwen-plus",
              messages: [
                {
                  role: "system",
                  content: "คุณคือ NOVA AI ผู้ช่วย AI ที่ตอบภาษาไทยอย่างเป็นธรรมชาติ"
                },
                {
                  role: "user",
                  content: body.message
                }
              ]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            { error: data?.message || "เรียก AI ไม่สำเร็จ" },
            { status: response.status }
          );
        }

        return Response.json({
          reply: data.choices?.[0]?.message?.content || "ไม่มีคำตอบ"
        });

      } catch (error) {
        return Response.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
