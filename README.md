# AI Podcast Studio

A comprehensive AI-powered podcast application that transforms your content into engaging two-person podcast conversations with realistic 3D avatar videos.

## Features

- **AI Script Generation**: Uses Groq LLM to create natural two-person podcast conversations
- **Text-to-Speech**: Groq TTS integration for realistic audio generation
- **3D Avatar Videos**: HeyGen API integration for professional avatar videos
- **Flexible Input**: Upload text files or paste content directly
- **Multiple Lengths**: Choose from Short (5-8 min), Medium (15-20 min), or Long (30-40 min)
- **Real-time Processing**: Track generation progress in real-time
- **Local Storage**: Audio and video files stored locally

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for development
- Tailwind CSS for styling
- TanStack Query for state management
- React Hook Form for form handling
- Lucide React for icons

### Backend
- Node.js + Express
- SQLite database with proper schema
- Groq SDK for AI script and audio generation
- HeyGen API for 3D avatar video generation
- Multer for file uploads

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Copy the `.env` file and add your API keys:

```bash
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# HeyGen API Configuration
HEYGEN_API_KEY=your_heygen_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DB_PATH=./server/database.sqlite
```

### 3. Get API Keys

1. **Groq API Key**: 
   - Sign up at [Groq Console](https://console.groq.com)
   - Create an API key in your dashboard

2. **HeyGen API Key**:
   - Sign up at [HeyGen](https://heygen.com)
   - Get your API key from the developer section

### 4. Start the Application

```bash
# Start both frontend and backend
npm run start:all

# Or start separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Usage

1. **Create a Podcast**:
   - Click "New Podcast" 
   - Enter title and description
   - Choose podcast length
   - Add your content (text or file upload)
   - Click "Create Podcast"

2. **Monitor Progress**:
   - Watch real-time status updates
   - Processing includes: Script → Audio → Video

3. **View Results**:
   - Click "View Details" to see the full podcast
   - Download audio and video files
   - Review the generated script

## API Endpoints

- `GET /api/podcasts` - List all podcasts
- `GET /api/podcasts/:id` - Get specific podcast
- `POST /api/podcasts` - Create new podcast
- `DELETE /api/podcasts/:id` - Delete podcast
- `GET /api/health` - Server health check

## Database Schema

```sql
CREATE TABLE podcasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  knowledge_base TEXT NOT NULL,
  length TEXT NOT NULL CHECK (length IN ('Short', 'Medium', 'Long')),
  script TEXT,
  audio_path TEXT,
  video_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## File Structure

```
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── App.tsx            # Main app component
├── server/                # Backend Express app
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Service utilities
│   └── index.js           # Server entry point
├── public/uploads/        # Generated files storage
│   ├── audio/             # Audio files
│   └── video/             # Video files
└── .env                   # Environment variables
```

## Development Notes

- The app uses SQLite for simplicity and local development
- File uploads are limited to 10MB
- Audio and video files are stored locally in `public/uploads/`
- Real-time status updates via polling every 5 seconds
- Error handling for all API operations

## Production Considerations

- Replace SQLite with PostgreSQL or MySQL for production
- Implement proper file storage (AWS S3, etc.)
- Add authentication and authorization
- Implement rate limiting
- Add proper logging and monitoring
- Configure CORS for production domains