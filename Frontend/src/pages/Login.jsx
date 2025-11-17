import React, { useState } from 'react';
import api from '../api/apiClient';
import { useNavigate } from 'react-router-dom';


const Login = () => {
const [form, setForm] = useState({ email: '', password: '' });
const [loading, setLoading] = useState(false);
const [msg, setMsg] = useState(null);
const navigate = useNavigate();


const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });


const submit = async (e) => {
e.preventDefault();
setLoading(true); setMsg(null);
try {
const res = await api.post('/api/auth/login', form);
// backend provided earlier doesn't include public login; if you have one, use it
localStorage.setItem('token', res.data.token);
localStorage.setItem('user', JSON.stringify(res.data.user || {}));
setMsg('Login successful');
navigate('/');
} catch (err) {
setMsg(err?.response?.data?.message || 'Login failed');
} finally { setLoading(false); }
};


return (
<div className="page container">
<h2>User Login</h2>
<form onSubmit={submit} className="form">
<label>Email<input name="email" value={form.email} onChange={handleChange} required /></label>
<label>Password<input type="password" name="password" value={form.password} onChange={handleChange} required /></label>
<button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
{msg && <p className="info">{msg}</p>}
</form>
</div>
);
};


export default Login;