import React from "react";

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`rounded-lg shadow-lg ${className}`}>{children}</div>;
};