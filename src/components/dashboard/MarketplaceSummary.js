import React from 'react';
import PropTypes from 'prop-types';

const MarketplaceSummary = ({ listings, packages, products = [], setActiveSection }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Marketplace</h3>
          <button 
            onClick={() => setActiveSection('marketplace')} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Manage →
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Services Summary */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Services</h4>
              <span className="text-sm text-gray-500">{listings.length} total</span>
            </div>
            {listings.length > 0 ? (
              <div className="space-y-2">
                {listings.slice(0, 2).map((listing) => (
                  <div key={listing.listing_id || listing.id} className="flex justify-between items-center py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{listing.name || listing.title}</p>
                      <p className="text-xs text-gray-600">{listing.service_types || listing.service_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${listing.price || listing.price_from}</p>
                    </div>
                  </div>
                ))}
                {listings.length > 2 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{listings.length - 2} more services
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No services yet</p>
            )}
          </div>

          {/* Packages Summary */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Packages</h4>
              <span className="text-sm text-gray-500">{packages.length} total</span>
            </div>
            {packages.length > 0 ? (
              <div className="space-y-2">
                {packages.slice(0, 2).map((pkg) => (
                  <div key={pkg.id} className="flex justify-between items-center py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pkg.name}</p>
                      <p className="text-xs text-gray-600">{pkg.service_ids?.length || 0} services</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">${pkg.package_price?.toFixed(2)}</p>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
                {packages.length > 2 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{packages.length - 2} more packages
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No packages yet</p>
            )}
          </div>

          {/* Products Summary */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Products</h4>
              <span className="text-sm text-gray-500">{products.length} total</span>
            </div>
            {products.length > 0 ? (
              <div className="space-y-2">
                {products.slice(0, 2).map((product) => (
                  <div key={product.id} className="flex justify-between items-center py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${product.price}</p>
                    </div>
                  </div>
                ))}
                {products.length > 2 && (
                  <p className="text-xs text-gray-500 text-center pt-1">
                    +{products.length - 2} more products
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

MarketplaceSummary.propTypes = {
  listings: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    service_type: PropTypes.string,
    price_from: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    active: PropTypes.bool,
  })).isRequired,
  packages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    service_ids: PropTypes.array,
    package_price: PropTypes.number,
    is_active: PropTypes.bool,
  })).isRequired,
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    category: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  })),
  setActiveSection: PropTypes.func.isRequired,
};

export default MarketplaceSummary;