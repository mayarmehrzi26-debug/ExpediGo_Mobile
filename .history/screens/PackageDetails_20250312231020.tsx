import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { firebasestore } from '../FirebaseConfig';
import { RootStackParamList } from '../NavigationTypes';
import StatusBadge from '../src/components/StatusBadge';

// Define the type of route parameters
interface PackageDetailsRouteParams {
  scannedData: string; // scannedData is the package ID
}

type PackageDetailsRouteProp = RouteProp<RootStackParamList, 'PackageDetails'> & {
  params: PackageDetailsRouteParams; // Specify the route.params type
};

type PackageDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'PackageDetails'>;

interface PackageDetailsProps {
  route: PackageDetailsRouteProp;
  navigation: PackageDetailsNavigationProp;
}

interface Package {
  id: string;
  deliveryId: string; // ID of the associated delivery
  qrCodeUrl: string; // URL of the QR code
}

interface Delivery {
  id: string;
  address: string;
  client: string;
  product: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: Date;
}

interface PackageDetails {
  Packageid: string;
  deliveryId: string;
  address: string;
  client: string;
  product: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: Date;
}

const PackageDetails: React.FC<PackageDetailsProps> = ({ route }) => {
  const { scannedData } = route.params; // Package ID scanned
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        console.log("Scanned Data (Package ID):", scannedData);

        // Create a query to get packages with the scannedData
        const packageQuery = query(collection(firebasestore, 'packages'), where('id', '==', scannedData));
        const querySnapshot = await getDocs(packageQuery);

        if (querySnapshot.empty) {
          console.error('No package found with this ID:', scannedData);
          alert('No package found with this ID.');
          setLoading(false);
          return;
        }

        const packageData = querySnapshot.docs[0].data() as Package;
        console.log("Package Data:", packageData);

        // Retrieve the associated delivery details
        const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', packageData.deliveryId));
        if (!deliveryDoc.exists()) {
          console.error('No delivery found for this package:', packageData.deliveryId);
          alert('No delivery found for this package.');
          setLoading(false);
          return;
        }

        const deliveryData = deliveryDoc.data() as Delivery;
        console.log("Delivery Data:", deliveryData);

        // Merge package and delivery data
        const mergedData: PackageDetails = {
          Packageid: packageData.id,
          deliveryId: packageData.deliveryId,
          address: deliveryData.address,
          client: deliveryData.client,
          product: deliveryData.product,
          payment: deliveryData.payment,
          isExchange: deliveryData.isExchange,
          isFragile: deliveryData.isFragile,
          status: deliveryData.status,
          createdAt: deliveryData.createdAt.toDate(), // Convert Firestore Timestamp to Date
        };

        setPackageDetails(mergedData);
      } catch (error) {
        console.error('Error fetching package details:', error);
        alert('An error occurred while fetching package details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [scannedData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!packageDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No details found for this package.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Package Details</Text>
      <Text style={styles.dataText}>Package ID: {packageDetails.Packageid}</Text>
      <Text style={styles.dataText}>Delivery ID: {packageDetails.deliveryId}</Text>
      <Text style={styles.dataText}>Client: {packageDetails.client}</Text>
      <Text style={styles.dataText}>Address: {packageDetails.address}</Text>
      <Text style={styles.dataText}>Product: {packageDetails.product}</Text>
      <View style={styles.dateContainer}>
        <Text style={styles.deliverySubtitle}>Status</Text>
        <StatusBadge status={packageDetails.status} /> {/* Using StatusBadge */}
      </View>
      <Text style={styles.dataText}>Payment: {packageDetails.payment}</Text>
      <Text style={styles.dataText}>Exchange: {packageDetails.isExchange ? 'Yes' : 'No'}</Text>
      <Text style={styles.dataText}>Fragile: {packageDetails.isFragile ? 'Yes' : 'No'}</Text>
      <Text style={styles.dataText}>Creation Date: {packageDetails.createdAt.toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dataText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  deliverySubtitle: {
    fontSize: 14,
    color: '#A7A9B7',
    marginTop: 5,
  },
});

export default PackageDetails;