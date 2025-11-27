import React, { useState } from 'react';
import api from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setMsg(null);
    try {
      // const res = await api.post('/api/auth/admin/login', form);
     const res = await api.post('/api/auth/admin/login', form);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('admin', JSON.stringify(res.data.user || {}));
      setMsg({ type: 'success', text: 'Admin login successful!' });
      setTimeout(() => navigate('/admin'), 1000);
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || 'Admin login failed' });
    } finally { 
      setLoading(false); 
    }
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundEffect: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.3), transparent 50%)',
      pointerEvents: 'none'
    },
    formWrapper: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
      padding: '50px 40px',
      maxWidth: '450px',
      width: '100%',
      animation: 'slideIn 0.6s ease-out',
      position: 'relative',
      zIndex: 1,
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    iconWrapper: {
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #1e3c72 0%, #7e22ce 100%)',
      borderRadius: '50%',
      margin: '0 auto 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '40px',
      boxShadow: '0 10px 30px rgba(30, 60, 114, 0.3)',
      animation: 'pulse 2s infinite'
    },
    heading: {
      textAlign: 'center',
      color: '#1e3c72',
      fontSize: '32px',
      fontWeight: '800',
      marginBottom: '8px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
      marginBottom: '35px',
      fontWeight: '500'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    label: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      fontSize: '14px',
      fontWeight: '700',
      color: '#333',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      paddingRight: '45px',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      outline: 'none',
      backgroundColor: '#f8f9fa',
      fontWeight: '500'
    },
    inputFocus: {
      border: '2px solid #1e3c72',
      backgroundColor: '#fff',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(30, 60, 114, 0.15)'
    },
    inputIcon: {
      position: 'absolute',
      right: '16px',
      color: '#999',
      fontSize: '18px',
      pointerEvents: 'none'
    },
    passwordToggle: {
      position: 'absolute',
      right: '16px',
      color: '#666',
      fontSize: '18px',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'color 0.3s ease'
    },
    passwordToggleHover: {
      color: '#1e3c72'
    },
    button: {
      padding: '16px',
      background: 'linear-gradient(135deg, #1e3c72 0%, #7e22ce 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '800',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      boxShadow: '0 8px 20px rgba(30, 60, 114, 0.3)'
    },
    buttonHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 30px rgba(30, 60, 114, 0.5)'
    },
    buttonDisabled: {
      opacity: '0.6',
      cursor: 'not-allowed',
      transform: 'none'
    },
    message: {
      padding: '14px 18px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      textAlign: 'center',
      marginTop: '15px',
      animation: 'fadeIn 0.4s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    messageSuccess: {
      background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
      color: '#155724',
      border: '2px solid #b1dfbb'
    },
    messageError: {
      background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
      color: '#721c24',
      border: '2px solid #f1b0b7'
    },
    securityBadge: {
      textAlign: 'center',
      marginTop: '25px',
      fontSize: '12px',
      color: '#999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
    },
    lockIcon: {
      fontSize: '14px',
      color: '#1e3c72'
    }
  };

  const [focusedField, setFocusedField] = useState(null);
  const [buttonHover, setButtonHover] = useState(false);
  const [passwordToggleHover, setPasswordToggleHover] = useState(false);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.backgroundEffect}></div>
      
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(40px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @media (max-width: 600px) {
            .form-wrapper {
              padding: 35px 25px !important;
            }
            .heading {
              font-size: 26px !important;
            }
            .icon-wrapper {
              width: 70px !important;
              height: 70px !important;
              font-size: 35px !important;
            }
          }
        `}
      </style>
      
      <div style={styles.formWrapper} className="form-wrapper">
        <div style={styles.iconWrapper} className="icon-wrapper">
          🔐
        </div>
        
        <h2 style={styles.heading} className="heading">Admin Portal</h2>
        <p style={styles.subtitle}>Secure access for administrators only</p>
        
        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>
            Email Address
            <div style={styles.inputWrapper}>
              <input 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...styles.input,
                  ...(focusedField === 'email' ? styles.inputFocus : {})
                }}
                placeholder="Enter Your Email"
                required 
                autoComplete="email"
              />
              <span style={styles.inputIcon}>📧</span>
            </div>
          </label>

          <label style={styles.label}>
            Password
            <div style={styles.inputWrapper}>
              <input 
                name="password" 
                type={showPassword ? 'text' : 'password'}
                value={form.password} 
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...styles.input,
                  ...(focusedField === 'password' ? styles.inputFocus : {})
                }}
                placeholder="Enter your password"
                required 
                autoComplete="current-password"
              />
              <span 
                style={{
                  ...styles.passwordToggle,
                  ...(passwordToggleHover ? styles.passwordToggleHover : {})
                }}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={() => setPasswordToggleHover(true)}
                onMouseLeave={() => setPasswordToggleHover(false)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
            </div>
          </label>

          <button 
            type="submit" 
            disabled={loading}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            style={{
              ...styles.button,
              ...(buttonHover && !loading ? styles.buttonHover : {}),
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? '🔄 Authenticating...' : '🚀 Login'}
          </button>

          {msg && (
            <div style={{
              ...styles.message,
              ...(msg.type === 'success' ? styles.messageSuccess : styles.messageError)
            }}>
              <span>{msg.type === 'success' ? '✅' : '❌'}</span>
              <span>{msg.text}</span>
            </div>
          )}
        </form>

        <div style={styles.securityBadge}>
          <span style={styles.lockIcon}>🔒</span>
          <span>Secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
