import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const SOAPNoteEditor = ({ caseId, existingNote, onSave, onCancel }) => {
  const [noteData, setNoteData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    priority: 'moderate',
    recommendations: '',
    follow_up_required: false,
    follow_up_date: ''
  });
  const [saving, setSaving] = useState(false);
  const [isTriageCase, setIsTriageCase] = useState(false);

  useEffect(() => {
    // Check if this is a triage case
    setIsTriageCase(caseId?.toString().startsWith('triage_'));
    
    // Load existing note data
    if (existingNote) {
      setNoteData({
        subjective: existingNote.subjective || '',
        objective: existingNote.objective || '',
        assessment: existingNote.assessment || '',
        plan: existingNote.plan || '',
        priority: existingNote.priority || 'moderate',
        recommendations: existingNote.recommendations || '',
        follow_up_required: existingNote.follow_up_required || false,
        follow_up_date: existingNote.follow_up_date || ''
      });
    }
  }, [caseId, existingNote]);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (isTriageCase) {
        // For triage cases, we might save to a different table or handle differently
        console.log('Saving triage assessment:', noteData);
        // This could update the consultation_booking status and add assessment notes
        const bookingId = caseId.replace('triage_', '');
        
        const { error } = await supabase
          .from('consultation_bookings')
          .update({
            status: 'assessed',
            triage_notes: JSON.stringify(noteData),
            priority: noteData.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId);

        if (error) throw error;
      } else {
        // For regular cases, save to soap_notes table
        const soapNoteData = {
          case_id: caseId,
          subjective: noteData.subjective,
          objective: noteData.objective,
          assessment: noteData.assessment,
          plan: noteData.plan,
          priority: noteData.priority,
          recommendations: noteData.recommendations,
          follow_up_required: noteData.follow_up_required,
          follow_up_date: noteData.follow_up_date || null,
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existingNote) {
          const { error } = await supabase
            .from('soap_notes')
            .update(soapNoteData)
            .eq('id', existingNote.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('soap_notes')
            .insert([soapNoteData]);
          if (error) throw error;
        }
      }

      onSave();
    } catch (error) {
      console.error('Error saving SOAP note:', error);
      alert('Failed to save SOAP note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {isTriageCase ? 'LuniTriage Assessment' : 'SOAP Note Editor'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* SOAP Form */}
          <div className="space-y-6">
            {/* Priority Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={noteData.priority}
                onChange={(e) => setNoteData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="moderate">Moderate Priority</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Subjective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjective (S) - Chief Complaint & History
              </label>
              <textarea
                value={noteData.subjective}
                onChange={(e) => setNoteData(prev => ({ ...prev, subjective: e.target.value }))}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What the pet owner reports, symptoms observed, history..."
              />
            </div>

            {/* Objective */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objective (O) - Physical Findings
              </label>
              <textarea
                value={noteData.objective}
                onChange={(e) => setNoteData(prev => ({ ...prev, objective: e.target.value }))}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Physical examination findings, vital signs, observable facts..."
              />
            </div>

            {/* Assessment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment (A) - Diagnosis & Analysis
              </label>
              <textarea
                value={noteData.assessment}
                onChange={(e) => setNoteData(prev => ({ ...prev, assessment: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Professional assessment, differential diagnosis, analysis..."
              />
            </div>

            {/* Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan (P) - Treatment & Next Steps
              </label>
              <textarea
                value={noteData.plan}
                onChange={(e) => setNoteData(prev => ({ ...prev, plan: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Treatment plan, medications, procedures, monitoring..."
              />
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations & Instructions
              </label>
              <textarea
                value={noteData.recommendations}
                onChange={(e) => setNoteData(prev => ({ ...prev, recommendations: e.target.value }))}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Home care instructions, when to return, warning signs..."
              />
            </div>

            {/* Follow-up */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={noteData.follow_up_required}
                  onChange={(e) => setNoteData(prev => ({ ...prev, follow_up_required: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Follow-up required</span>
              </label>
              
              {noteData.follow_up_required && (
                <div>
                  <input
                    type="date"
                    value={noteData.follow_up_date}
                    onChange={(e) => setNoteData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : (isTriageCase ? 'Complete Assessment' : 'Save SOAP Note')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOAPNoteEditor;