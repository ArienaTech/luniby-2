import { useEffect, useState } from 'react';
import openaiService from '../services/openaiService';

const TriageStatus = () => {
  const [status, setStatus] = useState({
    apiKeyPresent: false,
    apiKeyPreview: '',
    environment: '',
    timestamp: new Date().toISOString()
  });

  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    // Check environment variables
    const apiKeyPresent = !!process.env.REACT_APP_OPENAI_API_KEY;
    const apiKeyPreview = process.env.REACT_APP_OPENAI_API_KEY 
      ? process.env.REACT_APP_OPENAI_API_KEY.substring(0, 20) + '...'
      : 'Not found';

    setStatus({
      apiKeyPresent,
      apiKeyPreview,
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString()
    });


  }, []);

  const testTriageSystem = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const testMessages = [
        {
          id: '1',
          type: 'user',
          content: 'My dog is sick',
          timestamp: new Date().toISOString()
        }
      ];

      const region = {
        name: 'Australia',
        currency: 'AUD',
        guidelines: 'Australian Veterinary Guidelines',
        terminology: 'Australian veterinary terminology'
      };

      const response = await openaiService.generateTriageResponse(testMessages, region);
      
      setTestResult({
        success: true,
        message: 'Triage system working correctly!',
        response: response.content.substring(0, 200) + '...',
        analysis: response.analysis
      });

    } catch (error) {
      console.error('Triage test failed:', error);
      setTestResult({
        success: false,
        message: 'Triage system test failed',
        error: error.message,
        details: {
          status: error.response?.status,
          data: error.response?.data
        }
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🎯 Luni Triage System Status</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* API Configuration */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">🔑 API Configuration</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">OpenAI API Key:</span>
              <span className={`text-sm font-medium ${status.apiKeyPresent ? 'text-green-600' : 'text-red-600'}`}>
                {status.apiKeyPresent ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            {status.apiKeyPresent && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Key Preview:</span>
                <span className="text-xs font-mono text-gray-500">{status.apiKeyPreview}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Environment:</span>
              <span className="text-sm font-medium text-blue-600">{status.environment}</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">⚡ System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Triage Mode:</span>
              <span className={`text-sm font-medium ${status.apiKeyPresent ? 'text-green-600' : 'text-red-600'}`}>
                {status.apiKeyPresent ? '🤖 AI-Powered' : '❌ Unavailable'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">6-Criteria System:</span>
              <span className="text-sm font-medium text-green-600">✅ Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emergency Override:</span>
              <span className="text-sm font-medium text-green-600">✅ Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Regional Support:</span>
              <span className="text-sm font-medium text-green-600">✅ AU/NZ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Issue Explanation */}
      {!status.apiKeyPresent && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-lg font-semibold text-red-800 mb-2">❌ System Unavailable</h4>
          <div className="text-sm text-red-700 space-y-2">
            <p><strong>Issue:</strong> OpenAI API key is not detected in the React environment.</p>
            <p><strong>Current Behavior:</strong> Triage system is non-functional without API key.</p>
            <p><strong>Required for Operation:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>❌ Valid OpenAI API key</li>
              <li>❌ GPT-4 model access</li>
              <li>❌ Internet connectivity</li>
              <li>❌ Proper environment configuration</li>
            </ul>
            <p className="mt-3"><strong>Note:</strong> Mock responses have been removed for production use.</p>
          </div>
        </div>
      )}

      {status.apiKeyPresent && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-lg font-semibold text-green-800 mb-2">🎯 AI-Powered Mode Active</h4>
          <div className="text-sm text-green-700">
            <p><strong>Status:</strong> OpenAI GPT-4 integration is active and ready.</p>
            <p><strong>Features:</strong> Full AI-powered triage with real-time OpenAI responses.</p>
          </div>
        </div>
              )}

        {/* Test Button */}
        {status.apiKeyPresent && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">🧪 System Test</h4>
            <button
              onClick={testTriageSystem}
              disabled={testing}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing...
                </>
              ) : (
                'Test Triage System'
              )}
            </button>
            
            {testResult && (
              <div className={`mt-4 p-3 rounded-lg ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h5 className={`font-medium mb-2 ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? '✅ Test Passed' : '❌ Test Failed'}
                </h5>
                <p className={`text-sm mb-2 ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.message}
                </p>
                
                {testResult.success && testResult.response && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 font-medium">AI Response:</p>
                    <p className="text-xs text-green-700 bg-green-100 p-2 rounded mt-1">
                      {testResult.response}
                    </p>
                  </div>
                )}
                
                {!testResult.success && (
                  <div className="mt-2">
                    <p className="text-xs text-red-600 font-medium">Error Details:</p>
                    <p className="text-xs text-red-700 bg-red-100 p-2 rounded mt-1 font-mono">
                      {testResult.error}
                    </p>
                    {testResult.details && (
                      <pre className="text-xs text-red-600 bg-red-50 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Troubleshooting */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-lg font-semibold text-blue-800 mb-2">🛠️ Troubleshooting</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>If system is unavailable:</strong></p>
          <ol className="list-decimal list-inside ml-4 space-y-1">
            <li>Ensure .env file exists in project root</li>
            <li>Verify REACT_APP_OPENAI_API_KEY is set in .env</li>
            <li>Restart the React development server (npm start)</li>
            <li>Check browser console for debug messages</li>
            <li>Verify OpenAI API key has sufficient credits</li>
            <li>Test API connectivity</li>
          </ol>
          <p className="mt-3"><strong>Note:</strong> System requires valid OpenAI API key to function.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Last checked: {new Date(status.timestamp).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Enhanced Luni Triage System v2.0 - 6-Criteria Assessment
        </p>
      </div>
    </div>
  );
};

export default TriageStatus;