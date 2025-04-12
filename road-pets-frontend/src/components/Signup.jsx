import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/signup.css';


function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const validateForm = () => {
        if (!username || !email || !password) {
            setError('All fields are required');
            return false;
        }
        // Additional validation logic can be added here
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password,
            });
            console.log('Signup successful:', response);
            window.location.href = '/login';
        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'Error registering user');
            } else {
                setError('Error registering user');
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow" style={{ borderColor: '#ff914d' }}>
                        <div className="card-body">
                            <div className="d-flex justify-content-center">
                                
                            </div>
                            <h2 className="mb-4" style={{ color: '#ff914d' }}>Signup</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: '#000' }}>Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        style={{
                                            borderColor: '#ff914d',
                                            backgroundColor: '#fff',
                                            color: '#000',
                                        }}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: '#000' }}>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{
                                            borderColor: '#ff914d',
                                            backgroundColor: '#fff',
                                            color: '#000',
                                        }}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: '#000' }}>Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            borderColor: '#ff914d',
                                            backgroundColor: '#fff',
                                            color: '#000',
                                        }}
                                    />
                                </div>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-block w-100"
                                    style={{
                                        backgroundColor: '#ff914d',
                                        borderColor: '#ff914d',
                                        color: '#fff',
                                    }}
                                >
                                    Signup
                                </button>
                                <br></br>
                                <br></br>
                                <div className="d-flex justify-content-center">
                                    <p>If you already have an account, <a href="/login">Login</a></p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
