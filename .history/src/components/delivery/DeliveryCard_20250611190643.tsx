import { Entypo } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Divider, Menu } from 'react-native-paper';
import StatusBadge from '../shared/StatusBadge';

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  delivery,
  isSelected,
  onToggleSelection,
  onViewDetails,
  onEditPickup,
}) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => onToggleSelection(delivery.id)}>
          <View style={[styles.checkbox, isSelected && styles.checked]} />
        </TouchableOpacity>
        
        <Text style={styles.idText}>{delivery.id}</Text>
        
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </TouchableOpacity>
          }>
          <Menu.Item onPress={() => onViewDetails(delivery.id)} title="Détails" />
          <Divider />
          <Menu.Item onPress={onEditPickup} title="Modifier" />
        </Menu>
      </View>

      <Text style={styles.clientText}>{delivery.client}</Text>
      <View style={styles.divider} />

      <View style={styles.detailRow}>
        <Text style={styles.label}>Statut:</Text>
        <StatusBadge status={delivery.status} />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Destination:</Text>
        <Text style={styles.value}>{delivery.address}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {delivery.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 12,
  },
  checked: {
    backgroundColor: '#877DAB',
    borderColor: '#877DAB',
  },
  idText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27251F',
  },
  clientText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B2128',
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#1B2128',
    fontWeight: 'bold',
  },
});

export default DeliveryCard;