import React, { useState } from 'react';

const APIDocumentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeTab, setActiveTab] = useState('javascript');

  const navigationItems = [
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'authentication', title: 'Authentication' },
    { id: 'endpoints', title: 'API Endpoints' },
    { id: 'examples', title: 'Code Examples' },
    { id: 'integrations', title: 'Practice Integrations' },
    { id: 'webhooks', title: 'Webhooks' },
    { id: 'errors', title: 'Error Handling' },
    { id: 'sdks', title: 'SDKs & Libraries' }
  ];

  const codeExamples = {
    javascript: {
      language: 'JavaScript',
      basicRequest: `// Basic triage request
const response = await fetch('https://api.lunigen.com/v1/triage/assess', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'X-Clinic-ID': 'your-clinic-id'
  },
  body: JSON.stringify({
    case_id: 'clinic_case_12345',
    patient: {
      species: 'dog',
      breed: 'golden_retriever',
      age: '5_years',
      weight: '30kg'
    },
    presenting_complaint: 'Vomiting since yesterday',
    clinical_data: {
      duration: '24_hours',
      eating_drinking: 'reduced_appetite',
      behavior: 'lethargic',
      additional_symptoms: ['diarrhea']
    }
  })
});

const triageResult = await response.json();
console.log('Triage assessment:', triageResult);`,
      
      webhookHandler: `// Webhook endpoint handler
app.post('/webhooks/lunigen', (req, res) => {
  const { severity_level, recommendations } = req.body;
  
  // Verify webhook signature
  const signature = req.headers['x-lunigen-signature'];
  if (!verifySignature(req.body, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process the triage result
  updatePatientRecord(req.body.case_id, {
    severity: severity_level,
    soap_notes: req.body.soap_notes,
    recommendations: recommendations
  });
  
  res.status(200).json({ received: true });
});`
    },

    python: {
      language: 'Python',
      basicRequest: `import requests

# Basic triage request
url = "https://api.lunigen.com/v1/triage/assess"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
    "X-Clinic-ID": "your-clinic-id"
}

payload = {
    "case_id": "clinic_case_12345",
    "patient": {
        "species": "dog",
        "breed": "golden_retriever", 
        "age": "5_years",
        "weight": "30kg"
    },
    "presenting_complaint": "Vomiting since yesterday",
    "clinical_data": {
        "duration": "24_hours",
        "eating_drinking": "reduced_appetite",
        "behavior": "lethargic",
        "additional_symptoms": ["diarrhea"]
    }
}

response = requests.post(url, json=payload, headers=headers)
triage_result = response.json()
print("Triage assessment:", triage_result)`,

      webhookHandler: `from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)

@app.route('/webhooks/lunigen', methods=['POST'])
def handle_webhook():
    # Verify webhook signature
    signature = request.headers.get('X-Lunigen-Signature')
    if not verify_signature(request.data, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    data = request.json
    
    # Process triage result
    update_patient_record(data['case_id'], {
        'severity': data['severity_level'],
        'soap_notes': data['soap_notes'],
        'recommendations': data['recommendations']
    })
    
    return jsonify({'received': True})

def verify_signature(payload, signature):
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f'sha256={expected}', signature)`
    },

    php: {
      language: 'PHP',
      basicRequest: `<?php
// Basic triage request
$url = 'https://api.lunigen.com/v1/triage/assess';
$headers = [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json',
    'X-Clinic-ID: your-clinic-id'
];

$payload = [
    'case_id' => 'clinic_case_12345',
    'patient' => [
        'species' => 'dog',
        'breed' => 'golden_retriever',
        'age' => '5_years',
        'weight' => '30kg'
    ],
    'presenting_complaint' => 'Vomiting since yesterday',
    'clinical_data' => [
        'duration' => '24_hours',
        'eating_drinking' => 'reduced_appetite',
        'behavior' => 'lethargic',
        'additional_symptoms' => ['diarrhea']
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$triageResult = json_decode($response, true);
curl_close($ch);

echo "Triage assessment: " . print_r($triageResult, true);
?>`,

      webhookHandler: `<?php
// Webhook handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $signature = $_SERVER['HTTP_X_LUNIGEN_SIGNATURE'] ?? '';
    $payload = file_get_contents('php://input');
    
    // Verify signature
    $expected = 'sha256=' . hash_hmac('sha256', $payload, $webhookSecret);
    if (!hash_equals($expected, $signature)) {
        http_response_code(401);
        exit('Invalid signature');
    }
    
    $data = json_decode($payload, true);
    
    // Process triage result
    updatePatientRecord($data['case_id'], [
        'severity' => $data['severity_level'],
        'soap_notes' => $data['soap_notes'], 
        'recommendations' => $data['recommendations']
    ]);
    
    http_response_code(200);
    echo json_encode(['received' => true]);
}
?>`
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Getting Started with LuniGen API</h1>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-4">💡</div>
                <h3 className="text-lg font-semibold text-blue-800">Quick Start Guide</h3>
              </div>
              <p className="text-blue-700">
                Get your veterinary practice integrated with LuniGen AI triage in under 30 minutes. 
                This guide covers authentication, basic API calls, and webhook setup.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">Base URL</h2>
            <div className="bg-gray-900 text-white p-4 rounded-lg mb-6">
              <code>https://api.lunigen.com/v1/</code>
            </div>

            <h2 className="text-2xl font-bold mb-4">Required Headers</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Header</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2"><code>Authorization</code></td>
                    <td className="py-2">Bearer token for authentication</td>
                    <td className="py-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Required</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code>X-Clinic-ID</code></td>
                    <td className="py-2">Your unique clinic identifier</td>
                    <td className="py-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Required</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2"><code>Content-Type</code></td>
                    <td className="py-2">application/json</td>
                    <td className="py-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Required</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Starter</h4>
                <p className="text-green-700">500 requests/month</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Professional</h4>
                <p className="text-blue-700">2,000 requests/month</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800">Enterprise</h4>
                <p className="text-purple-700">Unlimited requests</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800">Multi-Location</h4>
                <p className="text-orange-700">Unlimited requests</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Quick Integration Steps</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-[#5EB47C] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                <div>
                  <h4 className="font-semibold">Get API Credentials</h4>
                  <p className="text-gray-600">Contact our team to receive your API key and clinic ID</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#5EB47C] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                <div>
                  <h4 className="font-semibold">Test API Connection</h4>
                  <p className="text-gray-600">Make your first API call to verify authentication</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#5EB47C] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                <div>
                  <h4 className="font-semibold">Integrate with Practice Software</h4>
                  <p className="text-gray-600">Connect to VetSpace, AVImark, or your existing system</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#5EB47C] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                <div>
                  <h4 className="font-semibold">Setup Webhooks</h4>
                  <p className="text-gray-600">Configure real-time notifications for triage results</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'authentication':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Authentication</h1>
            
            <h2 className="text-2xl font-bold mb-4">API Key Authentication</h2>
            <p className="mb-4">
              LuniGen API uses API key authentication with Bearer tokens. Include your API key in the Authorization header of every request.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
              <div className="flex items-center mb-2">
                <div className="text-xl mr-2">⚠️</div>
                <h4 className="font-semibold text-yellow-800">Security Notice</h4>
              </div>
              <p className="text-yellow-700">
                Never expose your API key in client-side code. All API calls should be made from your secure server environment.
              </p>
            </div>

            <h3 className="text-lg font-semibold mb-3">Authentication Headers</h3>
            <div className="bg-gray-900 text-white p-4 rounded-lg mb-6">
              <pre><code>{`Authorization: Bearer YOUR_API_KEY
X-Clinic-ID: your-clinic-identifier
Content-Type: application/json`}</code></pre>
            </div>

            <h3 className="text-lg font-semibold mb-3">Test Your Authentication</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Endpoint:</h4>
              <code className="bg-white p-2 rounded">GET /v1/auth/verify</code>
              
              <h4 className="font-semibold mt-4 mb-2">Example Response:</h4>
              <div className="bg-gray-900 text-white p-4 rounded">
                <pre><code>{`{
  "authenticated": true,
  "clinic": {
    "id": "clinic_abc123",
    "name": "Auckland Central Veterinary",
    "plan": "professional",
    "api_calls_remaining": 1847
  },
  "permissions": [
    "triage:create",
    "triage:read", 
    "soap:generate",
    "webhooks:create"
  ]
}`}</code></pre>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">Error Responses</h3>
            <div className="space-y-4">
              <div className="border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800">401 Unauthorized</h4>
                <p className="text-red-600 mb-2">Invalid or missing API key</p>
                <div className="bg-red-50 p-2 rounded">
                  <code>{"{"}"error": "Invalid API key", "code": "UNAUTHORIZED"{"}"}</code>
                </div>
              </div>
              <div className="border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800">403 Forbidden</h4>
                <p className="text-orange-600 mb-2">API key lacks required permissions</p>
                <div className="bg-orange-50 p-2 rounded">
                  <code>{"{"}"error": "Insufficient permissions", "code": "FORBIDDEN"{"}"}</code>
                </div>
              </div>
            </div>
          </div>
        );

      case 'endpoints':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">API Endpoints</h1>

            <div className="space-y-8">
              {/* Triage Assessment Endpoint */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">POST</span>
                  <h3 className="text-xl font-semibold">/v1/triage/assess</h3>
                </div>
                <p className="text-gray-600 mb-4">Create a new triage assessment for a patient</p>
                
                <h4 className="font-semibold mb-2">Request Body:</h4>
                <div className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
                  <pre><code>{`{
  "case_id": "clinic_case_12345",
  "patient": {
    "species": "dog|cat|rabbit|bird|other",
    "breed": "golden_retriever",
    "age": "5_years", 
    "weight": "30kg",
    "medical_history": [
      "previous_surgery",
      "chronic_kidney_disease"
    ]
  },
  "presenting_complaint": "Vomiting since yesterday",
  "clinical_data": {
    "duration": "24_hours|3_days|1_week",
    "eating_drinking": "normal|reduced|absent",
    "behavior": "normal|lethargic|restless|aggressive",
    "additional_symptoms": [
      "diarrhea",
      "lethargy"
    ]
  },
  "urgency_level": "standard|urgent",
  "clinic_context": {
    "current_caseload": "light|normal|heavy",
    "available_appointments": ["2pm", "4pm"],
    "triage_nurse_id": "nurse_001"
  }
}`}</code></pre>
                </div>

                <h4 className="font-semibold mt-4 mb-2">Response:</h4>
                <div className="bg-gray-900 text-white p-4 rounded-lg text-sm overflow-x-auto">
                  <pre><code>{`{
  "triage_id": "lunigen_triage_789",
  "timestamp": "2024-12-27T10:30:00Z",
  "severity_level": "MODERATE",
  "confidence_score": 0.94,
  "assessment": {
    "primary_concerns": ["gastroenteritis", "dietary_indiscretion"],
    "red_flags": [],
    "clinical_notes": "5-year-old Golden Retriever presenting..."
  },
  "recommendations": {
    "urgency": "schedule_within_6_hours",
    "suggested_diagnostics": ["physical_exam", "hydration_assessment"],
    "monitoring_instructions": "Monitor for continued vomiting",
    "client_advice": "Withhold food for 12 hours"
  },
  "soap_notes": {
    "subjective": "Owner reports vomiting...",
    "objective": "Based on reported symptoms...",
    "assessment": "Likely gastroenteritis...",
    "plan": "Schedule examination within 6 hours..."
  },
  "integration_data": {
    "suggested_appointment_type": "sick_visit",
    "estimated_duration": "20_minutes",
    "required_resources": ["examination_room", "iv_fluids_standby"]
  }
}`}</code></pre>
                </div>
              </div>

              {/* Batch Triage Endpoint */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">POST</span>
                  <h3 className="text-xl font-semibold">/v1/triage/batch</h3>
                </div>
                <p className="text-gray-600 mb-4">Process multiple triage assessments in a single request</p>
                
                <div className="bg-gray-900 text-white p-4 rounded-lg text-sm">
                  <pre><code>{`{
  "cases": [
    {
      "case_id": "case_001",
      "patient": { ... },
      "presenting_complaint": "..."
    },
    {
      "case_id": "case_002", 
      "patient": { ... },
      "presenting_complaint": "..."
    }
  ],
  "priority": "standard|urgent"
}`}</code></pre>
                </div>
              </div>

              {/* Get Triage Result */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">GET</span>
                  <h3 className="text-xl font-semibold">/v1/triage/&#123;triage_id&#125;</h3>
                </div>
                <p className="text-gray-600">Retrieve a previously created triage assessment</p>
              </div>

              {/* Usage Statistics */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">GET</span>
                  <h3 className="text-xl font-semibold">/v1/clinic/stats</h3>
                </div>
                <p className="text-gray-600">Get usage statistics and analytics for your clinic</p>
              </div>
            </div>
          </div>
        );

      case 'examples':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Code Examples</h1>
            
            <div className="flex space-x-4 mb-6">
              {Object.keys(codeExamples).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    activeTab === lang 
                      ? 'bg-[#5EB47C] text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {codeExamples[lang].language}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Basic Triage Request</h2>
                <div className="bg-gray-900 text-white p-6 rounded-lg overflow-x-auto">
                  <pre><code>{codeExamples[activeTab].basicRequest}</code></pre>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Webhook Handler</h2>
                <div className="bg-gray-900 text-white p-6 rounded-lg overflow-x-auto">
                  <pre><code>{codeExamples[activeTab].webhookHandler}</code></pre>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Practice Management Integrations</h1>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">🏥 VetSpace (New Zealand)</h3>
                <p className="text-gray-600 mb-4">
                  Direct integration with New Zealand's most popular veterinary practice management software.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Integration Features:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Automatic patient data sync</li>
                    <li>• Real-time appointment booking</li>
                    <li>• SOAP notes directly to patient records</li>
                    <li>• Billing integration</li>
                  </ul>
                </div>
                <a 
                  href="/contact"
                  className="inline-block bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
                >
                  VetSpace Integration Guide
                </a>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">📊 AVImark (Australia)</h3>
                <p className="text-gray-600 mb-4">
                  Seamless connection with Australia's leading veterinary software platform.
                </p>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold mb-2">Integration Features:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Patient history synchronization</li>
                    <li>• Automated workflow triggers</li>
                    <li>• Treatment plan integration</li>
                    <li>• Prescription management</li>
                  </ul>
                </div>
                <a 
                  href="/contact"
                  className="inline-block bg-[#5EB47C] text-white px-4 py-2 rounded-lg hover:bg-[#4A9A64] transition-colors"
                >
                  AVImark Integration Guide
                </a>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Custom Integration Framework</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="mb-4">
                  Don't see your practice management software? We provide a flexible integration framework 
                  for custom connections to any veterinary software system.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold mb-2">📡 REST API</h4>
                    <p className="text-sm text-gray-600">Standard HTTP endpoints for easy integration</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold mb-2">🔔 Webhooks</h4>
                    <p className="text-sm text-gray-600">Real-time notifications and data sync</p>
                  </div>
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold mb-2">🛠️ Custom SDKs</h4>
                    <p className="text-sm text-gray-600">Pre-built libraries for faster development</p>
                  </div>
                </div>
                <a 
                  href="/contact"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Request Custom Integration
                </a>
              </div>
            </div>
          </div>
        );

      case 'webhooks':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Webhooks</h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Webhooks allow you to receive real-time notifications when triage assessments are completed, 
              ensuring your practice management system stays synchronized with LuniGen results.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Why Use Webhooks?</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Real-time notifications eliminate polling</li>
                <li>• Automatic synchronization with your practice software</li>
                <li>• Immediate updates to patient records</li>
                <li>• Efficient resource usage</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold mb-4">Webhook Events</h2>
            <div className="space-y-4 mb-8">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800">triage.completed</h4>
                <p className="text-gray-600">Fired when a triage assessment is completed</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800">triage.updated</h4>
                <p className="text-gray-600">Fired when a triage assessment is updated or reviewed</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800">emergency.detected</h4>
                <p className="text-gray-600">Fired immediately when emergency conditions are identified</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Webhook Payload Example</h2>
            <div className="bg-gray-900 text-white p-6 rounded-lg overflow-x-auto mb-6">
              <pre><code>{`{
  "event": "triage.completed",
  "timestamp": "2024-12-27T10:30:00Z",
  "clinic_id": "clinic_abc123",
  "data": {
    "triage_id": "lunigen_triage_789",
    "case_id": "clinic_case_12345",
    "severity_level": "MODERATE",
    "confidence_score": 0.94,
    "patient": {
      "species": "dog",
      "breed": "golden_retriever",
      "age": "5_years"
    },
    "assessment": {
      "primary_concerns": ["gastroenteritis"],
      "urgency": "schedule_within_6_hours"
    },
    "soap_notes": {
      "subjective": "Owner reports...",
      "objective": "Based on symptoms...",
      "assessment": "Likely gastroenteritis...",
      "plan": "Schedule examination..."
    },
    "recommendations": {
      "suggested_diagnostics": ["physical_exam"],
      "monitoring_instructions": "Monitor for vomiting",
      "client_advice": "Withhold food for 12 hours"
    }
  }
}`}</code></pre>
            </div>

            <h2 className="text-2xl font-bold mb-4">Security & Verification</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Signature Verification</h3>
              <p className="text-yellow-700">
                All webhooks include an <code>X-Lunigen-Signature</code> header with an HMAC SHA256 signature 
                to verify the authenticity of the request.
              </p>
            </div>

            <h2 className="text-2xl font-bold mb-4">Webhook Configuration</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-4">Setup via API:</h4>
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <pre><code>{`POST /v1/webhooks
{
  "url": "https://your-clinic-system.com/webhooks/lunigen",
  "events": ["triage.completed", "emergency.detected"],
  "secret": "your_webhook_secret_key"
}`}</code></pre>
              </div>
            </div>
          </div>
        );

      case 'errors':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Error Handling</h1>

            <p className="text-lg text-gray-600 mb-8">
              LuniGen API uses conventional HTTP response codes and provides detailed error information 
              to help you debug integration issues quickly.
            </p>

            <h2 className="text-2xl font-bold mb-4">HTTP Status Codes</h2>
            <div className="space-y-4 mb-8">
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">200</span>
                  <h4 className="font-semibold text-green-800">Success</h4>
                </div>
                <p className="text-green-700">Request completed successfully</p>
              </div>

              <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">400</span>
                  <h4 className="font-semibold text-orange-800">Bad Request</h4>
                </div>
                <p className="text-orange-700">Invalid request format or missing required parameters</p>
              </div>

              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">401</span>
                  <h4 className="font-semibold text-red-800">Unauthorized</h4>
                </div>
                <p className="text-red-700">Invalid or missing API key</p>
              </div>

              <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">403</span>
                  <h4 className="font-semibold text-red-800">Forbidden</h4>
                </div>
                <p className="text-red-700">API key lacks required permissions or plan limits exceeded</p>
              </div>

              <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">429</span>
                  <h4 className="font-semibold text-purple-800">Rate Limited</h4>
                </div>
                <p className="text-purple-700">Too many requests, retry after the specified time</p>
              </div>

              <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold mr-4">500</span>
                  <h4 className="font-semibold text-gray-800">Server Error</h4>
                </div>
                <p className="text-gray-700">Internal server error, contact support if persistent</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Error Response Format</h2>
            <div className="bg-gray-900 text-white p-6 rounded-lg mb-6">
              <pre><code>{`{
  "error": {
    "code": "INVALID_SPECIES",
    "message": "Species 'elephant' is not supported for triage",
    "details": {
      "field": "patient.species",
      "supported_values": ["dog", "cat", "rabbit", "bird", "small_mammal"]
    },
    "request_id": "req_abc123def456"
  }
}`}</code></pre>
            </div>

            <h2 className="text-2xl font-bold mb-4">Common Error Codes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-600 mb-2">INVALID_SPECIES</h4>
                <p className="text-sm text-gray-600">Unsupported animal species provided</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-600 mb-2">MISSING_SYMPTOMS</h4>
                <p className="text-sm text-gray-600">No presenting complaint or symptoms provided</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-600 mb-2">QUOTA_EXCEEDED</h4>
                <p className="text-sm text-gray-600">Monthly API quota limit reached</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-600 mb-2">CASE_NOT_FOUND</h4>
                <p className="text-sm text-gray-600">Specified case ID does not exist</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4 mt-8">Retry Strategy</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-4">Recommended Approach:</h4>
              <ul className="text-blue-700 space-y-2">
                <li>• <strong>5xx errors:</strong> Retry with exponential backoff</li>
                <li>• <strong>429 errors:</strong> Respect the Retry-After header</li>
                <li>• <strong>4xx errors:</strong> Fix the request, don't retry immediately</li>
                <li>• <strong>Network errors:</strong> Retry up to 3 times with increasing delays</li>
              </ul>
            </div>
          </div>
        );

      case 'sdks':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">SDKs & Libraries</h1>

            <p className="text-lg text-gray-600 mb-8">
              Pre-built libraries and SDKs to accelerate your LuniGen API integration across different 
              programming languages and platforms.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">🟨</div>
                  <h3 className="text-lg font-bold">JavaScript/Node.js</h3>
                </div>
                <p className="text-gray-600 mb-4">Official SDK for Node.js applications</p>
                <div className="bg-gray-100 p-3 rounded text-sm mb-4">
                  <code>npm install @lunigen/api</code>
                </div>
                <a href="/contact" className="text-[#5EB47C] hover:underline">View Documentation</a>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">🐍</div>
                  <h3 className="text-lg font-bold">Python</h3>
                </div>
                <p className="text-gray-600 mb-4">Python SDK with async support</p>
                <div className="bg-gray-100 p-3 rounded text-sm mb-4">
                  <code>pip install lunigen-api</code>
                </div>
                <a href="/contact" className="text-[#5EB47C] hover:underline">View Documentation</a>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">🐘</div>
                  <h3 className="text-lg font-bold">PHP</h3>
                </div>
                <p className="text-gray-600 mb-4">PHP library for easy integration</p>
                <div className="bg-gray-100 p-3 rounded text-sm mb-4">
                  <code>composer require lunigen/api</code>
                </div>
                <a href="/contact" className="text-[#5EB47C] hover:underline">View Documentation</a>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">☕</div>
                  <h3 className="text-lg font-bold">Java</h3>
                </div>
                <p className="text-gray-600 mb-4">Java SDK for enterprise applications</p>
                <div className="bg-gray-100 p-3 rounded text-sm mb-4">
                  <code>Coming Soon</code>
                </div>
                <button className="text-gray-400 cursor-not-allowed">In Development</button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">💎</div>
                  <h3 className="text-lg font-bold">Ruby</h3>
                </div>
                <p className="text-gray-600 mb-4">Ruby gem for Rails applications</p>
                <div className="bg-gray-100 p-3 rounded text-sm mb-4">
                  <code>gem install lunigen-api</code>
                </div>
                <a href="/contact" className="text-[#5EB47C] hover:underline">View Documentation</a>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">🔷</div>
                  <h3 className="text-lg font-bold">C#/.NET</h3>
                </div>
                <p className="text-gray-600 mb-4">.NET library for Windows environments</p>
                <div className="bg-gray-100 p-3 rounded text-sm mb-4">
                  <code>NuGet: LuniGen.Api</code>
                </div>
                <a href="/contact" className="text-[#5EB47C] hover:underline">View Documentation</a>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-4">Quick Start with JavaScript SDK</h2>
            <div className="bg-gray-900 text-white p-6 rounded-lg mb-8">
              <pre><code>{`const { LuniGenAPI } = require('@lunigen/api');

// Initialize the client
const client = new LuniGenAPI({
  apiKey: process.env.LUNIGEN_API_KEY,
  clinicId: process.env.LUNIGEN_CLINIC_ID
});

// Perform triage assessment
async function performTriage() {
  try {
    const assessment = await client.triage.assess({
      caseId: 'case_123',
      patient: {
        species: 'dog',
        breed: 'golden_retriever',
        age: '5_years'
      },
      presentingComplaint: 'Vomiting since yesterday',
      clinicalData: {
        duration: '24_hours',
        eatingDrinking: 'reduced_appetite',
        behavior: 'lethargic'
      }
    });
    
    console.log('Assessment:', assessment);
    console.log('Severity:', assessment.severityLevel);
    console.log('SOAP Notes:', assessment.soapNotes);
    
  } catch (error) {
    console.error('Triage failed:', error.message);
  }
}

// Setup webhook handler
client.webhooks.verify = (payload, signature, secret) => {
  return client.webhooks.verifySignature(payload, signature, secret);
};

performTriage();`}</code></pre>
            </div>

            <h2 className="text-2xl font-bold mb-4">Community & Support</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <div className="text-3xl mb-4">📚</div>
                <h4 className="font-semibold mb-2">Documentation</h4>
                <p className="text-sm text-gray-600">Comprehensive guides and API reference</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-3xl mb-4">💬</div>
                <h4 className="font-semibold mb-2">Developer Support</h4>
                <p className="text-sm text-gray-600">Direct access to our development team</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <div className="text-3xl mb-4">🔧</div>
                <h4 className="font-semibold mb-2">Custom Solutions</h4>
                <p className="text-sm text-gray-600">Tailored integrations for your practice</p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a section from the navigation</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">LuniGen API Docs</h1>
          <p className="text-sm text-gray-600">Developer Documentation</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id 
                      ? 'bg-[#5EB47C] text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;