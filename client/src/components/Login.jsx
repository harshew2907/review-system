import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', credentials);
            const { token, role, id, storeId } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', id);
            if (storeId) localStorage.setItem('storeId', storeId);

            if (role === 'System Administrator') navigate('/admin-dashboard');
            else if (role === 'Store Owner') navigate('/owner-dashboard');
            else navigate('/user-dashboard');
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-box">
                <h2>Login</h2>
                {error && <p className="error-msg">{error}</p>}
                
                <form className="auth-form" onSubmit={handleLogin}>
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} 
                        required 
                    />
                    <button type="submit" className="btn-primary">Sign In</button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <span className="auth-link" onClick={() => navigate('/signup')}>Sign up here</span>
                </div>
            </div>
        </div>
    );
};

export default Login;