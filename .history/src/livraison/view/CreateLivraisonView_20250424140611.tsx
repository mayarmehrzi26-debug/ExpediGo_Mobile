import React, { useState, useEffect } from 'react';
import { LivraisonPresenter } from '../presenters';
import { DropdownOption } from '../models/Livraison';

const CreateLivraisonView: React.FC = () => {
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [clientOptions, productOptions] = await Promise.all([
          LivraisonPresenter.loadDropdownOptions('clients', 'name'),
          LivraisonPresenter.loadDropdownOptions('products', 'name', ['price'])
        ]);
        
        setClients(clientOptions);
        setProducts(productOptions);
      } catch (error) {
        console.error("Error loading options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, []);

  const handleSubmit = async (formData: any) => {
    try {
      const newDelivery = await LivraisonPresenter.createNewDelivery(formData);
      console.log("Delivery created:", newDelivery);
      // Afficher un message de succès ou rediriger
    } catch (error) {
      console.error("Error creating delivery:", error);
      // Afficher un message d'erreur
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Créer une nouvelle livraison</h2>
      {/* Formulaire de livraison ici */}
      {/* Utiliser les clients et products pour les dropdowns */}
    </div>
  );
};

export default CreateLivraisonView;