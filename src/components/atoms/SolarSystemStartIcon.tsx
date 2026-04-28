/** Orbit-style icon: central dot with tilted ellipses like planetary orbits. */
export const SolarSystemStartIcon = ({
  className,
}: {
  readonly className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <ellipse
      cx="12"
      cy="12"
      rx="5.5"
      ry="3.2"
      stroke="currentColor"
      strokeWidth="1.25"
      transform="rotate(-18 12 12)"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="8.2"
      ry="4.6"
      stroke="currentColor"
      strokeWidth="1.1"
      transform="rotate(22 12 12)"
      opacity="0.92"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="10.5"
      ry="5.8"
      stroke="currentColor"
      strokeWidth="0.95"
      transform="rotate(-6 12 12)"
      opacity="0.78"
    />
  </svg>
);
