const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// uc1 Register Customer
const registerCustomer = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "customer"
      }
    });

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ 
      message: "Account created successfully", 
      user: userWithoutPassword,
      token 
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// uc2 Register Store Owner
const registerStoreOwner = async (req, res) => {
  const { name, email, password, storeName, businessType, address } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create store owner account with pending status
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "storeOwner",
        isActive: false // Pending admin approval
      }
    });

    // Create store application
    await prisma.storeApplication.create({
      data: {
        ownerId: user.id,
        storeName,
        businessType,
        address,
        documents: "", // You can handle file upload later
        status: "pending"
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ 
      message: "Your application has been submitted and is under review", 
      user: userWithoutPassword
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// uc3 Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account is pending approval" });
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({ 
      message: "Login successful", 
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

// uc4 Logout
const logout = async (req, res) => {
  try {
    // Note: With JWT, logout is handled client-side by removing the token
    // You can implement token blacklisting here if needed
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

module.exports = { registerCustomer, registerStoreOwner, login, logout };