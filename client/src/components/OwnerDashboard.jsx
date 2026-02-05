import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/auth.css';

const OwnerDashboard = () => {
    const [data, setData] = useState({ reviewers: [], averageRating: 0 });
    const [storeInfo, setStoreInfo] = useState({ name: '', address: '' });
    const [newPassword, setNewPassword] = useState('');
    
    const storeId = localStorage.getItem('storeId');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (storeId) {
            axios.get(`http://localhost:5000/api/owner/store-data/${storeId}`)
                .then(res => setData(res.data))
                .catch(err => console.error("Error fetching store data:", err));

            axios.get(`http://localhost:5000/api/stores/${storeId}`)
                .then(res => setStoreInfo(res.data))
                .catch(err => console.error(err));
        }
    }, [storeId]);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.patch('http://localhost:5000/api/users/update-password', {
                userId,
                newPassword
            });
            alert("Password updated successfully!");
            setNewPassword('');
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (!storeId) return <div className="dashboard-container">No store assigned.</div>;

    return (
        <div className="dashboard-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Welcome, {storeInfo.name} Owner</h2>
                <button onClick={handleLogout} className="btn-danger">Logout</button>
            </div>

            <div className="stat-card">
                <span className="stat-label">Average Rating</span>
                <span className="stat-value">⭐ {data.averageRating || '0.0'} / 5.0</span>
            </div>

            <h3 style={{ marginTop: '30px' }}>User Reviews</h3>
            <table className="store-table">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Rating Given</th>
                    </tr>
                </thead>
                <tbody>
                    {data.reviewers.map((r, index) => (
                        <tr key={index}>
                            <td>{r.name}</td>
                            <td>{r.email}</td>
                            <td>⭐ {r.rating}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="management-card" style={{ marginTop: '30px' }}>
                <h3>Update Password</h3>
                <form className="auth-form" onSubmit={handlePasswordUpdate}>
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required 
                    />
                    <button type="submit" className="btn-primary">Update Password</button>
                </form>
            </div>
        </div>
    );
};

export default OwnerDashboard;