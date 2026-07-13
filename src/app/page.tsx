import { Nav } from "@/components/home/Nav";
import { Hero } from "@/components/home/Hero";
import { ProblemStatement } from "@/components/home/ProblemStatement";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturesBento } from "@/components/home/FeaturesBento";
import { HouseholdSpotlight } from "@/components/home/HouseholdSpotlight";
import { FinalCta } from "@/components/home/FinalCta";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <ProblemStatement />
        <HowItWorks />
        <FeaturesBento />
        <HouseholdSpotlight />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
