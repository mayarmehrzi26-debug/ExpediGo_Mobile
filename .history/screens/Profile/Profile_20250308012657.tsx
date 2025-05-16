import React from "react";
import { Card } from "../src//Card"; // Modifiez le chemin selon la nouvelle structure
import { ProfileAvatar } from "./ui/ProfileAvatar"; // Mettre à jour le chemin
import { ProfileMenuItem } from "./ui/ProfileMenuItem"; // Mettre à jour le chemin

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