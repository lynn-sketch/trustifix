type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserAvatar({ name, src, size = 40, className = "" }: UserAvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`tf-user-avatar ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`tf-user-avatar tf-user-avatar-fallback ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
