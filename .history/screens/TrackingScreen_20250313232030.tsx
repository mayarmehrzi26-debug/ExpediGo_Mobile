import MapComponent from '@/components/MapComponent';
import { cn } from '@/lib/utils';
import { MessageCircle, Package, Phone } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const LocationCard = ({ title, address, isOrigin }) => {
  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm ${isOrigin ? 'border-l-4 border-tracking-blue' : 'border-l-4 border-tracking-green'}`}>
      <h4 className="font-bold">{title}</h4>
      <p className="text-gray-500">{address}</p>
    </div>
  );
};

const TrackingCard = ({ origin, destination, className, style }) => {
  return (
    <div 
      className={cn(
        "bg-tracking-blue rounded-xl p-4 shadow-lg animate-fade-in-up",
        className
      )}
      style={style}
    >
      <LocationCard 
        title={origin.title}
        address={origin.address}
        isOrigin={true}
      />
      <LocationCard 
        title={destination.title}
        address={destination.address}
        isOrigin={false}
      />
    </div>
  );
};

const CourierCard = ({ 
  name, 
  type, 
  packageWeight = "1 KG", 
  status = "Processing", 
  className,
  style
}) => {
  return (
    <div 
      className={cn(
        "bg-tracking-lightBlue rounded-xl p-4 shadow-sm animate-fade-in-up",
        className
      )}
      style={style}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-tracking-blue font-semibold">
              {name.split(' ').map(part => part[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-tracking-darkGray">{name}</h3>
            <p className="text-gray-500 text-xs">{type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 bg-tracking-blue rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105">
            <Phone className="w-4 h-4 text-white" />
          </button>
          <button className="w-8 h-8 bg-tracking-blue rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105">
            <MessageCircle className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between mt-3">
        <div className="bg-white px-3 py-1.5 rounded-lg">
          <p className="text-xs text-gray-500">Package Weight</p>
          <p className="font-medium text-tracking-darkGray">{packageWeight}</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-lg">
          <p className="text-xs text-gray-500">Status</p>
          <p className="font-medium text-tracking-processing">{status}</p>
        </div>
      </div>
    </div>
  );
};

const PackageDetails = ({ className, style }) => {
  return (
    <div 
      className={cn(
        "absolute left-4 right-4 bottom-4 h-24 bg-white/10 backdrop-blur-md rounded-xl shadow-sm overflow-hidden",
        className
      )}
      style={style}
    >
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-tracking-processing to-tracking-processing/20" />
      <div className="absolute bottom-0 left-4 w-16 h-16">
        <Package className="w-12 h-12 text-tracking-darkGray" />
      </div>
    </div>
  );
};

const TrackingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for the map and data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-tracking-blue border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-tracking-blue font-medium">Loading map...</p>
        </div>
      ) : (
        <>
          <MapComponent />
          
          <div className="absolute left-4 right-4 bottom-4 flex flex-col gap-4 z-10">
            <TrackingCard 
              origin={{
                title: "My Location",
                address: "3150 Mine RD, Near New York 10001"
              }}
              destination={{
                title: "My Express",
                address: "2454 Royal Ln, Mesa, New Jersey..."
              }}
              className="animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            />
            
            <CourierCard 
              name="Linda Lindsey"
              type="Courier - Regular"
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            />
            
            <div className="h-16" />
          </div>
          
          <PackageDetails className="animate-fade-in-up" style={{ animationDelay: "0.3s" }} />
        </>
      )}
    </div>
  );
};

export default TrackingScreen;