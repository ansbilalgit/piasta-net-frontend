import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const baseUrl = "https://piasta-net-app.azurewebsites.net/api/items/";
    const url = `${baseUrl}?${searchParams.toString()}`;
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch items", success: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Items proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch items", success: false },
      { status: 500 }
    );
  }
}
