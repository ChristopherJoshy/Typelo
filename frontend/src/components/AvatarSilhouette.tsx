export default function AvatarSilhouette({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c.35-4.55 3.15-7 8-7s7.65 2.45 8 7H4Z" />
  </svg>
}
