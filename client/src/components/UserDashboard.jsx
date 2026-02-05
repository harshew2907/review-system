import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/auth.css';

const UserDashboard = () => {
    const [stores, setStores] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/stores?userId=${userId}`);
                setStores(res.data);
            } catch (err) {
                console.error("Error fetching stores:", err);
            }
        };
        fetchStores();
    }, [userId]);

    const handleRate = async (storeId, currentRating) => {
        const promptText = currentRating ? `Modify your rating (1-5):` : "Enter your rating (1-5):";
        const rating = prompt(promptText, currentRating || "");
        
        if (rating >= 1 && rating <= 5) {
            try {
                await axios.post('http://localhost:5000/api/ratings', {
                    user_id: userId,
                    store_id: storeId,
                    rating: parseInt(rating)
                });
                alert("Rating saved!");
                window.location.reload(); 
            } catch (err) {
                alert("Error submitting rating.");
            }
        } else if (rating !== null) {
            alert("Invalid rating. Please enter 1-5.");
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.patch('http://localhost:5000/api/users/update-password', { userId, newPassword });
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

    const filteredStores = stores.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-wrapper">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Available Stores</h2>
                <button onClick={handleLogout} className="btn-danger">Logout</button>
            </div>
            
            <input 
                type="text" 
                className="search-bar"
                placeholder="Search by name or address..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} 
                style={{ marginBottom: '20px', width: '100%' }}
            />

            <table className="store-table">
                <thead>
                    <tr>
                        <th>Store Name</th>
                        <th>Address</th>
                        <th>Overall Rating</th>
                        <th>Your Rating</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStores.map(s => (
                        <tr key={s.id}>
                            <td><strong>{s.name}</strong></td>
                            <td>{s.address}</td>
                            <td>⭐ {s.overall_rating || 'N/A'}</td>
                            <td>{s.user_rating ? `⭐ ${s.user_rating}` : 'Not rated'}</td>
                            <td>
                                <button 
                                    onClick={() => handleRate(s.id, s.user_rating)} 
                                    className={s.user_rating ? "btn-secondary" : "btn-primary"}
                                >
                                    {s.user_rating ? "Modify Rating" : "Rate Now"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="management-card" style={{ marginTop: '40px' }}>
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

export default UserDashboard;