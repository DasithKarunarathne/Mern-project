import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login first');
            return;
        }

        try {
            const res = await axios.get('/api/auth/users', {
                headers: { 'x-auth-token': token },
            });
            setUsers(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error loading users');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`/api/auth/users/${userId}`, {
                    headers: { 'x-auth-token': token },
                });
                setUsers(users.filter(user => user._id !== userId));
                alert('User deleted successfully');
            } catch (err) {
                console.error('Delete error:', err.response); // Log the full error response
                alert(err.response?.data?.msg || 'Error deleting user');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/customer');//login ekatada yanne?????
    };

    if (error) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #4a90e2, #87ceeb)',
                    color: 'white',
                    fontSize: '18px',
                }}
            >
                {error}
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #4a90e2, #87ceeb)',
                padding: '20px',
            }}
        >
            <div
                style={{
                    width: '800px',
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                    padding: '40px',
                    textAlign: 'center',
                }}
            >
                <h1
                    style={{
                        fontSize: '28px',
                        color: '#333',
                        marginBottom: '20px',
                    }}
                >
                    Admin Dashboard
                </h1>
                <button
                    onClick={handleLogout}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        padding: '10px 20px',
                        border: '1px solid #ff4d4d',
                        borderRadius: '5px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        background: 'transparent',
                        color: '#ff4d4d',
                    }}
                >
                    Logout
                </button>
                {users.length === 0 ? (
                    <p style={{ fontSize: '16px', color: '#666' }}>No users found.</p>
                ) : (
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            marginBottom: '20px',
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Full Name</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Username</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Email</th>
                                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user.fullName}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user.username}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user.email}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            style={{
                                                padding: '5px 10px',
                                                border: 'none',
                                                borderRadius: '5px',
                                                background: '#ff4d4d',
                                                color: 'white',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;