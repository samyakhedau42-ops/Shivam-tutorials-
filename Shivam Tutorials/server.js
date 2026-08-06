const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Allow the server to parse JSON bodies

const PORT = 3000;
const JWT_SECRET = 'a-very-secret-key-that-should-be-in-a-config-file'; // In a real app, use an environment variable

// --- In-Memory Database (for demonstration) ---
// In a real application, you would connect to a real database (e.g., PostgreSQL, MongoDB, SQLite).
const users = [
    {
        id: 1,
        firstName: 'Samyak',
        lastName: 'Hedau',
        email: 'samyakhedau42@gmail.com',
        // The password should be stored hashed. We'll pre-hash it here for the demo.
        // The original password is 'samyak@m24'.
        passwordHash: bcrypt.hashSync('samyak@m24', 10),
        role: 'admin'
    }
];
let nextUserId = 2;

// --- Middleware for Authentication ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) {
        res.status(400).json({ message: 'Token is not valid' });
    }
};

// --- Middleware for Admin Role Check ---
const adminAuth = (req, res, next) => {
    // This middleware should run *after* the auth middleware
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required.' });
    }
};

// --- API Endpoints ---

/**
 * @route   POST /api/register
 * @desc    Register a new user
 */
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = {
            id: nextUserId++,
            firstName,
            lastName,
            email,
            passwordHash, // Store the hash, not the plain password
            role: email === 'samyakhedau42@gmail.com' ? 'admin' : 'user'
        };

        users.push(newUser);

        console.log('New user registered:', { id: newUser.id, email: newUser.email });
        res.status(201).json({ message: 'User registered successfully. Please log in.' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

/**
 * @route   POST /api/login
 * @desc    Authenticate a user and return a JWT
 */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Compare submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // User is authenticated, create a JSON Web Token (JWT)
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day

        res.json({
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (for admin panel)
 * @access  Private (Admin)
 */
app.get('/api/users', [auth, adminAuth], (req, res) => {
    // Return all users except the one making the request, and don't send password hashes
    const usersForAdmin = users
        .filter(u => u.id !== req.user.id)
        .map(u => {
            const { passwordHash, ...userWithoutPassword } = u;
            return userWithoutPassword;
        });
    res.json(usersForAdmin);
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user's profile
 * @access  Private (Admin can edit anyone, user can edit self)
 */
app.put('/api/users/:id', auth, async (req, res) => {
    const userIdToUpdate = parseInt(req.params.id);
    const { firstName, lastName, email, password } = req.body;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== userIdToUpdate) {
        return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    const userIndex = users.findIndex(u => u.id === userIdToUpdate);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Update fields
    if (firstName) users[userIndex].firstName = firstName;
    if (lastName) users[userIndex].lastName = lastName;
    if (email) {
        // Check if new email is already taken by another user
        if (users.some(u => u.email === email && u.id !== userIdToUpdate)) {
            return res.status(400).json({ message: 'Email is already in use.' });
        }
        users[userIndex].email = email;
    }
    if (password) {
        users[userIndex].passwordHash = await bcrypt.hash(password, 10);
    }

    const { passwordHash, ...updatedUser } = users[userIndex];
    res.json(updatedUser);
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Private (Admin)
 */
app.delete('/api/users/:id', [auth, adminAuth], (req, res) => {
    const userIdToDelete = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userIdToDelete);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent the main admin from being deleted
    if (users[userIndex].email === 'samyakhedau42@gmail.com') {
        return res.status(400).json({ message: 'Cannot delete the main administrator.' });
    }

    users.splice(userIndex, 1);
    res.json({ message: 'User removed successfully.' });
});

/**
 * @route   POST /api/users/assign-admin/:id
 * @desc    Assign admin role to a user
 * @access  Private (Admin)
 */
app.post('/api/users/assign-admin/:id', [auth, adminAuth], (req, res) => {
    const userIdToPromote = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === userIdToPromote);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
    }

    users[userIndex].role = 'admin';
    res.json({ message: `Admin privileges granted to ${users[userIndex].email}.` });
});


// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log('This server provides API endpoints for user authentication.');
    console.log('It does NOT serve the HTML files. You should open your HTML files as you normally do.');
});