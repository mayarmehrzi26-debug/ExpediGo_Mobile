import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import QRCode from 'qrcode';

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
  allSelected
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQrCodeSvg = async (text: string) => {
    try {
      return await QRCode.toString(text, {
        type: 'svg',
        margin: 1,
        width: 150,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  };

  const generateHtmlContent = async (delivery: any) => {
    const qrCodeSvg = await generateQrCodeSvg(delivery.id);
    
    return `
      <html>
        <head>
          <style>
  body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .title { font-size: 24px; font-weight: bold; color: #333; }
            .subtitle { color: #666; margin-top: 5px; }
            .section { margin-bottom: 15px; }
            .section-title { 
              font-weight: bold; 
              margin-bottom: 5px; 
              color: #444;
              border-bottom: 1px solid #eee;
              padding-bottom: 3px;
            }
            .qr-container { 
              text-align: center; 
              margin: 20px 0; 
              padding: 10px;
              border: 1px dashed #ddd;
              border-radius: 5px;
            }
            .qr-title { font-weight: bold; margin-bottom: 5px; }
            .footer { 
              margin-top: 30px; 
              font-size: 12px; 
              text-align: center;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 15px 0; 
              font-size: 14px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .qr-image { 
              width: 150px; 
              height: 150px; 
              margin: 0 auto;
            }
            .info-row {
              display: flex;
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              width: 120px;
            }          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Bon de Livraison</div>
            <div class="subtitle">${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Informations Client</div>
            <div class="info-row">
              <span class="info-label">Nom:</span>
              <span>${delivery.client || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Téléphone:</span>
              <span>${delivery.phone || 'Non spécifié'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Adresse:</span>
              <span>${delivery.address || 'Non spécifié'}</span>
            </div>
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
                <td>${delivery.status || 'Non spécifié'}</td>
                <td>${delivery.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</td>
                <td>${delivery.amount || '0'} DT</td>
              </tr>
            </table>
          </div>
          
          ${delivery.items?.length ? `
          <div class="section">
            <div class="section-title">Articles</div>
            <table>
              <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
              ${delivery.items.map(item => `
                <tr>
                  <td>${item.description || 'N/A'}</td>
                  <td>${item.quantity || '1'}</td>
                  <td>${item.price || '0'} DT</td>
                  <td>${(item.price * item.quantity).toFixed(2) || '0'} DT</td>
                </tr>
              `).join('')}
            </table>
          </div>
          ` : ''}          
          <div class="qr-container">
            <div class="qr-title">Code QR de suivi</div>
            ${qrCodeSvg}
            <div>Scannez ce code pour suivre la livraison</div>
          </div>
          
          <!-- ... (reste du contenu HTML) ... -->
        </body>
      </html>
    `;
  };

  const generatePdf = async () => {
    if (selectedDeliveries.length === 0) {
      Alert.alert("Aucune sélection", "Veuillez sélectionner au moins une livraison");
      return;
    }

    setIsGenerating(true);
    
    try {
      const selected = deliveries.filter(d => selectedDeliveries.includes(d.id));
      
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
          dialogTitle: `Bon de Livraison ${delivery.id}`,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      Alert.alert("Erreur", "Impossible de générer le PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity 
        onPress={toggleSelectAll} 
        style={styles.checkbox}
        disabled={isGenerating}
      >
        <View style={[styles.checkboxInner, allSelected && styles.checkboxChecked]} />
      </TouchableOpacity>

      {/* PDF Export Button */}
      <TouchableOpacity 
        onPress={generatePdf} 
        style={styles.fileIcon}
        disabled={isGenerating}
      >
        <Image 
          source={require("../../assets/file-icon-green.png")} 
          style={[styles.icon, isGenerating && styles.disabledIcon]} 
        />
      </TouchableOpacity>

      {/* Other icons */}
      <TouchableOpacity style={styles.fileIcon} disabled={isGenerating}>
        <Image 
          source={require("../../assets/file-icon-grey.png")} 
          style={[styles.icon, isGenerating && styles.disabledIcon]} 
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.fileIcon} disabled={isGenerating}>
        <Image 
          source={require("../../assets/file-icon-empty.png")} 
          style={[styles.icon, isGenerating && styles.disabledIcon]} 
        />
      </TouchableOpacity>

      {/* Selection count */}
      {selectedDeliveries.length > 0 && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedDeliveries.length} sélectionné(s)
          </Text>
        </View>
      )}
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
  disabledIcon: {
    opacity: 0.5,
  },
  selectionInfo: {
    marginLeft: 'auto',
    marginRight: 10,
  },
  selectionText: {
    fontSize: 12,
    color: '#877DAB',
    fontWeight: '500',
  },
});

export default FileExplorer;