const asyncHandler = (requestHandler) => {
    // The asyncHandler function returns a new function
    return (req, res, next) => {
        // Inside the returned function, the requestHandler is executed
        Promise.resolve(requestHandler(req, res, next))  // Wrap the requestHandler in a promise
            .catch((err) => next(err));  // Catch any errors and pass them to the next middleware (error handler)
    }
}


export { asyncHandler }