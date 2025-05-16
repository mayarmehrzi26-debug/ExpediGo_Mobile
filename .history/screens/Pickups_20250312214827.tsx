import React from 'react';
import { Alert, Button } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const Pickups = () => {
  const generatePDF = async () => {
    try {
      const options = {
        html: '<h1>Test PDF</h1><p>This is a test PDF document.</p>',
        fileName: 'test',
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('Succès', `PDF généré : ${file.filePath}`);
    } catch (error) {
      console.error('Erreur :', error);
      Alert.alert('Erreur', 'Échec de la génération du PDF');
    }
  };

  return (
    <Button title="Générer PDF" onPress={generatePDF} />
  );
};

export default TestPDF;