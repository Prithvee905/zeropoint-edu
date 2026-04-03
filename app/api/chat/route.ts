import OpenAI from "openai"

export async function POST(req: Request) {

    try {

        const { message } = await req.json()

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful AI tutor for students."
                },
                {
                    role: "user",
                    content: message
                }
            ]
        })

        return Response.json({
            reply: completion.choices[0].message.content
        })

    } catch (error) {

        console.error(error)

        return Response.json({
            reply: "AI tutor failed to respond."
        })

    }

}
