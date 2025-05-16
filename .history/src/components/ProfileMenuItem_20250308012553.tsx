import { ChevronRight } from "lucide-react";
import React from "react";

export const ProfileMenuItem = ({ label, onClick }: { label: string; onClick?: () => void }) => {
  return (
    <div 
      className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer"
      onClick={onClick}
    >
      <span className="text-gray-700 text-base">{label}</span>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </div>
  );
};