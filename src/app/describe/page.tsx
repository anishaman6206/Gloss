import { DescribeGallery } from "@/components/describe/DescribeGallery";
import { DescribeHero } from "@/components/describe/DescribeHero";
import { describeImages } from "@/data/describeImages";

export const dynamic = "force-static";

const FEATURED_IMAGE =
  describeImages.find((img) => img.id === "santorini-village") ?? describeImages[0];

export default function DescribePage() {
  return (
    <div className="space-y-8" data-testid="describe-page">
      <DescribeHero image={FEATURED_IMAGE} />
      <DescribeGallery />
    </div>
  );
}
