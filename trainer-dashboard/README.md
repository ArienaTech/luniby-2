# Pet Trainer Dashboard

A comprehensive dashboard application for pet trainers and behavior service providers to manage their business operations, client relationships, and training programs.

## Features

### 🏠 Dashboard Overview
- Business metrics and KPIs
- Upcoming appointments
- Recent client activity
- Monthly progress tracking
- Client retention analytics

### 👥 Client Management
- Comprehensive client profiles
- Pet information and medical history
- Contact details and emergency contacts
- Search and filter functionality
- Client activity tracking

### 📅 Schedule & Calendar
- Interactive monthly calendar view
- Appointment scheduling and management
- Session type categorization
- Status tracking (scheduled, completed, cancelled)
- Today's appointments sidebar

### 🎓 Training Sessions
- Session notes and progress tracking
- Training goals and achievements
- Homework assignments
- Session types (individual, group, behavioral, puppy, advanced)
- Progress visualization

### 💬 Messages
- Client communication system
- Real-time messaging interface
- Conversation history
- Unread message indicators
- File attachment support

### 💰 Invoice Management
- Invoice creation and tracking
- Payment status monitoring
- Service billing details
- Client payment history
- Overdue payment alerts

### 📊 Analytics & Reports
- Revenue and session trends
- Client retention metrics
- Session type distribution
- Performance insights
- Business growth analytics

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Routing**: React Router DOM
- **Build Tool**: Create React App

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trainer-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Project Structure

```
src/
├── components/
│   ├── Analytics/          # Analytics and reporting components
│   ├── Clients/           # Client management components
│   ├── Dashboard/         # Dashboard overview components
│   ├── Invoices/          # Invoice management components
│   ├── Layout/            # Layout components (Header, Sidebar)
│   ├── Messages/          # Messaging system components
│   ├── Schedule/          # Calendar and scheduling components
│   └── Sessions/          # Training session components
├── data/
│   └── mockData.ts        # Mock data for development
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Main application component
└── index.tsx              # Application entry point
```

## Key Components

### Dashboard Overview
- Real-time business metrics
- Visual progress indicators
- Quick access to important information

### Client Management
- Detailed client and pet profiles
- Search and filtering capabilities
- Emergency contact information
- Training history tracking

### Scheduling System
- Full calendar integration
- Drag-and-drop appointment management
- Multiple session types
- Status tracking and updates

### Training Sessions
- Comprehensive session tracking
- Progress notes and achievements
- Homework assignments
- Goal setting and monitoring

### Communication Tools
- In-app messaging system
- Client communication history
- File sharing capabilities
- Notification management

### Financial Management
- Invoice generation and tracking
- Payment status monitoring
- Revenue analytics
- Expense tracking

## Features for Pet Trainers

### Client & Pet Management
- Store detailed information about clients and their pets
- Track medical history and behavioral notes
- Manage emergency contacts
- Monitor client engagement

### Session Planning & Tracking
- Schedule different types of training sessions
- Record session notes and progress
- Set training goals and track achievements
- Assign homework and follow-up tasks

### Business Analytics
- Monitor revenue and session trends
- Track client retention rates
- Analyze session effectiveness
- Generate performance reports

### Communication
- Direct messaging with clients
- Automated appointment reminders
- Progress updates and reports
- File sharing for training materials

## Responsive Design

The dashboard is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## Future Enhancements

- Real-time notifications
- Payment processing integration
- Advanced reporting features
- Mobile app companion
- API integration for third-party services
- Automated scheduling
- Video call integration
- Training resource library

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact [support@trainerdashboard.com](mailto:support@trainerdashboard.com)

---

Built with ❤️ for pet trainers and behavior specialists