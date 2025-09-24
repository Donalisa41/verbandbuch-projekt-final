const logError = (error, req = null) => {
    console.error('FEHLER:', error.message);
    if (req) {
        console.error('Route:', req.method, req.originalUrl);
    }
};

const handleAsyncError = (asyncFunction) => {
    return (req, res, next) => {
        Promise.resolve(asyncFunction(req, res, next))
            .catch(error => {
                logError(error, req);
                res.status(500).json({
                    success: false,
                    error: 'Interner Server-Fehler'
                });
            });
    };
};

export { logError, handleAsyncError };