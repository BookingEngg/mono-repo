type TExploreJobsIllustrationProps = {
  className?: string;
};

/**
 * Line art for the influencer Home empty state: a phone showing a job card
 * being "picked up" (the tag/link motif for an affiliate job) with sparkles
 * around it, encouraging a first visit to Explore. Every stroke uses
 * currentColor / theme classes so it follows the page's light and dark
 * palette automatically, matching NotFoundIllustration's approach.
 */
const ExploreJobsIllustration = ({
  className,
}: TExploreJobsIllustrationProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Soft backdrop circle */}
      <circle cx="200" cy="150" r="120" className="text-muted" fill="currentColor" />

      {/* Phone body */}
      <rect
        x="140"
        y="60"
        width="120"
        height="190"
        rx="18"
        className="text-background"
        fill="currentColor"
        stroke="currentColor"
      />
      <rect
        x="140"
        y="60"
        width="120"
        height="190"
        rx="18"
        className="text-border"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Screen content: a job card */}
      <rect
        x="156"
        y="88"
        width="88"
        height="60"
        rx="8"
        className="text-primary/15"
        fill="currentColor"
      />
      <rect
        x="156"
        y="158"
        width="60"
        height="8"
        rx="4"
        className="text-foreground/70"
        fill="currentColor"
      />
      <rect
        x="156"
        y="172"
        width="44"
        height="6"
        rx="3"
        className="text-muted-foreground/60"
        fill="currentColor"
      />
      <rect
        x="156"
        y="192"
        width="88"
        height="26"
        rx="13"
        className="text-primary"
        fill="currentColor"
      />

      {/* Tag/link badge popping off the card, the "affiliate link" motif */}
      <g transform="translate(258 96) rotate(18)">
        <rect
          x="-20"
          y="-14"
          width="40"
          height="28"
          rx="8"
          className="text-primary"
          fill="currentColor"
        />
        <circle cx="-8" cy="0" r="4" className="text-primary-foreground" fill="currentColor" />
      </g>

      {/* Sparkles */}
      <g className="text-primary" fill="currentColor">
        <path d="M96 96 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 Z" />
        <path d="M300 190 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
      </g>
      <g className="text-muted-foreground/50" fill="currentColor">
        <circle cx="88" cy="180" r="4" />
        <circle cx="310" cy="110" r="3" />
        <circle cx="200" cy="40" r="3" />
      </g>
    </svg>
  );
};

export default ExploreJobsIllustration;
