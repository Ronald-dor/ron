import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6" // Default size, can be overridden by props
      {...props}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
      <path d="M12 22V12" />
      <path d="M20 12v5" />
      <path d="M4 12v5" />
       {/* A simple tie shape */}
      <path d="M10 12L8 22l4-2 4 2-2-10" />
      <path d="M10 12a2 2 0 104 0 2 2 0 10-4 0z" />
    </svg>
  );
}
