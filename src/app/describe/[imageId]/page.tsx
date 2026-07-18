import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DescribeWorkspace } from "@/components/describe/DescribeWorkspace";
import { getDescribeImage, describeImages } from "@/data/describeImages";

export const dynamic = "force-static";

export function generateStaticParams() {
  return describeImages.map((image) => ({ imageId: image.id }));
}

export default function DescribeImagePage({ params }: { params: { imageId: string } }) {
  const image = getDescribeImage(params.imageId);
  if (!image) notFound();

  return (
    <div className="space-y-4" data-testid="describe-image-page">
      <Link
        href="/describe"
        data-testid="describe-back"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={14} /> All pictures
      </Link>
      <h1 className="font-display text-2xl font-bold tracking-tight">{image.title}</h1>
      <DescribeWorkspace image={image} />
    </div>
  );
}
