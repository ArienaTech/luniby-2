import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { productService } from '../services/productService.js';

// Pet Business components matching other professional dashboards but focused on products
const BusinessOverview = ({ user, profile }) => {
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    activeCustomers: 0,
    productsInStock: 0,
    ordersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessStats();
  }, [user]);

  const loadBusinessStats = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data: products, error } = await productService.getProducts({ providerId: user.id });
      
      if (error) {
        console.error('Error loading business stats:', error);
        // Use default values if error
        setStats({
          monthlyRevenue: 0,
          activeCustomers: 0,
          productsInStock: 0,
          ordersThisMonth: 0
        });
      } else {
        // Calculate stats from products
        const totalProducts = products.length;
        const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
        
        setStats({
          monthlyRevenue: Math.round(totalStockValue * 0.1), // Estimate 10% of inventory value as monthly revenue
          activeCustomers: Math.floor(totalProducts * 2.5), // Estimate customers based on product count
          productsInStock: totalProducts,
          ordersThisMonth: Math.floor(totalProducts * 0.3) // Estimate orders
        });
      }
    } catch (error) {
      console.error('Error in loadBusinessStats:', error);
      setStats({
        monthlyRevenue: 0,
        activeCustomers: 0,
        productsInStock: 0,
        ordersThisMonth: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Welcome back, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Business Owner'}
        </h1>
        <p className="text-gray-600">
          You have {stats.ordersThisMonth} orders this month and {stats.productsInStock} products in your catalog.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-xs sm:text-sm font-medium">Monthly Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-900">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
                <span className="text-lg sm:text-xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-xs sm:text-sm font-medium">Active Customers</p>
                <p className="text-xl sm:text-2xl font-bold text-green-900">{stats.activeCustomers}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-green-600">
                <span className="text-lg sm:text-xl">👥</span>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-xs sm:text-sm font-medium">Products in Stock</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">{stats.productsInStock}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600">
                <span className="text-lg sm:text-xl">📦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-xs sm:text-sm font-medium">Orders This Month</p>
                <p className="text-xl sm:text-2xl font-bold text-orange-900">{stats.ordersThisMonth}</p>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600">
                <span className="text-lg sm:text-xl">📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <RecentOrdersWidget user={user} />

        {/* Top Products */}
        <TopProductsWidget user={user} />
      </div>
    </div>
  );
};

const RecentOrdersWidget = ({ user }) => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentOrders();
  }, [user]);

  const loadRecentOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // For now, we'll show empty state since orders table isn't implemented yet
      // In the future, this would fetch from an orders table
      setRecentOrders([]);
    } catch (error) {
      console.error('Error loading recent orders:', error);
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5EB47C] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
            <p className="text-gray-600 text-sm">
              Orders will appear here once customers start purchasing your products
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">#</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Order #{order.id} - {order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.items} • ${order.total}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TopProductsWidget = ({ user }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopProducts();
  }, [user]);

  const loadTopProducts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await productService.getProducts({ providerId: user.id });
      
      if (error) {
        console.error('Error loading top products:', error);
        setTopProducts([]);
      } else {
        // Sort by stock quantity descending to show most stocked items as "top selling"
        const sortedProducts = data
          .sort((a, b) => b.stock_quantity - a.stock_quantity)
          .slice(0, 3);
        setTopProducts(sortedProducts);
      }
    } catch (error) {
      console.error('Error in loadTopProducts:', error);
      setTopProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductEmoji = (category) => {
    switch (category) {
      case 'Food': return '🥫';
      case 'Toys': return '🧸';
      case 'Accessories': return '🛏️';
      case 'Health': return '💊';
      case 'Grooming': return '🧴';
      default: return '📦';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Your Products</h3>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5EB47C] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        ) : topProducts.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-400 text-2xl mb-2">📦</div>
            <p className="text-sm text-gray-600">No products yet</p>
            <p className="text-xs text-gray-500">Add products to your catalog to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div key={product.id} className="flex items-start space-x-3">
                <span className="text-green-500 text-lg">{getProductEmoji(product.category)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.stock_quantity} units in stock • ${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductCatalog = ({ user, profile }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [error, setError] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Food',
    price: '',
    stock_quantity: '',
    description: '',
    image: '📦',
    images: []
  });

  // Load products from Supabase
  React.useEffect(() => {
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await productService.getProducts({ providerId: user.id });
      
      if (fetchError) {
        console.error('Error loading products:', fetchError);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } else {
        // Transform data to match component expectations
        const transformedProducts = data.map(product => ({
          ...product,
          stock: product.stock_quantity, // Map stock_quantity to stock for compatibility
          status: product.stock_quantity > 10 ? 'in_stock' : 'low_stock',
          image: getProductEmoji(product.category)
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error in loadProducts:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newProduct.name || !newProduct.price || !newProduct.stock_quantity) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const productData = {
        ...newProduct,
        provider_id: user?.id,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        images: newProduct.images || []
      };
      
      const { data, error } = await productService.createProduct(productData);
      
      if (error) {
        console.error('Error creating product:', error);
        alert('Failed to create product. Please try again.');
        return;
      }
      
      // Reload products to get the updated list
      await loadProducts();
      
      // Reset form and close modal
      setNewProduct({ 
        name: '', 
        category: 'Food', 
        price: '', 
        stock_quantity: '', 
        description: '', 
        image: '📦', 
        images: [] 
      });
      setShowAddModal(false);
      
      console.log('New product added:', data);
    } catch (error) {
      console.error('Error in handleAddProduct:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      images: product.images || []
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    if (!editingProduct.name || !editingProduct.price || !editingProduct.stock_quantity) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const updates = {
        name: editingProduct.name,
        category: editingProduct.category,
        price: parseFloat(editingProduct.price),
        stock_quantity: parseInt(editingProduct.stock_quantity),
        description: editingProduct.description,
        images: editingProduct.images || []
      };
      
      const { data, error } = await productService.updateProduct(editingProduct.id, updates);
      
      if (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product. Please try again.');
        return;
      }
      
      // Reload products to get the updated list
      await loadProducts();
      
      setShowEditModal(false);
      setEditingProduct(null);
      
      console.log('Product updated:', data);
    } catch (error) {
      console.error('Error in handleUpdateProduct:', error);
      alert('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct?.id) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await productService.deleteProduct(deletingProduct.id);
      
      if (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
        return;
      }
      
      // Reload products to get the updated list
      await loadProducts();
      
      setShowDeleteModal(false);
      setDeletingProduct(null);
      
      console.log('Product deleted:', data);
    } catch (error) {
      console.error('Error in confirmDeleteProduct:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProductEmoji = (category) => {
    switch (category) {
      case 'Food': return '🥫';
      case 'Toys': return '🧸';
      case 'Accessories': return '🛏️';
      case 'Health': return '💊';
      case 'Grooming': return '🧴';
      default: return '📦';
    }
  };

  const handleImageUpload = (e, isEditing = false) => {
    const files = Array.from(e.target.files);
    const currentImages = isEditing ? editingProduct.images : newProduct.images;
    
    if (currentImages.length + files.length > 4) {
      alert('You can only upload up to 4 images per product');
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = {
            id: Date.now() + Math.random(),
            file: file,
            preview: event.target.result,
            name: file.name
          };
          
          if (isEditing) {
            setEditingProduct(prev => ({
              ...prev,
              images: [...prev.images, imageData]
            }));
          } else {
            setNewProduct(prev => ({
              ...prev,
              images: [...prev.images, imageData]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (imageId, isEditing = false) => {
    if (isEditing) {
      setEditingProduct(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      }));
    }
  };

  const handleProductClick = (product) => {
    setDetailProduct(product);
    setShowProductDetail(true);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600">Manage your product inventory and listings</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9B63] transition-colors"
        >
          Add New Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
            />
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food & Treats</option>
              <option value="Toys">Toys & Games</option>
              <option value="Accessories">Accessories</option>
              <option value="Health">Health & Supplements</option>
              <option value="Grooming">Grooming Supplies</option>
            </select>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                  placeholder="e.g., Premium Dog Food"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value, image: getProductEmoji(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                >
                  <option value="Food">Food & Treats</option>
                  <option value="Toys">Toys & Games</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Health">Health & Supplements</option>
                  <option value="Grooming">Grooming Supplies</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                    placeholder="29.99"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.stock_quantity}
                    onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                    placeholder="50"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                  placeholder="Product description..."
                  rows="3"
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (up to 4)
                </label>
                
                {/* Image Upload Area */}
                {newProduct.images.length < 4 && (
                  <div className="mb-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB ({4 - newProduct.images.length} remaining)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                      />
                    </label>
                  </div>
                )}

                {/* Image Previews */}
                {newProduct.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {newProduct.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id, false)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {image.name.length > 10 ? image.name.substring(0, 10) + '...' : image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9B63] transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Product</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value, image: getProductEmoji(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                >
                  <option value="Food">Food & Treats</option>
                  <option value="Toys">Toys & Games</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Health">Health & Supplements</option>
                  <option value="Grooming">Grooming Supplies</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                  rows="3"
                />
              </div>

              {/* Image Upload Section for Edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (up to 4)
                </label>
                
                {/* Image Upload Area */}
                {editingProduct.images && editingProduct.images.length < 4 && (
                  <div className="mb-4">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB ({4 - (editingProduct.images?.length || 0)} remaining)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                      />
                    </label>
                  </div>
                )}

                {/* Image Previews for Edit */}
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {editingProduct.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id, true)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          {image.name.length > 10 ? image.name.substring(0, 10) + '...' : image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {setShowEditModal(false); setEditingProduct(null);}}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9B63] transition-colors"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Product</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingProduct.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {setShowDeleteModal(false); setDeletingProduct(null);}}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetail && detailProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{detailProduct.name}</h2>
              <button
                onClick={() => setShowProductDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Product Images */}
            {detailProduct.images && detailProduct.images.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {detailProduct.images.map((image, index) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.preview}
                        alt={`${detailProduct.name} - View ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {index + 1} of {detailProduct.images.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 text-center py-8 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-2">{detailProduct.image}</div>
                <p className="text-gray-500">No images uploaded</p>
              </div>
            )}
            
            {/* Product Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900">{detailProduct.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <p className="text-xl font-bold text-green-600">${detailProduct.price}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Stock</label>
                  <p className={`font-medium ${
                    detailProduct.status === 'in_stock' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {detailProduct.stock} units
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    detailProduct.status === 'in_stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {detailProduct.status === 'in_stock' ? 'In Stock' : 'Low Stock'}
                  </span>
                </div>
              </div>
              
              {detailProduct.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 mt-1">{detailProduct.description}</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowProductDetail(false);
                  handleEditProduct(detailProduct);
                }}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Edit Product
              </button>
              <button
                onClick={() => {
                  setShowProductDetail(false);
                  handleDeleteProduct(detailProduct);
                }}
                className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">Error loading products</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={loadProducts}
              className="ml-auto px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterCategory !== 'All' ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start building your product catalog by adding your first product'
            }
          </p>
          {!searchTerm && filterCategory === 'All' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9B63] transition-colors"
            >
              Add Your First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0 cursor-pointer" onClick={() => handleProductClick(product)}>
                  {product.images && product.images.length > 0 ? (
                    <div className="relative">
                      <img
                        src={product.images[0].preview}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                      />
                      {product.images.length > 1 && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          +{product.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors">
                      {product.image}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-green-600">${product.price}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.status === 'in_stock' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock} in stock
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.status === 'in_stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'in_stock' ? 'In Stock' : 'Low Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Product Actions */}
              <div className="flex space-x-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleEditProduct(product)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrderManagement = ({ user, profile }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // For now, we'll show empty state since orders table isn't implemented yet
      // In the future, this would fetch from an orders table
      setOrders([]);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'processing');
  const shippedOrders = orders.filter(order => order.status === 'shipped' || order.status === 'delivered' || order.status === 'in_transit');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Track and manage customer orders</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pending Orders</h3>
            </div>
            <div className="p-6">
              {pendingOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">⏳</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No pending orders</h4>
                  <p className="text-gray-600 text-sm">
                    New orders will appear here when customers make purchases
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <div key={order.id} className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-semibold text-sm">#</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Order #{order.id} - {order.customer_name}</p>
                        <p className="text-sm text-gray-600">{order.items} • ${order.total}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Shipments */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
            </div>
            <div className="p-6">
              {shippedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📦</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No shipments yet</h4>
                  <p className="text-gray-600 text-sm">
                    Completed orders will appear here once they're shipped
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shippedOrders.map((order) => (
                    <div key={order.id} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-sm">✓</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Order #{order.id} - {order.customer_name}</p>
                        <p className="text-sm text-gray-600">{order.items} • ${order.total}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryManagement = ({ user, profile }) => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventoryData();
  }, [user]);

  const loadInventoryData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await productService.getProducts({ providerId: user.id });
      
      if (error) {
        console.error('Error loading inventory data:', error);
        setLowStockProducts([]);
        setCategoryStats([]);
      } else {
        // Filter low stock products (less than 10 units)
        const lowStock = data.filter(product => product.stock_quantity < 10);
        setLowStockProducts(lowStock);

        // Calculate category statistics
        const categoryMap = {};
        data.forEach(product => {
          if (categoryMap[product.category]) {
            categoryMap[product.category]++;
          } else {
            categoryMap[product.category] = 1;
          }
        });

        const stats = Object.entries(categoryMap).map(([category, count]) => ({
          category,
          count,
          emoji: getProductEmoji(category)
        }));
        setCategoryStats(stats);
      }
    } catch (error) {
      console.error('Error in loadInventoryData:', error);
      setLowStockProducts([]);
      setCategoryStats([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductEmoji = (category) => {
    switch (category) {
      case 'Food': return '🥫';
      case 'Toys': return '🧸';
      case 'Accessories': return '🛏️';
      case 'Health': return '💊';
      case 'Grooming': return '🧴';
      default: return '📦';
    }
  };

  const getStockLevel = (quantity) => {
    if (quantity === 0) return { level: 'Out of Stock', color: 'red', bgColor: 'bg-red-50' };
    if (quantity < 5) return { level: 'Critical', color: 'red', bgColor: 'bg-red-50' };
    if (quantity < 10) return { level: 'Low', color: 'yellow', bgColor: 'bg-yellow-50' };
    return { level: 'Good', color: 'green', bgColor: 'bg-green-50' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600">Monitor stock levels and manage inventory</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
            </div>
            <div className="p-6">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">✅</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">All products well stocked</h4>
                  <p className="text-gray-600 text-sm">
                    Products with low stock (less than 10 units) will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => {
                    const stockInfo = getStockLevel(product.stock_quantity);
                    return (
                      <div key={product.id} className={`flex items-center space-x-4 p-4 ${stockInfo.bgColor} rounded-lg`}>
                        <div className={`w-10 h-10 bg-${stockInfo.color}-100 rounded-full flex items-center justify-center`}>
                          <span className={`text-${stockInfo.color}-600 font-semibold text-sm`}>
                            {stockInfo.color === 'red' ? '!' : '⚠'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            {product.stock_quantity === 0 ? 'Out of stock' : `Only ${product.stock_quantity} units remaining`}
                          </p>
                          <span className={`inline-block px-2 py-1 bg-${stockInfo.color}-100 text-${stockInfo.color}-800 text-xs rounded-full mt-1`}>
                            {stockInfo.level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Product Categories */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Product Categories</h3>
            </div>
            <div className="p-6">
              {categoryStats.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📦</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
                  <p className="text-gray-600 text-sm">
                    Add products to see category breakdown
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryStats.map((stat) => (
                    <div key={stat.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{stat.emoji}</span>
                        <span className="font-medium text-gray-900">{stat.category}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        {stat.count} product{stat.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BusinessMessages = ({ user, profile }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Messages</h1>
        <p className="text-gray-600">Communicate with your customers about orders and products</p>
      </div>

      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Messaging Coming Soon</h3>
        <p className="text-gray-600">
          Chat directly with customers about their orders, answer product questions, and provide customer support.
        </p>
      </div>
    </div>
  );
};

const BusinessAnalytics = ({ user, profile }) => {
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    customerRetention: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // For now, we'll calculate basic analytics from product data
      // In the future, this would include real order and customer data
      const { data: products, error } = await productService.getProducts(user.id);
      
      if (error) {
        console.error('Error loading analytics data:', error);
        setAnalyticsData({
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          customerRetention: 0
        });
      } else {
        // Calculate basic metrics from products
        const totalProducts = products.length;
        const totalStockValue = products.reduce((sum, product) => 
          sum + (product.price * product.stock_quantity), 0
        );
        
        setAnalyticsData({
          totalOrders: 0, // Will be populated when order system is implemented
          totalRevenue: 0, // Will be populated when order system is implemented  
          avgOrderValue: 0, // Will be populated when order system is implemented
          customerRetention: 0 // Will be populated when customer tracking is implemented
        });
      }
    } catch (error) {
      console.error('Error in loadAnalyticsData:', error);
      setAnalyticsData({
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        customerRetention: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
        <p className="text-gray-600">View your business performance and sales insights</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Analytics Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.totalOrders}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
              <span className="text-lg sm:text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">${analyticsData.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-green-600">
              <span className="text-lg sm:text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Avg. Order Value</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">${analyticsData.avgOrderValue}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600">
              <span className="text-lg sm:text-xl">🛒</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Customer Retention</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{analyticsData.customerRetention}%</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600">
              <span className="text-lg sm:text-xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

          {/* Sales Charts */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h4>
              <p className="text-gray-600 text-sm">
                Detailed analytics will be available once you start receiving orders and tracking customer interactions
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const BusinessProfile = ({ user, profile, onProfileUpdate }) => {
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    yearsInBusiness: '',
    businessType: 'Pet Supply Store',
    location: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessProfile();
  }, [user, profile]);

  const loadBusinessProfile = async () => {
    try {
      setLoading(true);
      
      // Start with profile data - use personal location as business location
      let locationData = '';
      let businessName = '';
      let businessType = 'Pet Supply Store';
      let yearsInBusiness = '';
      
      if (profile) {
        console.log('📋 Profile data received:', profile);
        // Use the personal location from signup as the business location
        locationData = profile.location || '';
        
        // Parse business name and years from organization field
        if (profile.organization) {
          if (profile.organization.includes('|years:')) {
            const parts = profile.organization.split('|years:');
            businessName = parts[0];
            yearsInBusiness = parts[1];
          } else {
            businessName = profile.organization;
          }
        } else {
          businessName = profile.full_name || '';
        }
        
        businessType = 'Pet Supply Store'; // Default for pet business
        console.log('📋 Extracted from profile - businessName:', businessName, 'location:', locationData, 'years:', yearsInBusiness);
      } else {
        console.log('⚠️ No profile data received');
      }

      // If no location in profile, try to get it from auth user metadata
      if (user?.id && !locationData) {
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (!userError && userData?.user?.user_metadata) {
            const metadata = userData.user.user_metadata;
            // Reconstruct location from signup data
            const locationParts = [
              metadata.address,
              metadata.city,
              metadata.country
            ].filter(Boolean);
            
            if (locationParts.length > 0) {
              locationData = locationParts.join(', ');
            }
            
            // Also get business name from metadata if not in profile
            if (!businessName && metadata.business_name) {
              businessName = metadata.business_name;
            }
          }
        } catch (error) {
          console.log('Could not retrieve user metadata:', error);
        }
      }

      // Skip providers table query for now due to 406 errors
      // We have all the data we need from the profile and auth metadata

      const finalBusinessInfo = {
        businessName: businessName,
        yearsInBusiness: yearsInBusiness || '', // Now extracted from profile
        businessType: businessType,
        location: locationData
      };

      console.log('📋 Setting business info:', finalBusinessInfo);
      setBusinessInfo(finalBusinessInfo);
    } catch (error) {
      console.error('Error loading business profile:', error);
      // Fallback to basic profile data
      if (profile) {
        setBusinessInfo({
          businessName: profile.organization || profile.full_name || '',
          yearsInBusiness: '',
          businessType: 'Pet Supply Store',
          location: profile.location || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        alert('Error: User not found');
        return;
      }

      console.log('💾 Saving business profile:', businessInfo);
      console.log('👤 User ID:', user.id);

      // First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email, organization, location')
        .eq('id', user.id)
        .single();

      if (checkError) {
        console.error('❌ Error checking existing profile:', checkError);
        if (checkError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('📝 Profile does not exist, creating new profile...');
          
          // Create organization data with years if provided
          let organizationData = businessInfo.businessName;
          if (businessInfo.yearsInBusiness) {
            organizationData = `${businessInfo.businessName}|years:${businessInfo.yearsInBusiness}`;
          }
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              phone: user.user_metadata?.phone || '',
              organization: organizationData,
              location: businessInfo.location,
              role: 'pet_business',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select();

          if (insertError) {
            console.error('❌ Error creating profile:', insertError);
            alert(`Error creating profile: ${insertError.message}. Please try again.`);
            return;
          }
          console.log('✅ Profile created successfully:', newProfile);
        } else {
          alert(`Error checking profile: ${checkError.message}. Please try again.`);
          return;
        }
      } else {
        // Profile exists, update it
        console.log('📝 Profile exists, updating with data:', {
          organization: businessInfo.businessName,
          location: businessInfo.location
        });

        // Store business info including years in business
        // We'll append years in business to the organization field in a structured way
        let organizationData = businessInfo.businessName;
        if (businessInfo.yearsInBusiness) {
          organizationData = `${businessInfo.businessName}|years:${businessInfo.yearsInBusiness}`;
        }

        const updateData = {
          organization: organizationData, // Store business name and years together
          location: businessInfo.location,
          updated_at: new Date().toISOString()
        };

        console.log('📝 Storing organization data:', organizationData);

        const { data: updateResult, error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)
          .select();

        if (profileError) {
          console.error('❌ Error updating profile:', profileError);
          alert(`Error saving profile: ${profileError.message}. Please try again.`);
          return;
        }

        console.log('✅ Profile updated successfully:', updateResult);
      }

      // Skip providers table update due to 406 errors
      console.log('📝 Skipping providers table update - using profiles table only');

      // Show success message
      alert('✅ Business profile saved successfully!');
      console.log('🎉 Business profile saved:', businessInfo);
      
      // Reload the profile data from the main component to reflect changes everywhere
      console.log('🔄 Refreshing profile data in main component...');
      if (onProfileUpdate) {
        await onProfileUpdate();
      }
      // Also reload local data
      await loadBusinessProfile();
      console.log('✅ Profile data refreshed');
    } catch (error) {
      console.error('❌ Error saving business profile:', error);
      alert(`Error saving profile: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600">Manage your business information and store details</p>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
        <p className="text-gray-600">Manage your business information and store details</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          {/* Business Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input 
                  type="text" 
                  value={businessInfo.businessName}
                  onChange={(e) => setBusinessInfo({...businessInfo, businessName: e.target.value})}
                  placeholder="Enter your business name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
                <input 
                  type="number" 
                  value={businessInfo.yearsInBusiness}
                  onChange={(e) => setBusinessInfo({...businessInfo, yearsInBusiness: e.target.value})}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <select 
                  value={businessInfo.businessType}
                  onChange={(e) => setBusinessInfo({...businessInfo, businessType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                >
                  <option value="Pet Supply Store">Pet Supply Store</option>
                  <option value="Pet Food Retailer">Pet Food Retailer</option>
                  <option value="Pet Accessories Shop">Pet Accessories Shop</option>
                  <option value="Online Pet Store">Online Pet Store</option>
                  <option value="Pet Boutique">Pet Boutique</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Location</label>
                <input 
                  type="text" 
                  value={businessInfo.location}
                  onChange={(e) => setBusinessInfo({...businessInfo, location: e.target.value})}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5EB47C]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is populated from your personal location provided during signup
                </p>
              </div>
            </div>
          </div>

          {/* Business Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Dashboard Access</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Product Management</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Order Management</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Coming Soon</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-2 text-white rounded-lg transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#5EB47C] hover:bg-[#4A9B63]'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const PetBusinessDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();

  // Pet Business navigation focused on products and sales
  const businessNavigation = [
    { 
      id: 'overview', 
      name: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
        </svg>
      )
    },
    { 
      id: 'products', 
      name: 'Products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      id: 'orders', 
      name: 'Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      id: 'inventory', 
      name: 'Inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      )
    },
    { 
      id: 'messages', 
      name: 'Messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    { 
      id: 'analytics', 
      name: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'profile', 
      name: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        setError('Error loading user data');
        setLoading(false);
        return;
      }

      if (!currentUser) {
        console.log('No user found, redirecting to sign in');
        navigate('/signin');
        return;
      }

      setUser(currentUser);

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.error('Error getting profile:', profileError);
        console.log('PetBusinessDashboard - No profile found, using basic user data');
      } else {
        setProfile(profileData);
        console.log('✅ PetBusinessDashboard - Profile loaded successfully');
      }

      setLoading(false);

    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setError('Error loading dashboard data');
      setLoading(false);
    }
  };

  // Render active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <BusinessOverview user={user} profile={profile} />;
      case 'products':
        return <ProductCatalog user={user} profile={profile} />;
      case 'orders':
        return <OrderManagement user={user} profile={profile} />;
      case 'inventory':
        return <InventoryManagement user={user} profile={profile} />;
      case 'messages':
        return <BusinessMessages user={user} profile={profile} />;
      case 'analytics':
        return <BusinessAnalytics user={user} profile={profile} />;
      case 'profile':
        return <BusinessProfile user={user} profile={profile} onProfileUpdate={fetchUserData} />;
      default:
        return <BusinessOverview user={user} profile={profile} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your business dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-600 font-montserrat">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#5EB47C] text-white rounded hover:bg-[#4A9B63]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get display name from profile or user data
  const displayName = profile?.full_name || 
                     (user?.user_metadata?.full_name) ||
                     (user?.email?.split('@')[0]) ||
                     'Business Owner';
  
  const firstName = displayName.split(' ')[0] || 'Owner';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img 
                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/PetBusiness.svg" 
                alt="Pet Business" 
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-md font-medium text-gray-900 truncate">Welcome back, {firstName}</h4>
                <p className="text-sm text-gray-600 truncate">Pet Business Owner</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-2 py-2">
          <div className="flex overflow-x-auto space-x-1 pb-2">
            {businessNavigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex-shrink-0 flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? 'bg-green-100 text-[#5EB47C]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/PetBusiness.svg" 
                  alt="Pet Business" 
                  className="w-10 h-10"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">Pet Business</h1>
                  <p className="text-sm text-gray-600 truncate">{displayName}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {businessNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === item.id
                      ? 'bg-green-100 text-[#5EB47C]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default PetBusinessDashboard;