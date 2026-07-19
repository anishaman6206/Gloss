import { Hero } from "@/components/landing/Hero";
import { StepsSection } from "@/components/landing/StepsSection";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { PracticeSection } from "@/components/landing/PracticeSection";
import { SocialProof } from "@/components/landing/SocialProof";
import { StickyCta } from "@/components/landing/StickyCta";

function Band({
  bg,
  className = "",
  glow = false,
  children,
}: {
  bg: "white" | "cream" | "mist";
  className?: string;
  glow?: boolean;
  children: React.ReactNode;
}) {
  const bgClass = bg === "white" ? "bg-white" : bg === "cream" ? "bg-cream" : "bg-mist";
  return (
    <section className={`relative w-full ${glow ? "overflow-hidden" : ""} ${bgClass}`}>
      {glow && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-[560px] w-[560px] -translate-x-1/3 -translate-y-1/4 rounded-full bg-brand/[0.08] blur-[120px]" />
          <div className="pointer-events-none absolute right-0 top-0 h-[560px] w-[560px] translate-x-1/3 -translate-y-1/4 rounded-full bg-mango/[0.08] blur-[120px]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-cream md:h-36" />
        </>
      )}
      <div
        className={`relative mx-auto max-w-7xl px-6 py-10 lg:px-8 md:py-14 ${className}`}
      >
        {children}
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <div data-testid="landing-page">
        <Band
          bg="white"
          glow
          className="flex items-center py-6 md:min-h-[75vh] md:py-8 lg:min-h-[80vh]"
        >
          <Hero />
        </Band>

        <Band bg="cream">
          <StepsSection />
        </Band>

        <Band bg="white">
          <ProductShowcase />
        </Band>

        <Band bg="cream">
          <PracticeSection />
        </Band>

        <Band bg="white">
          <SocialProof />
        </Band>
      </div>

      <StickyCta />
    </>
  );
}
