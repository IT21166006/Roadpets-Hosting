import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { Modal, Button, Form, Card, Row, Col, Container, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaPaw, FaBell, FaSyringe, FaPills } from 'react-icons/fa';
import '../CSS/petdashboard.css';

const PetDashboard = () => {
  const [pets, setPets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [petbirthday, setPetbirthday] = useState('');
  const [pettype, setPettype] = useState('');
  const [images, setImages] = useState([]);
  const [croppedImages, setCroppedImages] = useState([]);
  const imageRefs = useRef([]);
  const cropperRefs = useRef([]);

  // Pet type options
  const petTypeOptions = ['Dog', 'Cat', 'Monkey', 'Cattle', 'Goats', 'Birds'];

  // Dog vaccination schedule
  const dogVaccinationSchedule = [
    { age: '6-8 weeks', vaccine: 'DHPP, Deworming, Flea/tick treatment', purpose: 'Core vaccines, parasite control' },
    { age: '10-12 weeks', vaccine: 'DHPP booster, Rabies', purpose: 'Boost immunity, mandatory' },
    { age: '14-16 weeks', vaccine: 'Final DHPP booster', purpose: 'Full protection' },
    { age: 'Adult (Annually)', vaccine: 'Rabies booster, DHPP booster, Leptospirosis, Deworming', purpose: 'Maintain protection' },
    { age: 'Senior (7+ yrs)', vaccine: 'As adult + joint supplements', purpose: 'Health maintenance' },
  ];

  // Cat vaccination schedule
  const catVaccinationSchedule = [
    { age: '6-8 weeks', vaccine: 'FVRCP, Deworming, Flea/tick treatment', purpose: 'Core vaccine, parasite control' },
    { age: '10-12 weeks', vaccine: 'FVRCP booster, Rabies', purpose: 'Core + mandatory' },
    { age: '14-16 weeks', vaccine: 'Final FVRCP booster', purpose: 'Full protection' },
    { age: 'Adult (Annually)', vaccine: 'Rabies, FVRCP boosters, Deworming', purpose: 'Maintain protection' },
    { age: 'Senior (7+ yrs)', vaccine: 'As adult + kidney support', purpose: 'Health maintenance' },
  ];

  // Monkey vaccination schedule
  const monkeyVaccinationSchedule = [
    { age: 'Infant', vaccine: 'Rabies, Tetanus toxoid, Deworming', purpose: 'High-risk diseases, parasite control' },
    { age: 'Adult (Annually)', vaccine: 'Rabies booster, TB screening, B-complex vitamins', purpose: 'Maintain protection, nutrition' },
    { age: 'Senior (10+ yrs)', vaccine: 'As adult + joint support', purpose: 'Health maintenance' },
  ];

  // Cattle vaccination schedule
  const cattleVaccinationSchedule = [
    { age: 'At birth', vaccine: 'Colostrum feeding', purpose: 'Immunity boost' },
    { age: '2-4 weeks', vaccine: 'Brucellosis vaccine (females), Deworming', purpose: 'Reproductive health, parasite control' },
    { age: '3-6 months', vaccine: 'FMD, Blackleg vaccines', purpose: 'Disease prevention' },
    { age: 'Adult (Annually)', vaccine: 'FMD, Hemorrhagic Septicemia booster, Deworming', purpose: 'Maintain protection' },
    { age: 'Senior (7+ yrs)', vaccine: 'As adult + mineral support', purpose: 'Health maintenance' },
  ];

  // Goats vaccination schedule
  const goatVaccinationSchedule = [
    { age: 'At birth', vaccine: 'Colostrum feeding', purpose: 'Immunity boost' },
    { age: '2-4 weeks', vaccine: 'Enterotoxemia vaccine, Deworming', purpose: 'Core vaccine, parasite control' },
    { age: '3 months', vaccine: 'PPR vaccine', purpose: 'High priority' },
    { age: 'Adult (Annually)', vaccine: 'Enterotoxemia, PPR boosters, Deworming', purpose: 'Maintain protection' },
    { age: 'Senior (7+ yrs)', vaccine: 'As adult + mineral support', purpose: 'Health maintenance' },
  ];
  // Birds vaccination schedule
  const birdVaccinationSchedule = [
    { age: 'Few days old', vaccine: "Marek's disease vaccine (chickens), Deworming, Vitamins A/D3/E", purpose: 'Core vaccine, growth support' },
    { age: '4-6 weeks', vaccine: 'Newcastle disease, Fowlpox (chickens), Coccidiosis prevention', purpose: 'Disease & parasite control' },
    { age: 'Adult (Annually)', vaccine: 'Newcastle booster, Worming, Vitamin/mineral support', purpose: 'Maintain immunity & health' },
    { age: 'Senior (5+ yrs)', vaccine: 'As adult + calcium supplementation', purpose: 'Bone & reproductive health' },
  ];

  // Calculate pet age in years, months, and days
  const calculateDetailedAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birthDate.getDate());
      days = Math.floor((today - lastMonth) / (1000 * 60 * 60 * 24));
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  // Calculate pet age in years (for display in sidebar)
  const calculateAge = (birthday) => {
    const { years, months } = calculateDetailedAge(birthday);
    return months >= 6 ? years + 1 : years;
  };

  // Get vaccination recommendations based on pet age
  const getVaccinationRecommendations = (pet) => {
    const { years, months } = calculateDetailedAge(pet.petbirthday);
    const ageInWeeks = (years * 52) + (months * 4);
    let recommendations = [];

    switch (pet.pettype) {
      case 'Dog':
        if (ageInWeeks >= 6 && ageInWeeks <= 8) {
          recommendations.push(dogVaccinationSchedule[0]);
        } else if (ageInWeeks >= 10 && ageInWeeks <= 12) {
          recommendations.push(dogVaccinationSchedule[1]);
        } else if (ageInWeeks >= 14 && ageInWeeks <= 16) {
          recommendations.push(dogVaccinationSchedule[2]);
        } else if (years >= 1 && years < 7) {
          recommendations.push(dogVaccinationSchedule[3]);
        } else if (years >= 7) {
          recommendations.push(dogVaccinationSchedule[4]);
        }
        break;
      
      case 'Cat':
        if (ageInWeeks >= 6 && ageInWeeks <= 8) {
          recommendations.push(catVaccinationSchedule[0]);
        } else if (ageInWeeks >= 10 && ageInWeeks <= 12) {
          recommendations.push(catVaccinationSchedule[1]);
        } else if (ageInWeeks >= 14 && ageInWeeks <= 16) {
          recommendations.push(catVaccinationSchedule[2]);
        } else if (years >= 1 && years < 7) {
          recommendations.push(catVaccinationSchedule[3]);
        } else if (years >= 7) {
          recommendations.push(catVaccinationSchedule[4]);
        }
        break;
      
      case 'Monkey':
        if (ageInWeeks < 12) {
          recommendations.push(monkeyVaccinationSchedule[0]);
        } else if (years >= 1 && years < 10) {
          recommendations.push(monkeyVaccinationSchedule[1]);
        } else if (years >= 10) {
          recommendations.push(monkeyVaccinationSchedule[2]);
        }
        break;
      
      case 'Cattle':
        if (ageInWeeks < 2) {
          recommendations.push(cattleVaccinationSchedule[0]);
        } else if (ageInWeeks >= 2 && ageInWeeks <= 4) {
          recommendations.push(cattleVaccinationSchedule[1]);
        } else if (ageInWeeks >= 12 && ageInWeeks <= 24) {
          recommendations.push(cattleVaccinationSchedule[2]);
        } else if (years >= 1 && years < 7) {
          recommendations.push(cattleVaccinationSchedule[3]);
        } else if (years >= 7) {
          recommendations.push(cattleVaccinationSchedule[4]);
        }
        break;
      
      case 'Goats':
        if (ageInWeeks < 2) {
          recommendations.push(goatVaccinationSchedule[0]);
        } else if (ageInWeeks >= 2 && ageInWeeks <= 4) {
          recommendations.push(goatVaccinationSchedule[1]);
        } else if (ageInWeeks >= 12) {
          recommendations.push(goatVaccinationSchedule[2]);
        } else if (years >= 1 && years < 7) {
          recommendations.push(goatVaccinationSchedule[3]);
        } else if (years >= 7) {
          recommendations.push(goatVaccinationSchedule[4]);
        }
        break;
      
      case 'Birds':
        if (ageInWeeks < 1) {
          recommendations.push(birdVaccinationSchedule[0]);
        } else if (ageInWeeks >= 4 && ageInWeeks <= 6) {
          recommendations.push(birdVaccinationSchedule[1]);
        } else if (years >= 1 && years < 5) {
          recommendations.push(birdVaccinationSchedule[2]);
        } else if (years >= 5) {
          recommendations.push(birdVaccinationSchedule[3]);
        }
        break;
      
      default:
        return null;
    }

    return recommendations;
  };

  // Fetch user's pets on component mount
  useEffect(() => {
    const fetchPets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/pets/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setPets(response.data);
        if (response.data.length > 0) {
          setCurrentPet(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
        setError('Failed to load pets. Please try again later.');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [navigate]);

  // Initialize Cropper.js when images are loaded
  useEffect(() => {
    images.forEach((imageSrc, index) => {
      if (imageSrc && imageRefs.current[index]) {
        cropperRefs.current[index] = new Cropper(imageRefs.current[index], {
          aspectRatio: 1,
          viewMode: 1,
          autoCropArea: 1,
        });
      }
    });

    return () => {
      cropperRefs.current.forEach((cropper) => {
        if (cropper) {
          cropper.destroy();
        }
      });
      cropperRefs.current = [];
    };
  }, [images]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileReaders = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((results) => {
      setImages(results);
      setCroppedImages(new Array(results.length).fill(null));
    });
  };

  const handleCrop = (index) => {
    if (cropperRefs.current[index]) {
      const croppedCanvas = cropperRefs.current[index].getCroppedCanvas({
        width: 400,
        height: 400,
      });

      const base64Image = croppedCanvas.toDataURL('image/jpeg');
      const updatedCroppedImages = [...croppedImages];
      updatedCroppedImages[index] = base64Image;
      setCroppedImages(updatedCroppedImages);
      alert(`Image ${index + 1} cropped successfully!`);
    }
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Use cropped images if available, otherwise use original images
      const imagesToSubmit = croppedImages.some(img => img !== null) ? croppedImages : images;

      if (imagesToSubmit.length === 0) {
        setError('Please add at least one image of your pet');
        return;
      }

      const petData = {
        name,
        petbirthday,
        pettype,
        images: imagesToSubmit
      };

      const response = await axios.post(
        'http://localhost:5000/api/pets',
        petData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPets([response.data, ...pets]);
      setCurrentPet(response.data);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating pet:', error);
      setError(error.response?.data?.message || 'Failed to create pet');
    }
  };

  const handleEditPet = (pet) => {
    setCurrentPet(pet);
    setName(pet.name);
    setPetbirthday(pet.petbirthday);
    setPettype(pet.pettype);
    setImages(pet.images);
    setShowEditModal(true);
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token || !currentPet) {
      return;
    }

    try {
      const petData = {
        name,
        petbirthday,
        pettype,
        images: images
      };

      const response = await axios.put(
        `http://localhost:5000/api/pets/${currentPet._id}`,
        petData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setPets(pets.map(pet => pet._id === currentPet._id ? response.data : pet));
      setCurrentPet(response.data);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error updating pet:', error);
      setError(error.response?.data?.message || 'Failed to update pet');
    }
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/pets/${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPets(pets.filter(pet => pet._id !== petId));
      if (currentPet && currentPet._id === petId) {
        setCurrentPet(pets.length > 1 ? pets.find(pet => pet._id !== petId) : null);
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      setError('Failed to delete pet');
    }
  };

  const resetForm = () => {
    setName('');
    setPetbirthday('');
    setPettype('');
    setImages([]);
    setCroppedImages([]);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your pets...</p>
      </div>
    );
  }

  return (
    <Container fluid className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FaPaw className="me-2" />My Pets</h2>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center"
        >
          <FaPlus className="me-2" /> Add Pet
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {pets.length === 0 ? (
        <div className="text-center p-5 bg-light rounded">
          <FaPaw size={50} className="mb-3 text-muted" />
          <h4>No pets added yet</h4>
          <p className="text-muted">Click the "Add Pet" button to register your first pet!</p>
        </div>
      ) : (
        <Row className="dashboard-container">
          {/* Left Sidebar - Pet Names */}
          <Col md={3} className="pet-sidebar">
            <div className="list-group">
              {pets.map((pet) => (
                <button
                  key={pet._id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${currentPet && currentPet._id === pet._id ? 'active' : ''
                    }`}
                  onClick={() => setCurrentPet(pet)}
                >
                  <span>{pet.name}</span>
                  <span className="badge bg-primary rounded-pill">
                    {calculateAge(pet.petbirthday)} years
                  </span>
                </button>
              ))}
            </div>
          </Col>

          {/* Right Content - Pet Details */}
          <Col md={9} className="pet-details">
            {currentPet ? (
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">{currentPet.name}</h3>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditPet(currentPet)}
                    >
                      <FaEdit className="me-1" /> Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeletePet(currentPet._id)}
                    >
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="pet-info">
                        <p><strong>Type:</strong> {currentPet.pettype}</p>
                        <p><strong>Birthday:</strong> {new Date(currentPet.petbirthday).toLocaleDateString()}</p>
                        <p><strong>Age:</strong> {calculateAge(currentPet.petbirthday)} years</p>

                        {/* Detailed Age Information */}
                        <div className="detailed-age mt-3">
                          <h5>Detailed Age</h5>
                          {(() => {
                            const { years, months, days } = calculateDetailedAge(currentPet.petbirthday);
                            return (
                              <p>
                                <strong>{currentPet.name}</strong> is <strong>{years}</strong> years,
                                <strong> {months}</strong> months, and <strong>{days}</strong> days old
                              </p>
                            );
                          })()}
                        </div>

                        {/* Health Notifications for All Pets */}
                        <div className="health-notifications mt-4">
                          <h5 className="d-flex align-items-center">
                            <FaBell className="me-2 text-warning" /> Health Notifications
                          </h5>
                          {(() => {
                            const recommendations = getVaccinationRecommendations(currentPet);
                            if (recommendations && recommendations.length > 0) {
                              return (
                                <Alert variant="info" className="mt-2">
                                  <h6 className="d-flex align-items-center">
                                    <FaSyringe className="me-2" /> Vaccination Schedule
                                  </h6>
                                  <p className="mb-2">Based on {currentPet.name}'s age, the following vaccinations are recommended:</p>
                                  {recommendations.map((rec, index) => (
                                    <div key={index} className="mb-2 p-2 bg-light rounded">
                                      <div className="d-flex justify-content-between">
                                        <Badge bg="primary">{rec.age}</Badge>
                                        <Badge bg="success">{rec.purpose}</Badge>
                                      </div>
                                      <p className="mt-2 mb-0"><strong>Vaccines/Treatments:</strong> {rec.vaccine}</p>
                                    </div>
                                  ))}
                                </Alert>
                              );
                            } else {
                              return (
                                <Alert variant="success" className="mt-2">
                                  <p className="mb-0">No vaccinations are currently due for {currentPet.name}.</p>
                                </Alert>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      {currentPet.images && currentPet.images.length > 0 && (
                        <div className="pet-images">
                          <div className="main-image mb-3">
                            <img
                              src={currentPet.images[0]}
                              alt={currentPet.name}
                              className="img-fluid rounded"
                              style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          {currentPet.images.length > 1 && (
                            <div className="d-flex gap-2 overflow-auto">
                              {currentPet.images.slice(1).map((img, index) => (
                                <img
                                  key={index}
                                  src={img}
                                  alt={`${currentPet.name} ${index + 2}`}
                                  className="img-thumbnail"
                                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ) : (
              <div className="text-center p-5 bg-light rounded h-100 d-flex align-items-center justify-content-center">
                <div>
                  <FaPaw size={50} className="mb-3 text-muted" />
                  <h4>Select a pet from the sidebar</h4>
                  <p className="text-muted">Click on a pet name to view its details</p>
                </div>
              </div>
            )}
          </Col>
        </Row>
      )}

      {/* Add Pet Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPet}>
            <Form.Group className="mb-3">
              <Form.Label>Pet Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pet Type</Form.Label>
              <Form.Select
                value={pettype}
                onChange={(e) => setPettype(e.target.value)}
                required
              >
                <option value="">Select pet type</option>
                {petTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pet Birthday</Form.Label>
              <Form.Control
                type="date"
                value={petbirthday}
                onChange={(e) => setPetbirthday(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pet Images</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                multiple
                required
              />
            </Form.Group>

            {images.map((imageSrc, index) => (
              <div key={index} className="mb-3">
                <h6>Image {index + 1}:</h6>
                <img
                  ref={(el) => (imageRefs.current[index] = el)}
                  src={imageSrc}
                  alt={`Preview ${index + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '10px' }}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleCrop(index)}
                  className="mb-3"
                >
                  Crop Image
                </Button>
              </div>
            ))}

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Add Pet
              </Button>
              <Button variant="outline-secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Pet Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Pet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdatePet}>
            <Form.Group className="mb-3">
              <Form.Label>Pet Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pet Type</Form.Label>
              <Form.Select
                value={pettype}
                onChange={(e) => setPettype(e.target.value)}
                required
              >
                <option value="">Select pet type</option>
                {petTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pet Birthday</Form.Label>
              <Form.Control
                type="date"
                value={petbirthday}
                onChange={(e) => setPetbirthday(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Current Images</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Pet ${index + 1}`}
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Add New Images (Optional)</Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                multiple
              />
            </Form.Group>

            {images.length > 0 && images[0].startsWith('data:') && images.map((imageSrc, index) => (
              <div key={index} className="mb-3">
                <h6>New Image {index + 1}:</h6>
                <img
                  ref={(el) => (imageRefs.current[index] = el)}
                  src={imageSrc}
                  alt={`Preview ${index + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '300px', marginBottom: '10px' }}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleCrop(index)}
                  className="mb-3"
                >
                  Crop Image
                </Button>
              </div>
            ))}

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Update Pet
              </Button>
              <Button variant="outline-secondary" onClick={handleCloseEditModal}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PetDashboard; 