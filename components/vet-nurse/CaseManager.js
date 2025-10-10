import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import SOAPNoteEditor from './SOAPNoteEditor';

const CaseManager = ({ nurseId, initialFilter = 'all' }) => {
  const [allCases, setAllCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showSOAPEditor, setShowSOAPEditor] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('severity'); // Default sort by severity (most urgent first)

  // LuniTriage severity levels (matching the AI system)
  const SEVERITY_LEVELS = {
    emergency: { 
      label: 'Emergency', 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: '🚨', 
      priority: 4,
      description: 'Immediate veterinary attention required'
    },
    serious: { 
      label: 'Serious', 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      icon: '⚠️', 
      priority: 3,
      description: 'Urgent veterinary care needed'
    },
    moderate: { 
      label: 'Moderate', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: '📋', 
      priority: 2,
      description: 'Veterinary assessment recommended'
    },
    mild: { 
      label: 'Mild', 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: '✅', 
      priority: 1,
      description: 'Monitor and routine care'
    },
    pending: { 
      label: 'Pending Assessment', 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: '⏳', 
      priority: 0,
      description: 'Awaiting triage assessment'
    }
  };

  // Service type indicators
  const SERVICE_TYPES = {
    'LuniTriage SOAP Review': { icon: '📋', label: 'SOAP Review', color: 'bg-purple-100 text-purple-800' },
    'LuniTriage Consultation': { icon: '💬', label: 'Consultation', color: 'bg-blue-100 text-blue-800' },
    'Mobile Consultation': { icon: '🏠', label: 'Mobile Visit', color: 'bg-green-100 text-green-800' },
    'Emergency Care': { icon: '🚨', label: 'Emergency', color: 'bg-red-100 text-red-800' },
    'Health Check': { icon: '🩺', label: 'Health Check', color: 'bg-teal-100 text-teal-800' },
    'Follow-up': { icon: '🔄', label: 'Follow-up', color: 'bg-gray-100 text-gray-800' }
  };

  // Filter options based on severity
  const filterOptions = [
    { id: 'all', name: 'All Cases', count: allCases.length },
    { id: 'emergency', name: 'Emergency', count: allCases.filter(c => c.severity === 'emergency').length, color: 'text-red-600' },
    { id: 'serious', name: 'Serious', count: allCases.filter(c => c.severity === 'serious').length, color: 'text-orange-600' },
    { id: 'moderate', name: 'Moderate', count: allCases.filter(c => c.severity === 'moderate').length, color: 'text-yellow-600' },
    { id: 'mild', name: 'Mild', count: allCases.filter(c => c.severity === 'mild').length, color: 'text-green-600' },
    { id: 'pending', name: 'Pending Assessment', count: allCases.filter(c => c.severity === 'pending').length, color: 'text-blue-600' },
    { id: 'assigned', name: 'My Cases', count: allCases.filter(c => c.assigned_nurse_id === nurseId).length, color: 'text-purple-600' }
  ];

  useEffect(() => {
    if (initialFilter && initialFilter !== 'all') {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  useEffect(() => {
    loadAllCases();
  }, [nurseId]);

  const loadAllCases = async () => {
    try {
      setLoading(true);
      setDbError(null);
      
      if (!nurseId) {
        setLoading(false);
        setAllCases([]);
        return;
      }

      // Load all cases from multiple sources and unify them
      const casesFromSources = await Promise.allSettled([
        loadRegularCases(),
        loadTriageBookings(),
        loadConsultationBookings()
      ]);

      const allCasesData = [];
      
      // Process results from all sources
      casesFromSources.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allCasesData.push(...result.value);
        }
      });

      // Sort by severity (Emergency -> Serious -> Moderate -> Mild -> Pending)
      allCasesData.sort((a, b) => {
        const severityA = SEVERITY_LEVELS[a.severity]?.priority || 0;
        const severityB = SEVERITY_LEVELS[b.severity]?.priority || 0;
        return severityB - severityA; // Highest priority first
      });

      setAllCases(allCasesData);
    } catch (error) {
      console.error('Error loading cases:', error);
      setDbError('general_error');
      setAllCases([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRegularCases = async () => {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select(`
          *,
          customer:profiles!cases_customer_id_fkey(full_name, email),
          soap_notes(id, status, created_at)
        `)
        .or(`assigned_nurse_id.eq.${nurseId},status.eq.new`);

      if (error && !error.message?.includes('relation "cases" does not exist')) {
        throw error;
      }

      return (data || []).map(case_item => ({
        ...case_item,
        source: 'cases',
        service_type: case_item.case_type || 'General Case',
        severity: case_item.priority || 'pending' // Map existing priority to severity
      }));
    } catch (error) {
      console.error('Error loading regular cases:', error);
      return [];
    }
  };

  const loadTriageBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_bookings')
        .select(`
          *,
          marketplace_listings (name, service_types)
        `)
        .in('consultation_type', ['LuniTriage SOAP Review', 'LuniTriage Consultation'])
        .in('status', ['pending', 'confirmed', 'in_progress']);

      if (error) throw error;

      return (data || []).map(booking => ({
        id: `booking_${booking.id}`,
        case_number: `LT-${booking.id}`,
        title: `${booking.pet_name} - ${booking.consultation_type}`,
        description: booking.consultation_reason || 'LuniTriage assessment required',
        severity: booking.triage_priority || 'pending', // Use triage priority if available
        status: booking.status === 'pending' ? 'pending_assessment' : booking.status,
        pet_name: booking.pet_name,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        service_type: booking.consultation_type,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        source: 'triage_booking',
        customer: {
          full_name: booking.customer_name,
          email: booking.customer_email
        },
        booking_data: {
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          booking_id: booking.id
        }
      }));
    } catch (error) {
      console.error('Error loading triage bookings:', error);
      return [];
    }
  };

  const loadConsultationBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_bookings')
        .select(`
          *,
          marketplace_listings (name, service_types)
        `)
        .not('consultation_type', 'in', ['LuniTriage SOAP Review', 'LuniTriage Consultation'])
        .in('status', ['pending', 'confirmed', 'in_progress']);

      if (error) throw error;

      return (data || []).map(booking => ({
        id: `consultation_${booking.id}`,
        case_number: `CS-${booking.id}`,
        title: `${booking.pet_name} - ${booking.consultation_type || 'Consultation'}`,
        description: booking.consultation_reason || 'Consultation scheduled',
        severity: 'moderate', // Default severity for regular consultations
        status: booking.status,
        pet_name: booking.pet_name,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        service_type: booking.consultation_type || 'Consultation',
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        source: 'consultation_booking',
        customer: {
          full_name: booking.customer_name,
          email: booking.customer_email
        },
        booking_data: {
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          booking_id: booking.id
        }
      }));
    } catch (error) {
      console.error('Error loading consultation bookings:', error);
      return [];
    }
  };

  const getSeverityBadge = (severity) => {
    const config = SEVERITY_LEVELS[severity] || SEVERITY_LEVELS.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getServiceTypeBadge = (serviceType) => {
    const config = SERVICE_TYPES[serviceType] || { icon: '📄', label: serviceType, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getFilteredCases = () => {
    let filtered = allCases;

    // Apply severity filter
    if (activeFilter !== 'all' && activeFilter !== 'assigned') {
      filtered = filtered.filter(c => c.severity === activeFilter);
    } else if (activeFilter === 'assigned') {
      filtered = filtered.filter(c => c.assigned_nurse_id === nurseId);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(searchLower) ||
        c.description?.toLowerCase().includes(searchLower) ||
        c.case_number?.toLowerCase().includes(searchLower) ||
        c.pet_name?.toLowerCase().includes(searchLower) ||
        c.customer_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    if (sortBy === 'severity') {
      filtered.sort((a, b) => {
        const severityA = SEVERITY_LEVELS[a.severity]?.priority || 0;
        const severityB = SEVERITY_LEVELS[b.severity]?.priority || 0;
        return severityB - severityA;
      });
    } else if (sortBy === 'created_at') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  };

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    if (caseItem.source === 'triage_booking') {
      // For triage cases, could open LuniTriage interface or SOAP editor
      console.log('Opening triage case for assessment:', caseItem);
    }
    setShowSOAPEditor(true);
  };

  const handleUpdateSeverity = async (caseId, newSeverity) => {
    try {
      // Update severity based on case source
      const caseItem = allCases.find(c => c.id === caseId);
      if (!caseItem) return;

      if (caseItem.source === 'triage_booking') {
        const bookingId = caseItem.booking_data.booking_id;
        const { error } = await supabase
          .from('consultation_bookings')
          .update({ 
            triage_priority: newSeverity,
            status: 'assessed',
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);
        
        if (error) throw error;
      } else if (caseItem.source === 'cases') {
        const { error } = await supabase
          .from('cases')
          .update({ 
            priority: newSeverity,
            updated_at: new Date().toISOString()
          })
          .eq('id', caseId);
        
        if (error) throw error;
      }

      // Update local state
      setAllCases(prev => prev.map(c => 
        c.id === caseId ? { ...c, severity: newSeverity } : c
      ));

    } catch (error) {
      console.error('Error updating severity:', error);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const filteredCases = getFilteredCases();

  // If database migration is needed, show setup message
  if (dbError === 'migration_needed') {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Database Setup Required</h3>
          <p className="text-yellow-700 mb-4">
            The case management system needs to be set up in your database. Please run the case management migration to enable this feature.
          </p>
          <div className="bg-yellow-100 border border-yellow-300 rounded p-3 text-left">
            <p className="text-sm font-medium text-yellow-800 mb-2">Migration File:</p>
            <code className="text-xs text-yellow-700 bg-yellow-200 px-2 py-1 rounded">
              database/migrations/011_case_management_system.sql
            </code>
          </div>
          <button 
            onClick={loadAllCases}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If general database error, show error message


  if (dbError === 'general_error') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Database Error</h3>
          <p className="text-red-700 mb-4">
            There was an error connecting to the case management system. Please try again or contact support.
          </p>
          <button 
            onClick={loadAllCases}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (showSOAPEditor && selectedCase) {
    return (
      <SOAPNoteEditor
        caseId={selectedCase.id}
        existingNote={selectedCase.soap_notes?.[0]}
        onSave={() => {
          setShowSOAPEditor(false);
          setSelectedCase(null);
          loadAllCases();
        }}
        onCancel={() => {
          setShowSOAPEditor(false);
          setSelectedCase(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cases</h1>
            <p className="text-sm text-gray-700">All cases with LuniTriage severity assessment</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''}
            </span>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Case
            </button>
          </div>
        </div>



        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4 w-full">
            {/* Search - Takes up more space */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search cases..."
              />
            </div>

            {/* Filter by Severity */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Severity
              </label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name} ({option.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="severity">Severity (Most Urgent)</option>
                <option value="created_at">Newest First</option>
                <option value="case_number">Case Number</option>
              </select>
            </div>
          </div>
      </div>

      {/* Cases List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading cases...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
          <p className="text-gray-600">
            {searchTerm || activeFilter !== 'all' || activeFilter !== 'assigned'
              ? 'Try adjusting your filters to see more cases.'
              : 'New cases will appear here when customers book consultations.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((caseItem) => (
            <div 
              key={caseItem.id} 
              className={`bg-white rounded-lg shadow border-2 hover:shadow-lg transition-all cursor-pointer ${
                caseItem.severity === 'emergency' ? 'border-red-300 bg-red-50' :
                caseItem.severity === 'serious' ? 'border-orange-300 bg-orange-50' :
                caseItem.severity === 'moderate' ? 'border-yellow-300 bg-yellow-50' :
                caseItem.severity === 'mild' ? 'border-green-300 bg-green-50' :
                'border-blue-300 bg-blue-50'
              }`}
              onClick={() => handleCaseClick(caseItem)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {caseItem.title}
                      </h3>
                      <span className="text-sm font-mono text-gray-500">
                        #{caseItem.case_number}
                      </span>
                    </div>

                    {/* Severity and Service Type Badges */}
                    <div className="flex items-center space-x-2 mb-3">
                      {getSeverityBadge(caseItem.severity)}
                      {getServiceTypeBadge(caseItem.service_type)}
                    </div>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {caseItem.description}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {caseItem.customer?.full_name || caseItem.customer_name || 'Unknown Customer'}
                      </div>
                      
                      {/* Pet name */}
                      {caseItem.pet_name && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Pet: {caseItem.pet_name}
                        </div>
                      )}
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getTimeAgo(caseItem.created_at)}
                      </div>
                      {caseItem.due_date && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due: {new Date(caseItem.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {caseItem.soap_notes?.length > 0 && (
                        <div className="flex items-center text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          SOAP Note Available
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right side - Actions and Status */}
                  <div className="flex flex-col items-end space-y-3 ml-6">
                    {/* Time stamp */}
                    <div className="text-xs text-gray-500">
                      {getTimeAgo(caseItem.created_at)}
                    </div>

                    {/* Primary action button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCaseClick(caseItem);
                      }}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                        caseItem.severity === 'emergency' ? 'bg-red-600 hover:bg-red-700' :
                        caseItem.severity === 'serious' ? 'bg-orange-600 hover:bg-orange-700' :
                        caseItem.severity === 'moderate' ? 'bg-yellow-600 hover:bg-yellow-700' :
                        caseItem.severity === 'mild' ? 'bg-green-600 hover:bg-green-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {caseItem.severity === 'pending' ? 'Start Triage' : 
                       caseItem.source === 'triage_booking' ? 'Review' : 
                       'View Details'}
                    </button>

                    {/* Quick severity update for pending cases */}
                    {caseItem.severity === 'pending' && (
                      <select
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.value) {
                            handleUpdateSeverity(caseItem.id, e.target.value);
                          }
                        }}
                        className="text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">Quick Assess</option>
                        <option value="mild">✅ Mild</option>
                        <option value="moderate">📋 Moderate</option>
                        <option value="serious">⚠️ Serious</option>
                        <option value="emergency">🚨 Emergency</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseManager;