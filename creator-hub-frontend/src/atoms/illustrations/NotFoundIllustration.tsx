type TNotFoundIllustrationProps = {
  className?: string;
};

/**
 * Full-bleed line art for the 404 screen: a compass adrift on a dashed route
 * that wanders off the edge of the canvas, with giant "404" numerals anchoring
 * the scene behind it. Every stroke uses currentColor / theme classes so it
 * follows the page's light and dark palette automatically.
 */
const NotFoundIllustration = ({ className }: TNotFoundIllustrationProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 800 460"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* Giant numerals anchoring the scene */}
      <text
        x="400"
        y="330"
        textAnchor="middle"
        className="text-foreground/[0.07]"
        fill="currentColor"
        fontSize="300"
        fontWeight="800"
      >
        404
      </text>

      {/* Scattered stars */}
      <g className="text-muted-foreground/40" fill="currentColor">
        <circle cx="110" cy="70" r="4" />
        <circle cx="170" cy="150" r="3" />
        <circle cx="70" cy="230" r="3" />
        <circle cx="700" cy="80" r="4" />
        <circle cx="650" cy="160" r="2.5" />
        <circle cx="730" cy="240" r="3" />
      </g>

      {/* A wandering, dashed route running off both edges of the canvas */}
      <path
        d="M -20 300 C 90 300, 130 220, 220 220 S 330 160, 320 210"
        className="text-muted-foreground/40"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="10 10"
        strokeLinecap="round"
      />
      <path
        d="M 480 210 C 500 160, 560 160, 580 210 S 660 260, 700 230 S 780 190, 820 200"
        className="text-muted-foreground/40"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="10 10"
        strokeLinecap="round"
      />

      {/* Dashed orbit ring the compass sits in, closing the broken route */}
      <circle
        cx="400"
        cy="215"
        r="90"
        className="text-border"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="7 9"
      />

      {/* Compass badge, dropped where the route breaks off */}
      <circle cx="400" cy="215" r="48" className="text-primary" fill="currentColor" />
      <circle
        cx="400"
        cy="215"
        r="22"
        className="text-primary-foreground"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M 411 203 L 393 208 L 389 227 L 407 222 Z"
        className="text-primary-foreground"
        fill="currentColor"
      />
    </svg>
  );
};

export default NotFoundIllustration;
