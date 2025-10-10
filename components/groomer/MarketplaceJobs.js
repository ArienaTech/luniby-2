import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const MarketplaceJobs = ({ groomerData, onStatsUpdate }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: 'all',
    service: 'all',
    priceRange: 'all'
  });

  useEffect(() => {
    loadMarketplaceJobs();
  }, [filters]);

  const loadMarketplaceJobs = async () => {
    try {
      setLoading(true);
      
      // For now, we'll show empty state since marketplace jobs aren't implemented yet
      // In the future, this would fetch from a marketplace jobs API
      setJobs([]);
    } catch (error) {
      console.error('Error loading marketplace jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      // In real app, this would update the job status in your marketplace system
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'accepted', groomer_id: groomerData?.id }
          : job
      ));
      
      // Refresh stats
      if (onStatsUpdate) onStatsUpdate();
      
      alert('Job accepted! You can now view it in your bookings.');
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept job. Please try again.');
    }
  };

  const getServiceColor = (serviceType) => {
    const colors = {
      'Full Grooming': 'bg-blue-100 text-blue-800',
      'Bath & Brush': 'bg-green-100 text-green-800',
      'Nail Trim': 'bg-yellow-100 text-yellow-800',
      'Styling': 'bg-purple-100 text-purple-800'
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EB47C]"></div>
        <span className="ml-2 text-gray-600">Loading marketplace jobs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Jobs</h1>
          <p className="text-gray-600">Browse and accept available grooming jobs in your area</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {jobs.filter(j => j.status === 'available').length} Available
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select 
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
            >
              <option value="all">All Locations</option>
              <option value="auckland-cbd">Auckland CBD</option>
              <option value="ponsonby">Ponsonby</option>
              <option value="newmarket">Newmarket</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
            <select 
              value={filters.service}
              onChange={(e) => setFilters({...filters, service: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
            >
              <option value="all">All Services</option>
              <option value="full-grooming">Full Grooming</option>
              <option value="bath-brush">Bath & Brush</option>
              <option value="nail-trim">Nail Trim</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <select 
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-[#5EB47C] focus:border-[#5EB47C]"
            >
              <option value="all">All Prices</option>
              <option value="0-50">$0 - $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100+">$100+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.filter(job => job.status === 'available').map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-[#5EB47C] font-semibold text-lg">
                      {job.pet_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.pet_name}</h3>
                    <p className="text-sm text-gray-600">{job.pet_type} • {job.owner_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getServiceColor(job.service_type)}`}>
                    {job.service_type}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{job.description}</p>

                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">📍</span>
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    {job.scheduled_date} at {job.scheduled_time}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">💰</span>
                    ${job.price}
                  </div>
                </div>
              </div>

              <div className="ml-6">
                <button
                  onClick={() => handleAcceptJob(job.id)}
                  className="bg-[#5EB47C] text-white px-6 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors font-medium"
                >
                  Accept Job
                </button>
              </div>
            </div>
          </div>
        ))}

        {jobs.filter(job => job.status === 'available').length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
            <p className="text-gray-600">Check back later or adjust your filters to see more opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceJobs;