import { cn } from "@/lib/utils";

type JibJibLogoProps = {
  variant?: "full" | "mark" | "word";
  className?: string;
  dark?: boolean;
  subtitle?: string;
};

const thaiStack = "'IBM Plex Sans Thai', 'Noto Sans Thai', Tahoma, sans-serif";
const monoStack = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

/**
 * JibJib brand mark.
 * Thai-first logo using จิบ + the repeat grammar mark ๆ as the neon flex/check-in symbol.
 * Built as inline SVG so it stays crisp in the app and share cards.
 */
export function JibJibLogo({
  variant = "full",
  className,
  dark = false,
  subtitle = "COFFEE PASSPORT",
}: JibJibLogoProps) {
  const ink = dark ? "#FFF8EC" : "#211711";
  const soft = dark ? "rgba(255,248,236,.66)" : "rgba(33,23,17,.58)";

  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 96 96"
        role="img"
        aria-label="JibJib"
        className={cn("block", className)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="5" y="5" width="86" height="86" rx="29" fill="#120C08" />
        <path d="M5 42 C18 13 53 -1 91 17 L91 91 H5Z" fill="#083E36" opacity="0.72" />
        <path d="M15 22 H55" stroke="#D7FF28" strokeWidth="5" strokeLinecap="round" />
        <path d="M65 20 H81" stroke="#FF5C42" strokeWidth="5" strokeLinecap="round" />
        <text
          x="16"
          y="63"
          fontFamily={thaiStack}
          fontWeight="900"
          fontSize="42"
          letterSpacing="-4.8"
          fill="#FFF8EC"
        >
          จิบ
        </text>
        <text
          x="66"
          y="58"
          fontFamily={thaiStack}
          fontWeight="900"
          fontSize="36"
          letterSpacing="-3"
          fill="#FF5C42"
        >
          ๆ
        </text>
        <circle cx="77" cy="28" r="4.5" fill="#D7FF28" />
        <rect x="13" y="13" width="70" height="70" rx="24" fill="none" stroke="#FFF8EC" strokeOpacity="0.15" strokeWidth="1.5" />
      </svg>
    );
  }

  if (variant === "word") {
    return (
      <svg
        viewBox="0 0 260 92"
        role="img"
        aria-label="JibJib"
        className={cn("block", className)}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18 18 H96" stroke="#D7FF28" strokeWidth="6" strokeLinecap="round" />
        <path d="M191 18 H230" stroke="#FF5C42" strokeWidth="6" strokeLinecap="round" />
        <text
          x="18"
          y="72"
          fontFamily={thaiStack}
          fontWeight="900"
          fontSize="76"
          letterSpacing="-8"
          fill={ink}
        >
          จิบ
        </text>
        <text
          x="151"
          y="63"
          fontFamily={thaiStack}
          fontWeight="900"
          fontSize="62"
          letterSpacing="-4"
          fill="#FF5C42"
        >
          ๆ
        </text>
        <circle cx="210" cy="30" r="6" fill="#D7FF28" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 900 520"
      role="img"
      aria-label={`จิบๆ ${subtitle}`}
      className={cn("block", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="jjFullBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#120C08" />
          <stop offset="0.66" stopColor="#21130D" />
          <stop offset="1" stopColor="#083E36" />
        </linearGradient>
        <linearGradient id="jjFullHot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D7FF28" />
          <stop offset="0.54" stopColor="#D7FF28" />
          <stop offset="1" stopColor="#FF5C42" />
        </linearGradient>
        <filter id="jjFullLift" x="-15%" y="-20%" width="130%" height="150%">
          <feDropShadow dx="0" dy="22" stdDeviation="24" floodColor="#170E08" floodOpacity="0.22" />
        </filter>
      </defs>

      <rect width="900" height="520" rx="0" fill={dark ? "transparent" : "#F8F0E4"} />
      {!dark ? (
        <>
          <circle cx="790" cy="80" r="170" fill="#D7FF28" opacity="0.14" />
          <circle cx="120" cy="500" r="190" fill="#FF5C42" opacity="0.10" />
        </>
      ) : null}

      <g transform="translate(90 72)" filter="url(#jjFullLift)">
        <rect x="0" y="0" width="720" height="300" rx="56" fill="url(#jjFullBg)" />
        <rect x="34" y="33" width="652" height="234" rx="44" fill="none" stroke="#FFF8EC" strokeOpacity="0.08" strokeWidth="2" />

        <path d="M64 58 H208" stroke="#D7FF28" strokeWidth="7" strokeLinecap="round" />
        <path d="M586 58 H650" stroke="#FF5C42" strokeWidth="7" strokeLinecap="round" />

        <text x="72" y="177" fontFamily={thaiStack} fontWeight="900" fontSize="152" letterSpacing="-12" fill="#FFF8EC">
          จิบ
        </text>
        <text x="285" y="166" fontFamily={thaiStack} fontWeight="900" fontSize="126" letterSpacing="-8" fill="url(#jjFullHot)">
          ๆ
        </text>

        <circle cx="397" cy="82" r="8" fill="#FF5C42" />
        <circle cx="397" cy="82" r="15" fill="none" stroke="#FF5C42" strokeOpacity="0.24" strokeWidth="3" />

        <rect x="76" y="220" width="40" height="6" rx="3" fill="#D7FF28" />
        <text x="140" y="226" fontFamily={monoStack} fontWeight="900" fontSize="20" letterSpacing="8" fill="#FFF8EC" opacity="0.8">
          {subtitle}
        </text>
        <text x="480" y="226" fontFamily={monoStack} fontWeight="900" fontSize="14" letterSpacing="2.5" fill="#D7FF28">
          SIP STAMP FLEX
        </text>
      </g>

      {!dark ? (
        <g transform="translate(345 402)">
          <rect x="0" y="0" width="210" height="76" rx="28" fill="#FFF8EC" stroke="#211711" strokeOpacity="0.14" />
          <text x="30" y="55" fontFamily={thaiStack} fontWeight="900" fontSize="56" letterSpacing="-6" fill="#211711">
            จิบ
          </text>
          <text x="113" y="51" fontFamily={thaiStack} fontWeight="900" fontSize="46" letterSpacing="-4" fill="#FF5C42">
            ๆ
          </text>
          <text x="152" y="42" fontFamily={monoStack} fontWeight="800" fontSize="11" letterSpacing="2" fill="#211711" opacity="0.55">
            APP MARK
          </text>
        </g>
      ) : null}
    </svg>
  );
}
