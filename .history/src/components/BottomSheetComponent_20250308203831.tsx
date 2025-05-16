import BottomSheet from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BottomSheetComponent = ({ onClose }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Valeurs de hauteur
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
    if (onClose) onClose();
  }, []);

  return (
    <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Détails Supplémentaires</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClosePress}>
          <Text style={styles.closeText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F97316',
    borderRadius: 8,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BottomSheetComponent;
