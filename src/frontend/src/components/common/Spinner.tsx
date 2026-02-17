export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export function Spinner({ size = 'medium' }: SpinnerProps) {
  const sizeMap = { small: '16px', medium: '32px', large: '48px' };
  const dimension = sizeMap[size];

  return (
    <div
      className="spinner"
      role="status"
      aria-label="Loading"
      style={{ width: dimension, height: dimension }}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
