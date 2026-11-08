import type { ReactNode } from "react";

export type IconName =
  | "camera"
  | "arrow"
  | "shield"
  | "spark"
  | "washer"
  | "fridge"
  | "fan"
  | "kettle"
  | "check"
  | "close"
  | "plus";

const paths: Record<IconName, ReactNode> = {
  camera: (
    <>
      <path d="M3 7h4l2-3h6l2 3h4v13H3V7Z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </>
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6l8-3Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7L12 2Z" />
    </>
  ),
  washer: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M4 7h16m-12-3h1m3 0h1" />
      <circle cx="12" cy="14" r="5" />
      <path d="M8 15c3-3 5 3 8-1" />
    </>
  ),
  fridge: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M5 9h14M8 5v1m0 7v3" />
    </>
  ),
  fan: (
    <>
      <circle cx="12" cy="10" r="8" />
      <circle cx="12" cy="10" r="1.5" />
      <path d="M12 8.5c-7-8-8 4-1.5 2m3 0c8-5-4-10-1.5-2m0 3c-2 9 10 5 1.5-1M12 18v4m-5 0h10" />
    </>
  ),
  kettle: (
    <>
      <path d="M6 9h11l2 12H4L6 9Zm3-3h5m-3-3v3m6 5c7-3 7 7 1 6M5 10 2 8v6l3 2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
};

export function Icon({
  name,
  size = 24,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
