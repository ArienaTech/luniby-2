import React, { useState, useEffect, useCallback } from 'react';
import { getProviderConfig, getProviderLabels } from '../config/providerConfig';
import { PROVIDER_TYPES } from '../constants/providerTypes';
import { supabase } from '../lib/supabase';
import { subscribeToAuth } from '../lib/auth-manager';

// Groomer-specific components
import GroomerOverview from './groomer/GroomerOverview';
import MarketplaceJobs from './groomer/MarketplaceJobs';
import MyBookings from './groomer/MyBookings';
import ServiceCatalog from './groomer/ServiceCatalog';
import Messages from './groomer/Messages';
import Earnings from './groomer/Earnings';
import PhotoGallery from './groomer/PhotoGallery';
import GroomerProfile from './groomer/GroomerProfile';

const GroomerDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [groomerData, setGroomerData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    todayAppointments: 0,
    weeklyRevenue: 0,
    totalPets: 0,
    completedGrooming: 0,
    pendingAppointments: 0,
    lowStockItems: 0
  });

  const config = getProviderConfig(PROVIDER_TYPES.GROOMER);
  const labels = getProviderLabels(PROVIDER_TYPES.GROOMER);

  // Initialize user and auth subscription
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // Subscribe to auth changes
    const unsubscribe = subscribeToAuth((event, session) => {
      setUser(session?.user || null);
    });

    return unsubscribe;
  }, []);

  // Load groomer data and dashboard stats
  const loadGroomerData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load groomer profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Load provider data
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (providerError && providerError.code !== 'PGRST116') {
        console.error('Provider error:', providerError);
      }

      setGroomerData({
        profile: profileData,
        provider: providerData
      });

      // Load dashboard statistics
      await loadDashboardStats();

    } catch (error) {
      console.error('Error loading groomer data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load dashboard statistics
  const loadDashboardStats = async () => {
    if (!user?.id) return;

    try {
      // Get today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('groomer_id', user.id)
        .gte('appointment_date', today)
        .lt('appointment_date', new Date(Date.now() + 86400000).toISOString().split('T')[0]);

      // Get this week's revenue
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { data: weeklyBookings } = await supabase
        .from('appointments')
        .select('total_cost')
        .eq('groomer_id', user.id)
        .eq('status', 'completed')
        .gte('appointment_date', weekStart.toISOString().split('T')[0]);

      // Get total pets managed
      const { data: pets } = await supabase
        .from('pet_profiles')
        .select('id')
        .eq('groomer_id', user.id);

      // Get completed grooming sessions this month
      const monthStart = new Date();
      monthStart.setDate(1);
      const { data: completedSessions } = await supabase
        .from('appointments')
        .select('id')
        .eq('groomer_id', user.id)
        .eq('status', 'completed')
        .gte('appointment_date', monthStart.toISOString().split('T')[0]);

      // Get pending appointments
      const { data: pendingAppts } = await supabase
        .from('appointments')
        .select('id')
        .eq('groomer_id', user.id)
        .eq('status', 'scheduled');

      // Get low stock items
      const { data: inventory } = await supabase
        .from('groomer_inventory')
        .select('*')
        .eq('groomer_id', user.id)
        .lt('current_stock', 'min_stock_level');

      const weeklyRevenue = weeklyBookings?.reduce((sum, booking) => sum + (booking.total_cost || 0), 0) || 0;

      setDashboardStats({
        todayAppointments: todayAppts?.length || 0,
        weeklyRevenue,
        totalPets: pets?.length || 0,
        completedGrooming: completedSessions?.length || 0,
        pendingAppointments: pendingAppts?.length || 0,
        lowStockItems: inventory?.length || 0
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  useEffect(() => {
    loadGroomerData();
  }, [loadGroomerData]);

  // Handle quick actions
  const handleQuickAction = (action, filter = null) => {
    setActiveSection(action);
    // You can pass filter parameters to components if needed
  };

  // Render active section content
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <GroomerOverview 
            stats={dashboardStats}
            groomerData={groomerData}
            onQuickAction={handleQuickAction}
          />
        );
      case 'marketplace':
        return <MarketplaceJobs groomerData={groomerData} onStatsUpdate={loadDashboardStats} />;
      case 'bookings':
        return <MyBookings groomerData={groomerData} onStatsUpdate={loadDashboardStats} />;
      case 'services':
        return <ServiceCatalog groomerData={groomerData} />;
      case 'messages':
        return <Messages groomerData={groomerData} />;
      case 'earnings':
        return <Earnings groomerData={groomerData} />;
      case 'gallery':
        return <PhotoGallery groomerData={groomerData} />;
      case 'profile':
        return <GroomerProfile groomerData={groomerData} onUpdate={loadGroomerData} />;
      default:
        return (
          <GroomerOverview 
            stats={dashboardStats}
            groomerData={groomerData}
            onQuickAction={handleQuickAction}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5EB47C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your groomer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <img 
                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/groomer.svg" 
                alt="Groomer" 
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-md font-medium text-gray-900 truncate">Welcome back, {groomerData?.profile?.full_name || 'Professional Groomer'}</h4>
              </div>
            </div>
            <button
              onClick={() => setActiveSection('appointments')}
              className="px-3 py-1.5 bg-[#5EB47C] text-white rounded-md hover:bg-[#4A9A64] transition-colors text-sm"
            >
              Schedule
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-2 py-2">
          <div className="flex overflow-x-auto space-x-1 pb-2">
            {config.navigation.map((item) => (
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
                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/groomer.svg" 
                  alt="Groomer" 
                  className="w-10 h-10"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">{labels.sidebarTitle}</h1>
                  <p className="text-sm text-gray-600 truncate">{groomerData?.profile?.full_name || 'Professional Groomer'}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {config.navigation.map((item) => (
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

export default GroomerDashboard;