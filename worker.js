export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: Chat
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        // ตรวจ API Key
        if (!env.GEMINI_API_KEY) {
          return Response.json(
            {
              error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน Cloudflare"
            },
            { status: 500 }
          );
        }

        const body = await request.json();

        if (!body?.message || typeof body.message !== "string") {
          return Response.json(
            { error: "กรุณาใส่ข้อความ" },
            { status: 400 }
          );
        }

        const message = body.message.trim();

        if (!message) {
          return Response.json(
            { error: "กรุณาใส่ข้อความ" },
            { status: 400 }
          );
        }

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },

            body: JSON.stringify({
              system_instruction: {
                parts: [
                  {
                    text:
                      "คุณคือ NOVA AI ผู้ช่วย AI ส่วนตัว " +
                      "ตอบภาษาไทยอย่างเป็นธรรมชาติ " +
                      "ตอบให้เข้าใจง่าย กระชับ และเป็นมิตร"
                  }
                ]
              },

              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: message
                    }
                  ]
                }
              ]
            })
          }
        );

        const data = await response.json();

        // Gemini API error
        if (!response.ok) {
          return Response.json(
            {
              error:
                data?.error?.message ||
                "Gemini API เรียกไม่สำเร็จ"
            },
            {
              status: response.status
            }
          );
        }

        // ดึงข้อความตอบกลับ
        const reply =
          data?.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        if (!reply) {
          return Response.json(
            {
              error: "Gemini ไม่ได้ส่งข้อความตอบกลับ"
            },
            { status: 502 }
          );
        }

        return Response.json({
          reply
        });

      } catch (error) {
        return Response.json(
          {
            error:
              error?.message ||
              "เกิดข้อผิดพลาดภายใน Worker"
          },
          { status: 500 }
        );
      }
    }

    // หน้าเว็บ
    return env.ASSETS.fetch(request);
  }
};
