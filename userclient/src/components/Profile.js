import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Add Link for navigation

function Profile() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await axios.get('/api/auth/profile', {
                    headers: { 'x-auth-token': token },
                });
                setUser(res.data);
                setFormData({
                    fullName: res.data.fullName,
                    username: res.data.username,
                    email: res.data.email,
                });
            } catch (err) {
                setError(err.response?.data?.msg || 'Error loading profile');
            }
        } else {
            setError('Please login first');
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put('/api/auth/profile', formData, {
                headers: { 'x-auth-token': token },
            });
            setUser(res.data);
            setIsEditing(false);
            alert('Profile updated successfully');
        } catch (err) {
            console.error(err.response.data);
            alert(err.response.data.msg || 'Update failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    if (error) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #282c34,rgb(68, 71, 77))',
                    color: 'white',
                    fontSize: '18px',
                }}
            >
                {error}
            </div>
        );
    }

    if (!user) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #282c34,rgb(68, 71, 77))',
                    color: 'white',
                    fontSize: '18px',
                }}
            >
                Loading...
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
                background: 'linear-gradient(135deg, #282c34,rgb(68, 71, 77))',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    width: '500px',
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
                        marginBottom: '10px',
                    }}
                >
                    Welcome, {user.fullName}!
                </h1>
                <p
                    style={{
                        fontSize: '16px',
                        color: '#666',
                        marginBottom: '30px',
                    }}
                >
                    Manage your profile details below
                </p>

                {isEditing ? (
                    <form onSubmit={onSubmit}>
                        <div
                            style={{
                                marginBottom: '20px',
                                textAlign: 'left',
                            }}
                        >
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    color: '#333',
                                    marginBottom: '5px',
                                }}
                            >
                                Full Name:
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={onChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px',
                                }}
                            />
                        </div>
                        <div
                            style={{
                                marginBottom: '20px',
                                textAlign: 'left',
                            }}
                        >
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    color: '#333',
                                    marginBottom: '5px',
                                }}
                            >
                                Username:
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={onChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px',
                                }}
                            />
                        </div>
                        <div
                            style={{
                                marginBottom: '20px',
                                textAlign: 'left',
                            }}
                        >
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    color: '#333',
                                    marginBottom: '5px',
                                }}
                            >
                                Email:
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={onChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px',
                                    fontSize: '14px',
                                }}
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '10px',
                            }}
                        >
                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    background: '#4a90e2',
                                    color: 'white',
                                }}
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #4a90e2',
                                    borderRadius: '5px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    color: '#4a90e2',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div
                        style={{
                            textAlign: 'left',
                            marginBottom: '30px',
                        }}
                    >
                        <p
                            style={{
                                fontSize: '16px',
                                color: '#333',
                                marginBottom: '10px',
                            }}
                        >
                            <strong>Full Name:</strong> {user.fullName}
                        </p>
                        <p
                            style={{
                                fontSize: '16px',
                                color: '#333',
                                marginBottom: '10px',
                            }}
                        >
                            <strong>Username:</strong> {user.username}
                        </p>
                        <p
                            style={{
                                fontSize: '16px',
                                color: '#333',
                                marginBottom: '20px',
                            }}
                        >
                            <strong>Email:</strong> {user.email}
                        </p>
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: 'none',
                                borderRadius: '5px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                background: '#4a90e2',
                                color: 'white',
                                marginBottom: '10px',
                            }}
                        >
                            Edit Profile
                        </button>
                        {user.isAdmin && (
                            <Link to="/admin">
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                        background: '#28a745',
                                        color: 'white',
                                        marginBottom: '10px',
                                    }}
                                >
                                    Go to Admin Dashboard
                                </button>
                            </Link>
                        )}
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '10px',
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
            </div>
        </div>
    );
}

export default Profile;