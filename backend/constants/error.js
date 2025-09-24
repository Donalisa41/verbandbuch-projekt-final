const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'Dieses Feld ist erforderlich',
    INVALID_DATE: 'Ungültiges Datum',
    TEXT_TOO_SHORT: 'Text zu kurz (mindestens 3 Zeichen)',
    ACCIDENT_NOT_FOUND: 'Unfall nicht gefunden',
    DATABASE_ERROR: 'Datenbankfehler',
    INVALID_ID: 'Ungültige ID'
};

const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
};

export { ERROR_MESSAGES, HTTP_STATUS };