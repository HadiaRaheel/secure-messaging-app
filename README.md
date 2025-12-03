# 🔐 Secure End-to-End Encrypted Messaging & File-Sharing System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

A secure communication platform implementing end-to-end encryption (E2EE) for text messaging and file sharing. Built as a semester project for Information Security course (BSSE 7th Semester).

## 📋 Table of Contents

- [Features](#features)
- [Security Architecture](#security-architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [Attack Demonstrations](#attack-demonstrations)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Known Issues](#known-issues)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

---

## ✨ Features

### Core Security Features
- ✅ **End-to-End Encryption (E2EE)** using AES-256-GCM
- ✅ **Authenticated Key Exchange** using ECDH + RSA digital signatures
- ✅ **Perfect Authentication** preventing Man-in-the-Middle attacks
- ✅ **Replay Attack Protection** using nonces, timestamps, and sequence numbers
- ✅ **Secure Password Storage** using bcrypt with salted hashing
- ✅ **Client-Side Key Storage** - private keys never leave the device
- ✅ **Encrypted File Sharing** with client-side encryption
- ✅ **Comprehensive Security Logging** for audit trails

### Functional Features
- 👤 User authentication (register/login)
- 💬 Real-time encrypted messaging
- 📁 Encrypted file upload and download
- 👥 User directory and contact list
- 🔑 Cryptographic key generation and management
- 📊 Security event logging and monitoring

---

## 🏗️ Security Architecture

### Encryption Stack

```
┌─────────────────────────────────────────────┐
│         CLIENT-SIDE ENCRYPTION              │
├─────────────────────────────────────────────┤
│  1. Key Generation (ECDH + RSA-2048)       │
│  2. Key Exchange (Authenticated DH)         │
│  3. Session Key Derivation (HKDF)          │
│  4. Message Encryption (AES-256-GCM)       │
│  5. File Encryption (AES-256-GCM + Chunks) │
└─────────────────────────────────────────────┘
              ↓ HTTPS ↓
┌─────────────────────────────────────────────┐
│         SERVER (ZERO KNOWLEDGE)             │
├─────────────────────────────────────────────┤
│  • Stores only ciphertext + metadata        │
│  • Cannot decrypt any user content          │
│  • Validates replay protection              │
│  • Logs security events                     │
└─────────────────────────────────────────────┘
```

### Key Exchange Protocol

```
Alice                                    Bob
  |                                       |
  | 1. Generate ECDH key pair            |
  |    Generate RSA-2048 key pair        |
  |                                       |
  | 2. Sign ECDH public key with RSA     |
  |    Send: DH_Pub_A + Signature_A      |
  |-------------------------------------->|
  |                                       | 3. Verify Signature_A
  |                                       |    Generate ECDH key pair
  |                                       |    Generate RSA-2048 key pair
  |                                       |
  |                                       | 4. Sign ECDH public key with RSA
  |    Send: DH_Pub_B + Signature_B      |
  |<--------------------------------------|
  |                                       |
  | 5. Verify Signature_B                |
  |    Compute shared secret: g^(ab)     |
  |    Derive session key using HKDF     |
  |                                       | 6. Compute shared secret: g^(ab)
  |                                       |    Derive session key using HKDF
  |                                       |
  | 7. Send Key Confirmation              |
  |    HMAC(session_key, "CONFIRMED")    |
  |-------------------------------------->| 8. Verify Key Confirmation
  |                                       |
  | ✓ Secure channel established         | ✓ Secure channel established
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js 18.2.0
- **Cryptography:** Web Crypto API (SubtleCrypto)
- **Storage:** IndexedDB for private keys
- **HTTP Client:** Axios
- **Styling:** CSS3 (custom styling)

### Backend
- **Runtime:** Node.js 16+
- **Framework:** Express.js 4.18+
- **Database:** MongoDB 4.4+
- **Authentication:** JWT + bcrypt
- **Logging:** Custom security logger

### Development Tools
- **Version Control:** Git
- **Package Manager:** npm
- **Code Editor:** VS Code
- **API Testing:** Postman
- **Security Testing:** Wireshark, BurpSuite

---

## 📦 Prerequisites

Before installation, ensure you have the following installed:

### Required Software
```bash
# Node.js (v16 or higher)
node --version  # Should output v16.x.x or higher

# npm (comes with Node.js)
npm --version   # Should output 8.x.x or higher

# MongoDB (v4.4 or higher)
mongod --version  # Should output 4.4.x or higher

# Git
git --version
```

### System Requirements
- **OS:** Windows 10+, macOS 10.14+, or Linux (Ubuntu 20.04+)
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** 2GB free space
- **Browser:** Chrome 90+, Firefox 88+, or Safari 14+

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/[your-username]/secure-messaging-app.git

# Navigate to project directory
cd secure-messaging-app
```

### Step 2: Install Dependencies

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Expected packages:
# - express
# - mongoose
# - bcryptjs
# - jsonwebtoken
# - cors
# - dotenv
# - socket.io (optional)
```

#### Frontend Setup
```bash
# Navigate to frontend directory (from root)
cd ../frontend

# Install frontend dependencies
npm install

# Expected packages:
# - react
# - react-dom
# - react-router-dom
# - axios
```

### Step 3: Database Setup

#### Start MongoDB
```bash
# Windows
net start MongoDB

# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Create Database
```bash
# Connect to MongoDB shell
mongosh

# Create database
use secure_messaging_db

# Create collections
db.createCollection("users")
db.createCollection("messages")
db.createCollection("files")
db.createCollection("keys")

# Create indexes for performance
db.users.createIndex({ username: 1 }, { unique: true })
db.messages.createIndex({ sender: 1, receiver: 1, timestamp: -1 })
db.files.createIndex({ owner: 1, uploadDate: -1 })

# Exit MongoDB shell
exit
```

---

## ⚙️ Configuration

### Backend Configuration

Create `.env` file in `/backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/secure_messaging_db
DB_NAME=secure_messaging_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_change_this

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/security.log

# Attack Demo Mode (set to false in production)
ENABLE_ATTACK_DEMOS=true
```

### Frontend Configuration

Create `.env` file in `/frontend` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000

# Feature Flags
REACT_APP_ENABLE_FILE_SHARING=true
REACT_APP_MAX_FILE_SIZE=50

# Development
REACT_APP_DEBUG=true
```

### Security Configuration

#### Generate Secure Secrets
```bash
# Generate JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### SSL/TLS Configuration (Production)
```bash
# Generate self-signed certificate (for testing only)
openssl req -nodes -new -x509 -keyout server.key -out server.cert

# For production, use Let's Encrypt:
# https://letsencrypt.org/
```

---

## 🎯 Usage

### Starting the Application

#### Method 1: Development Mode (Separate Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Expected output:
# [INFO] Server running on http://localhost:5000
# [INFO] MongoDB connected successfully
# [INFO] Security logger initialized
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start

# Expected output:
# Compiled successfully!
# 
# You can now view secure-messaging-app in the browser.
#   Local:            http://localhost:3000
#   On Your Network:  http://192.168.1.x:3000
```

#### Method 2: Using Utility Script
```bash
# From project root
npm run start-all

# This will start both backend and frontend
```

### First-Time Setup

#### 1. Register a New User
```
1. Open browser: http://localhost:3000
2. Click "Register here"
3. Enter username (e.g., "alice")
4. Enter password (min 6 characters)
5. Confirm password
6. Click "Register"
```

#### 2. Generate Cryptographic Keys
```
1. After registration, you'll be redirected to key generation page
2. Enter your username and password
3. Click "Generate Keys"
4. Wait for key generation (may take 5-10 seconds)
5. Keys are stored locally in your browser
6. You'll see success message: "Keys generated successfully"
```

#### 3. Login and Start Messaging
```
1. Login with your credentials
2. Select a user from the "Users" list
3. Type your message in the text box
4. Click "Send"
5. Message is encrypted before sending
6. Recipient will see decrypted message
```

### Using File Sharing

#### Upload Encrypted File
```
1. Select a conversation partner
2. Click "Choose File" in the "Share Encrypted File" section
3. Select file (max 50MB)
4. Click "Upload"
5. File is encrypted client-side before upload
6. Wait for upload confirmation
```

#### Download Encrypted File
```
1. View "Shared Files" section
2. Click "Download" button next to desired file
3. File is downloaded and decrypted automatically
4. Decrypted file is saved to your Downloads folder
```

---

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Integration Tests
```bash
# Run all tests
npm run test:all

# Run specific test suite
npm test -- --grep "Key Exchange"
```

### Manual Testing Checklist

#### Authentication Tests
- [ ] Register new user with valid credentials
- [ ] Register with duplicate username (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect password (should fail)
- [ ] Logout and session cleanup

#### Encryption Tests
- [ ] Send message and verify encryption
- [ ] Receive message and verify decryption
- [ ] Send message to wrong user (decryption should fail)
- [ ] Intercept network traffic (should show ciphertext only)

#### Key Exchange Tests
- [ ] Perform key exchange between two users
- [ ] Verify digital signatures
- [ ] Attempt MITM attack (should fail with signature error)
- [ ] Key exchange timeout handling

#### File Sharing Tests
- [ ] Upload small file (<1MB)
- [ ] Upload medium file (10MB)
- [ ] Upload large file (50MB)
- [ ] Download and verify file integrity
- [ ] Upload with invalid file type (if restricted)

#### Replay Attack Tests
- [ ] Send legitimate message
- [ ] Capture and replay message (should be rejected)
- [ ] Send message with old timestamp (should be rejected)
- [ ] Send message with duplicate nonce (should be rejected)

---

## 🎭 Attack Demonstrations

### Running Attack Demos

The project includes demonstration scripts for educational purposes:

#### MITM Attack Demo
```bash
cd attack-demos
node mitm-attack.js

# Expected output:
# 1. Shows successful MITM without signatures
# 2. Shows how signatures prevent MITM
# 3. Demonstrates key substitution attack
```

**Demo Output:**
```
=== MITM Attack Demonstration ===
SCENARIO 1: Insecure DH Exchange (No Signatures)
------------------------------------------------
Alice public key: 4f90d7cadd64ddf4db71a790f36c21ca...
⚠️  ATTACKER intercepts!
Eve generates her own DH key pair
⚠️  ATTACK SUCCESSFUL!
Eve can decrypt both Alice's and Bob's messages

=== PROTECTION: DH with Digital Signatures ===
With digital signatures:
✓ MITM attack prevented!
```

#### Replay Attack Demo
```bash
cd attack-demos
node replay-attack.js

# Expected output:
# 1. Shows successful replay without protection
# 2. Shows how nonces/timestamps prevent replay
# 3. Demonstrates message duplication attack
```

**Demo Output:**
```
=== Replay Attack Demonstration ===
SCENARIO 1: Without Replay Protection
--------------------------------------
⚠️  Attacker replays the same message 10 times
⚠️  ATTACK SUCCESSFUL!
Bank processes: $1000 transferred (Alice only authorized $100)

SCENARIO 2: With Replay Protection
-----------------------------------
⚠️  Attacker tries to replay message #1
❌ REJECTED! Sequence number already used
✓ Replay attack prevented!
```

### Network Traffic Analysis

#### Using Wireshark
```bash
# 1. Start Wireshark
# 2. Capture on localhost interface
# 3. Filter: tcp.port == 5000
# 4. Send a message in the app
# 5. Examine HTTP POST to /api/messages
# 6. Verify payload contains only ciphertext
```

#### Using BurpSuite
```bash
# 1. Configure browser to use Burp proxy (127.0.0.1:8080)
# 2. Intercept HTTP requests
# 3. Send message in app
# 4. View intercepted request in Burp
# 5. Attempt to modify ciphertext
# 6. Forward request and observe rejection due to invalid MAC
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "securePassword123"
}

Response 201:
{
  "success": true,
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "securePassword123"
}

Response 200:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "alice"
  }
}
```

### Key Exchange Endpoints

#### Initiate Key Exchange
```http
POST /api/keys/exchange
Authorization: Bearer <token>
Content-Type: application/json

