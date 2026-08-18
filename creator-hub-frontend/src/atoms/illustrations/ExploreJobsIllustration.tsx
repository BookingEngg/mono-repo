type TExploreJobsIllustrationProps = {
  className?: string;
};

// Symmetric heart, centered on origin — reused at different scales so every
// heart in the scene shares the same (correctly mirrored) silhouette.
const HEART_PATH =
  "M0 7 C-6 1 -10 -3 -10 -7 C-10 -11 -6 -13 -3 -11 C-1 -10 0 -8 0 -6 C0 -8 1 -10 3 -11 C6 -13 10 -11 10 -7 C10 -3 6 1 0 7 Z";

/**
 * Line art for the influencer Home empty state: a phone playing a content
 * "reel" with a marketing/megaphone badge and social engagement (heart,
 * star, follow) orbiting around it. Every stroke uses currentColor / theme
 * classes so it follows the page's light and dark palette automatically,
 * matching NotFoundIllustration's approach.
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
      <circle cx="200" cy="152" r="118" className="text-muted" fill="currentColor" />

      {/* Dashed orbit the engagement icons sit on */}
      <circle
        cx="200"
        cy="152"
        r="94"
        className="text-border"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 8"
      />

      {/* Phone body */}
      <rect
        x="156"
        y="62"
        width="88"
        height="180"
        rx="16"
        className="text-background"
        fill="currentColor"
      />
      <rect
        x="156"
        y="62"
        width="88"
        height="180"
        rx="16"
        className="text-border"
        stroke="currentColor"
        strokeWidth="3"
      />

      {/* Screen: reel content with a centered play button */}
      <rect x="168" y="76" width="64" height="128" rx="8" className="text-primary/12" fill="currentColor" />
      <circle cx="200" cy="140" r="20" className="text-primary" fill="currentColor" />
      <path d="M194 130 L212 140 L194 150 Z" className="text-primary-foreground" fill="currentColor" />

      {/* Caption bars under the reel */}
      <rect x="176" y="172" width="48" height="6" rx="3" className="text-foreground/70" fill="currentColor" />
      <rect x="176" y="184" width="32" height="6" rx="3" className="text-muted-foreground/60" fill="currentColor" />

      {/* Liked heart overlay, bottom-right of the screen */}
      <g transform="translate(216 196) scale(0.7)">
        <path d={HEART_PATH} className="text-destructive" fill="currentColor" />
      </g>

      {/* Marketing/megaphone badge pinned to the phone's top-left corner */}
      <g transform="translate(150 78) rotate(-14)">
        <circle r="22" className="text-primary" fill="currentColor" />
        <g className="text-primary-foreground" fill="currentColor">
          {/* Horn: narrow mouthpiece flaring to a wide bell */}
          <path d="M-9 -5 L8 -14 C9.5 -14.7 11 -13.6 11 -12 L11 12 C11 13.6 9.5 14.7 8 14 L-9 5 Z" />
          {/* Grip at the mouthpiece end */}
          <rect x="-13" y="-3" width="4.5" height="6" rx="1.5" />
        </g>
        {/* Sound wave broadcasting from the bell */}
        <path
          d="M14 -7 C17 -4 17 4 14 7"
          className="text-primary-foreground"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Orbiting engagement icons */}
      <g transform="translate(84 108)">
        <circle r="19" className="text-background" fill="currentColor" />
        <circle r="19" className="text-border" stroke="currentColor" strokeWidth="2" />
        <g transform="scale(1.05)">
          <path d={HEART_PATH} className="text-destructive" fill="currentColor" />
        </g>
      </g>

      <g transform="translate(316 130)">
        <circle r="18" className="text-background" fill="currentColor" />
        <circle r="18" className="text-border" stroke="currentColor" strokeWidth="2" />
        <path
          d="M0 -9 L2.6 -3 L9 -2.4 L4.2 2 L5.6 8.4 L0 5 L-5.6 8.4 L-4.2 2 L-9 -2.4 L-2.6 -3 Z"
          className="text-primary"
          fill="currentColor"
        />
      </g>

      <g transform="translate(112 224)">
        <circle r="17" className="text-background" fill="currentColor" />
        <circle r="17" className="text-border" stroke="currentColor" strokeWidth="2" />
        <path
          d="M0 -7 L0 7 M-7 0 L7 0"
          className="text-primary"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      <g transform="translate(288 216)">
        <circle r="16" className="text-background" fill="currentColor" />
        <circle r="16" className="text-border" stroke="currentColor" strokeWidth="2" />
        <g className="text-primary" fill="currentColor">
          <rect x="-9" y="-9" width="18" height="12" rx="3" />
          <path d="M-4 3 L-7 9 L1 3 Z" />
        </g>
      </g>

      {/* Scattered sparkles */}
      <g className="text-muted-foreground/50" fill="currentColor">
        <circle cx="66" cy="60" r="3" />
        <circle cx="336" cy="66" r="4" />
        <circle cx="340" cy="240" r="3" />
      </g>
      <g className="text-primary" fill="currentColor">
        <path d="M60 210 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" />
      </g>
    </svg>
  );
};

export default ExploreJobsIllustration;
