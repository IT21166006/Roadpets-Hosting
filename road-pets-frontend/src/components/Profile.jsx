import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import LightbulbCircleIcon from '@mui/icons-material/LightbulbCircle';

// Default avatar for posts
const defaultPostAvatar = "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010";

// Random avatars for user profile
const profileAvatars = [
    "https://i.ibb.co/gM2bXPJB/1.png",
    "https://i.ibb.co/x8hFLfVN/2.png",
    "https://i.ibb.co/HDfgyWzq/3.png",
    "https://i.ibb.co/TD4ykN4b/4.png",
    "https://i.ibb.co/RkMSD2c3/5.png",
    "https://i.ibb.co/jk72Gt8w/6.png"
];

function Profile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [userAvatar, setUserAvatar] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        location: '',
        description: ''
    });
    const navigate = useNavigate();

    // Function to get random profile avatar
    const getRandomProfileAvatar = () => {
        const randomIndex = Math.floor(Math.random() * profileAvatars.length);
        return profileAvatars[randomIndex];
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch user profile
                const userResponse = await axios.get('http://localhost:5000/api/protected/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (userResponse.data) {
                    setUser(userResponse.data);
                    // Set random avatar for the user profile
                    setUserAvatar(getRandomProfileAvatar());
                    localStorage.setItem('user', JSON.stringify(userResponse.data));
                }

                // Fetch user's posts
                const postsResponse = await axios.get('http://localhost:5000/api/posts/user', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Add default avatar to each post
                const postsWithAvatars = postsResponse.data.map(post => ({
                    ...post,
                    userAvatar: defaultPostAvatar
                }));
                setPosts(postsWithAvatars);
            } catch (error) {
                console.error('Error in profile:', error);
                const errorMessage = error.response?.data?.error || 'Failed to load profile';
                setError(errorMessage);
                
                if (error.response?.status === 401 || error.response?.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleEditPost = (post) => {
        setCurrentPost(post);
        setFormData({
            name: post.name,
            phoneNumber: post.phoneNumber,
            location: post.location,
            description: post.description
        });
        setShowEditModal(true);
    };

    const handleUpdatePost = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/posts/${currentPost._id}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setPosts(posts.map(post => 
                post._id === currentPost._id ? response.data : post
            ));
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post');
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setPosts(posts.filter(post => post._id !== postId));
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post');
            }
        }
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading profile data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">
                    <h4 className="alert-heading">Error Loading Profile</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">
                        <button 
                            className="btn btn-outline-danger"
                            onClick={() => {
                                localStorage.clear();
                                navigate('/login');
                            }}
                        >
                            Back to Login
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            {/* User Profile Section */}
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex align-items-center mb-4">
                        <img
                            src={userAvatar}
                            alt="User Avatar"
                            className="rounded-circle me-3"
                            style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        />
                        <div>
                            <h2 className="card-title mb-2">User Profile</h2>
                            {user && (
                                <div>
                                    <div className="mb-2">
                                        <strong>Username:</strong> {user.username || 'Not available'}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Email:</strong> {user.email || 'Not available'}
                                    </div>
                                    <div className="mb-2">
                                        <strong>Role:</strong> {user.role || 'Not available'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <button 
                            className="btn btn-danger"
                            onClick={() => {
                                localStorage.clear();
                                navigate('/login');
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </Card.Body>
            </Card>

            {/* User's Posts Section */}
            <h3 className="mb-4">My Posts</h3>
            <div className="row">
                {posts.map((post) => (
                    <div key={post._id} className="col-md-4 mb-4">
                        <Card>
                            <Card.Header className="bg-white">
                                <div className="d-flex align-items-center">
                                    <img
                                        src={post.userAvatar}
                                        alt="User Avatar"
                                        className="rounded-circle me-2"
                                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    />
                                    <span className="fw-bold">{post.name}</span>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <h5 className="card-title"><PersonIcon/>{post.name}</h5>
                                
                                {/* Post Images */}
                                {post.images && post.images.length > 0 && (
                                    <div className="mb-3">
                                        <img
                                            src={post.images[0]}
                                            alt="Post"
                                            className="img-fluid rounded"
                                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}

                                <p className="card-text"><strong><PhoneIcon/> Phone: </strong> {post.phoneNumber}</p>
                                <p className="card-text"><strong><LocationOnIcon/> Location: </strong> {post.location}</p>
                                <p className="card-text"><strong><LightbulbCircleIcon/> Description:</strong> {post.description}</p>
                                
                                <div className="d-flex justify-content-end gap-2">
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => handleEditPost(post)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeletePost(post._id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Edit Post Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Post</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdatePost}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Profile;
