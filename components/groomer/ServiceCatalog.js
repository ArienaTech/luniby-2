import React, { useState } from 'react';

const ServiceCatalog = ({ groomerData }) => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: 'Full Grooming Package',
      description: 'Complete grooming service including bath, brush, nail trim, and styling',
      duration: '2-3 hours',
      basePrice: 65,
      category: 'full_service'
    },
    {
      id: 2,
      name: 'Bath & Brush',
      description: 'Basic wash and brush service for maintenance grooming',
      duration: '1-1.5 hours',
      basePrice: 35,
      category: 'basic'
    },
    {
      id: 3,
      name: 'Nail Trim',
      description: 'Professional nail trimming service',
      duration: '15-30 minutes',
      basePrice: 15,
      category: 'add_on'
    },
    {
      id: 4,
      name: 'Teeth Cleaning',
      description: 'Basic dental hygiene service',
      duration: '20-30 minutes',
      basePrice: 25,
      category: 'add_on'
    }
  ]);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  const categories = {
    full_service: { name: 'Full Service', color: 'bg-green-100 text-green-800' },
    basic: { name: 'Basic Services', color: 'bg-blue-100 text-blue-800' },
    add_on: { name: 'Add-on Services', color: 'bg-green-100 text-green-800' },
    specialty: { name: 'Specialty Services', color: 'bg-orange-100 text-orange-800' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Catalog</h1>
          <p className="text-gray-600">Manage your grooming services and pricing</p>
        </div>
        <button
          onClick={() => setShowAddServiceModal(true)}
          className="bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
        >
          + Add Service
        </button>
      </div>



      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${categories[service.category].color}`}>
                {categories[service.category].name}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="text-gray-900">{service.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="text-green-600 font-semibold">${service.basePrice}</span>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-green-50 text-[#5EB47C] px-3 py-2 rounded text-sm font-medium hover:bg-green-100">
                Edit Service
              </button>
              <button className="px-3 py-2 bg-gray-50 text-gray-600 rounded text-sm hover:bg-gray-100">
                View Bookings
              </button>
            </div>
          </div>
        ))}
      </div>



      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-blue-400 text-2xl mr-3">🚀</div>
          <div>
            <h3 className="text-lg font-medium text-blue-900">Enhanced Service Management Coming Soon</h3>
            <p className="text-blue-700 mt-1">
              Advanced features like breed-specific pricing, service packages, and automated booking will be available soon.
            </p>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Service</h2>
            <p className="text-gray-600 mb-4">
              Service management features are coming soon! You'll be able to add custom services with breed-specific pricing.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddServiceModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalog;