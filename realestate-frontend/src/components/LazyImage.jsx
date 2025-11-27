// src/components/LazyImage.jsx
import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, className, placeholder }) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '/images/placeholder.jpg');
  const [imageRef, setImageRef] = useState();
  const imgRef = useRef();

  useEffect(() => {
    let observer;

    if (imgRef.current) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imgRef.current);
            }
          });
        },
        { rootMargin: '100px' }
      );
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

export default LazyImage;