{
  "peerId": "507f191e810c19729de860ea",
  "dhPublicKey": "base64_encoded_public_key",
  "signature": "base64_encoded_signature",
  "timestamp": 1638360000000
}

Response 200:
{
  "success": true,
  "exchangeId": "key_exchange_123"
}
```

### Messaging Endpoints

#### Send Message
```http
POST /api/messages/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": "507f191e810c19729de860ea",
  "ciphertext": "base64_encoded_ciphertext",
  "iv": "base64_encoded_iv",
  "nonce": "unique_nonce_123456",
  "timestamp": "2025-12-02T19:49:30.849Z",
  "sequence": 42
}

Response 201:
{
  "success": true,
  "messageId": "msg_123456"
}
```

#### Get Messages
```http
GET /api/messages/conversation/:userId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "messages": [
    {
      "id": "msg_123456",
      "sender": "507f1f77bcf86cd799439011",
      "receiver": "507f191e810c19729de860ea",
      "ciphertext": "base64_encoded_ciphertext",
      "iv": "base64_encoded_iv",
      "timestamp": "2025-12-02T19:49:30.849Z"
    }
  ]
}
```

### File Endpoints

#### Upload Encrypted File
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
- file: <encrypted file data>
- fileName: "document.pdf"
- receiverId: "507f191e810c19729de860ea"
- encryptionMetadata: { iv: "...", chunkSize: 1048576 }

Response 201:
{
  "success": true,
  "fileId": "file_789",
  "fileName": "document.pdf",
  "fileSize": 1024000
}
```

