import React, { useEffect, useState } from "react";
import { ScrollView, Button, View } from "react-native";
import { Livraison } from "../models/Livraison";
import { DropdownOption } from "../models/DropdownOption";
import { getDropdownOptions, generateQRCode, saveNewDelivery } from "../presenters/NouvelleLivraisonPresenter";
import CustomDropdown from "../../components/CustomDropdown";
import CustomCheckbox from "../../components/CustomCheckbox";

const NouvelleLivraisonScreen = ({ navigation }) => {
  const [clients, setClients] = useState<DropdownOption[]>([]);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [addresses, setAddresses] = useState<DropdownOption[]>([]);
  const [status, setStatus] = useState<string>("");

  // States utilisateur
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isFragile, setIsFragile] = useState<boolean>(false);
  const [isExchange, setIsExchange] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  useEffect(() => {
    getDropdownOptions("clients", "name").then(setClients);
    getDropdownOptions("products", "name", ["amount"]).then(setProducts);
    getDropdownOptions("adresses", "address").then(setAddresses);
    getDropdownOptions("Status", "nomStat").then((s) => setStatus(s[0]?.label || ""));
  }, []);

  const handleSubmit = async () => {
    const id = Math.floor(Math.random() * 1000000).toString();
    const qrCodeUrl = generateQRCode(id);

    const livraison: Livraison = {
      id,
      address: selectedAddress,
      client: selectedClient,
      product: selectedProduct,
      payment: "en ligne",
      isExchange,
      isFragile,
      termsAccepted,
      quantity,
      totalAmount: 40, // à calculer selon produit
      createdAt: new Date(),
      status,
      qrCodeUrl,
    };

    await saveNewDelivery(livraison);
    navigation.goBack();
  };

  return (
    <ScrollView>
      <CustomDropdown options={clients} onChange={setSelectedClient} />
      <CustomDropdown options={products} onChange={setSelectedProduct} />
      <CustomDropdown options={addresses} onChange={setSelectedAddress} />
      <CustomCheckbox label="Colis fragile" value={isFragile} onChange={setIsFragile} />
      <CustomCheckbox label="Échange" value={isExchange} onChange={setIsExchange} />
      <CustomCheckbox label="Conditions acceptées" value={termsAccepted} onChange={setTermsAccepted} />
      <Button title="Créer la livraison" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default NouvelleLivraisonScreen;
