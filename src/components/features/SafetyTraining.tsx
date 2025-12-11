'use client';

import { useState } from 'react';
import { Play, CheckCircle, Clock, AlertTriangle, Shield, Award, ChevronRight, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface TrainingVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  category: 'safety' | 'compliance' | 'customer-service';
  required: boolean;
  completed: boolean;
}

const trainingVideos: TrainingVideo[] = [
  {
    id: 'safety-1',
    title: 'Road Safety Essentials',
    description: 'Learn essential road safety rules and traffic guidelines for delivery partners.',
    duration: '8:30',
    thumbnail: '/training/road-safety.jpg',
    category: 'safety',
    required: true,
    completed: false,
  },
  {
    id: 'safety-2',
    title: 'Handling Food Safely',
    description: 'Best practices for handling and transporting food items.',
    duration: '6:15',
    thumbnail: '/training/food-safety.jpg',
    category: 'safety',
    required: true,
    completed: true,
  },
  {
    id: 'safety-3',
    title: 'Emergency Procedures',
    description: 'What to do in case of accidents, emergencies, or SOS situations.',
    duration: '10:00',
    thumbnail: '/training/emergency.jpg',
    category: 'safety',
    required: true,
    completed: false,
  },
  {
    id: 'compliance-1',
    title: 'Alcohol Delivery Guidelines',
    description: 'Rules and regulations for delivering alcohol products safely.',
    duration: '7:45',
    thumbnail: '/training/alcohol.jpg',
    category: 'compliance',
    required: true,
    completed: false,
  },
  {
    id: 'compliance-2',
    title: 'Age Verification Process',
    description: 'Step-by-step guide to verify customer age for restricted products.',
    duration: '5:30',
    thumbnail: '/training/age-verify.jpg',
    category: 'compliance',
    required: true,
    completed: false,
  },
  {
    id: 'customer-1',
    title: 'Customer Communication',
    description: 'Tips for professional and friendly customer interactions.',
    duration: '4:20',
    thumbnail: '/training/communication.jpg',
    category: 'customer-service',
    required: false,
    completed: true,
  },
  {
    id: 'customer-2',
    title: 'Handling Complaints',
    description: 'How to handle difficult situations and customer complaints.',
    duration: '6:00',
    thumbnail: '/training/complaints.jpg',
    category: 'customer-service',
    required: false,
    completed: false,
  },
];

export default function SafetyTraining() {
  const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'safety' | 'compliance' | 'customer-service'>('all');

  const filteredVideos = activeCategory === 'all'
    ? trainingVideos
    : trainingVideos.filter(v => v.category === activeCategory);

  const completedCount = trainingVideos.filter(v => v.completed).length;
  const requiredCount = trainingVideos.filter(v => v.required).length;
  const requiredCompletedCount = trainingVideos.filter(v => v.required && v.completed).length;

  const playVideo = (video: TrainingVideo) => {
    setSelectedVideo(video);
    setShowModal(true);
    setIsPlaying(true);
  };

  const markAsComplete = () => {
    if (selectedVideo) {
      // In real app, update backend
      toast.success(`Completed: ${selectedVideo.title}`);
      setShowModal(false);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-6 w-6" />
          <h2 className="text-lg font-bold">Safety Training</h2>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-blue-100">Your Progress</span>
          <span className="font-semibold">{completedCount}/{trainingVideos.length} completed</span>
        </div>
        <div className="h-2 bg-blue-400/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${(completedCount / trainingVideos.length) * 100}%` }}
          />
        </div>
        {requiredCompletedCount < requiredCount && (
          <p className="text-xs text-amber-200 mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Complete {requiredCount - requiredCompletedCount} more required trainings
          </p>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'safety', label: 'Safety' },
          { id: 'compliance', label: 'Compliance' },
          { id: 'customer-service', label: 'Customer Service' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Video List */}
      <div className="space-y-3">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className={`bg-white rounded-lg border p-4 ${
              video.completed ? 'border-green-200 bg-green-50/50' : ''
            }`}
          >
            <div className="flex gap-3">
              {/* Thumbnail */}
              <div className="relative w-24 h-16 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  {video.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  ) : (
                    <Play className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{video.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{video.description}</p>
                  </div>
                  {video.required && !video.completed && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full flex-shrink-0">
                      Required
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </span>
                  <button
                    onClick={() => playVideo(video)}
                    className={`text-xs font-medium flex items-center gap-1 ${
                      video.completed ? 'text-green-600' : 'text-blue-600'
                    }`}
                  >
                    {video.completed ? 'Watch Again' : 'Start'}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certification Badge */}
      {requiredCompletedCount === requiredCount && (
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-4 text-white text-center">
          <Award className="h-12 w-12 mx-auto mb-2" />
          <h3 className="font-bold text-lg">Safety Certified!</h3>
          <p className="text-amber-100 text-sm">
            You&apos;ve completed all required safety trainings
          </p>
        </div>
      )}

      {/* Video Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setIsPlaying(false);
        }}
        title={selectedVideo?.title || ''}
        size="lg"
      >
        {selectedVideo && (
          <div className="space-y-4">
            {/* Video Player Placeholder */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {isPlaying ? (
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-3" />
                    <p className="text-sm">Playing video...</p>
                    <p className="text-xs text-gray-400 mt-1">(Demo - no actual video)</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <Play className="h-8 w-8 text-white ml-1" />
                  </button>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div>
              <p className="text-gray-600 text-sm">{selectedVideo.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedVideo.duration}
                </span>
                <span className="capitalize">{selectedVideo.category.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Action Button */}
            {!selectedVideo.completed && (
              <Button fullWidth onClick={markAsComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
