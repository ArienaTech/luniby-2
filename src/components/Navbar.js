import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import { subscribeToAuth } from '../lib/auth-manager.js';
import healthRecordService from '../services/healthRecordService';
import petService from '../services/petService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showHowItWorksDropdown, setShowHowItWorksDropdown] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    
    // Use centralized auth manager
    const unsubscribe = subscribeToAuth((event, session) => {
      if (session?.user) {
        checkUser();
      } else {
        setUser(null);
        setUserRole(null);
        setProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  // Refresh notifications periodically (every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
      if (showNotificationCenter && !event.target.closest('.notification-dropdown')) {
        setShowNotificationCenter(false);
      }
      if (showHowItWorksDropdown && !event.target.closest('.how-it-works-dropdown')) {
        setShowHowItWorksDropdown(false);
      }
      if (showAboutDropdown && !event.target.closest('.about-dropdown')) {
        setShowAboutDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown, showNotificationCenter, showHowItWorksDropdown, showAboutDropdown]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Get user profile with full data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, phone, location, organization')
          .eq('id', user.id)
          .single();
        
        // Special override for tim-davis909@gmail.com trainer account
        if (user?.email === 'tim-davis909@gmail.com') {
          setUserRole('trainer');
          return;
        }
        
        // Primary role detection: Check user_type from user metadata first
        const userTypeFromMetadata = user?.user_metadata?.user_type;
        
        // Use user_type from metadata as the primary role source
        let effectiveRole = userTypeFromMetadata || profile?.role || null;
        
        // Handle direct role assignments first
        if (profile?.role === 'breeder') {
          effectiveRole = 'breeder';
        } else if (profile?.role === 'trainer') {
          effectiveRole = 'trainer';
        } else if (profile?.role === 'provider') {
          const { data: providerData, error: providerError } = await supabase
            .from('providers')
            .select('provider_type')
            .eq('user_id', user.id)
            .single();
          
          if (providerData?.provider_type === 'groomer') {
            effectiveRole = 'groomer';
          } else if (providerData?.provider_type === 'breeder') {
            effectiveRole = 'breeder';
          } else if (providerData?.provider_type === 'trainer') {
            effectiveRole = 'trainer';
          } else if (providerData?.provider_type === 'nutritionist') {
            effectiveRole = 'nutritionist';
          } else if (providerData?.provider_type === 'pet_business') {
            effectiveRole = 'pet_business';
          } else if (providerData?.provider_type === 'holistic_care') {
            effectiveRole = 'holistic_care';
          }
        }
        
        setProfile(profile);
        setUserRole(effectiveRole);
        

        
        // Load health notifications (non-blocking)
        loadNotifications().catch(error => {
          console.error('Error loading notifications:', error);
          setNotifications([]);
        });
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotifications([]);
        return;
      }

      // Get user's pets
      const petsResult = await petService.getUserPets(user.id);
      if (!petsResult.success || !petsResult.data.length) {
        setNotifications([]);
        return;
      }

      const pets = petsResult.data;
      const healthNotifications = [];

      // Generate health notifications for each pet
        for (const pet of pets) {
          try {
            // Get ALL health records with due dates for this pet
            const healthRecordsResult = await healthRecordService.getHealthRecords(pet.id);
            
            if (healthRecordsResult.success) {
              const healthRecords = healthRecordsResult.data;

              // Check each health record for upcoming due dates
              healthRecords.forEach(record => {
                if (record.next_due_date) {
                  const dueDate = new Date(record.next_due_date);
                  const daysUntil = healthRecordService.getDaysUntilDue(record.next_due_date);
                  
                  // Show notifications for due dates within 30 days or overdue
                  if (daysUntil <= 30) {
                    let title = '';
                    let message = '';
                    let urgent = false;

                    // Customize message based on record type
                    switch (record.record_type) {
                      case 'vaccination':
                        title = daysUntil < 0 ? 'Vaccination Overdue' : 'Vaccination Due Soon';
                        message = daysUntil < 0 ? 
                          `${pet.name}'s vaccination is ${Math.abs(daysUntil)} days overdue` :
                          daysUntil === 0 ?
                          `${pet.name}'s vaccination is due today` :
                          `${pet.name}'s vaccination is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
                        urgent = daysUntil <= 7;
                        break;
                      case 'grooming':
                        title = daysUntil < 0 ? 'Grooming Overdue' : 'Grooming Due Soon';
                        message = daysUntil < 0 ? 
                          `${pet.name}'s grooming is ${Math.abs(daysUntil)} days overdue` :
                          daysUntil === 0 ?
                          `${pet.name}'s grooming is due today` :
                          `${pet.name}'s grooming is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
                        urgent = daysUntil <= 3;
                        break;
                      case 'checkup':
                        title = daysUntil < 0 ? 'Checkup Overdue' : 'Checkup Due Soon';
                        message = daysUntil < 0 ? 
                          `${pet.name}'s checkup is ${Math.abs(daysUntil)} days overdue` :
                          daysUntil === 0 ?
                          `${pet.name}'s checkup is due today` :
                          `${pet.name}'s checkup is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
                        urgent = daysUntil <= 7;
                        break;
                      case 'dental':
                        title = daysUntil < 0 ? 'Dental Care Overdue' : 'Dental Care Due Soon';
                        message = daysUntil < 0 ? 
                          `${pet.name}'s dental care is ${Math.abs(daysUntil)} days overdue` :
                          daysUntil === 0 ?
                          `${pet.name}'s dental care is due today` :
                          `${pet.name}'s dental care is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
                        urgent = daysUntil <= 7;
                        break;
                      default:
                        title = daysUntil < 0 ? `${record.record_type} Overdue` : `${record.record_type} Due Soon`;
                        message = daysUntil < 0 ? 
                          `${pet.name}'s ${record.record_type} is ${Math.abs(daysUntil)} days overdue` :
                          daysUntil === 0 ?
                          `${pet.name}'s ${record.record_type} is due today` :
                          `${pet.name}'s ${record.record_type} is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
                        urgent = daysUntil <= 7;
                    }

                    healthNotifications.push({
                      id: `health-${record.id}`,
                      title: title,
                      message: message,
                      read: false,
                      urgent: urgent,
                      type: 'health',
                      petId: pet.id,
                      petName: pet.name,
                      recordType: record.record_type,
                      dueDate: dueDate
                    });
                  }
                }
              });
            }

            // Also get health stats for additional health indicators
            const healthStatsResult = await healthRecordService.calculatePetHealthStats(pet.id);
            if (healthStatsResult.success) {
              const healthData = healthStatsResult.data;

              // Add general health checkup reminders (if no recent checkup record found)
              if (healthData.daysSinceLastCheckup > 365) {
                const hasCheckupDue = healthNotifications.some(n => 
                  n.petId === pet.id && n.recordType === 'checkup'
                );
                
                if (!hasCheckupDue) {
                  healthNotifications.push({
                    id: `checkup-general-${pet.id}`,
                    title: 'Annual Checkup Due',
                    message: `${pet.name} hasn't had a checkup in over a year`,
                    read: false,
                    urgent: healthData.daysSinceLastCheckup > 450,
                    type: 'health',
                    petId: pet.id,
                    petName: pet.name,
                    recordType: 'checkup'
                  });
                }
              }
            }
          } catch (error) {
            console.error(`Error loading health data for pet ${pet.id}:`, error);
          }
        }

      // Load booking notifications
      const bookingNotifications = [];
      try {
        const { data: bookingsData } = await supabase
          .from('consultation_bookings')
          .select(`
            *,
            marketplace_listings (
              title,
              provider_name,
              service_type
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (bookingsData) {
          bookingsData.forEach(booking => {
            const appointmentDate = new Date(booking.preferred_date + ' ' + booking.preferred_time);
            const now = new Date();
            const timeDiff = appointmentDate - now;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));

            // Show notifications for upcoming appointments (within 7 days)
            if (daysDiff >= 0 && daysDiff <= 7 && booking.status === 'confirmed') {
              let message = '';
              let urgent = false;

              if (daysDiff === 0 && hoursDiff <= 24 && hoursDiff > 0) {
                message = `${booking.marketplace_listings?.service_type || 'Appointment'} with ${booking.marketplace_listings?.provider_name || 'provider'} today at ${booking.preferred_time}`;
                urgent = true;
              } else if (daysDiff === 1) {
                                  message = `${booking.marketplace_listings?.service_type || 'Appointment'} with ${booking.marketplace_listings?.provider_name || 'provider'} tomorrow at ${booking.preferred_time}`;
                urgent = true;
              } else if (daysDiff <= 3) {
                                  message = `${booking.marketplace_listings?.service_type || 'Appointment'} with ${booking.marketplace_listings?.provider_name || 'provider'} in ${daysDiff} days`;
                urgent = false;
              } else {
                                  message = `${booking.marketplace_listings?.service_type || 'Appointment'} scheduled for ${booking.preferred_date}`;
                urgent = false;
              }

              bookingNotifications.push({
                id: `booking-${booking.id}`,
                title: booking.status === 'confirmed' ? 'Upcoming Appointment' : 'Appointment Update',
                message: message,
                read: false,
                urgent: urgent,
                type: 'booking',
                bookingId: booking.id,
                appointmentDate: appointmentDate
              });
            }

            // Show notifications for recently confirmed bookings (within 3 days)
            if (booking.status === 'confirmed' && booking.confirmed_at) {
              const confirmedDate = new Date(booking.confirmed_at);
              const daysSinceConfirmed = Math.ceil((now - confirmedDate) / (1000 * 60 * 60 * 24));
              
              if (daysSinceConfirmed <= 3) {
                bookingNotifications.push({
                  id: `confirmed-${booking.id}`,
                  title: 'Booking Confirmed',
                  message: `Your ${booking.marketplace_listings?.service_type || 'appointment'} with ${booking.marketplace_listings?.provider_name || 'provider'} is confirmed for ${booking.preferred_date}`,
                  read: false,
                  urgent: false,
                  type: 'booking',
                  bookingId: booking.id
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Error loading booking notifications:', error);
      }

      // Load pet reminders
      const reminderNotifications = [];
      try {
        const remindersResult = await healthRecordService.getReminders(user.id);
        if (remindersResult.success && remindersResult.data) {
          remindersResult.data.forEach(reminder => {
            const dueDate = new Date(reminder.due_date);
            const now = new Date();
            const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

            // Show reminders that are due within 7 days or overdue
            if (daysDiff <= 7) {
              reminderNotifications.push({
                id: `reminder-${reminder.id}`,
                title: reminder.title || 'Pet Reminder',
                message: daysDiff < 0 ? 
                  `Overdue: ${reminder.description}` : 
                  daysDiff === 0 ? 
                  `Due today: ${reminder.description}` :
                  `Due in ${daysDiff} days: ${reminder.description}`,
                read: false,
                urgent: daysDiff <= 1,
                type: 'reminder',
                reminderId: reminder.id,
                petId: reminder.pet_id
              });
            }
          });
        }
      } catch (error) {
        console.error('Error loading reminder notifications:', error);
      }

      // Combine all notifications
      const allNotifications = [...healthNotifications, ...bookingNotifications, ...reminderNotifications];

      // Sort notifications by urgency, then by date/relevance
      allNotifications.sort((a, b) => {
        if (a.urgent !== b.urgent) return b.urgent - a.urgent;
        if (a.appointmentDate && b.appointmentDate) {
          return a.appointmentDate - b.appointmentDate;
        }
        return a.petName?.localeCompare(b.petName || '') || 0;
      });

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const handleNotificationClick = (notification) => {
    if (notification.type === 'health' && notification.petId) {
      // Navigate to pet owner dashboard with health records tab for the specific pet
      navigate('/pet-owner-dashboard?tab=health&pet=' + notification.petId);
      setShowNotificationCenter(false);
    } else if (notification.type === 'booking') {
      // Navigate to pet owner dashboard bookings section
      navigate('/pet-owner-dashboard?tab=bookings');
      setShowNotificationCenter(false);
    } else if (notification.type === 'reminder') {
      // Navigate to pet owner dashboard overview or specific pet
      if (notification.petId) {
        navigate('/pet-owner-dashboard?tab=overview&pet=' + notification.petId);
      } else {
        navigate('/pet-owner-dashboard?tab=overview');
      }
      setShowNotificationCenter(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    setProfile(null);
    setShowProfileDropdown(false);
    setNotifications([]);
    setShowNotificationCenter(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin': return '/admin';
      case 'groomer': return '/groomer-dashboard';
      case 'trainer': return '/trainer-dashboard';
      case 'breeder': return '/breeder-dashboard';
      case 'nutritionist': return '/nutritionist-dashboard';
      case 'pet_business': return '/pet-business-dashboard';
      case 'holistic_care': return '/holistic-care-dashboard';
      case 'vet_nurse': return '/vet-nurse-dashboard';
      case 'veterinarian': return '/veterinarian-portal';
      case 'support': return '/support-dashboard';
      case 'pet_owner':
      default: return '/pet-owner-dashboard';
    }
  };

  const getDashboardLabel = () => {
    switch (userRole) {
      case 'admin': return 'Admin';
      case 'groomer': return 'My Dashboard';
      case 'trainer': return 'My Dashboard';
      case 'breeder': return 'My Dashboard';
      case 'nutritionist': return 'My Dashboard';
      case 'pet_business': return 'My Dashboard';
      case 'holistic_care': return 'My Dashboard';
      case 'vet_nurse': return 'My Dashboard';
      case 'veterinarian': return 'My Dashboard';
      case 'support': return 'Support';
      case 'pet_owner': return 'My Dashboard';
      default: return 'My Dashboard';
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClass = (path) => {
    const baseClass = "px-3 py-2 text-base font-medium transition-colors duration-200 font-montserrat";
    const activeClass = "text-[#5EB47C]";
    const inactiveClass = "text-gray-900 hover:text-[#5EB47C]";
    
    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      {/* Using same structure as homepage sections */}
      <div className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo - Aligned with homepage content */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img 
                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img//Luniby-logo-finalx.svg" 
                  alt="Luniby Logo" 
                  className="h-9 sm:h-10 w-auto"
                />
              </Link>
            </div>

            {/* Centered Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
              <Link to="/marketplace" className={getLinkClass('/marketplace')}>
                Petcare Hub
              </Link>
              <Link to="/luni-triage" className={getLinkClass('/luni-triage')}>
                LuniGen
              </Link>

              {/* How It Works Dropdown */}
              <div className="relative how-it-works-dropdown">
                <button
                  onClick={() => setShowHowItWorksDropdown(!showHowItWorksDropdown)}
                  className={`${getLinkClass('/pricing')} flex items-center space-x-1`}
                >
                  <span>How It Works</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showHowItWorksDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showHowItWorksDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/pricing"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#5EB47C] transition-colors"
                      onClick={() => setShowHowItWorksDropdown(false)}
                    >
                      Pet Owners
                    </Link>
                    <Link
                      to="/clinics"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#5EB47C] transition-colors"
                      onClick={() => setShowHowItWorksDropdown(false)}
                    >
                      Clinics
                    </Link>
                    <Link
                      to="/vet-schools"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#5EB47C] transition-colors"
                      onClick={() => setShowHowItWorksDropdown(false)}
                    >
                      Vet Schools
                    </Link>
                  </div>
                )}
              </div>
              
              {/* About Dropdown */}
              <div className="relative about-dropdown">
                <button
                  onClick={() => setShowAboutDropdown(!showAboutDropdown)}
                  className={`${getLinkClass('/about')} flex items-center space-x-1`}
                >
                  <span>About</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showAboutDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showAboutDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/about"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#5EB47C] transition-colors"
                      onClick={() => setShowAboutDropdown(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      to="/investors"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#5EB47C] transition-colors"
                      onClick={() => setShowAboutDropdown(false)}
                    >
                      Investors
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#5EB47C] transition-colors"
                      onClick={() => setShowAboutDropdown(false)}
                    >
                      Contact Us
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Auth Buttons - Right */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>

                  
                  {/* Dashboard Title, Notifications & Profile */}
                  <div className="flex items-center space-x-3">
                    {/* Dashboard Title */}
                    {user && (
                      <Link
                        to={getDashboardLink()}
                        className={getLinkClass(getDashboardLink())}

                      >
                        {userRole === 'veterinarian' ? 'My Dashboard' :
                         userRole === 'vet_nurse' ? 'My Dashboard' :
                         userRole === 'trainer' ? 'My Dashboard' :
                         userRole === 'groomer' ? 'My Dashboard' :
                         userRole === 'breeder' ? 'My Dashboard' :
                         userRole === 'nutritionist' ? 'My Dashboard' :
                         userRole === 'pet_business' ? 'My Dashboard' :
                         userRole === 'holistic_care' ? 'My Dashboard' :
                         userRole === 'pet_owner' ? 'My Dashboard' :
                         userRole === 'admin' ? 'My Dashboard' :
                         'My Dashboard'}
                      </Link>
                    )}
                    

                    {/* Notification Bell */}
                    <div className="relative notification-dropdown">
                      <button
                        onClick={() => setShowNotificationCenter(!showNotificationCenter)}
                        className="relative p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-200 group"
                        title="Notifications"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a3 3 0 10-6 0v3l-5 5h5a3 3 0 006 0z" />
                        </svg>
                        {notifications.filter(n => !n.read).length > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg">
                            {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                          </span>
                        )}
                      </button>

                      {/* Notification Dropdown */}
                      {showNotificationCenter && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[55]">
                          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            {notifications.length > 0 && (
                              <button
                                onClick={clearAllNotifications}
                                className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                              notifications.map((notification) => (
                                <div 
                                  key={notification.id} 
                                  onClick={() => handleNotificationClick(notification)}
                                  className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                                    !notification.read ? (
                                      notification.urgent ? 'bg-orange-50' : 
                                      notification.type === 'booking' ? 'bg-green-50' : 
                                      notification.type === 'reminder' ? 'bg-purple-50' :
                                      'bg-blue-50'
                                    ) : ''
                                  }`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className={`w-8 h-8 rounded-full mt-1 flex items-center justify-center flex-shrink-0 ${
                                      notification.urgent ? 'bg-orange-100' : 
                                      notification.type === 'booking' ? 'bg-green-100' : 
                                      notification.type === 'reminder' ? 'bg-purple-100' :
                                      'bg-blue-100'
                                    }`}>
                                      {notification.type === 'health' ? (
                                        <svg className={`w-4 h-4 ${notification.urgent ? 'text-orange-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      ) : notification.type === 'booking' ? (
                                        <svg className={`w-4 h-4 ${notification.urgent ? 'text-orange-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 012 0v4m0 0V3a1 1 0 012 0v4m0 0h4l-4 4-4-4m0 0V7a1 1 0 012 0v4" />
                                        </svg>
                                      ) : notification.type === 'reminder' ? (
                                        <svg className={`w-4 h-4 ${notification.urgent ? 'text-orange-600' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      ) : (
                                        <div className={`w-2 h-2 rounded-full ${notification.urgent ? 'bg-red-500' : notification.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                      {notification.petName && (
                                        <p className="text-xs text-gray-500 mt-1">Pet: {notification.petName}</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeNotification(notification.id);
                                      }}
                                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-all duration-200"
                                      title="Close notification"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-8 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="text-2xl">🔔</span>
                                </div>
                                <p className="text-gray-600 text-sm">No notifications</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Profile Dropdown - Social Media Style */}
                    <div className="relative profile-dropdown">
                      <button
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
                      >
                        {/* Profile Picture */}
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : userRole === 'admin' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/admin.svg" 
                              alt="Admin" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'pet_business' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/PetBusiness.svg" 
                              alt="Pet Business" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'pet_owner' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/pet-owner.svg" 
                              alt="Pet Owner" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'breeder' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/breeder.svg" 
                              alt="Breeder" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'nutritionist' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/nutritionist.svg" 
                              alt="Nutritionist" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'holistic_care' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/holistic-care.svg" 
                              alt="Holistic Care" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'veterinarian' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet.svg" 
                              alt="Veterinarian" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'vet_nurse' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet-nurse%20(1).svg" 
                              alt="Vet Nurse" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'trainer' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/pet-trainer.svg" 
                              alt="Trainer" 
                              className="w-6 h-6"
                            />
                          ) : userRole === 'groomer' ? (
                            <img 
                              src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/groomer.svg" 
                              alt="Groomer" 
                              className="w-6 h-6"
                            />
                          ) : (
                            <span className="text-sm">👤</span>
                          )}
                        </div>
                        
                        {/* 3-line menu icon */}
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>

                    {/* Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[55]">
                        {/* Profile Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                              {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                              ) : userRole === 'admin' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/admin.svg" 
                                  alt="Admin" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'pet_business' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/PetBusiness.svg" 
                                  alt="Pet Business" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'pet_owner' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/pet-owner.svg" 
                                  alt="Pet Owner" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'breeder' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/breeder.svg" 
                                  alt="Breeder" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'nutritionist' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/nutritionist.svg" 
                                  alt="Nutritionist" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'holistic_care' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/holistic-care.svg" 
                                  alt="Holistic Care" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'veterinarian' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet.svg" 
                                  alt="Veterinarian" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'vet_nurse' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet-nurse%20(1).svg" 
                                  alt="Vet Nurse" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'trainer' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/pet-trainer.svg" 
                                  alt="Trainer" 
                                  className="w-8 h-8"
                                />
                              ) : userRole === 'groomer' ? (
                                <img 
                                  src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/groomer.svg" 
                                  alt="Groomer" 
                                  className="w-8 h-8"
                                />
                              ) : (
                                <span className="text-lg">👤</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 font-montserrat truncate">
                                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          
                          <Link
                            to="/settings"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-montserrat transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                          </Link>

                          <div className="border-t border-gray-100 my-1"></div>

                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              handleSignOut();
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-montserrat transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/signin" className="text-gray-900 hover:text-[#5EB47C] px-4 py-2 text-base font-medium transition-colors duration-200 font-montserrat">
                    Sign In
                  </Link>
                  <Link to="/signup" className="bg-[#5EB47C] hover:bg-[#4A9A64] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm font-montserrat">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex-shrink-0">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-[#5EB47C] hover:bg-gray-100 transition-colors duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="py-6 space-y-3">
                <Link
                  to="/marketplace"
                  className="block px-3 py-3 text-base font-medium text-gray-900 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md font-montserrat transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Petcare Hub
                </Link>
                <Link
                  to="/luni-triage"
                  className="block px-3 py-3 text-base font-medium text-gray-900 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md font-montserrat transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  LuniGen
                </Link>
                {/* Mobile How It Works Dropdown */}
                <div className="how-it-works-dropdown">
                  <button
                    onClick={() => setShowHowItWorksDropdown(!showHowItWorksDropdown)}
                    className="flex items-center justify-between w-full px-3 py-3 text-base font-medium text-gray-900 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md font-montserrat transition-colors duration-200"
                  >
                    <span>How It Works</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showHowItWorksDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showHowItWorksDropdown && (
                    <div className="ml-4 mt-2 space-y-2">
                      <Link
                        to="/pricing"
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => {
                          setShowHowItWorksDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        Pet Owners
                      </Link>
                      <Link
                        to="/clinics"
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => {
                          setShowHowItWorksDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        Clinics
                      </Link>
                      <Link
                        to="/vet-schools"
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => {
                          setShowHowItWorksDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        Vet Schools
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Mobile About Dropdown */}
                <div className="about-dropdown">
                  <button
                    onClick={() => setShowAboutDropdown(!showAboutDropdown)}
                    className="flex items-center justify-between w-full px-3 py-3 text-base font-medium text-gray-900 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md font-montserrat transition-colors duration-200"
                  >
                    <span>About</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showAboutDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showAboutDropdown && (
                    <div className="ml-4 mt-2 space-y-2">
                      <Link
                        to="/about"
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => {
                          setShowAboutDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        About Us
                      </Link>
                      <Link
                        to="/investors"
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => {
                          setShowAboutDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        Investors
                      </Link>
                      <Link
                        to="/contact"
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md transition-colors"
                        onClick={() => {
                          setShowAboutDropdown(false);
                          setIsOpen(false);
                        }}
                      >
                        Contact Us
                      </Link>
                    </div>
                  )}
                </div>
                {user && (
                  <Link
                    to={getDashboardLink()}
                    className="block px-3 py-3 text-base font-medium text-gray-900 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md font-montserrat transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                                         {userRole === 'veterinarian' ? 'My Dashboard' :
                      userRole === 'vet_nurse' ? 'My Dashboard' :
                      userRole === 'trainer' ? 'My Dashboard' :
                      userRole === 'groomer' ? 'My Dashboard' :
                      userRole === 'breeder' ? 'My Dashboard' :
                      userRole === 'nutritionist' ? 'My Dashboard' :
                      userRole === 'pet_business' ? 'My Dashboard' :
                      userRole === 'holistic_care' ? 'My Dashboard' :
                      userRole === 'pet_owner' ? 'My Dashboard' :
                      userRole === 'admin' ? 'Admin Dashboard' :
                      'My Dashboard'}
                  </Link>
                )}
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="space-y-3">
                    {user ? (
                      <>
                        {/* Mobile Profile Header */}
                        <div className="flex items-center px-3 py-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden mr-3">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : userRole === 'admin' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/admin.svg" 
                                alt="Admin" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'pet_business' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/PetBusiness.svg" 
                                alt="Pet Business" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'pet_owner' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/pet-owner.svg" 
                                alt="Pet Owner" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'breeder' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/breeder.svg" 
                                alt="Breeder" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'nutritionist' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/nutritionist.svg" 
                                alt="Nutritionist" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'holistic_care' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/holistic-care.svg" 
                                alt="Holistic Care" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'veterinarian' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet.svg" 
                                alt="Veterinarian" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'vet_nurse' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet-nurse%20(1).svg" 
                                alt="Vet Nurse" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'trainer' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/pet-trainer.svg" 
                                alt="Trainer" 
                                className="w-8 h-8"
                              />
                            ) : userRole === 'groomer' ? (
                              <img 
                                src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/groomer.svg" 
                                alt="Groomer" 
                                className="w-8 h-8"
                              />
                            ) : (
                              <span className="text-lg">👤</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 font-montserrat truncate">
                              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                          </div>
                        </div>


                        <Link
                          to="/settings"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center w-full px-3 py-3 text-base font-medium text-gray-900 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md font-montserrat transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>

                        <div className="border-t border-gray-200 my-2"></div>

                        <button
                          onClick={() => { handleSignOut(); setIsOpen(false); }}
                          className="flex items-center w-full px-3 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md font-montserrat transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/signin" className="block px-3 py-3 text-base font-medium text-gray-900 hover:text-[#5EB47C] hover:bg-gray-50 rounded-md font-montserrat transition-colors duration-200" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                        <Link to="/signup" className="block bg-[#5EB47C] hover:bg-[#4A9A64] text-white px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200 shadow-sm font-montserrat text-center" onClick={() => setIsOpen(false)}>
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;