#### Download Encrypted File
```http
GET /api/files/download/:fileId
Authorization: Bearer <token>

Response 200:
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="encrypted_file"

<binary encrypted file data>
```

---

## 📁 Project Structure

```
secure-messaging-app/
│
├── frontend/                    # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── Chat.js         # Main chat interface
│   │   │   ├── FileList.js     # File listing component
│   │   │   ├── FileUpload.js   # File upload component
│   │   │   ├── Login.js        # Login form
│   │   │   ├── Register.js     # Registration form
│   │   │   └── Extrachat.js    # Additional chat features
│   │   ├── services/
│   │   │   ├── axiosConfig.js  # Axios configuration
│   │   │   ├── cryptoService.js # Cryptographic operations
│   │   │   └── fileService.js  # File handling
│   │   ├── App.js              # Main App component
│   │   ├── App.css             # Application styles
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   └── .env                    # Frontend environment variables
│
├── backend/                     # Node.js backend server
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── models/
│   │   ├── File.js             # File model
│   │   ├── KeyExchange.js      # Key exchange model
│   │   ├── Log.js              # Security log model
│   │   ├── Message.js          # Message model
│   │   └── User.js             # User model
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── files.js            # File handling routes
│   │   ├── keyExchange.js      # Key exchange routes
│   │   ├── logs.js             # Logging routes
│   │   ├── messages.js         # Messaging routes
│   │   └── users.js            # User management routes
│   ├── utils/
│   │   └── Logger.js           # Security logger utility
│   ├── uploads/                # Encrypted file storage
│   ├── logs/                   # Security audit logs
│   │   └── security.log
│   ├── ssl/                    # SSL certificates (production)
│   │   ├── server.key
│   │   └── server.cert
│   ├── server.js               # Express server entry point
│   ├── package.json
│   └── .env                    # Backend environment variables
│
├── attack-demos/                # Attack demonstration scripts
│   ├── mitm-attack.js          # MITM attack demo
│   ├── replay-attack.js        # Replay attack demo
│   └── README.md               # Attack demo documentation
│
├── threat-modeling/             # Security analysis documents
│   └── STRIDE-Analysis.md      # STRIDE threat model
│
├── docs/                        # Project documentation
│   ├── API.md                  # API documentation
│   ├── ARCHITECTURE.md         # Architecture diagrams
│   ├── SECURITY.md             # Security design document
│   └── SETUP.md                # Setup guide
│
├── tests/                       # Test suites
│   ├── unit/
│   ├── integration/
│   └── security/
│
├── .gitignore                   # Git ignore rules
├── package.json                 # Root package file
├── README.md                    # This file
└── PROJECT_REPORT.pdf           # Final project report
```

