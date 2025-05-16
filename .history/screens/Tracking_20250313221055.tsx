
import { ArrowLeft, Bell, Clock, Home, MapPin, Search, ShoppingCart, Star } from 'lucide-react';
import React from 'react';

const Tracking = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 z-10">
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3">
          <ArrowLeft size={24} color="#000" />
        </button>
        
        <div className="flex-1 h-12 bg-white rounded-full flex items-center px-4 shadow-sm">
          <Search size={18} color="#a088ca" className="mr-2" />
          <input 
            className="flex-1 h-full text-base text-gray-800 outline-none"
            placeholder="Search here.."
          />
        </div>
      </div>
      
      {/* Map Content */}
      <div className="flex-1 bg-gray-100 relative mt-4">
        {/* Map Markers */}
        <div className="absolute top-[40%] left-[18%] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
          <img 
            src="https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png" 
            className="w-8 h-8 rounded-full"
            alt="Restaurant"
          />
        </div>
        
        <div className="absolute top-[20%] left-[35%] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
          <img 
            src="https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png" 
            className="w-8 h-8 rounded-full"
            alt="Restaurant"
          />
        </div>
        
        <div className="absolute top-[25%] right-[25%] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
          <img 
            src="https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png" 
            className="w-8 h-8 rounded-full"
            alt="Restaurant"
          />
        </div>
        
        <div className="absolute bottom-[30%] right-[15%] w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
          <img 
            src="https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png" 
            className="w-8 h-8 rounded-full"
            alt="Restaurant"
          />
        </div>
        
        {/* Active Location */}
        <div className="absolute top-[35%] left-[12%] w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-md">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
        </div>
        
        {/* Purple Paths */}
        <div className="absolute top-[35%] left-[20%] w-24 h-0.5 bg-purple-500 rotate-30 rounded-md"></div>
        <div className="absolute top-[42%] right-[20%] w-32 h-0.5 bg-purple-500 -rotate-70 rounded-md"></div>
        
        {/* Street Labels */}
        <div className="absolute top-[15%] left-[5%] text-gray-500 text-xs font-medium">Jl. Kori</div>
        <div className="absolute bottom-[20%] left-[30%] text-gray-500 text-xs font-medium">Jl. Ninduk</div>
      </div>
      
      {/* Restaurant Details Card */}
      <div className="absolute bottom-24 left-5 right-5 bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex mb-4">
          <img 
            src="https://e7f8189d-770c-4fdb-912e-ada0f82e240f.lovableproject.com/lovable-uploads/c43f9df7-1674-4e0f-8fc3-78b3f6794614.png" 
            className="w-12 h-12 rounded-full mr-3"
            alt="Restaurant Logo"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-0.5">Junkie</h3>
            <p className="text-gray-500 text-sm mb-1.5">Jl. Rameyan No 321, Santui City</p>
            
            <div className="flex">
              <div className="flex items-center mr-4">
                <Star size={14} color="#FFB800" />
                <span className="ml-1 text-xs text-gray-700">4.5</span>
              </div>
              <div className="flex items-center mr-4">
                <Clock size={14} color="#F06292" />
                <span className="ml-1 text-xs text-gray-700">11 minutes</span>
              </div>
              <div className="flex items-center">
                <MapPin size={14} color="#9C64FF" />
                <span className="ml-1 text-xs text-gray-700">1.9 km</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="w-full py-3 bg-purple-500 text-white rounded-full font-medium">
          Check Restaurant Now
        </button>
      </div>
      
      {/* Bottom Navigation */}
      <div className="flex h-[70px] bg-white border-t border-gray-200">
        <button className="flex-1 flex items-center justify-center">
          <Home size={24} color="#999" />
        </button>
        
        <button className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center mb-0.5">
            <MapPin size={20} color="#fff" />
          </div>
          <span className="text-xs text-purple-500 font-medium">Nearby</span>
        </button>
        
        <button className="flex-1 flex items-center justify-center">
          <ShoppingCart size={24} color="#999" />
        </button>
        
        <button className="flex-1 flex items-center justify-center">
          <Bell size={24} color="#999" />
        </button>
      </div>
    </div>
  );
};

export default Tracking;