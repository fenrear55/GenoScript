// app/api/users/[id]/route.ts
export async function GET(request: Request, { params }) {
  const { id } = params
  // handles GET /api/users/123
}

export async function DELETE(request: Request, { params }) {
  const { id } = params
  // handles DELETE /api/users/123
}