---

## 🔒 Security Considerations

### Production Deployment Checklist

#### Critical Security Requirements
- [ ] **HTTPS Everywhere:** Deploy with valid TLS certificate
- [ ] **Certificate Pinning:** Implement certificate pinning in client
- [ ] **Content Security Policy:** Add CSP headers
- [ ] **Rate Limiting:** Implement aggressive rate limiting
- [ ] **DDoS Protection:** Use Cloudflare or similar
- [ ] **Security Headers:** Add HSTS, X-Frame-Options, etc.
- [ ] **Input Validation:** Validate all user inputs
- [ ] **SQL Injection:** Already protected (using MongoDB + Mongoose)
- [ ] **XSS Protection:** Already protected (React auto-escaping)
- [ ] **CSRF Protection:** Implement CSRF tokens

#### Key Management
- [ ] **Private Key Security:** Keys stored only in IndexedDB
- [ ] **Key Rotation:** Implement periodic key rotation
- [ ] **Key Backup:** Provide encrypted backup mechanism
- [ ] **Key Recovery:** Implement social recovery or backup codes
- [ ] **Key Revocation:** Add key revocation mechanism

#### Monitoring & Logging
- [ ] **Centralized Logging:** Aggregate logs to SIEM
- [ ] **Anomaly Detection:** Monitor for unusual patterns
- [ ] **Alert System:** Set up real-time security alerts
- [ ] **Audit Trail:** Maintain complete audit logs
- [ ] **Log Retention:** Implement 90-day log retention policy

