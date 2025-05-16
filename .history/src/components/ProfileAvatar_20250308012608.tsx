import React from "react";

export const ProfileAvatar = ({ name, src }: { name: string; src?: string }) => {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="h-20 w-20 border-2 border-gray-200 rounded-full overflow-hidden flex items-center justify-center bg-muted">
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-lg font-medium">{initials}</span>
      )}
    </div>
  );
};