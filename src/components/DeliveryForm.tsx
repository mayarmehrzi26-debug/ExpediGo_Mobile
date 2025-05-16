import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';

interface DeliveryFormProps {
  deliveryData: any;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ deliveryData, onChange, onSubmit }) => {
  return (
    <View>
      <Text>Adresse Pickup</Text>
      <TextInput
        value={deliveryData.pickupAddress}
        onChangeText={(text) => onChange('pickupAddress', text)}
      />
      <Text>Adresse de Livraison</Text>
      <TextInput
        value={deliveryData.deliveryAddress}
        onChangeText={(text) => onChange('deliveryAddress', text)}
      />
      <Text>Produit</Text>
      <TextInput
        value={deliveryData.product}
        onChangeText={(text) => onChange('product', text)}
      />
      <Button title="Créer Livraison" onPress={onSubmit} />
    </View>
  );
};

export default DeliveryForm;
