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
            /* ... (conserver les mêmes styles que précédemment) ... */
          </style>
        </head>
        <body>
          <!-- ... (conserver le même contenu HTML que précédemment) ... -->
          
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