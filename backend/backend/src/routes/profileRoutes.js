import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, uploadImage.single('profileImage'), updateProfile);

export default router;