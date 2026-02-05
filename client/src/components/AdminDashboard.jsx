import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/auth.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [usersList, setUsersList] = useState([]);
    const [storesList, setStoresList] = useState([]);
    
    const [store, setStore] = useState({ name: '', address: '' });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'Normal User' });

    const fetchAllData = async () => {
        try {
            const [statsRes, usersRes, storesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats'),
                axios.get('http://localhost:5000/api/users'),
                axios.get('http://localhost:5000/api/stores')
            ]);
            setStats(statsRes.data);
            setUsersList(usersRes.data || []);
            setStoresList(storesRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleAddStore = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/stores', store);
            alert("Store added!");
            setStore({ name: '', address: '' });
            fetchAllData();
        } catch (err) { alert("Failed to add store"); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/users', newUser);
            alert("User created successfully!");
            setNewUser({ name: '', email: '', password: '', address: '', role: 'Normal User' });
            fetchAllData();
        } catch (err) {
            alert(err.response?.data?.message || "Creation failed");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.patch(`http://localhost:5000/api/users/${userId}/role`, { role: newRole });
            alert("Role updated!");
            fetchAllData();
        } catch (err) { alert("Failed to update role"); }
    };

    const handleAssignStore = async (userId, storeId) => {
        try {
            await axios.patch(`http://localhost:5000/api/users/${userId}/assign-store`, { storeId });
            alert("Store assigned!");
            fetchAllData();
        } catch (err) { alert("Failed to assign store"); }
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const filteredUsers = usersList.filter(u => {
        const search = searchTerm.toLowerCase();
        return (
            (u.name?.toLowerCase().includes(search)) ||
            (u.email?.toLowerCase().includes(search)) ||
            (u.role?.toLowerCase().includes(search))
        );
    }).sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div className="admin-page">
            <nav className="navbar">
                <div className="navbar-content">
                    <h1>System Admin</h1>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="compact-stats">
                    <div className="stat-item"><span className="stat-label">Users</span><span className="stat-value">{stats.users}</span></div>
                    <div className="stat-item"><span className="stat-label">Stores</span><span className="stat-value">{stats.stores}</span></div>
                    <div className="stat-item"><span className="stat-label">Ratings</span><span className="stat-value">{stats.ratings}</span></div>
                </div>

                <div className="main-layout">
                    <aside className="forms-sidebar">
                        <div className="management-card">
                            <h3>Add New Store</h3>
                            <form className="auth-form" onSubmit={handleAddStore}>
                                <input placeholder="Store Name" value={store.name} onChange={(e)=>setStore({...store, name: e.target.value})} required />
                                <input placeholder="Store Address" value={store.address} onChange={(e)=>setStore({...store, address: e.target.value})} required />
                                <button type="submit" className="btn-primary">Add Store</button>
                            </form>
                        </div>

                        <div className="management-card">
                            <h3>Create New User</h3>
                            <form className="auth-form" onSubmit={handleCreateUser}>
                                <input placeholder="Full Name" value={newUser.name} onChange={(e)=>setNewUser({...newUser, name: e.target.value})} required />
                                <input type="email" placeholder="Email Address" value={newUser.email} onChange={(e)=>setNewUser({...newUser, email: e.target.value})} required />
                                <input type="password" placeholder="Password" value={newUser.password} onChange={(e)=>setNewUser({...newUser, password: e.target.value})} required />
                                <button type="submit" className="btn-primary">Create User</button>
                            </form>
                        </div>
                    </aside>

                    <section className="table-section">
                        <div className="table-controls">
                            <input 
                                type="text" 
                                className="search-bar" 
                                placeholder="Search users..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>

                        <h3>User Management</h3>
                        <table className="store-table">
                            <thead>
                                <tr>
                                    <th onClick={() => requestSort('name')} style={{cursor:'pointer'}}>Name ↑↓</th>
                                    <th onClick={() => requestSort('role')} style={{cursor:'pointer'}}>Role ↑↓</th>
                                    <th>Assign Store</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td><span className={`badge ${u.role.replace(/\s+/g, '-')}`}>{u.role}</span></td>
                                        <td>
                                            <select 
                                                className="dashboard-select" 
                                                value={u.store_id || ""} 
                                                onChange={(e) => handleAssignStore(u.id, e.target.value)}
                                            >
                                                <option value="">None</option>
                                                {storesList.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select className="dashboard-select" value={u.role} onChange={(e)=>handleRoleChange(u.id, e.target.value)}>
                                                <option value="Normal User">User</option>
                                                <option value="Store Owner">Owner</option>
                                                <option value="System Administrator">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan="4" style={{textAlign:'center'}}>No users found.</td></tr>}
                            </tbody>
                        </table>

                        <h3 style={{marginTop: '40px'}}>Existing Stores</h3>
                        <table className="store-table">
                            <thead>
                                <tr>
                                    <th>Store Name</th>
                                    <th>Address</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {storesList.length > 0 ? storesList.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.name}</strong></td>
                                        <td>{s.address}</td>
                                        <td>⭐ {s.overall_rating || '0.0'}</td>
                                    </tr>
                                )) : <tr><td colSpan="3" style={{textAlign:'center'}}>No stores added yet.</td></tr>}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;