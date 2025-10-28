import React from 'react';
import { useNavigate } from 'react-router-dom';

const Disclaimer = () => {
  const navigate = useNavigate();
  
  const handleClose = () => {
    // Navigate back to the previous page
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Medical Disclaimer
            </h1>
            <p className="text-lg text-gray-600">
              Important information about Luni AI veterinary triage services
            </p>
          </div>

          {/* Disclaimer Content */}
          <div className="space-y-6 text-gray-700 leading-relaxed">
            
            {/* Primary Disclaimer */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Important Medical Disclaimer
              </h2>
              <p className="font-medium">
                <strong>Luni AI is NOT a substitute for professional veterinary care.</strong> This service provides AI-generated triage assessments for informational purposes only and should never replace consultation with a qualified veterinarian.
              </p>
            </div>

            {/* Service Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">What Luni AI Provides</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI-powered symptom assessment and triage recommendations</li>
                <li>Educational information about pet health conditions</li>
                <li>Guidance on when to seek immediate veterinary care</li>
                <li>SOAP note documentation for reference purposes</li>
                <li>Emergency indicators and warning signs</li>
              </ul>
            </section>

            {/* What It Is NOT */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">What Luni AI Does NOT Provide</h2>
              <ul className="list-disc pl-6 space-y-2 text-red-700">
                <li><strong>Medical diagnosis:</strong> Only a licensed veterinarian can provide an official diagnosis</li>
                <li><strong>Treatment recommendations:</strong> Specific treatments must be prescribed by a veterinarian</li>
                <li><strong>Emergency care:</strong> Cannot replace immediate veterinary attention for emergencies</li>
                <li><strong>Prescription medications:</strong> Cannot prescribe or recommend specific medications</li>
                <li><strong>Physical examination:</strong> Cannot replace hands-on veterinary examination</li>
              </ul>
            </section>

            {/* Regulatory Compliance */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Regulatory Compliance</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🇳🇿 New Zealand</h3>
                  <p>This service operates in accordance with:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Veterinary Council of New Zealand (VCNZ) guidelines</li>
                    <li>New Zealand Veterinary Association (NZVA) standards</li>
                    <li>Animal Welfare Act 1999</li>
                    <li>Health Information Privacy Code 2020</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">🇦🇺 Australia</h3>
                  <p>This service operates in accordance with:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Australian Veterinary Association (AVA) guidelines</li>
                    <li>Veterinary Boards of Australia standards</li>
                    <li>Australian Privacy Principles (APPs)</li>
                    <li>Therapeutic Goods Administration (TGA) requirements</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Limitations */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Limitations of Remote Assessment</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cannot perform physical examination or diagnostic tests</li>
                  <li>Limited to visual assessment and owner-reported information</li>
                  <li>Cannot detect all medical conditions or emergencies</li>
                  <li>May not identify subtle or internal conditions</li>
                  <li>Accuracy depends on quality of information provided</li>
                  <li>Cannot replace laboratory testing or imaging studies</li>
                </ul>
              </div>
            </section>

            {/* Emergency Warning */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Emergency Situations
              </h2>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="font-semibold text-red-800 mb-2">
                  Seek IMMEDIATE veterinary care if your pet shows:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-red-700">
                  <li>Difficulty breathing or choking</li>
                  <li>Severe bleeding or trauma</li>
                  <li>Loss of consciousness or collapse</li>
                  <li>Suspected poisoning or toxic ingestion</li>
                  <li>Severe pain or distress</li>
                  <li>Inability to urinate or defecate</li>
                  <li>Seizures or neurological symptoms</li>
                  <li>Bloated or distended abdomen</li>
                </ul>
                <p className="mt-3 font-medium text-red-800">
                  Do not delay seeking emergency care while using this service.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and complete information about your pet's condition</li>
                <li>Use this service as a supplement to, not replacement for, veterinary care</li>
                <li>Seek professional veterinary attention when recommended</li>
                <li>Follow up with your regular veterinarian for ongoing care</li>
                <li>Contact emergency services immediately for urgent situations</li>
              </ul>
            </section>

            {/* Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Privacy & Data Protection</h2>
              <p>
                We are committed to protecting your privacy and your pet's medical information in accordance with 
                Australian Privacy Principles and New Zealand Privacy Act 2020. All consultations are confidential 
                and data is handled securely.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Questions or Concerns</h2>
              <p>
                If you have questions about this disclaimer or our services, please contact us through our 
                support channels. For immediate veterinary concerns, contact your local veterinary clinic 
                or emergency animal hospital.
              </p>
            </section>

            {/* Legal */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By using Luni AI services, you acknowledge that you have read, understood, and agree to this disclaimer. 
                This disclaimer is subject to change and was last updated on {new Date().toLocaleDateString()}.
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-8">
            <button 
              onClick={handleClose}
              className="px-6 py-2 bg-[#5EB47C] text-white rounded-lg hover:bg-[#4A9B63] transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;