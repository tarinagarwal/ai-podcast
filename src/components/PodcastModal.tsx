import { X, FileText, Mic, Video, Download, Clock } from "lucide-react";
import { Podcast } from "../types/podcast";

interface PodcastModalProps {
  podcast: Podcast;
  isOpen: boolean;
  onClose: () => void;
}

export default function PodcastModal({
  podcast,
  isOpen,
  onClose,
}: PodcastModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{podcast.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Podcast Info */}
          <div className="mb-6">
            {podcast.description && (
              <p className="text-gray-600 mb-4">{podcast.description}</p>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {podcast.length} Length
              </span>
              <span>
                Created: {new Date(podcast.created_at).toLocaleDateString()}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  podcast.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : podcast.status === "processing"
                    ? "bg-blue-100 text-blue-800"
                    : podcast.status === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {podcast.status.charAt(0).toUpperCase() +
                  podcast.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Script */}
            {podcast.script && (
              <div>
                <div className="flex items-center mb-3">
                  <FileText className="w-5 h-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Generated Script
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {podcast.script}
                  </pre>
                </div>
              </div>
            )}

            {/* Audio */}
            {podcast.audio_path && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Mic className="w-5 h-5 text-green-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Generated Audio
                    </h3>
                  </div>
                  <a
                    href={`http://localhost:3001${podcast.audio_path}`}
                    download
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <audio controls className="w-full">
                    <source
                      src={`http://localhost:3001${podcast.audio_path}`}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {/* Video */}
            {podcast.video_path && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Video className="w-5 h-5 text-purple-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Generated Video
                    </h3>
                  </div>
                  <a
                    href={`http://localhost:3001${podcast.video_path}`}
                    download
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <video controls className="w-full max-w-2xl mx-auto">
                    <source
                      src={`http://localhost:3001${podcast.video_path}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video element.
                  </video>
                </div>
              </div>
            )}

            {/* Knowledge Base */}
            <div>
              <div className="flex items-center mb-3">
                <FileText className="w-5 h-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Source Knowledge Base
                </h3>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {podcast.knowledge_base}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
