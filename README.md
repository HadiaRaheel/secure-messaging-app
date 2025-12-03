# 🔐 Secure End-to-End Encrypted Messaging System

End-to-end encrypted messaging and file-sharing application with zero-knowledge architecture. The server never has access to plaintext messages or files.

**Team:** Unzila Anjum (22i-2550), Eshal Omar (22i-2402), Hadia (22i-2700)  
**Course:** Information Security - FAST NUCES

---

## ⚡ Quick Start

### Prerequisites
- Node.js v16+
- MongoDB v4.4+
- Modern browser with Web Crypto API

### Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/yourusername/secure-messaging-app.git
cd secure-messaging-app

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Configure environment variables:**

Backend `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/secure-messaging
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
REACT_APP_USE_HTTPS=false
```

Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_USE_HTTPS=false
```

3. **Start MongoDB:**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

4. **Run the application:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

Access at: `http://localhost:3000`

---

🎯 Overview
This project implements a zero-knowledge end-to-end encrypted (E2EE) messaging and file-sharing system where:
•	Messages and files never exist in plaintext outside sender/receiver devices
•	The server cannot decrypt or view any user content
•	Hybrid cryptography combines RSA-2048 and AES-256-GCM
•	Custom authenticated key exchange protocol prevents MITM attacks
•	Comprehensive security logging and audit trails
•	Demonstrated attack resistance against MITM and replay attacks
Key Principles
✅ Confidentiality: Only intended recipients can decrypt content
✅ Integrity: Messages cannot be tampered without detection
✅ Authenticity: Digital signatures verify sender identity
✅ Forward Secrecy: Compromised keys don't reveal past messages
✅ Zero-Knowledge Server: Server stores only encrypted ciphertext

## 🔒 Key Features

- **End-to-End Encryption:** AES-256-GCM for messages and files
- **Zero-Knowledge Server:** Server never sees plaintext
- **Custom Key Exchange:** ECDH + RSA signatures prevent MITM attacks
- **Replay Protection:** Nonces, timestamps, and sequence numbers
- **Security Logging:** Complete audit trail of all security events

---

## 🛠️ Tech Stack

**Frontend:** React, Web Crypto API, IndexedDB  
**Backend:** Node.js, Express, MongoDB  
**Security:** RSA-2048, ECDH P-256, AES-256-GCM, bcrypt, JWT

---

## 🧪 Testing

### Run Attack Demos
```bash
cd attack-demos
node mitm-attack.js      # MITM demonstration
node replay-attack.js    # Replay attack demo
```

## 📄 License
This project is submitted as part of an academic requirement for the Information Security course at FAST-NUCES. All rights reserved by the project team.
**Academic Use Only** - This project is intended for educational purposes. Do not use in production without thorough security audit and proper implementation of production-grade security measures.