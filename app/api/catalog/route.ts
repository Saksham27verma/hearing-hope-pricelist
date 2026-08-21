import { readCatalog, validateCatalog, writeCatalog } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const catalog = await readCatalog();
  return Response.json(catalog, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const catalog = validateCatalog(body);
  if (!catalog) {
    return Response.json({ error: "Invalid catalog" }, { status: 400 });
  }

  try {
    const saved = await writeCatalog(catalog);
    return Response.json(saved, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Could not save catalog" },
      { status: 500 },
    );
  }
}
