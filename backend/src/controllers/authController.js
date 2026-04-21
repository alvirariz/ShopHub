const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// uc1 Register Customer
const registerCustomer = async (req, res) => {
  const { name, email, password } = req.body

  try {
    //check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" })
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: "customer"
      }
    })

    res.status(201).json({ message: "Account created successfully", user })

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

// uc2 Register Store Owner
const registerStoreOwner = async (req, res) => {
  const { name, email, password, storeName, businessType, address } = req.body

  try {
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" })
    }

    //create store owner account with pending status
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: "storeOwner",
        isActive: false
      }
    })

    res.status(201).json({ message: "Your application has been submitted and is under review", user })

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

// uc3 Login
const login = async (req, res) => {
  const { email, password } = req.body

  try {
    //check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(400).json({ message: "Incorrect email or password" })
    }

    //secondly check if password matches
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect email or password" })
    }

    //check if account is active
    if (!user.isActive) {
      return res.status(400).json({ message: "Your account is pending approval" })
    }

    res.status(200).json({ message: "Login successful", user })

  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

// uc4 Logout
const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error })
  }
}

module.exports = { registerCustomer, registerStoreOwner, login, logout }