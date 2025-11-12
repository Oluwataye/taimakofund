import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const proverbs = [
  { text: "A tree cannot stand without roots", language: "Igbo" },
  { text: "It takes a village to raise a child", language: "Yoruba" },
  { text: "Unity is strength, division is weakness", language: "Hausa" },
  { text: "When spider webs unite, they can tie up a lion", language: "Ethiopian" },
  { text: "A family is like a forest, when you are outside it is dense, when you are inside you see that each tree has its place", language: "Akan" },
];

const ProverbBanner = () => {
  const [currentProverb, setCurrentProverb] = useState(proverbs[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProverb(proverbs[Math.floor(Math.random() * proverbs.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-gold/10 via-orange/10 to-gold/10 border-y border-gold/20 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 text-center">
          <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
          <p className="text-sm md:text-base text-foreground">
            <span className="font-semibold">Proverb of the Day:</span> "{currentProverb.text}"
            <span className="text-muted-foreground ml-2">— {currentProverb.language}</span>
          </p>
          <Sparkles className="w-4 h-4 text-gold flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default ProverbBanner;