#### Compliance
- [ ] **GDPR:** Implement data privacy controls
- [ ] **Data Retention:** Define and enforce retention policies
- [ ] **Right to Deletion:** Allow users to delete all data
- [ ] **Privacy Policy:** Create comprehensive privacy policy
- [ ] **Terms of Service:** Define clear terms of service

### Known Vulnerabilities

#### High Priority
1. **No HTTPS in Development:** Currently using HTTP on localhost
   - **Impact:** Vulnerable to network sniffing
   - **Mitigation:** Deploy with HTTPS certificate

2. **No Forward Secrecy:** Long-term key compromise exposes all messages
   - **Impact:** Historical message disclosure
   - **Mitigation:** Implement Double Ratchet algorithm

3. **Metadata Leakage:** Server sees sender, receiver, timestamp
   - **Impact:** Communication patterns exposed
   - **Mitigation:** Implement sealed sender, onion routing

#### Medium Priority
4. **No Multi-Device Support:** Keys are device-specific
   - **Impact:** User cannot access from multiple devices
   - **Mitigation:** Implement secure key synchronization

5. **Browser Storage Security:** Keys in IndexedDB can be extracted
   - **Impact:** Physical device access compromises keys
   - **Mitigation:** Add additional encryption layer, biometric auth

6. **Large File Memory:** Files >50MB cause browser memory issues
   - **Impact:** Denial of service, crashes
   - **Mitigation:** Implement streaming encryption

#### Low Priority
7. **No Key Fingerprint Verification:** Trust on first use
   - **Impact:** MITM possible on first key exchange
   - **Mitigation:** Add QR code verification

8. **No Message Search:** Cannot search encrypted messages
   - **Impact:** Usability issue
   - **Mitigation:** Implement client-side searchable encryption

