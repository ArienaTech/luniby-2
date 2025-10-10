import React, { useState, useEffect } from 'react';
import healthRecordService from '../services/healthRecordService';
import { PetIcon, HealthIcon, UIIcon } from './MinimalIcons';

// Multi-pet health records viewer for dashboard
const MultiPetHealthRecordsViewer = ({ pets, userPlan, onEditRecord, onDeleteRecord, onRefresh, onAddRecord, refreshKey = 0 }) => {
  const [allRecords, setAllRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedRecords, setExpandedRecords] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
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

  const toggleRecordExpansion = (recordId) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (pets && pets.length > 0) {
      loadAllHealthRecords();
    } else {
      setLoading(false);
    }
  }, [pets, refreshKey]);

  const loadAllHealthRecords = async () => {
    setLoading(true);
    try {
      const recordsMap = {};
      
      // Load records for each pet
      await Promise.all(pets.map(async (pet) => {
        try {
          const result = await healthRecordService.getHealthRecords(pet.id);
          recordsMap[pet.id] = {
            pet: pet,
            records: result.success ? result.data : [],
            error: result.success ? null : result.error
          };
        } catch (error) {
          console.error(`Error loading records for ${pet.name}:`, error);
          recordsMap[pet.id] = {
            pet: pet,
            records: [],
            error: error.message
          };
        }
      }));
      
      setAllRecords(recordsMap);
      
      // Set "All Pets" as default selection
      setSelectedPet('all');
      
    } catch (error) {
      console.error('Error loading health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this health record? This action cannot be undone.')) {
      return;
    }

    setDeletingId(recordId);
    try {
      const result = await healthRecordService.deleteHealthRecord(recordId);
      if (result.success) {
        // Refresh the records
        await loadAllHealthRecords();
        if (onRefresh) onRefresh();
        alert('Health record deleted successfully!');
      } else {
        alert(`Failed to delete health record: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting health record:', error);
      alert(`Error deleting health record: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditRecord = (record) => {
    if (onEditRecord) {
      onEditRecord(record);
    } else {
      alert('Edit functionality not implemented yet. Please contact support.');
    }
  };

  // const getRecordIcon = (recordType) => {
  //   const iconComponents = {
  //     checkup: <HealthIcon type="check" className="w-5 h-5" color="currentColor" />,
  //     vaccination: <HealthIcon type="vaccination" className="w-5 h-5" color="currentColor" />,
  //     surgery: <UIIcon type="surgery" className="w-5 h-5" color="currentColor" />,
  //     emergency: <HealthIcon type="emergency" className="w-5 h-5" color="currentColor" />,
  //     dental: <HealthIcon type="dental" className="w-5 h-5" color="currentColor" />,
  //     grooming: <UIIcon type="scissors" className="w-5 h-5" color="currentColor" />,
  //     lab_work: <HealthIcon type="lab" className="w-5 h-5" color="currentColor" />,
  //     other: <HealthIcon type="records" className="w-5 h-5" color="currentColor" />
  //   };
  //   return iconComponents[recordType] || <HealthIcon type="records" className="w-5 h-5" color="currentColor" />;
  // };

  // const getRecordColor = (recordType) => {
  //   const colors = {
  //     checkup: 'from-blue-50 to-blue-100 border-blue-200',
  //     vaccination: 'from-green-50 to-green-100 border-green-200',
  //     surgery: 'from-red-50 to-red-100 border-red-200',
  //     emergency: 'from-orange-50 to-orange-100 border-orange-200',
  //     dental: 'from-purple-50 to-purple-100 border-purple-200',
  //     grooming: 'from-pink-50 to-pink-100 border-pink-200',
  //     lab_work: 'from-yellow-50 to-yellow-100 border-yellow-200',
  //     other: 'from-gray-50 to-gray-100 border-gray-200'
  //   };
  //   return colors[recordType] || 'from-gray-50 to-gray-100 border-gray-200';
  // };

  const getRecordBadgeColor = (recordType) => {
    const colors = {
      checkup: 'bg-blue-100 text-blue-800',
      vaccination: 'bg-green-100 text-green-800',
      surgery: 'bg-red-100 text-red-800',
      emergency: 'bg-orange-100 text-orange-800',
      dental: 'bg-purple-100 text-purple-800',
      grooming: 'bg-pink-100 text-pink-800',
      lab_work: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[recordType] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // const formatTime = (dateString) => {
  //   return new Date(dateString).toLocaleTimeString('en-US', {
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#5EB47C] border-t-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Loading health records...</p>
        <p className="text-sm text-gray-500">Please wait while we gather your pet's medical history</p>
      </div>
    );
  }

  if (!pets || pets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-[#E5F4F1] rounded-full flex items-center justify-center">
          <HealthIcon type="health" className="w-10 h-10" color="#5EB47C" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets added yet</h3>
        <p className="text-gray-600">Add your first pet to start tracking health records</p>
      </div>
    );
  }

  const totalRecords = Object.values(allRecords).reduce((sum, item) => sum + item.records.length, 0);

  return (
    <div className="space-y-6">
      {/* Pet Selection Tabs */}
      <div className="mb-6">
        <div className="flex items-center space-x-1 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedPet('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedPet === 'all'
                ? 'bg-[#5EB47C] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Pets
          </button>
          {pets.map((pet) => {
            // const petRecords = allRecords[pet.id]?.records || [];
            return (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedPet === pet.id
                    ? 'bg-[#5EB47C] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pet.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      {selectedPet && ((selectedPet === 'all' && totalRecords > 0) || (selectedPet !== 'all' && allRecords[selectedPet] && allRecords[selectedPet].records.length > 0)) && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search health records, procedures, medications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EB47C] focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Filter */}
            <CustomDropdown
              value={dateFilter}
              onChange={setDateFilter}
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
                { value: 'type', label: 'By Type' },
                { value: 'cost', label: 'By Cost' }
              ]}
              placeholder="Newest First"
              dropdownKey="sort"
            />
          </div>
        </div>
      )}

      {/* Selected Pet's Records */}
      {selectedPet && (selectedPet === 'all' || allRecords[selectedPet]) && (
        <div className="space-y-4">
          {(() => {
            const currentRecords = selectedPet === 'all' 
              ? Object.values(allRecords).flatMap(item => item.records.map(record => ({...record, petInfo: item.pet})))
              : allRecords[selectedPet]?.records || [];
            
            return currentRecords.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                <HealthIcon type="records" className="w-8 h-8" color="#6B7280" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedPet === 'all' ? 'No health records yet' : `No health records yet for ${allRecords[selectedPet].pet.name}`}
              </h4>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {selectedPet === 'all' 
                  ? 'Start building your pets\' medical history by adding their first health records.'
                  : `Start building ${allRecords[selectedPet].pet.name}'s medical history by adding their first health record.`
                }
              </p>
              {selectedPet !== 'all' && (
                <button 
                  onClick={() => {
                    if (onAddRecord) {
                      onAddRecord(allRecords[selectedPet].pet);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors font-medium"
                >
                  <HealthIcon type="vaccination" className="w-4 h-4 mr-2" color="white" />
                  Add First Record
                </button>
              )}
            </div>
          ) : (
            <>
              {(() => {
                const filteredRecords = currentRecords
                  .filter((record) => {
                    // Search filter
                    if (searchQuery.trim()) {
                      const query = searchQuery.toLowerCase();
                      const matchesSearch = (
                        record.title?.toLowerCase().includes(query) ||
                        record.description?.toLowerCase().includes(query) ||
                        record.record_type?.toLowerCase().includes(query) ||
                        record.veterinarian_name?.toLowerCase().includes(query) ||
                        record.clinic_name?.toLowerCase().includes(query) ||
                        record.notes?.toLowerCase().includes(query) ||
                        record.medications?.some(med => med.toLowerCase().includes(query))
                      );
                      if (!matchesSearch) return false;
                    }

                    // Date filter
                    if (dateFilter !== 'all') {
                      const recordDate = new Date(record.date_performed);
                      const now = new Date();
                      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                      switch (dateFilter) {
                        case 'today':
                          if (recordDate < today) return false;
                          break;
                        case 'week':
                          const weekAgo = new Date(today);
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          if (recordDate < weekAgo) return false;
                          break;
                        case 'month':
                          const monthAgo = new Date(today);
                          monthAgo.setMonth(monthAgo.getMonth() - 1);
                          if (recordDate < monthAgo) return false;
                          break;
                        case 'year':
                          const yearAgo = new Date(today);
                          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                          if (recordDate < yearAgo) return false;
                          break;
                        default:
                          // 'all' case - no filtering needed
                          break;
                      }
                    }

                    return true;
                  })
                  .sort((a, b) => {
                    switch (sortBy) {
                      case 'date_asc':
                        return new Date(a.date_performed) - new Date(b.date_performed);
                      case 'date_desc':
                        return new Date(b.date_performed) - new Date(a.date_performed);
                      case 'type':
                        return a.record_type?.localeCompare(b.record_type) || 0;
                      case 'cost':
                        const aCost = parseFloat(a.cost) || 0;
                        const bCost = parseFloat(b.cost) || 0;
                        return bCost - aCost;
                      default:
                        return new Date(b.date_performed) - new Date(a.date_performed);
                    }
                  });

                if (filteredRecords.length === 0 && (searchQuery.trim() || dateFilter !== 'all')) {
                  return (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                      <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <HealthIcon type="search" className="w-8 h-8" color="#6B7280" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        No matching health records found
                      </h4>
                      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        Try adjusting your search terms or filters to see more records{selectedPet !== 'all' ? ` for ${allRecords[selectedPet].pet.name}` : ''}.
                      </p>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setDateFilter('all');
                        }}
                        className="inline-flex items-center px-4 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9A64] transition-colors font-medium"
                      >
                        Clear Filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {searchQuery.trim() && (
                      <div className="text-sm text-gray-600 mb-4">
                        Found {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} matching "{searchQuery}"
                      </div>
                    )}
                    {filteredRecords.map((record) => {
                  const isExpanded = expandedRecords.has(record.id);
                  return (
                    <div key={record.id} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg shadow-sm transition-all duration-200">
                      {/* Compact Row */}
                      <div
                        onClick={() => toggleRecordExpansion(record.id)}
                        className="p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          {/* Left: Main Info */}
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">{record.title}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRecordBadgeColor(record.record_type)}`}>
                                  {record.record_type.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-gray-600">
                                <span className="flex items-center">
                                  <HealthIcon type="calendar" className="w-3 h-3 mr-1" color="currentColor" />
                                  {formatDate(record.date_performed)}
                                </span>
                                {selectedPet === 'all' && record.petInfo && (
                                  <span className="flex items-center">
                                    <PetIcon species="pet" className="w-3 h-3 mr-1" color="currentColor" />
                                    {record.petInfo.name}
                                  </span>
                                )}
                                {record.veterinarian_name && (
                                  <span className="flex items-center">
                                    <HealthIcon type="doctor" className="w-3 h-3 mr-1" color="currentColor" />
                                    {record.veterinarian_name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Cost & Expand Arrow */}
                          <div className="flex items-center space-x-3 flex-shrink-0">
                            {record.cost && (
                              <div className="text-right">
                                <div className="text-sm font-semibold text-green-700">${record.cost}</div>
                              </div>
                            )}
                            <div className="w-6 h-6 bg-white/60 rounded-full flex items-center justify-center">
                              <svg 
                                className={`w-3 h-3 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-white/50">
                          {/* Description */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 leading-relaxed">{record.description}</p>
                          </div>
                          
                          {/* Additional Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
                            {record.clinic_name && (
                              <div className="flex items-center p-3 bg-white rounded-lg border">
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-500 font-medium">Clinic</div>
                                  <div className="text-sm font-semibold text-gray-900 truncate">{record.clinic_name}</div>
                                </div>
                              </div>
                            )}
                            
                            {record.weight && (
                              <div className="flex items-center p-3 bg-white rounded-lg border">
                                <HealthIcon type="weight" className="w-5 h-5 mr-2 flex-shrink-0" color="#6B7280" />
                                <div>
                                  <div className="text-xs text-gray-500 font-medium">Weight</div>
                                  <div className="text-sm font-semibold text-gray-900">{record.weight} lbs</div>
                                </div>
                              </div>
                            )}
                            
                            {record.temperature && (
                              <div className="flex items-center p-3 bg-white rounded-lg border">
                                <HealthIcon type="temperature" className="w-5 h-5 mr-2 flex-shrink-0" color="#6B7280" />
                                <div>
                                  <div className="text-xs text-gray-500 font-medium">Temperature</div>
                                  <div className="text-sm font-semibold text-gray-900">{record.temperature}°F</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Documents */}
                          {record.documents && record.documents.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold text-gray-900 mb-2">
                                Documents
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {record.documents.map((doc, idx) => (
                                  <a
                                    key={idx}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center max-w-xs px-2 py-1 rounded-full text-xs border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                                    title={doc.name}
                                  >
                                    <span className="mr-1">
                                      {(doc.type || '').startsWith('image/') ? 
                                        <HealthIcon type="image" className="w-4 h-4" color="currentColor" /> : 
                                        (doc.type === 'application/pdf' ? 
                                          <HealthIcon type="document" className="w-4 h-4" color="currentColor" /> : 
                                          <HealthIcon type="attachment" className="w-4 h-4" color="currentColor" />
                                        )
                                      }
                                    </span>
                                    <span className="truncate">{doc.name}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Medications */}
                          {record.medications && record.medications.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold text-gray-900 mb-2">
                                Medications Prescribed
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {record.medications.map((med, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1 bg-white text-gray-700 rounded-full text-sm font-medium border">
                                    {med}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {record.notes && (
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                                <UIIcon type="write" className="w-4 h-4 mr-2" color="currentColor" />
                                Additional Notes
                              </h5>
                              <div className="p-3 bg-white rounded-lg border">
                                <p className="text-sm text-gray-700 leading-relaxed">{record.notes}</p>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-500">
                              Added {new Date(record.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditRecord(record);
                                }}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg transition-all duration-200 text-sm font-medium border hover:shadow-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRecord(record.id);
                                }}
                                disabled={deletingId === record.id}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50"
                              >
                                {deletingId === record.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent mr-1"></div>
                                    <span className="hidden sm:inline">Deleting...</span>
                                    <span className="sm:hidden">...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="hidden sm:inline">Delete</span>
                                    <span className="sm:hidden">Del</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                  </div>
                );
              })()}
            </>
          );
        })()}
        </div>
      )}
    </div>
  );
};

// Single-pet health records viewer (keeping for backward compatibility)
const SinglePetHealthRecordsViewer = ({ petId, petName }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) {
      loadHealthRecords();
    } else {
      setLoading(false);
    }
  }, [petId]);

  const loadHealthRecords = async () => {
    setLoading(true);
    try {
      const result = await healthRecordService.getHealthRecords(petId);
      if (result.success) {
        setRecords(result.data);
      }
    } catch (error) {
      console.error('Error loading health records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading health records...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Health Records for {petName}</h3>
      {records.length === 0 ? (
        <p className="text-gray-600">No health records yet.</p>
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <div key={record.id} className="p-4 border rounded-lg">
              <h4 className="font-medium">{record.title}</h4>
              <p className="text-sm text-gray-600">{record.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(record.date_performed).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main component that decides which viewer to use
const HealthRecordsViewer = ({ petId, petName, pets, userPlan, onEditRecord, onDeleteRecord, onRefresh, onAddRecord, refreshKey }) => {
  // Always call hooks at the top level - no conditional hook calls
  const [shouldUseSingleViewer] = useState(!pets && petId);
  
  // If pets array is provided, use the multi-pet viewer
  if (pets) {
    return (
      <MultiPetHealthRecordsViewer 
        pets={pets} 
        userPlan={userPlan} 
        onEditRecord={onEditRecord}
        onDeleteRecord={onDeleteRecord}
        onRefresh={onRefresh}
        onAddRecord={onAddRecord}
        refreshKey={refreshKey}
      />
    );
  }
  
  // If petId is provided but no pets array, use single-pet viewer
  if (shouldUseSingleViewer) {
    return <SinglePetHealthRecordsViewer petId={petId} petName={petName} />;
  }
  
  // Fallback
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <HealthIcon type="health" className="w-8 h-8" color="#6B7280" />
      </div>
      <p className="text-gray-600">No pet data provided</p>
    </div>
  );
};

export default HealthRecordsViewer;