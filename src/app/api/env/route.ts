// import { NextApiRequest, NextApiResponse } from 'next';

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   res.status(200).json({
//     SESSION_SECRET: process.env.SESSION_SECRET,
//     DB_PASSWORD: process.env.DB_PASSWORD,
//     POSTGRES_USER: process.env.POSTGRES_USER,
//     CONNECTION_STRING: process.env.CONNECTION_STRING,
//   });
// }
// Basic GET handler to return a simple response
export async function GET() {
  return new Response(JSON.stringify({ message: "GET request received" }), {
    status: 200,
  });
}