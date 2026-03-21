// app/api/users/route.ts
export async function GET() {
  // GET /api/users - get all users
}

export async function POST(request: Request) {
  // POST /api/users - create a new user
  const body = await request.json()
}