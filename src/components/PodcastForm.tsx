import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, FileText, Mic, Video, AlertCircle } from 'lucide-react';
import { CreatePodcastRequest } from '../types/podcast';

interface PodcastFormProps {
  onSubmit: (data: CreatePodcastRequest) => void;
  isLoading: boolean;
}

export default function PodcastForm({ onSubmit, isLoading }: PodcastFormProps) {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreatePodcastRequest>();

  const handleFormSubmit = (data: CreatePodcastRequest) => {
    onSubmit({
      ...data,
      knowledgeFile: knowledgeFile || undefined,
    });
    reset();
    setKnowledgeFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      setKnowledgeFile(file);
    } else {
      alert('Please select a valid text file (.txt)');
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create AI Podcast</h2>
        <p className="text-gray-600">Transform your content into an engaging two-person podcast</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Podcast Title *
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter podcast title..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of your podcast..."
          />
        </div>

        {/* Length */}
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">
            Podcast Length *
          </label>
          <select
            {...register('length', { required: 'Length is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select length...</option>
            <option value="Short">Short (5-8 minutes)</option>
            <option value="Medium">Medium (15-20 minutes)</option>
            <option value="Long">Long (30-40 minutes)</option>
          </select>
          {errors.length && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.length.message}
            </p>
          )}
        </div>

        {/* Knowledge Base Input Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Knowledge Base Input Method *
          </label>
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setInputMethod('text')}
              className={`flex items-center px-4 py-2 rounded-lg border ${
                inputMethod === 'text'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Type Text
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('file')}
              className={`flex items-center px-4 py-2 rounded-lg border ${
                inputMethod === 'file'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </button>
          </div>

          {inputMethod === 'text' ? (
            <div>
              <textarea
                {...register('knowledgeText', { 
                  required: inputMethod === 'text' ? 'Knowledge base content is required' : false 
                })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your content here... This will be used to generate the podcast conversation."
              />
              {errors.knowledgeText && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.knowledgeText.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">Choose a text file</span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1">TXT files up to 10MB</p>
              </div>
              {knowledgeFile && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ {knowledgeFile.name} selected
                </p>
              )}
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">What you'll get:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-500" />
              Two-person script
            </div>
            <div className="flex items-center">
              <Mic className="w-4 h-4 mr-2 text-green-500" />
              AI-generated audio
            </div>
            <div className="flex items-center">
              <Video className="w-4 h-4 mr-2 text-purple-500" />
              3D avatar video
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Podcast...
            </div>
          ) : (
            'Create Podcast'
          )}
        </button>
      </form>
    </div>
  );
}