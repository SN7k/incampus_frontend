import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { Image } from '../../types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface ImageGalleryProps {
  images: Image[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  if (!images || images.length === 0) {
    return null;
  }

  // If there's only one image, display it normally
  if (images.length === 1) {
    return (
      <div className="post-image-container">
        <img 
          src={images[0].url} 
          alt="Post content" 
          className="w-full rounded-lg object-cover max-h-[500px]"
          loading="lazy"
        />
      </div>
    );
  }

  // For multiple images (2-3), use Swiper
  return (
    <div className="post-gallery-container">
      <Swiper
        modules={[Pagination, Navigation]}
        pagination={{ clickable: true }}
        navigation={true}
        spaceBetween={10}
        slidesPerView={1}
        className="rounded-lg overflow-hidden"
        style={{ height: '400px' }} // Fixed height for consistent carousel size
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full">
              <img 
                src={image.url} 
                alt={`Post image ${index + 1}`} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageGallery; 