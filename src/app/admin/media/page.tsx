import { getAllMedia, getMediaStats } from "@/lib/supabase/queries/media";
import { MediaLibrary } from "@/components/admin/media-library";

interface PageProps {
  searchParams: Promise<{ type?: string; search?: string }>;
}

export default async function MediaPage({ searchParams }: PageProps) {
  const { type, search } = await searchParams;
  const validType = type === "image" || type === "video" || type === "audio" ? type : undefined;

  const [media, stats] = await Promise.all([
    getAllMedia({ type: validType, search, limit: 100 }),
    getMediaStats(),
  ]);

  return (
    <div className="space-y-6">
      <MediaLibrary initialMedia={media} stats={stats} />
    </div>
  );
}
