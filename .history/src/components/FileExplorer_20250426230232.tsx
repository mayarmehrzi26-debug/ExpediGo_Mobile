import React, { useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

interface FileExplorerProps {
  selectedDeliveries: string[];
  deliveries: any[];
  toggleSelectAll: () => void;
  allSelected: boolean;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  selectedDeliveries,
  deliveries,
  toggleSelectAll,
  allSelected,
}) => {
  const qrCodeRef = useRef<any>(null);

  const generateQRCodeBase64 = async (text: string) => {
    if (!qrCodeRef.current) return '';
    
    try {
      const uri = await captureRef(qrCodeRef, {
        format: 'png',
        quality: 1,
      });
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/png;base64,${base64}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const generateHtmlContent = async (delivery: any) => {
    // Générer le QR code pour cette livraison
    const qrCodeData = await generateQRCodeBase64(delivery.id);

    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .qr-container { text-align: center; margin: 20px 0; }
            .qr-code { width: 150px; height: 150px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Bon de Livraison</h1>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="qr-container">
            <h3>QR Code de suivi</h3>
            <img class="qr-code" src="${qrCodeData}" />
            <p>ID: ${delivery.id}</p>
          </div>
          
          <h2>Informations client</h2>
          <table>
            <tr><th>Nom</th><td>${delivery.client || 'Non spécifié'}</td></tr>
            <tr><th>Adresse</th><td>${delivery.address || 'Non spécifié'}</td></tr>
            <tr><th>Téléphone</th><td>${delivery.phone || 'Non spécifié'}</td></tr>
          </table>
          
          <h2>Détails de la livraison</h2>
          <table>
            <tr><th>Statut</th><td>${delivery.status || 'Non spécifié'}</td></tr>
            <tr><th>Date</th><td>${delivery.createdAt?.toDate?.()?.toLocaleDateString() || 'Non spécifié'}</td></tr>
            <tr><th>Montant</th><td>${delivery.amount || '0'} DT</td></tr>
          </table>
        </body>
      </html>
    `;
  };

  const generatePdf = async () => {
    if (selectedDeliveries.length === 0) {
      Alert.alert('Aucune sélection', 'Veuillez sélectionner au moins une livraison');
      return;
    }

    try {
      const selected = deliveries.filter(d => selectedDeliveries.includes(d.id));
      
      // Cachez le QR code invisible pour la capture
      const qrCodeView = (
        <View style={{ position: 'absolute', left: -1000 }}>
          <QRCode 
            value={selected[0].id} 
            size={200}
            getRef={(ref) => (qrCodeRef.current = ref)}
          />
        </View>
      );

      for (const delivery of selected) {
        const html = await generateHtmlContent(delivery);
        const { uri } = await Print.printToFileAsync({ html });
        
        const newUri = `${FileSystem.documentDirectory}Livraison_${delivery.id}.pdf`;
        await FileSystem.copyAsync({
          from: uri,
          to: newUri,
        });
        
        await Sharing.shareAsync(newUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Livraison ${delivery.id}`,
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de générer le PDF');
    }
  };

  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity onPress={toggleSelectAll} style={styles.checkbox}>
        <View style={[styles.checkboxInner, allSelected && styles.checkboxChecked]} />
      </TouchableOpacity>

      {/* Bouton PDF avec QR code */}
      <TouchableOpacity onPress={generatePdf} style={styles.fileIcon}>
        <Image source={require('../../assets/file-icon-green.png')} style={styles.icon} />
      </TouchableOpacity>

      {/* Icônes */}
      <TouchableOpacity onPress={generatePdf} style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-green.png")} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-grey.png")} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.fileIcon}>
        <Image source={require("../../assets/file-icon-empty.png")} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#877DAB",
  },
  fileIcon: {
    marginRight: 14,
  },
  icon: {
    width: 30,
    height: 34,
    resizeMode: "contain",
  },
});

export default FileExplorer;