import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (formData.name.length < 20 || formData.name.length > 60) {
            setError("Name must be between 20 and 60 characters.");
            return false;
        }
        if (formData.address.length > 400) {
            setError("Address cannot exceed 400 characters.");
            return false;
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16})/;
        if (!passwordRegex.test(formData.password)) {
            setError("Password must be 8-16 characters, with one uppercase and one special character.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            const response = await axios.post('http://localhost:5000/api/register', formData);
            alert(response.data.message);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Try again.");
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="auth-box">
                <h2>Create Account</h2>
                {error && <p className="error-msg">{error}</p>}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input 
                        name="name" 
                        type="text" 
                        placeholder="Full Name (20-60 characters)" 
                        onChange={handleChange} 
                        required 
                    />
                    <input 
                        name="email" 
                        type="email" 
                        placeholder="Email Address" 
                        onChange={handleChange} 
                        required 
                    />
                    <textarea 
                        name="address" 
                        placeholder="Full Address (Max 400 characters)" 
                        onChange={handleChange} 
                        required 
                    />
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="Password (8-16 chars, 1 Upper, 1 Special)" 
                        onChange={handleChange} 
                        required 
                    />
                    <button type="submit" className="btn-primary">Sign Up</button>
                </form>

                <p className="auth-footer">
                    Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Login here</span>
                </p>
            </div>
        </div>
    );
};

export default Signup;