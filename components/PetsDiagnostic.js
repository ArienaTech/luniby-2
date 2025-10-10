import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PetsDiagnostic = () => {
  const [pets, setPets] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiagnosticData();
  }, []);

  const loadDiagnosticData = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log('No user found');
        setLoading(false);
        return;
      }
      setUser(user);

      // Get pets for this user
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (petsError) {
        console.error('Error loading pets:', petsError);
      } else {
        setPets(petsData || []);
      }

      // Get health records
      const { data: healthData, error: healthError } = await supabase
        .from('health_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (healthError) {
        console.error('Error loading health records:', healthError);
      } else {
        setHealthRecords(healthData || []);
      }

    } catch (error) {
      console.error('Error loading diagnostic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testHealthRecordCreation = async (petId) => {
    try {
      console.log('Testing health record creation for pet:', petId);
      
      const testData = {
        record_type: 'checkup',
        title: 'Test Health Record',
        description: 'This is a test record',
        date_performed: new Date().toISOString().split('T')[0],
        notes: 'Test notes'
      };

      const { data, error } = await supabase
        .from('health_records')
        .insert([{
          pet_id: petId,
          ...testData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        alert(`❌ Test failed: ${error.message}`);
        console.error('Test error:', error);
      } else {
        alert('✅ Test successful! Health record created.');
        console.log('Test success:', data);
        loadDiagnosticData(); // Refresh data
      }
    } catch (error) {
      alert(`❌ Exception: ${error.message}`);
      console.error('Test exception:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading diagnostic data...</div>;
  }

  if (!user) {
    return <div className="p-6">Please sign in to run diagnostics.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          🔬 Pets & Health Records Diagnostic
        </h2>

        {/* User Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Current User</h3>
          <p className="text-blue-700">Email: {user.email}</p>
          <p className="text-blue-700">ID: {user.id}</p>
        </div>

        {/* Pets Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Pets ({pets.length})
            </h3>
            <button
              onClick={loadDiagnosticData}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
          
          {pets.length === 0 ? (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">No pets found. This might be the issue!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Species</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Owner ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pets.map((pet) => (
                    <tr key={pet.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm font-mono text-gray-900">{pet.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{pet.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{pet.species}</td>
                      <td className="px-4 py-2 text-sm font-mono text-gray-500">{pet.owner_id}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {new Date(pet.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => testHealthRecordCreation(pet.id)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Test Health Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Health Records Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Health Records ({healthRecords.length})
          </h3>
          
          {healthRecords.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No health records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pet ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {healthRecords.map((record) => {
                    const petExists = pets.find(p => p.id === record.pet_id);
                    return (
                      <tr key={record.id} className={`hover:bg-gray-50 ${!petExists ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">{record.id}</td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900">
                          {record.pet_id}
                          {!petExists && <span className="text-red-600 ml-2">❌</span>}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{record.title}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{record.record_type}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {record.date_performed ? new Date(record.date_performed).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Diagnostic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Diagnostic Info</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Total pets found: {pets.length}</li>
            <li>• Total health records: {healthRecords.length}</li>
            <li>• Orphaned health records: {healthRecords.filter(r => !pets.find(p => p.id === r.pet_id)).length}</li>
            <li>• User ID: {user.id}</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Troubleshooting Steps:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Check if you have any pets in the table above</li>
            <li>If no pets, create a pet first in the dashboard</li>
            <li>Use the "Test Health Record" button to verify foreign key works</li>
            <li>Check browser console for detailed error messages</li>
            <li>Refresh this page after creating/updating pets</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PetsDiagnostic;