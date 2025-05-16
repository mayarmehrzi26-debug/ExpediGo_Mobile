import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles';

const AjoutAdressForm = ({
  zone,
  address,
  onAddressChange,
  onMapPress,
  onSubmit,
  loading,
}: {
  zone: string;
  address: string;
  onAddressChange: (value: string) => void;
  onMapPress: () => void;
  onSubmit: () => void;
  loading: boolean;
}) => (
  <>
    <View style={styles.formGroup}>
      <Text style={styles.label}>Zone</Text>
      <View style={styles.zoneContainer}>
        <TextInput style={styles.input} value={zone} editable={false} />
        <TouchableOpacity onPress={onMapPress} style={styles.mapIcon}>
          <Ionicons name="map" size={24} color="#54E598" />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.formGroup}>
      <Text style={styles.label}>Adresse</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Entrez l'adresse"
        value={address}
        onChangeText={onAddressChange}
        multiline
        numberOfLines={4}
      />
    </View>

    <TouchableOpacity style={styles.submitButton} onPress={onSubmit} disabled={loading}>
      {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Ajouter l'adresse</Text>}
    </TouchableOpacity>
  </>
);

export default AjoutAdressForm;
