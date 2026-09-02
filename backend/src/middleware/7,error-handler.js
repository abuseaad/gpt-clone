// Step 1: Format and send any error passed via next(error)
export const errorHandler = (err, req, res, next) => {
    console.log('error in request:' ,err.message);
    return res.status(err.status || 500).json({
        status: false,
        message: err.status || "something worng try again later",
    });
};
 