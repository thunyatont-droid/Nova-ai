export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const body = await request.json();

        if (!body.message) {
          return Response.json(
            { error: "กรุณาใส่ข้อความ" },
            { status: 400 }
          );
        }

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [
                  {
                    text: "คุณคือ NOVA AI ผู้ช่วย AI ที่ตอบภาษาไทยอย่างเป็นธรรมชาติ"
                  }
                ]
              },
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: body.message
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return Response.json(
            {
              error: data?.error?.message || "Gemini API เรียกไม่สำเร็จ"
            },
            { status: response.status }
          );
        }

        const reply =
          data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("") || "Gemini ไม่มีคำตอบ";

        return Response.json({ reply });

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
