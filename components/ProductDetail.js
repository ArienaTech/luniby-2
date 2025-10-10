import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import FavoriteButton from './FavoriteButton';

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [provider, setProvider] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [quantityDropdownOpen, setQuantityDropdownOpen] = useState(false);
  const quantityDropdownRef = useRef(null);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        // Load product details
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) {
          // Product loading error - handled by UI state
          setLoading(false);
          return;
        }

        setProduct(productData);

        // Load provider details
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', productData.provider_id)
          .single();

        if (!providerError) {
          setProvider(providerData);
        }

        // Load related products from the same provider
        const { data: relatedData, error: relatedError } = await supabase
          .from('products')
          .select('*')
          .eq('provider_id', productData.provider_id)
          .eq('is_active', true)
          .gt('stock_quantity', 0)
          .neq('id', productId)
          .limit(3);

        if (!relatedError) {
          setRelatedProducts(relatedData || []);
        }

        setLoading(false);
      } catch (error) {
        // Error loading product data - handled by UI state
        setLoading(false);
      }
    };

    if (productId) {
      loadProductData();
    }
  }, [productId]);

  // Close quantity dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (quantityDropdownRef.current && !quantityDropdownRef.current.contains(event.target)) {
        setQuantityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-montserrat">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-montserrat">Product not found</h3>
          <p className="text-gray-500 font-montserrat mb-4">The product you're looking for doesn't exist.</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors font-montserrat"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <nav className="flex overflow-x-auto scrollbar-hide" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 sm:space-x-4 whitespace-nowrap">
              <li>
                <Link to="/marketplace" className="text-gray-500 hover:text-gray-700 font-montserrat">
                  Marketplace
                </Link>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-500 font-montserrat">{product.category}</span>
              </li>
              <li>
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <span className="text-gray-900 font-montserrat font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1">
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl h-64 sm:h-80 lg:h-96 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover border-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-montserrat">
                  {product.name}
                </h1>
              </div>
              <FavoriteButton
                listingId={product.id}
                listingType="product"
                size="md"
                className="ml-4 flex-shrink-0"
              />
            </div>
            <div className="mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 font-montserrat">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="text-sm text-gray-500 font-montserrat">
                      {product.subcategory}
                    </span>
                  )}
                  {product.brand && (
                    <span className="text-sm text-gray-500 font-montserrat">
                      by {product.brand}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 font-montserrat">
                  ${product.price}
                </p>
              </div>
            </div>

            {/* Provider Info */}
            {provider && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-medium text-base font-montserrat">
                      {provider.name?.charAt(0) || 'P'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 font-montserrat">
                      Sold by {provider.business_name || provider.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {provider.verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 font-montserrat">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                      {provider.rating > 0 && (
                        <div className="flex items-center">
                          <div className="flex text-yellow-400 mr-1">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 font-montserrat">
                            {provider.rating} ({provider.reviews_count})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/provider/${provider.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium font-montserrat"
                  >
                    View Store
                  </Link>
                </div>
              </div>
            )}

            {/* Product Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 font-montserrat">
                  Description
                </h3>
                <p className="text-gray-700 font-montserrat leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 font-montserrat">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.sku && (
                  <div>
                    <span className="text-gray-500 font-montserrat">SKU:</span>
                    <span className="ml-2 text-gray-900 font-montserrat">{product.sku}</span>
                  </div>
                )}
                {product.weight_kg && (
                  <div>
                    <span className="text-gray-500 font-montserrat">Weight:</span>
                    <span className="ml-2 text-gray-900 font-montserrat">{product.weight_kg} kg</span>
                  </div>
                )}
                {product.dimensions && (
                  <div>
                    <span className="text-gray-500 font-montserrat">Dimensions:</span>
                    <span className="ml-2 text-gray-900 font-montserrat">{product.dimensions}</span>
                  </div>
                )}
                {product.age_group && (
                  <div>
                    <span className="text-gray-500 font-montserrat">Age Group:</span>
                    <span className="ml-2 text-gray-900 font-montserrat">{product.age_group}</span>
                  </div>
                )}
                {product.pet_type && (
                  <div>
                    <span className="text-gray-500 font-montserrat">Pet Type:</span>
                    <span className="ml-2 text-gray-900 font-montserrat">{product.pet_type}</span>
                  </div>
                )}
                {product.is_prescription && (
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 font-montserrat">
                      ⚠️ Prescription Required
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 font-montserrat">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 font-montserrat"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock and Purchase */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium font-montserrat ${
                    product.stock_quantity > 10 
                      ? 'bg-green-100 text-green-800' 
                      : product.stock_quantity > 0 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_quantity > 10 ? 'In Stock' : 
                     product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of Stock'}
                  </span>
                </div>
                
                {product.stock_quantity > 0 && (
                  <div className="flex items-center gap-3" ref={quantityDropdownRef}>
                    <label className="text-sm font-medium text-gray-700 font-montserrat">
                      Quantity:
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setQuantityDropdownOpen(!quantityDropdownOpen)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-montserrat bg-white text-left flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[60px]"
                      >
                        <span>{quantity}</span>
                        <svg
                          className={`w-4 h-4 ml-2 transition-transform ${quantityDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {quantityDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden max-h-60 overflow-y-auto min-w-[60px]">
                          {[...Array(Math.min(product.stock_quantity, 10))].map((_, i) => (
                            <button
                              key={i + 1}
                              type="button"
                              onClick={() => {
                                setQuantity(i + 1);
                                setQuantityDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center font-montserrat ${
                                quantity === i + 1 ? 'bg-[#E5F4F1] text-[#4A9A64]' : 'text-gray-900'
                              } ${i > 0 ? 'border-t border-gray-200' : ''}`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  disabled={product.stock_quantity === 0}
                  className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-medium font-montserrat transition-colors ${
                    product.stock_quantity > 0
                      ? 'bg-[#5EB47C] text-white hover:bg-[#4A9A64]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button
                  disabled={product.stock_quantity === 0}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-xl font-medium font-montserrat border transition-colors ${
                    product.stock_quantity > 0
                      ? 'border-[#5EB47C] text-[#5EB47C] hover:bg-[#E5F4F1]'
                      : 'border-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 font-montserrat">
              More from {provider?.business_name || provider?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-primary-100 to-primary-200 h-28 sm:h-32 rounded-t-2xl overflow-hidden">
                      {relatedProduct.image_url ? (
                        <img
                          src={relatedProduct.image_url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover border-0"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-base">
                          📦
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 font-montserrat group-hover:text-primary-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900 font-montserrat">
                          ${relatedProduct.price}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 font-montserrat">
                          {relatedProduct.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;