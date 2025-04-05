import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/signup.css'; // Ensure this file contains the custom CSS styles
import Logo from "../asserts/logo.png";
import api from '../config/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            console.log('Attempting login with:', { email });
            
            const response = await api.post('/api/auth/login', {
                email,
                password,
            });

            console.log('Login response status:', response.status);
            console.log('Login response data:', response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                navigate('/profile');
            } else {
                setError('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                code: error.code
            });
            
            // Use the error message from the API configuration
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            
            <div className="row justify-content-center">
                

                <div className="col-md-6">
                    <div className="card shadow" style={{ borderColor: '#ff914d' }}>
                        <div className="card-body">
                        <div className="d-flex justify-content-center">
                            <img src={Logo} width="200" alt="Logo" />
                        </div>
                            <h2 className="mx-auto mb-4" style={{ color: '#ff914d' }}>Login</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: '#000' }}>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
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
                                        required
                                        disabled={isLoading}
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
                                    disabled={isLoading}
                                    style={{
                                        backgroundColor: '#ff914d',
                                        borderColor: '#ff914d',
                                        color: '#fff',
                                    }}
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>
                                <br></br>
                                <br></br>
                                <div className="d-flex justify-content-center">
                                <p>If you have not an account <a href="/signup">Signup</a></p>
                                </div>
                            
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
