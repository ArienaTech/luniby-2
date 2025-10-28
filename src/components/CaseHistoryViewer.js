import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import caseHistoryService from '../services/caseHistoryService';
import { PetIcon, HealthIcon, UIIcon } from './MinimalIcons';

const CaseHistoryViewer = ({ pets, userId }) => {
  const [soapNotes, setSoapNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [selectedSoapNote, setSelectedSoapNote] = useState(null);
  const [showSoapModal, setShowSoapModal] = useState(false);
  const [sortBy, setSortBy] = useState('date_desc');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.custom-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const CustomDropdown = ({ value, onChange, options, placeholder, dropdownKey }) => (
    <div className="custom-dropdown relative">
      <button
        type="button"
        onClick={() => setOpenDropdown(openDropdown === dropdownKey ? null : dropdownKey)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent bg-white text-left flex items-center justify-between hover:bg-gray-50"
      >
        <span className="truncate">
          {options.find(opt => opt.value === value)?.label || placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === dropdownKey ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {openDropdown === dropdownKey && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpenDropdown(null);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                value === option.value ? 'bg-[#E5F4F1] text-[#5EB47C]' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (userId) {
      loadSoapNotes();
    }
  }, [userId]);

  const loadSoapNotes = async () => {
    setLoading(true);
    try {
      const soapResult = await caseHistoryService.getUserSoapNotes(userId);
      if (soapResult.success) {
        setSoapNotes(soapResult.data);
      }
    } catch (error) {
      console.error('Error loading SOAP notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      low: { color: 'from-green-50 to-green-100 border-green-200', icon: <HealthIcon type="check" className="w-4 h-4" color="#10B981" />, badge: 'bg-green-100 text-green-800' },
      moderate: { color: 'from-blue-50 to-blue-100 border-blue-200', icon: <HealthIcon type="warning" className="w-4 h-4" color="#3B82F6" />, badge: 'bg-blue-100 text-blue-800' },
      high: { color: 'from-orange-50 to-orange-100 border-orange-200', icon: <HealthIcon type="warning" className="w-4 h-4" color="#F59E0B" />, badge: 'bg-orange-100 text-orange-800' },
      urgent: { color: 'from-red-50 to-red-100 border-red-200', icon: <HealthIcon type="emergency" className="w-4 h-4" color="#EF4444" />, badge: 'bg-red-100 text-red-800' }
    };
    return configs[severity] || configs.moderate;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDateFilterOptions = () => {
    const now = new Date();
    return {
      all: () => true,
      today: (date) => new Date(date).toDateString() === now.toDateString(),
      week: (date) => {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return new Date(date) >= weekAgo;
      },
      month: (date) => {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return new Date(date) >= monthAgo;
      },
      year: (date) => {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return new Date(date) >= yearAgo;
      }
    };
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = soapNotes.map(item => ({ 
      ...item, 
      searchText: `${item.title} ${item.subjective} ${item.objective} ${item.assessment} ${item.plan}` 
    }));

    // Pet filter
    if (selectedPet !== 'all') {
      filtered = filtered.filter(item => item.pet_id === selectedPet);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.searchText?.toLowerCase().includes(query) ||
        item.vet_name?.toLowerCase().includes(query) ||
        item.clinic_name?.toLowerCase().includes(query)
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(item => item.severity === severityFilter);
    }

    // Date filter
    const dateFilterFn = getDateFilterOptions()[dateFilter];
    if (dateFilterFn) {
      filtered = filtered.filter(item => dateFilterFn(item.created_at));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'severity':
          const severityOrder = { urgent: 4, high: 3, moderate: 2, low: 1 };
          return (severityOrder[b.severity] || 2) - (severityOrder[a.severity] || 2);
        case 'pet':
          const petA = pets.find(p => p.id === a.pet_id)?.name || '';
          const petB = pets.find(p => p.id === b.pet_id)?.name || '';
          return petA.localeCompare(petB);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [soapNotes, selectedPet, searchQuery, severityFilter, dateFilter, sortBy, pets]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const openSoapModal = (soapNote) => {
    setSelectedSoapNote(soapNote);
    setShowSoapModal(true);
  };

  const closeSoapModal = () => {
    setSelectedSoapNote(null);
    setShowSoapModal(false);
  };

  // const getSOAPPreview = (note) => {
  //   // Get first available section as preview
  //   const sections = ['subjective', 'objective', 'assessment', 'plan'];
  //   for (const section of sections) {
  //     if (note[section]) {
  //       const text = note[section];
  //       return text.length > 120 ? text.substring(0, 120) + '...' : text;
  //     }
  //   }
  //   return 'No content available';
  // };

  const renderSOAPModal = () => {
    if (!selectedSoapNote || !showSoapModal) return null;

    const note = selectedSoapNote;
    const pet = pets.find(p => p.id === note.pet_id);
    const severityConfig = getSeverityConfig(note.severity);

    const sections = [
      { key: 'subjective', title: 'SUBJECTIVE', icon: <UIIcon type="write" className="w-4 h-4" color="currentColor" />, color: 'blue' },
      { key: 'objective', title: 'OBJECTIVE', icon: <HealthIcon type="search" className="w-4 h-4" color="currentColor" />, color: 'green' },
      { key: 'assessment', title: 'ASSESSMENT', icon: <HealthIcon type="target" className="w-4 h-4" color="currentColor" />, color: 'orange' },
      { key: 'plan', title: 'PLAN', icon: <HealthIcon type="records" className="w-4 h-4" color="currentColor" />, color: 'purple' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className={`px-6 py-4 bg-gradient-to-r ${severityConfig.color} border-b border-gray-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <HealthIcon type="health" className="w-6 h-6" color="#6B7280" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{note.title}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    {pet && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/80 text-gray-700">
                        <span className="mr-1">
                          <PetIcon species={pet.species} className="w-3 h-3" color="currentColor" />
                        </span>
                        {pet.name}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${severityConfig.badge}`}>
                      SOAP NOTE
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeSoapModal}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <HealthIcon type="calendar" className="w-5 h-5 mr-3 flex-shrink-0" color="#6B7280" />
                <div>
                  <div className="text-xs text-gray-500 font-medium">Date</div>
                  <div className="text-sm font-semibold text-gray-900">{formatDateTime(note.created_at)}</div>
                </div>
              </div>
              
              {note.vet_name && (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <HealthIcon type="doctor" className="w-5 h-5 mr-3 flex-shrink-0" color="#6B7280" />
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Veterinarian</div>
                    <div className="text-sm font-semibold text-gray-900">{note.vet_name}</div>
                  </div>
                </div>
              )}
              
              {note.clinic_name && (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <HealthIcon type="health" className="w-5 h-5 mr-3 flex-shrink-0" color="#6B7280" />
                  <div>
                    <div className="text-xs text-gray-500 font-medium">Clinic</div>
                    <div className="text-sm font-semibold text-gray-900">{note.clinic_name}</div>
                  </div>
                </div>
              )}

              {note.cost && (
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <UIIcon type="money" className="w-5 h-5 mr-3 flex-shrink-0" color="#10B981" />
                  <div>
                    <div className="text-xs text-green-600 font-medium">Total Cost</div>
                    <div className="text-lg font-bold text-green-700">${note.cost}</div>
                  </div>
                </div>
              )}

              {note.source && (
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <span className="mr-3 flex-shrink-0">
                    {note.source === 'luni_triage' ? 
                      <HealthIcon type="vaccination" className="w-5 h-5" color="#3B82F6" /> : 
                      <UIIcon type="write" className="w-5 h-5" color="#3B82F6" />
                    }
                  </span>
                  <div>
                    <div className="text-xs text-blue-600 font-medium">Source</div>
                    <div className="text-sm font-semibold text-blue-700">
                      {note.source === 'luni_triage' ? 'Luni Triage' : 'Manual Entry'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SOAP Sections */}
            <div className="space-y-6">
              {sections.map(section => {
                if (!note[section.key]) return null;
                
                return (
                  <div key={section.key} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">{section.icon}</span>
                      <h3 className={`text-lg font-bold text-${section.color}-800 uppercase tracking-wide`}>
                        {section.title}
                      </h3>
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {note[section.key]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Follow-up Information */}
            {note.follow_up_date && (
              <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-orange-500 text-lg">⏰</span>
                  <span className="font-medium text-orange-800">Follow-up Scheduled:</span>
                  <span className="text-orange-700 font-semibold">{formatDateTime(note.follow_up_date)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#5EB47C] border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Loading SOAP notes...</p>
        <p className="text-sm text-gray-500">Gathering your pet's medical records</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Modern Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">        
        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <HealthIcon type="health" className="w-6 h-6" color="#10B981" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">{soapNotes.length}</div>
              <div className="text-xs text-green-700 font-medium">Total SOAP Notes</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <HealthIcon type="vaccination" className="w-6 h-6" color="#3B82F6" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                {soapNotes.filter(note => note.source === 'luni_triage').length}
              </div>
              <div className="text-xs text-blue-700 font-medium">Luni Triage</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <HealthIcon type="emergency" className="w-6 h-6" color="#EF4444" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
                {soapNotes.filter(note => note.severity === 'urgent' || note.severity === 'high').length}
              </div>
              <div className="text-xs text-red-700 font-medium">Urgent Cases</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <PetIcon species="pet" className="w-6 h-6" color="#8B5CF6" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">{pets.length}</div>
              <div className="text-xs text-purple-700 font-medium">Pets Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* SOAP Records Container - Updated Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">SOAP Records</h2>
            <p className="text-gray-600 text-sm mb-4">Medical records from Luni Triage assessments</p>
          </div>
        </div>
        
        {/* Full-width divider line */}
        <div className="-mx-6 border-t border-gray-200 mb-6"></div>
        
        {/* Pet Selection Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => {
              setSelectedPet('all');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedPet === 'all'
                ? 'bg-[#5EB47C] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Pets
          </button>
          {pets.map(pet => (
            <button
              key={pet.id}
              onClick={() => {
                setSelectedPet(pet.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedPet === pet.id
                  ? 'bg-[#5EB47C] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {pet.name}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search SOAP notes, symptoms, treatments..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">

              {/* Severity Filter */}
              <CustomDropdown
                value={severityFilter}
                onChange={(value) => {
                  setSeverityFilter(value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Severities' },
                  { value: 'urgent', label: 'Urgent', icon: <HealthIcon type="emergency" className="w-4 h-4" color="currentColor" /> },
                  { value: 'high', label: 'High', icon: <HealthIcon type="warning" className="w-4 h-4" color="currentColor" /> },
                  { value: 'moderate', label: 'Moderate', icon: <HealthIcon type="warning" className="w-4 h-4" color="currentColor" /> },
                  { value: 'low', label: 'Low', icon: <HealthIcon type="check" className="w-4 h-4" color="currentColor" /> }
                ]}
                placeholder="All Severities"
                dropdownKey="severity"
              />

              {/* Date Filter */}
              <CustomDropdown
                value={dateFilter}
                onChange={(value) => {
                  setDateFilter(value);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'Past Week' },
                  { value: 'month', label: 'Past Month' },
                  { value: 'year', label: 'Past Year' }
                ]}
                placeholder="All Time"
                dropdownKey="date"
              />

              {/* Sort By */}
              <CustomDropdown
                value={sortBy}
                onChange={setSortBy}
                options={[
                  { value: 'date_desc', label: 'Newest First' },
                  { value: 'date_asc', label: 'Oldest First' },
                  { value: 'severity', label: 'By Severity', icon: <HealthIcon type="emergency" className="w-4 h-4" color="currentColor" /> },
                  { value: 'pet', label: 'By Pet', icon: <PetIcon species="pet" className="w-4 h-4" color="currentColor" /> }
                ]}
                placeholder="Newest First"
                dropdownKey="sort"
              />
            </div>
          </div>

          {/* Results Summary */}
          {filteredAndSortedData.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <div>
                {searchQuery && `Found ${filteredAndSortedData.length} SOAP note${filteredAndSortedData.length !== 1 ? 's' : ''} matching "${searchQuery}"`}
              </div>
              <div>
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}

          {/* SOAP Notes List - Now underneath search */}
          <div className="mt-6">
            {filteredAndSortedData.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No matching SOAP notes found' : 'No notes yet'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'Start using Luni Triage to conduct pet health assessments and generate SOAP notes.'
                  }
                </p>
                {!searchQuery && (
                  <Link
                    to="/luni-triage"
                    className="inline-flex items-center px-6 py-3 bg-[#5EB47C] text-white rounded-xl hover:bg-[#4A9A64] transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    Start Triage Assessment
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* SOAP Notes List - Compact Design */}
                <div className="space-y-2">
                  {paginatedData.map((note) => {
                    const severityConfig = getSeverityConfig(note.severity);
                    const pet = pets.find(p => p.id === note.pet_id);
                    
                    return (
                      <div
                        key={note.id}
                        onClick={() => openSoapModal(note)}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          {/* Left: Main Info */}
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">{note.title}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityConfig.badge}`}>
                                  {note.severity.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-600">
                                <span className="flex items-center">
                                  <HealthIcon type="calendar" className="w-3 h-3 mr-1" color="currentColor" />
                                  {formatDate(note.created_at)}
                                </span>
                                {pet && (
                                  <span className="flex items-center">
                                    <PetIcon species={pet.species} className="w-3 h-3 mr-1" color="currentColor" />
                                    {pet.name}
                                  </span>
                                )}
                                {note.source === 'luni_triage' && (
                                  <span className="text-blue-600 flex items-center">
                                    <HealthIcon type="vaccination" className="w-3 h-3 mr-1" color="currentColor" />
                                    Luni Triage
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Cost & Arrow */}
                          <div className="flex items-center space-x-3 flex-shrink-0">
                            {note.cost && (
                              <div className="text-right">
                                <div className="text-sm font-semibold text-green-700">${note.cost}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of {filteredAndSortedData.length} SOAP notes
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                currentPage === pageNum
                                  ? 'bg-[#5EB47C] text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* SOAP Note Modal */}
      {renderSOAPModal()}
    </div>
  );
};

export default CaseHistoryViewer;