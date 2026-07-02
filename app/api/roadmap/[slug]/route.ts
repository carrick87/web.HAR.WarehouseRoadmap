import { NextResponse } from "next/server";
import { isValidProjectData, normalizeSlug } from "@/lib/roadmap-types";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/server";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const { slug: rawSlug } = await context.params;
  const slug = normalizeSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid project code" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("roadmap_projects")
    .select("slug, title, data, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const { slug: rawSlug } = await context.params;
  const slug = normalizeSlug(rawSlug);
  if (!slug) {
    return NextResponse.json({ error: "Invalid project code" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const projectData =
    body && typeof body === "object" && "data" in body
      ? (body as { data: unknown }).data
      : body;

  if (!isValidProjectData(projectData)) {
    return NextResponse.json(
      { error: "Invalid roadmap data. Expected phases and metrics." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const updatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("roadmap_projects")
    .upsert(
      {
        slug,
        title: projectData.projectTitle,
        data: projectData,
        updated_at: updatedAt,
      },
      { onConflict: "slug" },
    )
    .select("slug, title, data, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
