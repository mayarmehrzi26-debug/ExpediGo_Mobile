import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, CreditCard, Calendar, RefreshCcw, AlertTriangle, ArrowLeft, Eye } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { firebasestore } from "@/services/firebase";

interface Delivery {
  id: string;
  address: string;
  destination: string;
  montant: string;
  client: string;
  product: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: Date;
}

interface PackageDetails {
  deliveryId: string;
  address: string;
  client: string;
  product: string;
  destination: string;
  montant: string;
  payment: string;
  isExchange: boolean;
  isFragile: boolean;
  status: string;
  createdAt: Date;
}

const Pack = () => {
  const [searchParams] = useSearchParams();
  const scannedData = searchParams.get('scannedData');
  
  const [loading, setLoading] = useState(true);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!scannedData) {
        // For development purposes, we'll use mock data when no ID is provided
        console.log('No scanned data provided, using mock data');
        
        // Mock data for development
        setTimeout(() => {
          const mockPackageDetails: PackageDetails = {
            deliveryId: "DEL-12345",
            client: "John Doe",
            address: "123 Main St, New York",
            destination: "456 Park Ave, Brooklyn",
            product: "Electronics",
            montant: "150",
            payment: "Cash on delivery",
            isExchange: true,
            isFragile: true,
            status: "In Transit",
            createdAt: new Date()
          };
          
          setPackageDetails(mockPackageDetails);
          setLoading(false);
        }, 1000);
        
        return;
      }

      try {
        const deliveryDoc = await getDoc(doc(firebasestore, 'livraisons', scannedData));
        if (deliveryDoc.exists()) {
          const deliveryData = deliveryDoc.data() as Delivery;

          // Récupération des détails du client
          const clientDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.client));
          const clientName = clientDoc.exists() ? clientDoc.data()?.name : "Client inconnu";
          
          // Récupération de l'adresse de destination
          const destinationDoc = await getDoc(doc(firebasestore, 'clients', deliveryData.client));
          const destinationName = destinationDoc.exists() ? destinationDoc.data()?.address : "Client inconnu";
          
          // Produit nom
          const productDoc = await getDoc(doc(firebasestore, 'products', deliveryData.product));
          const productValue = productDoc.exists() ? productDoc.data()?.name : "produit inconnue";

          // Montant
          const montantDoc = await getDoc(doc(firebasestore, 'products', deliveryData.product));
          const montantValue = montantDoc.exists() ? montantDoc.data()?.amount : "amount inconnue";
          
          // Récupération des détails de l'adresse
          const addressDoc = await getDoc(doc(firebasestore, 'adresses', deliveryData.address));
          const addressValue = addressDoc.exists() ? addressDoc.data()?.address : "Adresse inconnue";

          const mergedData: PackageDetails = {
            deliveryId: deliveryData.id,
            address: addressValue,
            client: clientName,
            product: productValue,
            destination: destinationName,
            payment: deliveryData.payment,
            isExchange: deliveryData.isExchange,
            isFragile: deliveryData.isFragile,
            status: deliveryData.status,
            createdAt: deliveryData.createdAt.toDate(),
            montant: montantValue
          };
          setPackageDetails(mergedData);
        } else {
          console.error(`Aucune livraison trouvée avec l'ID: ${scannedData}`);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la livraison :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [scannedData]);

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFDDF1] to-[#FFF5FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFDDF1] to-[#FFF5FB] px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="outline" className="rounded-full w-10 h-10 p-0 mr-3 shadow-sm">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-semibold">Détails du Colis</h1>
      </div>

      {/* Package Image Section */}
      <div className="flex justify-center items-center mb-6">
        <div className="bg-white p-6 rounded-full shadow-md">
          <Package size={80} color="#9C27B0" strokeWidth={2} />
        </div>
      </div>

      {packageDetails ? (
        <Card className="mb-8 rounded-3xl shadow-lg border-none overflow-hidden">
          <CardHeader className="pt-6 pb-0">
            <h2 className="text-2xl font-bold">{packageDetails.product}</h2>
            <p className="text-gray-500 text-sm">{packageDetails.deliveryId}</p>
            <div className="my-2">
              <Badge className={`${getStatusColor(packageDetails.status)}`}>
                {packageDetails.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm">
                Colis de <span className="font-medium">{packageDetails.address}</span> à <span className="font-medium">{packageDetails.destination}</span> pour le client <span className="font-medium">{packageDetails.client}</span>.
                <span className="text-purple-600 font-medium ml-1 flex items-center gap-1 mt-2">
                  <Eye size={14} /> Voir l'itinéraire
                </span>
              </p>
            </div>

            {/* Info Badges */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-1">
                <MapPin size={16} color="#F7B633" />
                <span className="text-gray-700 text-sm">{packageDetails.destination}</span>
              </div>
              <div className="flex items-center gap-1">
                <CreditCard size={16} color="#F06292" />
                <span className="text-gray-700 text-sm">{packageDetails.payment}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} color="#9C27B0" />
                <span className="text-gray-700 text-sm">{new Date(packageDetails.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <Label className="text-gray-500 text-sm">Client:</Label>
                <span className="text-sm font-medium">{packageDetails.client}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-gray-500 text-sm">Origine:</Label>
                <span className="text-sm font-medium">{packageDetails.address}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-gray-500 text-sm">Échange:</Label>
                <div className="flex items-center">
                  {packageDetails.isExchange ? 
                    <RefreshCcw size={14} className="mr-1 text-purple-600" /> : 
                    null}
                  <span className="text-sm font-medium">{packageDetails.isExchange ? 'Oui' : 'Non'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-gray-500 text-sm">Fragile:</Label>
                <div className="flex items-center">
                  {packageDetails.isFragile ? 
                    <AlertTriangle size={14} className="mr-1 text-orange-500" /> : 
                    null}
                  <span className="text-sm font-medium">{packageDetails.isFragile ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Price and Quantity */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-500 text-sm">Montant total</p>
                <p className="text-xl font-bold">{packageDetails.montant} dt</p>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-8 w-8 hover:bg-purple-100"
                  onClick={decreaseQuantity}
                >
                  <span className="text-purple-700">-</span>
                </Button>
                <span className="text-lg font-medium w-6 text-center">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-8 w-8 hover:bg-purple-100"
                  onClick={increaseQuantity}
                >
                  <span className="text-purple-700">+</span>
                </Button>
              </div>
            </div>

            {/* Action Button */}
            <Button className="w-full py-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg">
              Confirmer la Livraison
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-8 p-6 bg-white rounded-3xl shadow-lg text-center">
          <p className="text-lg text-gray-600">Aucun détail trouvé pour cette livraison.</p>
        </div>
      )}
    </div>
  );
};

export default Index;
