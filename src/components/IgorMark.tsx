interface IgorMarkProps {
  size?: number;
  className?: string;
}

export function IgorMark({ size = 28, className }: IgorMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
    >
      <path
        d="M11 6.5h14M18 7v22M11 29.5h14"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M7.5 13.5c2.4-3 5.8-4.7 10.5-4.7M28.5 22.5c-2.4 3-5.8 4.7-10.5 4.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="18" cy="18" r="2.7" fill="currentColor" />
    </svg>
  );
}
