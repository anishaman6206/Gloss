import { GraduationCap } from "lucide-react";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const dynamic = "force-static";

export const metadata = {
  title: "Microlessons",
};

export default function MicrolessonsPage() {
  return (
    <ComingSoon
      icon={GraduationCap}
      title="Bite-sized lessons are on the way."
      description="Quick, focused lessons you can finish in under two minutes — perfect for a coffee break. Coming soon."
      accent="mango"
    />
  );
}
