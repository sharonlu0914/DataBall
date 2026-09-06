export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label="DataBall">
      DataBall
    </span>
  );
}