---

## 🐛 Known Issues

### Current Bugs
1. **Decryption Failure Message:** Sometimes shows "[Decryption failed]" even when keys are valid
   - **Status:** Investigating
   - **Workaround:** Refresh page and try again

2. **File Upload Timeout:** Large files (>30MB) sometimes timeout
   - **Status:** Known issue with current chunking implementation
   - **Workaround:** Keep files under 30MB

3. **Key Generation Slow:** Takes 5-10 seconds on slower devices
   - **Status:** Expected behavior (RSA-2048 generation)
   - **Workaround:** Use faster device or reduce key size (not recommended)

4. **Mobile Browser Compatibility:** IndexedDB not working on older iOS Safari
   - **Status:** Limited browser support
   - **Workaround:** Use Chrome or updated Safari

### Planned Fixes
- [ ] Optimize key generation using Web Workers
- [ ] Implement progressive file upload with resume capability
- [ ] Add better error messages for decryption failures
- [ ] Improve mobile browser compatibility

---

## 🤝 Contributing

This is an academic project, but contributions for educational purposes are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow existing code style
- Write descriptive commit messages
- Add comments for complex cryptographic operations
- Include unit tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Educational Use Disclaimer:**  
This project is developed for educational purposes as part of an Information Security course. While implementing industry-standard cryptographic algorithms, it has NOT been professionally audited and should NOT be used for protecting sensitive real-world communications.

---

## 👥 Authors

**Team Members:**
- **Member 1** - Frontend Development & Key Exchange Protocol
  - GitHub: [@member1](https://github.com/member1)
  - Contribution: 35%

- **Member 2** - Backend Development & Attack Demonstrations
  - GitHub: [@member2](https://github.com/member2)
  - Contribution: 33%

- **Member 3** - Cryptography Implementation & Documentation
  - GitHub: [@member3](https://github.com/member3)
  - Contribution: 32%

**Course:** Information Security - BSSE 7th Semester  
**Institution:** [Your University Name]  
**Semester:** Fall 2025  
**Instructor:** [Professor Name]

---

## 📞 Support

For issues, questions, or suggestions:
- 📧 Email: team@securemessaging.edu
- 🐛 GitHub Issues: [Create an issue](https://github.com/[username]/secure-messaging-app/issues)
- 📚 Documentation: [Read the docs](./docs/)

---

## 🙏 Acknowledgments

- **Cryptography References:**
  - Bruce Schneier - Applied Cryptography
  - Menezes, van Oorschot, Vanstone - Handbook of Applied Cryptography
  
- **Protocol Inspiration:**
  - Signal Protocol (Double Ratchet Algorithm)
  - TLS 1.3 Specification
  - WhatsApp End-to-End Encryption Whitepaper

- **Tools & Libraries:**
  - Web Crypto API - MDN Documentation
  - React.js Team
  - Express.js Community
  - MongoDB Team

- **Security Research:**
  - OWASP - Web Security Guidelines
  - NIST - Cryptographic Standards
  - Mozilla - Security Best Practices

---

## 📊 Project Statistics

```
Lines of Code:     ~8,500
Frontend:          ~3,200 lines (JavaScript + JSX + CSS)
Backend:           ~2,800 lines (Node.js + Express)
Documentation:     ~2,500 lines (Markdown)
Tests:             ~1,000 lines

Development Time:  15 weeks
Team Size:         3 members
Commits:           247+
Files:             67
```

---

**⚠️ Security Notice:**  
This implementation is for educational purposes. While it demonstrates secure cryptographic principles, it has not undergone professional security auditing. Do NOT use this code to protect real sensitive communications without proper security review and hardening.

**📱 Stay Secure!**  
Remember: Perfect security is impossible, but thoughtful design and implementation can provide strong practical security. Always use trusted, audited encryption tools for real-world sensitive communications.

---

*Last Updated: December 2025*  
*Version: 1.0.0*  
*Status: Academic Project - Final Submission*