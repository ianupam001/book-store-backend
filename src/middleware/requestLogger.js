const requestLogger = (req, res, next) => {
    const endpoint = `${req.method} ${req.originalUrl}`;
    const ip = req.ip || req.connection.remoteAddress;
    const correlationId = req.headers['x-correlation-id'] || 'N/A';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] - ${endpoint}`);
    console.log(`IP Address: ${ip}`);
    console.log(`Correlation ID: ${correlationId}`);
    console.log(`Browser Info: ${userAgent}`);
    console.log('-------------------------');

    next();
};

module.exports = requestLogger;
