import { BookMarked } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const dynamic = "force-static";

export const metadata = {
  title: "Grammar",
};

export default function GrammarPage() {
  return (
    <ComingSoon
      icon={BookMarked}
      title="Grammar lessons are on the way."
      description="Short chapters on prepositions, articles, conjunctions, and more — each with real examples and a practice exercise. We'll let you know the moment it's live."
      accent="leaf"
    />
  );
}
