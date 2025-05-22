# InCampus

InCampus is a social networking platform designed specifically for college students and faculty. It provides a space for academic communities to connect, share, and collaborate within a secure and focused environment.

## Features

### User Authentication
- Email-based registration and login
- OTP verification for account security
- Profile setup with university ID integration

### Social Networking
- **Friend Management System**
  - Send and receive friend requests
  - Accept/decline requests with intuitive UI
  - Unfriend option via dropdown menu
  - Friend suggestions based on department and year

- **Post Creation and Interaction**
  - Create posts with text and images
  - Like and comment on posts
  - Delete your own posts
  - Feed prioritizes friends' content

- **User Profiles**
  - Customizable profile information
  - Photo gallery in Collections tab
  - Dynamic statistics (posts, friends, likes)
  - Profile likes

- **Real-time Notifications**
  - Friend request notifications
  - Post like and comment alerts
  - Visual indicators for unread notifications
  - Notification management

### User Experience
- Responsive design for mobile and desktop
- Dark/light mode toggle
- Clean, intuitive interface
- Comprehensive search functionality

## Technical Implementation

### Frontend (React + TypeScript)
- Component-based architecture
- Context API for state management
- localStorage for data persistence
- Custom event system for cross-component communication

### Demo Credentials
For testing purposes, you can use:
- Email: `demo@incampus.edu`
- Password: `password123`
- OTP for all verification screens: `123456`

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/incampus.git
cd incampus
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
incampus/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── friends/      # Friend management components
│   │   │   ├── layout/       # Layout components (Navbar, etc.)
│   │   │   ├── notification/ # Notification components
│   │   │   ├── post/         # Post-related components
│   │   │   ├── search/       # Search functionality
│   │   │   └── ui/           # Reusable UI components
│   │   ├── contexts/         # React contexts for state management
│   │   ├── data/             # Mock data for development
│   │   ├── pages/            # Main application pages
│   │   ├── types/            # TypeScript type definitions
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Usage Guide

### Authentication
1. Register with your university email
2. Verify your account with the OTP sent to your email
3. Complete your profile setup

### Social Interaction
1. Add friends by searching for them or from suggestions
2. Create posts by clicking on "Capture your moment"
3. Like and comment on posts in your feed
4. View notifications by clicking the bell icon

### Profile Management
1. View your profile by clicking your avatar
2. Edit your profile information
3. View your posts, friends, and collections
4. Manage privacy settings

### Settings
1. Access settings from the dropdown menu
2. Update personal information
3. Change password with OTP verification
4. Delete account if needed (requires verification)

## Development Notes

### Local Storage
The application uses localStorage for data persistence in the demo version. In a production environment, this would be replaced with proper backend API calls.

### Mock Data
The application includes mock data for demonstration purposes. In a real deployment, this would be replaced with actual data from a backend.

### OTP Verification
For testing purposes, all OTP verifications accept `123456` as the valid code.

## Future Enhancements
- Real-time chat functionality
- Academic resource sharing
- Event creation and management
- Course discussion forums
- Integration with university systems

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- All the contributors who have helped build InCampus
- The university community for feedback and suggestions
