# 🏥 CareBridge

CareBridge is a **college team project** built using **Next.js**.
The aim of this project is to provide a simple healthcare platform where **patients and doctors can manage medical reports and health data digitally**.

---

## ✨ Project Highlights

* 📄 Upload medical reports (PDF / images)
* 🤖 Extract basic text and details from medical reports
* 🧑‍⚕️ Doctors can edit and update patient health metrics
* 🧑‍💻 Patients can view their medical information
* 🔐 Secure authentication and access control
* ☁️ Cloud storage for uploaded reports

---

## 🛠 Tech Stack

* ⚛️ Next.js (App Router)
* 🟦 TypeScript
* 🎨 Tailwind CSS
* 🗄 Prisma ORM
* 🐘 PostgreSQL
* ☁️ Vercel Blob Storage

---

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Environment Setup

Create a `.env` file in the root directory and add the required variables:

```env
DATABASE_URL=your_database_url
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### Run Database Migrations

```bash
npx prisma migrate dev
```

### Start Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

You can start editing the application by modifying files inside the `app/` directory. Changes will reflect automatically.

---

## 📁 Project Structure

```
carebridge/
├── app/
├── components/
├── lib/
├── prisma/
├── public/
└── README.md
```

---

## 🌐 Deployment

This project is deployed using **Vercel**.

```bash
vercel deploy
```

Deployment guide:
[https://nextjs.org/docs/app/building-your-application/deploying](https://nextjs.org/docs/app/building-your-application/deploying)

---

## 👥 Team Project

CareBridge is a **team-based college project**, developed collaboratively to gain hands-on experience in **full-stack web development** and modern web technologies.

---

🧹 ESLint Configuration Setup

ESLint is used to maintain code quality and enforce consistent coding standards across the project.

📦 Installation
npm install eslint --save-dev


For React projects:

npx eslint --init


Follow the setup prompts:

Choose JavaScript / TypeScript

Select React (if applicable)

Choose a style guide (Airbnb / Standard / None)

Select JSON format for configuration

📁 Configuration File

After setup, ESLint creates a configuration file:

.eslintrc.json (or .eslintrc.js)

Example:

{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}

▶️ Running ESLint

To check for errors:

npx eslint .

🚀 Deployment Verification

After deployment, the live application URL was tested to ensure successful build and hosting. All major features and API endpoints were verified to be functioning correctly in the production environment. Environment variables were properly configured, and no runtime errors were observed in logs. This confirms the application is successfully deployed and stable.

📝 Form Handling & Validation

Forms are handled using controlled components to manage user input through state. Input validation ensures required fields are filled and data formats (like email, password length, etc.) are correct before submission. Client-side validation improves user experience by preventing invalid data from being sent to the server. Error messages are displayed dynamically for better usability.

## 📜 License

This project is licensed under the **MIT License**.
