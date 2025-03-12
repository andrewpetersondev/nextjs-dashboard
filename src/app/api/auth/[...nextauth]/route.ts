// import { handlers } from "@/auth"
// export const { GET, POST } = handlers
// export const runtime = "edge" // optional

// Basic GET handler to return a simple response
export async function GET() {
  return new Response(JSON.stringify({ message: "GET request received" }), {
    status: 200,
  });
}