import express from 'express';
import Pet from '../models/Pet.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create post route
router.post('/', authenticateToken, async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Images received:', req.body.images ? req.body.images.length : 0);
        console.log('First image sample:', req.body.images ? req.body.images[0]?.substring(0, 100) + '...' : 'No images');

        // Validate required fields
        if (!req.body.name || !req.body.petbirthday || !req.body.pettype || !req.body.images) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: req.body 
            });
        }

        // Create new pet with base64 images
        const newPet = new Pet({
            name: req.body.name,
            petbirthday: req.body.petbirthday,
            pettype: req.body.pettype,
            images: req.body.images, // Array of base64 strings
            user: req.user.userId
        });

        // Save pet
        const savedPet = await newPet.save();
        console.log('Saved post:', savedPet);
        console.log('Saved images count:', savedPet.images.length);
        console.log('First saved image sample:', savedPet.images[0]?.substring(0, 100) + '...');

        res.status(201).json(savedPet);
    } catch (error) {
        console.error('Error creating pet:', error);
        res.status(500).json({ 
            message: 'Error creating pet', 
            error: error.message,
            stack: error.stack 
        });
    }
});

// Get all pets
router.get('/', async (req, res) => {
    try {
        const pets = await Pet.find().sort({ createdAt: -1 });
        res.json(pets);
    } catch (error) {
        console.error('Error fetching pets:', error);
        res.status(500).json({ error: 'Error fetching pets' });
    }
});

// Get user's pets
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const pets = await Pet.find({ user: req.user.userId })
            .sort({ createdAt: -1 });
        res.json(pets);
    } catch (error) {
        console.error('Error fetching user pets:', error);
        res.status(500).json({ error: 'Error fetching pets' });
    }
});

// Update pet
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, user: req.user.userId });
        
        if (!pet) {
            return res.status(404).json({ error: 'Pet not found or unauthorized' });
        }

        const updatedPet = await Pet.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedPet);
    } catch (error) {
        console.error('Error updating pet:', error);
        res.status(500).json({ error: 'Error updating pet' });
    }
});

// Delete pet
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, user: req.user.userId });
        
        if (!pet) {
            return res.status(404).json({ error: 'Pet not found or unauthorized' });
        }

        await Pet.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
        console.error('Error deleting pet:', error);
        res.status(500).json({ error: 'Error deleting pet' });
    }
});



export default router;