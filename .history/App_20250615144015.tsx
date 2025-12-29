import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { PaperProvider } from "react-native-paper";
import BarcodeScanner from "./screens/BarcodeScanner";
import Caisse from "./screens/Caisse";
import Chatbot from "./screens/Chatbot";
import Colis from "./screens/Client/Colis";
import EmailScreen from "./screens/EmailScreen";
import EmailSender from "./screens/EmailSender";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import NouvelleLivraison from "./screens/NouvelleLivraison";
import OnboardingScreen from "./screens/OnboardingScreen";
import OTPScreen from "./screens/OTPScreen";
import PackageDetailss from "./screens/PackageDetailss";
import Pickups from "./screens/Pickups";
import PickupAdresses from "./screens/Profile/PickupAddresses";
import Tracking from "./screens/Tracking";
import TrackingScreen from "./screens/TrackingScreen";
import AjoutAdress from "./src/adress/view/AjoutAdressView";
import ListeAdressesView from "./src/adress/view/ListeAdressesView";
import Login from "./src/auth/Login";
import SignUpScreen from "./src/auth/SignUpScreen";
import AjoutClientView from "./src/clients/view/AjoutClientView";
import ClientDetailsView from "./src/clients/view/ClientDetailsView";
import ListeClientsView from "./src/clients/view/ListeClientsView";
import ModifierClient from "./src/clients/view/ModifierClient";
import HomeClient from "./src/destinataire//HomeClient";
import ChatScreen from "./src/destinataire/ChatScreen";
import CommandeDetails from "./src/destinataire/CommandeDetails";
import CommandesClient from "./src/destinataire/CommandesClient";
import ProfileClient from "./src/destinataire/Profile/ProfileClient";
import EditLivraison from "./src/expediteur//EditLivraison";
import ProfileLivreur from "./src/livreur/Profile/ProfileLivreur";

import EmballageCommand from "./src/emballage/view/EmballageCommand";
import EmballageList from "./src/emballage/view/EmballageList";
import CashView from './src/expediteur/caisse/view/CashView';
import HomeScreen from "./src/expediteur/HomeScreen";
import Livraison from "./src/expediteur/Livraison";
import PackageDetails from "./src/expediteur/PackageDetails";
import BadClients from "./src/expediteur/Profile/BadClients";
import BusinessInfo from "./src/expediteur/Profile/BusinessInfo";
import InfoPerso from "./src/expediteur/Profile/InfoPerso";
import HistoriqueCommandes from "./src/livraison/view/HistoriqueCommandes";
import NouvelleLivraisonScreen from "./src/livraison/view/NouvelleLivraisonScreen";
import Notification from "./src/livreur/components/NotificationsScreen";
import MesCommandes from "./src/livreur/MesCommandes";
import PackageDetailsLiv from "./src/livreur/PackageDetailsLiv";
import Profile from "./src/livreur/Profile/ProfileLivreur";
import CommandeDetailsScreen from './src/livreur/views/CommandeDetailsScreen';
import EmballageDetailsScreen from './src/livreur/views/EmballageDetailsScreen';
import HomeLivreur from "./src/livreur/views/HomeLivreur";
import AjoutProd from "./src/produit/view/AjoutProdView";
import EditProduct from "./src/produit/view/EditProductView";
import ProductList from "./src/produit/view/ProductListView";
import AddTicket from "./src/ticket/view/AddTicketView";
import Support from "./src/ticket/view/TicketListView";
import Profile from "./src/expediteur/Profile/Profile";

const App: React.FC = () => {
  const Stack = createStackNavigator<RootStackParamList>();

  return (
    <PaperProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding">
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
  name="CommandeDetails" 
  component={CommandeDetailsScreen} 
  options={{ title: 'Détails de la commande' }}
/>
<Stack.Screen 
  name="CommandeDetailsClient" 
  component={CommandeDetails} 
  options={{ headerShown: false }}
/>
<Stack.Screen 
  name="EmballageDetails" 
  component={EmballageDetailsScreen} 
  options={{ title: 'Détails emballage' }}
/>
<Stack.Screen 
  name="ChatScreen" 
  component={ChatScreen} 
  options={{ headerShown:false }}
/>
<Stack.Screen 
  name="Notifications" 
  component={Notification} 
  options={{ headerShown:false }}
/>
         <Stack.Screen
          name="EmailSender"
          component={EmailSender}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="CommandesClient"
          component={CommandesClient}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="OTPScreen"
          component={OTPScreen}
          options={{ headerShown: false }}
        />
       
          <Stack.Screen
          name="ListeAdresses"
          component={ListeAdressesView}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="ProductList"
          component={ProductList}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="EditProduct"
          component={EditProduct}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ModifierClient"
          component={ModifierClient}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CashView"
          component={CashView}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="EmballageCommand"
          component={EmballageCommand}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ListeClients" component={ListeClientsView} options={{ headerShown: false }}/>
        <Stack.Screen name="ClientDetails" component={ClientDetailsView} options={{ headerShown: false }} />

        <Stack.Screen
          name="NouvelleLivraison"
          component={NouvelleLivraison}
          options={{ headerShown: false }}
        />
               <Stack.Screen
          name="NouvelleLivraisonScreen"
          component={NouvelleLivraisonScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HistoriqueCommandes"
          component={HistoriqueCommandes}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmballageList"
          component={EmballageList}
          options={{ headerShown: false }}
        />

         <Stack.Screen
          name="ProfileExp"
          component={Profile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AjoutClient"
          component={AjoutClientView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AjoutProd"
          component={AjoutProd}
          options={{ headerShown: false }}
        />
       <Stack.Screen
          name="AjoutAdress"
          component={AjoutAdress}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Pickups"
          component={Pickups}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Livraison"
          component={Livraison}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Support"
          component={Support}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="AddTicket"
          component={AddTicket}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="ProfileLivreur"
          component={ProfileLivreur}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="InfoPerso"
          component={InfoPerso}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="BadClients"
          component={BadClients}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BusinessInfo"
          component={BusinessInfo}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="PickupAdresses"
          component={PickupAdresses}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Caisse"
          component={Caisse}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScanner}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
        name="PackageDetails"
         component={PackageDetails} 
         options={{headerShown: false  }}
         />
          <Stack.Screen 
        name="PackageDetailss"
         component={PackageDetailss} 
         options={{headerShown: false  }}
         />
         <Stack.Screen 
        name="PackageDetailsLiv"
         component={PackageDetailsLiv} 
         options={{headerShown: false  }}


         />
 <Stack.Screen
          name="HomeLivreur"
          component={HomeLivreur}
          options={{ headerShown: false }}

        />
        <Stack.Screen
          name="MesCommandes"
          component={MesCommandes}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="TrackingScreen"
          component={TrackingScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Tracking"
          component={Tracking}
          options={{ headerShown: false }}
        />
          <Stack.Screen
          name="HomeClient"
          component={HomeClient}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Colis"
          component={Colis}
          options={{ headerShown: false }}
        />
        
         <Stack.Screen
          name="Chatbot"
          component={Chatbot}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailScreen"
          component={EmailScreen}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="EditLivraison"
          component={EditLivraison}
          options={{ headerShown: false }}
        />
<Stack.Screen
          name="ProfileClient"
          component={ProfileClient}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
     
    </NavigationContainer>
    </PaperProvider>

  );
};

export default App;