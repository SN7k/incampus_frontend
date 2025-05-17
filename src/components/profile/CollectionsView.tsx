import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ZoomIn, Download, Heart, MessageCircle } from 'lucide-react';
import { Post } from '../../types';

interface CollectionsViewProps {
  posts: Post[];
}

const CollectionsView: React.FC<CollectionsViewProps> = ({ posts }) => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    post: Post;
  } | null>(null);
  
  // No longer using edit mode

  // Extract all images from posts
  const allImages = posts
    .filter(post => post.media && post.media.length > 0)
    .flatMap(post => 
      post.media!
        .filter(media => media.type === 'image')
        .map(media => ({
          url: media.url,
          post
        }))
    );

  // Group images by month and year
  const groupedImages: Record<string, { url: string; post: Post }[]> = {};
  
  allImages.forEach(image => {
    const date = new Date(image.post.createdAt);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!groupedImages[monthYear]) {
      groupedImages[monthYear] = [];
    }
    
    groupedImages[monthYear].push(image);
  });

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  // No longer using edit functionality
  
  return (
    <div className="py-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Photo Collections</h2>
      </div>
      {Object.keys(groupedImages).length > 0 ? (
        <>
          {Object.entries(groupedImages).map(([monthYear, images]) => (
            <div key={monthYear} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">{monthYear}</h3>
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {images.map((image, index) => (
                  <motion.div 
                    key={`${image.url}-${index}`}
                    className="aspect-square overflow-hidden rounded-lg cursor-pointer relative group"
                    variants={item}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img 
                      src={image.url} 
                      alt={`Photo from ${image.post.createdAt}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No photos yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Photos from posts will appear here
          </p>
        </div>
      )}

      {/* Album Creation Modal removed */}
      
      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
              <div className="w-full md:w-3/4 bg-black flex items-center justify-center">
                <img 
                  src={selectedImage.url} 
                  alt="Selected" 
                  className="max-h-[80vh] max-w-full object-contain"
                />
              </div>
              
              <div className="w-full md:w-1/4 p-4 flex flex-col">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={selectedImage.post.user.avatar} 
                    alt={selectedImage.post.user.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {selectedImage.post.user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(selectedImage.post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-800 dark:text-gray-200 mb-4">
                  {selectedImage.post.content}
                </p>
                
                <div className="flex space-x-4 mt-auto">
                  <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    <Heart size={18} className="mr-1" />
                    <span>{selectedImage.post.likes}</span>
                  </button>
                  <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    <MessageCircle size={18} className="mr-1" />
                    <span>{selectedImage.post.comments.length}</span>
                  </button>
                  <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 ml-auto">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsView;
