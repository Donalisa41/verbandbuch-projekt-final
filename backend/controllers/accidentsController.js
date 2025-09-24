import { query } from '../db/db.js';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/error.js';

const getAllAccidents = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const searchName = req.query.search_name || '';
    
    let whereClause = '';
    let queryParams = [limit, offset];
    
    if (searchName) {
        whereClause = 'WHERE name_verletzte_person ILIKE $3';
        queryParams.push(`%${searchName}%`);
    }
    
    const sqlQuery = `
        SELECT 
            id, name_verletzte_person, unfall_datum, unfall_uhrzeit, 
            ort, hergang, art_der_verletzung, zeugen,
            erstehilfe_datum, erstehilfe_uhrzeit, erstehilfe_massnahmen, ersthelfer_name,
            created_at
        FROM accidents 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
    `;
    
    query(sqlQuery, queryParams)
        .then(result => {
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result.rows,
                pagination: { currentPage: page, recordsPerPage: limit }
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden der Unfälle:', error);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success: false,
                error: ERROR_MESSAGES.DATABASE_ERROR
            });
        });
};

const getAccidentById = (req, res) => {
    const id = parseInt(req.params.id);
    
    if (!id || id <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: ERROR_MESSAGES.INVALID_ID
        });
    }
    
    query('SELECT * FROM accidents WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: ERROR_MESSAGES.ACCIDENT_NOT_FOUND
                });
            }
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: result.rows[0]
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden des Unfalls:', error);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success: false,
                error: ERROR_MESSAGES.DATABASE_ERROR
            });
        });
};

const createAccident = (req, res) => {
    const {
        name_verletzte_person, unfall_datum, unfall_uhrzeit, ort, hergang,
        art_der_verletzung, zeugen, erstehilfe_datum, erstehilfe_uhrzeit,
        erstehilfe_massnahmen, ersthelfer_name
    } = req.body;
    
    if (!name_verletzte_person || !unfall_datum || !ort || !hergang || !art_der_verletzung) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: ERROR_MESSAGES.REQUIRED_FIELD
        });
    }
    
    const insertQuery = `
        INSERT INTO accidents (
            name_verletzte_person, unfall_datum, unfall_uhrzeit, ort, hergang,
            art_der_verletzung, zeugen, erstehilfe_datum, erstehilfe_uhrzeit,
            erstehilfe_massnahmen, ersthelfer_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, name_verletzte_person, created_at
    `;
    
    const params = [
        name_verletzte_person, unfall_datum, unfall_uhrzeit, ort, hergang,
        art_der_verletzung, zeugen, erstehilfe_datum, erstehilfe_uhrzeit,
        erstehilfe_massnahmen, ersthelfer_name
    ];
    
    query(insertQuery, params)
        .then(result => {
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Unfall erfolgreich gemeldet',
                data: result.rows[0]
            });
        })
        .catch(error => {
            console.error('Fehler beim Erstellen des Unfalls:', error);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success: false,
                error: ERROR_MESSAGES.DATABASE_ERROR
            });
        });
};

const updateAccident = (req, res) => {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    if (!id || id <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: ERROR_MESSAGES.INVALID_ID
        });
    }
    
    const updateQuery = `
        UPDATE accidents SET 
            name_verletzte_person = $1, unfall_datum = $2, unfall_uhrzeit = $3,
            ort = $4, hergang = $5, art_der_verletzung = $6, zeugen = $7,
            erstehilfe_datum = $8, erstehilfe_uhrzeit = $9, erstehilfe_massnahmen = $10,
            ersthelfer_name = $11, updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING id, name_verletzte_person, updated_at
    `;
    
    const params = [
        updateData.name_verletzte_person, updateData.unfall_datum, updateData.unfall_uhrzeit,
        updateData.ort, updateData.hergang, updateData.art_der_verletzung, updateData.zeugen,
        updateData.erstehilfe_datum, updateData.erstehilfe_uhrzeit, updateData.erstehilfe_massnahmen,
        updateData.ersthelfer_name, id
    ];
    
    query(updateQuery, params)
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: ERROR_MESSAGES.ACCIDENT_NOT_FOUND
                });
            }
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Unfall erfolgreich aktualisiert',
                data: result.rows[0]
            });
        })
        .catch(error => {
            console.error('Fehler beim Aktualisieren des Unfalls:', error);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success: false,
                error: ERROR_MESSAGES.DATABASE_ERROR
            });
        });
};

const deleteAccident = (req, res) => {
    const id = parseInt(req.params.id);
    
    if (!id || id <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: ERROR_MESSAGES.INVALID_ID
        });
    }
    
    query('DELETE FROM accidents WHERE id = $1 RETURNING id, name_verletzte_person', [id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: ERROR_MESSAGES.ACCIDENT_NOT_FOUND
                });
            }
            
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Unfall erfolgreich gelöscht',
                data: result.rows[0]
            });
        })
        .catch(error => {
            console.error('Fehler beim Löschen des Unfalls:', error);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                success: false,
                error: ERROR_MESSAGES.DATABASE_ERROR
            });
        });
};

export {
    getAllAccidents,
    getAccidentById,
    createAccident,
    updateAccident,
    deleteAccident
};