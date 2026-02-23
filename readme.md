Scalability & Future Improvements ->

While this is a functional MVP, here is how I would scale this system for a production environment like PrimeTrade AI:

Secure Auth: Move from localStorage to HttpOnly Cookies. This prevents XSS attacks by ensuring the JWT cannot be accessed via JavaScript.

Database Performance: Add Database Indexing to the email and owner (taskId) fields in MongoDB. This ensures that searches remain fast even if the database grows to millions of records.

Traffic Handling: Implement Rate Limiting (using express-rate-limit) to prevent DDoS attacks and "brute-force" login attempts on the authentication endpoints.

State Management: Transition the frontend to TanStack Query (React Query). This would handle caching and background data synchronization, reducing the number of repetitive API calls to the server.

Real-time Updates: For a trading platform, I would integrate WebSockets (Socket.io) so that task updates or market data sync across all open tabs instantly without a page refresh.

Server Reliability: Use PM2 or Docker to manage the Node.js process, ensuring the server automatically restarts if it crashes and can scale across multiple CPU cores.