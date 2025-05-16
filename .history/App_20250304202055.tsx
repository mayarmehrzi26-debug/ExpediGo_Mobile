import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import AjoutAdress from "./screens/AjoutAdress";
import AjoutClient from "./screens/AjoutClient";
import AjoutProd from "./screens/AjoutProd";
import EmballageCommand from "./screens/EmballageCommand";
import EmballageList from "./screens/EmballageList";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import Login from "./screens/Login";
import NouvelleLivraison from "./screens/NouvelleLivraison";
import OnboardingScreen from "./screens/OnboardingScreen";
import OTPScreen from "./screens/OTPScreen";
import SignUpScreen from "./screens/SignUpScreen";


const App: React.FC = () => {
  const Stack = createStackNavigator<RootStackParamList>();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
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
          name="OTPScreen"
          component={OTPScreen}
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
        <Stack.Screen
          name="NouvelleLivraison"
          component={NouvelleLivraison}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmballageList"
          component={EmballageList}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="AjoutProd"
          component={AjoutProd}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="AjoutClient"
          component={AjoutClient}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AjoutAdress"
          component={AjoutAdress}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AjoutAdress"
          component={P}
          options={{ headerShown: false }}
        />
        
      </Stack.Navigator>
     
    </NavigationContainer>
  );
};

export default App;