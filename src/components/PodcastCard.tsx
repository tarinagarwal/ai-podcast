import React from "react";
import {
  Clock,
  FileText,
  Mic,
  Video,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Podcast } from "../types/podcast";

interface PodcastCardProps {
  podcast: Podcast;
  onDelete: (id: number) => void;
  onView: (podcast: Podcast) => void;
}

export default function PodcastCard({
  podcast,
  onDelete,
  onView,
}: PodcastCardProps) {
  const getStatusIcon = () => {
    switch (podcast.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <RotateCcw className="w-5 h-5 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (podcast.status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing...";
      case "error":
        return "Error";
      default:
        return "Pending";
    }
  };

  const getLengthBadgeColor = () => {
    switch (podcast.length) {
      case "Short":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Long":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {podcast.title}
          </h3>
          {podcast.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {podcast.description}
            </p>
          )}

          <div className="flex items-center space-x-3 mb-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getLengthBadgeColor()}`}
            >
              {podcast.length}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Created: {new Date(podcast.created_at).toLocaleDateString()}
          </div>
        </div>

        <button
          onClick={() => onDelete(podcast.id)}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {podcast.status === "error" && podcast.error_message && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{podcast.error_message}</p>
        </div>
      )}

      {podcast.status === "completed" && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-1 text-blue-500" />
            Script
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mic className="w-4 h-4 mr-1 text-green-500" />
            Audio
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Video className="w-4 h-4 mr-1 text-purple-500" />
            Video
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => onView(podcast)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
        >
          View Details
        </button>

        {podcast.status === "completed" && (
          <>
            {podcast.audio_path && (
              <a
                href={`http://localhost:3001${podcast.audio_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors duration-200"
              >
                Audio
              </a>
            )}
            {podcast.video_path && (
              <a
                href={`http://localhost:3001${podcast.video_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors duration-200"
              >
                Video
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
