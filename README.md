# 📋 Student Attendance Tracker
## Full-Stack App — Deploy on AWS EC2

---

## 📁 Project Structure
```
attendance-tracker/
├── server.js              ← Express server (entry point)
├── package.json
├── routes/
│   ├── students.js        ← Add / Delete students API
│   └── attendance.js      ← Mark & Report attendance API
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## 🔌 API Endpoints
| Method | Route | Description |
|---|---|---|
| GET | `/health` | Server health check |
| GET | `/api/students` | List all students |
| POST | `/api/students` | Add a student |
| DELETE | `/api/students/:id` | Remove a student |
| GET | `/api/attendance/:date` | Get attendance for a date |
| POST | `/api/attendance/:date` | Save attendance for a date |
| GET | `/api/attendance/report/:studentId` | Student report |

---

## 🚀 Deploy on AWS EC2

### 1. Launch EC2
- AMI: **Ubuntu 22.04 LTS**
- Type: **t2.micro** (Free tier)
- Key pair: Download `.pem` file
- Allow **HTTP** in Security Group

### 2. Open Port 3000
EC2 → Security Group → Inbound Rules → Add:
- Type: Custom TCP | Port: **3000** | Source: `0.0.0.0/0`

### 3. SSH into EC2
```bash
chmod 400 my-key.pem
ssh -i my-key.pem ubuntu@YOUR-PUBLIC-IP
```

### 4. Install Node.js
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

### 5. Upload & Run
```bash
# Upload files (from your local machine)
scp -i my-key.pem -r ./attendance-tracker ubuntu@YOUR-PUBLIC-IP:~/

# On EC2
cd ~/attendance-tracker
npm install
npm start
```

### 6. Open in Browser
```
http://YOUR-EC2-PUBLIC-IP:3000
```

---

## 🔄 Keep Running with PM2
```bash
sudo npm install -g pm2
pm2 start server.js --name "attendance"
pm2 startup && pm2 save
```
