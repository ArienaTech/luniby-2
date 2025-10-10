import React, { useState } from 'react';
import PropTypes from 'prop-types';

const MarketplaceManager = ({ 
  listings = [], 
  packages = [], 
  products = [], 
  providerData = {},
  onCreateService,
  onEditService,
  onDeleteService,
  onToggleStatus,
  onGoLive
}) => {
  const [activeTab, setActiveTab] = useState('services');

  const ServiceCard = ({ service }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{service.name || service.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
        </div>
        <div className="ml-4 text-right">
          <p className="font-semibold text-gray-900">${service.price || service.price_from}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            service.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {service.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{service.category}</span>
          {service.verified && (
            <span className="inline-flex items-center text-xs text-blue-600">
              ✓ Verified
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEditService(service)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(service.listing_id || service.id, service.active)}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            {service.active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDeleteService(service.listing_id || service.id, service.name || service.title)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ type }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-2xl">
          {type === 'services' ? '🛍️' : type === 'packages' ? '📦' : '🏷️'}
        </span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {type} yet
      </h3>
      <p className="text-gray-600 mb-6">
        Create your first {type.slice(0, -1)} to start selling on the marketplace
      </p>
      <button
        onClick={() => onCreateService(type)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
      >
        Create {type.slice(0, -1)}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Marketplace Status Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              Marketplace
              {providerData?.verified && (
                <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  🚀 Live
                </span>
              )}
            </h3>
            <p className="text-gray-700">
              {providerData?.verified 
                ? "Your profile is live and accepting bookings from customers" 
                : listings.length > 0 
                  ? "Ready to publish your services to the marketplace"
                  : "Create services to get started on the marketplace"
              }
            </p>
          </div>
          
          {!providerData?.verified && listings.length > 0 && (
            <button
              onClick={onGoLive}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Go Live on Marketplace
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'services', label: 'Services', count: listings.length },
            { key: 'packages', label: 'Packages', count: packages.length },
            { key: 'products', label: 'Products', count: products.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 font-medium text-sm ${
                activeTab === tab.key
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Your Services</h3>
              <button
                onClick={() => onCreateService('service')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                + Add Service
              </button>
            </div>
            
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((service) => (
                  <ServiceCard key={service.listing_id || service.id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState type="services" />
            )}
          </div>
        )}

        {activeTab === 'packages' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Service Packages</h3>
              <button
                onClick={() => onCreateService('package')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                + Create Package
              </button>
            </div>
            
            {packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{pkg.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{pkg.service_ids?.length || 0} services included</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-600">${pkg.package_price?.toFixed(2)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="packages" />
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Products</h3>
              <button
                onClick={() => onCreateService('product')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                + Add Product
              </button>
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">${product.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState type="products" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

MarketplaceManager.propTypes = {
  listings: PropTypes.array,
  packages: PropTypes.array,
  products: PropTypes.array,
  providerData: PropTypes.object,
  onCreateService: PropTypes.func.isRequired,
  onEditService: PropTypes.func.isRequired,
  onDeleteService: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onGoLive: PropTypes.func.isRequired,
};

export default MarketplaceManager;