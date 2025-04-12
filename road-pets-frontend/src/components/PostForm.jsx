import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { useNavigate } from 'react-router-dom';

const PostForm = () => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [croppedImages, setCroppedImages] = useState([]);
    const imageRefs = useRef([]);
    const cropperRefs = useRef([]);
    const [countryCode, setCountryCode] = useState('+1'); // Default country code
    const [phoneError, setPhoneError] = useState('');
    const [locationError, setLocationError] = useState(''); // New state for location error
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Add useEffect to fetch user profile data when component mounts
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/protected/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Auto-fill the name field with user's username
                if (response.data && response.data.username) {
                    setName(response.data.username);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchUserProfile();
    }, [navigate]);

    // Function to fetch location using ipinfo.io
    const fetchLocation = async () => {
        try {
            const response = await axios.get('https://ipinfo.io?token=3e56a6d6dfa74a'); // Replace YOUR_IPINFO_API_TOKEN
            setLocation(response.data.city + ', ' + response.data.region + ', ' + response.data.country);
        } catch (error) {
            console.error('Error getting location:', error);
            setLocationError('Failed to get location. Please enter manually.');
        }
    };

    // Initialize Cropper.js when images are loaded
    useEffect(() => {
        // Clear any existing cropper instances
        cropperRefs.current.forEach((cropper) => {
            if (cropper) {
                cropper.destroy();
            }
        });
        cropperRefs.current = [];
        
        // Initialize new cropper instances for each image
        images.forEach((imageSrc, index) => {
            if (imageSrc && imageRefs.current[index]) {
                // Add a small delay to ensure the image is fully loaded
                setTimeout(() => {
                    if (imageRefs.current[index]) {
                        cropperRefs.current[index] = new Cropper(imageRefs.current[index], {
                            aspectRatio: 4 / 5,
                            viewMode: 1,
                            autoCropArea: 1,
                        });
                    }
                }, 100);
            }
        });

        return () => {
            // Destroy cropper instances to avoid memory leaks
            cropperRefs.current.forEach((cropper) => {
                if (cropper) {
                    cropper.destroy();
                }
            });
            cropperRefs.current = [];
        };
    }, [images]);

    // Fetch location on component mount
    useEffect(() => {
        fetchLocation();
    }, []);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Clear any existing cropper instances to avoid memory leaks
        cropperRefs.current.forEach((cropper) => {
            if (cropper) {
                cropper.destroy();
            }
        });
        cropperRefs.current = [];
        
        const fileReaders = files.map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(fileReaders).then((results) => {
            // Set the original images
            setImages(results);
            
            // Initialize cropped images array with null values
            setCroppedImages(new Array(results.length).fill(null));
            
            // Reset image refs array to match the new number of images
            imageRefs.current = new Array(results.length).fill(null);
        });
    };

    const handleCrop = (index) => {
        if (cropperRefs.current[index]) {
            const croppedCanvas = cropperRefs.current[index].getCroppedCanvas({
                width: 400,
                height: 500,
            });

            const base64Image = croppedCanvas.toDataURL('image/jpeg');
            
            // Create a new array with the same length as the original images array
            const updatedCroppedImages = new Array(images.length).fill(null);
            
            // Copy any existing cropped images
            croppedImages.forEach((img, i) => {
                if (img !== null) {
                    updatedCroppedImages[i] = img;
                }
            });
            
            // Set the newly cropped image at the correct index
            updatedCroppedImages[index] = base64Image;
            
            setCroppedImages(updatedCroppedImages);
            alert(`Image ${index + 1} cropped successfully!`);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (value.length > 18) {
            setPhoneError('Phone number must be 18 characters or less.');
        } else {
            setPhoneError('');
        }
        setPhoneNumber(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            // Use cropped images if available, otherwise use original images
            let imagesToSubmit = [];
            
            // Check if we have cropped images
            if (croppedImages.some(img => img !== null)) {
                // Filter out null values from croppedImages
                imagesToSubmit = croppedImages.filter(img => img !== null);
            } else {
                // Use original images
                imagesToSubmit = [...images];
            }
            
            // Ensure we don't have duplicate images
            const uniqueImages = [...new Set(imagesToSubmit)];
            
            console.log('Submitting images:', uniqueImages.length);
            console.log('First image sample:', uniqueImages[0]?.substring(0, 100) + '...');

            const postData = {
                name,
                description,
                location,
                phoneNumber,
                images: uniqueImages
            };

            console.log('Post data being sent:', {
                ...postData,
                images: `Array of ${uniqueImages.length} images`
            });

            const response = await axios.post(
                'http://localhost:5000/api/posts',
                postData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Response from server:', response.data);

            if (response.data) {
                navigate('/');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create post';
            setError(errorMessage);

            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="text-center mb-4">Create a Post</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                readOnly
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                            <div className="input-group">
                                <select
                                    className="form-select"
                                    style={{ maxWidth: '100px' }}
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                >
                                    <option value="+1">+1</option>
                                    <option value="+44">+94</option>
                                    {/* Add more country codes as needed */}
                                </select>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    className="form-control"
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    required

                                    placeholder="Enter phone number"
                                />
                            </div>
                            {phoneError && <div className="text-danger small">{phoneError}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="location" className="form-label">Location</label>
                            <input
                                type="text"
                                id="location"
                                className="form-control"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                            {locationError && <div className="text-danger small">{locationError}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows="4"
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="images" className="form-label">Images</label>
                            <input
                                type="file"
                                id="images"
                                className="form-control"
                                onChange={handleImageChange}
                                accept="image/*"
                                multiple
                                required
                            />
                        </div>

                        {images.map((imageSrc, index) => (
                            <div key={index} className="mb-3">
                                <h5>Image {index + 1}:</h5>
                                <img
                                    ref={(el) => (imageRefs.current[index] = el)}
                                    src={imageSrc}
                                    alt={`Preview ${index + 1}`}
                                    style={{ maxWidth: '100%', marginBottom: '10px' }}
                                />
                                <br></br>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => handleCrop(index)}
                                >
                                    Crop Image
                                </button>
                            </div>
                        ))}

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-100 "
                            disabled={!name || !location || !description || images.length === 0}
                        >
                            Create Post
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostForm;
