import React from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { ProfileMenuItem } from "@/components/ProfileMenuItem";

// ProfileAvatar component embedded directly in the file
const ProfileAvatar = ({ name, src }: { name: string; src?: string }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

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

// ProfileMenuItem component embedded directly in the file
const ProfileMenuItem = ({ label, onClick }: { label: string; onClick?: () => void }) => {
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

const Profile = () => {
  const menuItems = [
    "Informations personnelles",
    "Informations du Business",
    "Gestion des collaborateurs",
    "Adresse de pickup",
    "Message client",
    "API Key",
    "Se déconnecter",
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8 mx-auto max-w-lg">
        <Card className="p-6 bg-white shadow-sm">
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-100">
            <ProfileAvatar name="Sabier Ben Jabara" />
            <h1 className="mt-4 text-xl font-medium text-gray-900">
              Sabier Ben Jabara
            </h1>
          </div>

          <div className="space-y-0">
            {menuItems.map((item, index) => (
              <ProfileMenuItem 
                key={index} 
                label={item} 
                onClick={() => console.log(`Clicked: ${item}`)} 
              />
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Profile;
