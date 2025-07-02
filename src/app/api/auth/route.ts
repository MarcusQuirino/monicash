import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { pin } = await request.json();

        // Get the PIN from environment variable
        const correctPin = process.env.AUTH_PIN;

        if (!correctPin) {
            console.error("AUTH_PIN environment variable is not set");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        if (!pin || pin.length !== 6) {
            return NextResponse.json(
                { error: "PIN deve ter 6 dígitos" },
                { status: 400 }
            );
        }

        if (pin === correctPin) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "PIN incorreto" },
                { status: 401 }
            );
        }
    } catch {
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
} 