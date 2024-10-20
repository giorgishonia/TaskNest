# TaskNest

TaskNest is a simple Todo List app built with React and Firebase, allowing users to manage tasks efficiently. It supports adding, toggling, and deleting tasks with real-time updates. Each user can sign in to manage their personal tasks.

## Features
- **User Authentication:** Firebase Authentication to handle user login/logout.
- **Real-time Todo Management:** Users can add, toggle, and delete tasks in real-time.
- **Responsive UI:** Responsive design with custom styling using UI components.

## Tech Stack
- **React:** Frontend framework.
- **Firebase:** Backend for authentication and Firestore database.
- **TypeScript:** Ensures type safety.
- **Vercel:** For deployment.

## Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js (v14 or later)
- Firebase account and project

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/tasknest.git
    cd tasknest
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up Firebase:**
    - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
    - Enable Firebase Authentication and Firestore Database.
    - Copy the Firebase config values and add them to your `.env` file.

    Create a `.env.local` file in the root directory and add the following:
    ```bash
    REACT_APP_FIREBASE_API_KEY=your-api-key
    REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
    REACT_APP_FIREBASE_PROJECT_ID=your-project-id
    REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    REACT_APP_FIREBASE_APP_ID=your-app-id
    ```

4. **Run the app:**
    ```bash
    npm start
    ```

### Firebase Setup

To correctly set up Firebase for TaskNest:

1. **Authentication:**
   - Navigate to **Authentication** in the Firebase console and enable email/password login.

2. **Firestore Database:**
   - Set up a Firestore database with a `todos` collection. Each document should have fields like `text`, `completed`, and `userId`.

### Project Structure

```bash
src/
│
├── components/
│   ├── ui/
│   ├── todo-list.tsx  # Todo list logic and component
│
├── lib/
│   └── utils.ts       # Helper functions
│
└── App.tsx            # Main entry point

