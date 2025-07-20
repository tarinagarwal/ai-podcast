import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mic2, AlertTriangle, RefreshCw } from "lucide-react";
import { podcastService } from "./services/api";
import { Podcast, CreatePodcastRequest } from "./types/podcast";
import { useAuth } from "./contexts/AuthContext";
import PodcastForm from "./components/PodcastForm";
import PodcastCard from "./components/PodcastCard";
import PodcastModal from "./components/PodcastModal";
import Header from "./components/Header";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Check server health
  useEffect(() => {
    const checkServer = async () => {
      const isOnline = await podcastService.checkHealth();
      setServerStatus(isOnline ? "online" : "offline");
    };

    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch podcasts
  const {
    data: podcasts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["podcasts"],
    queryFn: () => podcastService.getAllPodcasts(),
    refetchInterval: 5000, // Refetch every 5 seconds to get status updates
    enabled: serverStatus === "online",
  });

  // Create podcast mutation
  const createMutation = useMutation({
    mutationFn: podcastService.createPodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      setShowForm(false);
    },
  });

  // Delete podcast mutation
  const deleteMutation = useMutation({
    mutationFn: podcastService.deletePodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
    },
  });

  const handleCreatePodcast = (data: CreatePodcastRequest) => {
    createMutation.mutate(data);
  };

  const handleDeletePodcast = (id: number) => {
    if (confirm("Are you sure you want to delete this podcast?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewPodcast = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
  };

  // Don't render anything if not authenticated (ProtectedRoute handles this)
  if (!isAuthenticated) {
    return null;
  }

  if (serverStatus === "offline") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Server Offline
          </h2>
          <p className="text-gray-600 mb-4">
            The AI Podcast server is not running. Please start the server with:
          </p>
          <code className="bg-gray-100 px-3 py-2 rounded block text-sm">
            cd server && npm run dev
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header
        serverStatus={serverStatus}
        isLoading={isLoading}
        onRefresh={() => refetch()}
        onNewPodcast={() => setShowForm(!showForm)}
        showForm={showForm}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Form */}
        {showForm && (
          <div className="mb-8">
            <PodcastForm
              onSubmit={handleCreatePodcast}
              isLoading={createMutation.isPending}
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">
                Failed to load podcasts. Please try again.
              </p>
            </div>
          </div>
        )}

        {/* Podcasts Grid */}
        {!showForm && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Podcasts ({podcasts.length})
              </h2>
            </div>

            {isLoading && serverStatus === "checking" ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600">Loading podcasts...</span>
              </div>
            ) : podcasts.length === 0 ? (
              <div className="text-center py-12">
                <Mic2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No podcasts yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first AI-powered podcast
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Your First Podcast
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {podcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
                    podcast={podcast}
                    onDelete={handleDeletePodcast}
                    onView={handleViewPodcast}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Podcast Modal */}
      {selectedPodcast && (
        <PodcastModal
          podcast={selectedPodcast}
          isOpen={!!selectedPodcast}
          onClose={() => setSelectedPodcast(null)}
        />
      )}
    </div>
  );
}

export default App;
