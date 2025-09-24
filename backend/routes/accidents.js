import express from 'express';
import {
    getAllAccidents,
    getAccidentById,
    createAccident,
    updateAccident,
    deleteAccident
} from '../controllers/accidentsController.js';

const router = express.Router();

router.get('/', getAllAccidents);
router.get('/:id', getAccidentById);
router.post('/', createAccident);
router.put('/:id', updateAccident);
router.delete('/:id', deleteAccident);

export default router;