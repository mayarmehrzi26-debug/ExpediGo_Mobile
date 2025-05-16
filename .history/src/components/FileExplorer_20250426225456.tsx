import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Livraison } from "./models/";

interface FileExplorerProps {
  selectedDeliveries: string[];
  deliveries: Livraison[];
  toggleSelectAll: () => void;
  allSelected: boolean; 
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  selectedDeliveries, 
  deliveries,
  toggleSelectAll ,
  allSelected

}) => {


  const generateHtmlContent = (delivery: Livraison) => {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; margin-bottom: 5px; }
            .qr-code { text-align: center; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Bon de Livraison</div>
            <div>${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Informations Client</div>
            <div>Nom: ${delivery.client}</div>
            <div>Téléphone: ${delivery.phone}</div>
            <div>Adresse: ${delivery.address}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Détails Livraison</div>
            <table>
              <tr>
                <th>ID Livraison</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Montant</th>
              </tr>
              <tr>
                <td>${delivery.id}</td>
                <td>${delivery.status}</td>
                <td>${delivery.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                <td>${delivery.amount || '0'} DT</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">Articles</div>
            <table>
              <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix</th>
              </tr>
              ${delivery.items?.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price} DT</td>
                </tr>
              `).join('') || '<tr><td colspan="3">Aucun article</td></tr>'}
            </table>
          </div>
          
          <div class="qr-code">
            <!-- Vous pouvez générer un QR code ici avec une API ou librairie -->
            <div>[QR Code pour ${delivery.id}]</div>
          </div>
          
          <div class="footer">
            <div>Merci pour votre confiance</div>
            <div>© ${new Date().getFullYear()} Votre Société</div>
          </div>
        </body>
      </html>
    `;
  };

  const generatePdf = async () => {
    if (selectedDeliveries.length === 0) {
      Alert.alert("Aucune sélection", "Veuillez sélectionner au moins une livraison");
      return;
    }

    try {
      const selected = deliveries.filter(d => selectedDeliveries.includes(d.id));
      
      // Générer un PDF par livraison
      for (const delivery of selected) {
        const html = generateHtmlContent(delivery);
        const { uri } = await Print.printToFileAsync({ html });
        
        const newUri = `${FileSystem.documentDirectory}Livraison_${delivery.id}.pdf`;
        await FileSystem.copyAsync({
          from: uri,
          to: newUri,
        });
        
        await Sharing.shareAsync(newUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Partager Livraison ${delivery.id}`,
        });
      }
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      Alert.alert("Erreur", "Impossible de générer le PDF");
    }
  };

  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity onPress={toggleSelectAll} style={styles.checkbox}>
        <View style={[styles.checkboxInner, allSelected && styles.checkboxChecked]} />
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