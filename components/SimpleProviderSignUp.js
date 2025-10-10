import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

const SimpleProviderSignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    providerType: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Creating account...');

    // Validation
    if (!formData.phone || formData.phone.trim() === '') {
      setMessage('❌ Phone number is required');
      setLoading(false);
      return;
    }

    if (formData.phone === formData.email) {
      setMessage('❌ Phone number cannot be the same as email');
      setLoading(false);
      return;
    }

    // Debug: Log form data

    try {
      // Step 1: Sign up with Supabase Auth
      const signupData = {
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            user_type: 'provider',
            phone: formData.phone || null, // Ensure we don't send empty string
            full_name: `${formData.firstName} ${formData.lastName}`,
            provider_type: formData.providerType,
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      };


      const { data, error } = await supabase.auth.signUp(signupData);

      if (error) {
        setMessage(`❌ Signup failed: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data.user) {
        setMessage(`✅ Success! User created: ${data.user.email}`);
        
        // Step 2: Wait a moment, then create provider record
        setTimeout(async () => {
          try {
            const { data: providerData, error: providerError } = await supabase.rpc('create_provider_record', {
              provider_name: `${formData.firstName} ${formData.lastName}`,
              provider_email: formData.email,
              provider_phone: formData.phone,
              provider_type: formData.providerType
            });


            if (providerError) {
              setMessage(prev => prev + `\n⚠️ Provider record failed: ${providerError.message}`);
            } else if (providerData && providerData.success === false) {
              setMessage(prev => prev + `\n⚠️ Provider record failed: ${providerData.error || 'Unknown error'}`);
            } else if (providerData && providerData.success === true) {
              setMessage(prev => prev + `\n✅ Provider record created successfully! Type: ${providerData.provider_type || 'unknown'}`);
            } else {
              setMessage(prev => prev + `\n⚠️ Provider record: Unexpected response format`);
            }

            // Step 3: Verify the profile role was set correctly
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role, phone')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
              setMessage(prev => prev + `\n⚠️ Could not verify profile: ${profileError.message}`);
            } else {
              setMessage(prev => prev + `\n✅ Profile role: ${profileData.role}, Phone: ${profileData.phone || 'Not set'}`);
            }

          } catch (err) {
            setMessage(prev => prev + `\n⚠️ Provider record error: ${err.message}`);
          }
          
          setLoading(false);
        }, 2000);
      } else {
        setMessage('❌ No user data returned');
        setLoading(false);
      }

    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2>🧪 Simple Provider Signup Test</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        <input
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 chars)"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        <input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        <select
          name="providerType"
          value={formData.providerType}
          onChange={handleChange}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        >
          <option value="">Select Provider Type</option>
          <option value="veterinarian">Veterinarian</option>
          <option value="vet_nurse">Vet Nurse</option>
          <option value="groomer">Groomer</option>
          <option value="trainer">Trainer</option>
          <option value="breeder">Breeder</option>
          <option value="nutritionist">Nutritionist</option>
          <option value="pet_business">Pet Business</option>
          <option value="holistic_care">Holistic Care</option>
          <option value="other">Other</option>
        </select>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '15px', 
            fontSize: '18px', 
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up as Provider'}
        </button>
      </form>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '5px',
        whiteSpace: 'pre-line',
        fontFamily: 'monospace',
        minHeight: '100px'
      }}>
        {message || 'Fill out the form and click Sign Up to test'}
      </div>
    </div>
  );
};

export default SimpleProviderSignUp;