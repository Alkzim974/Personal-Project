import React from 'react';

interface CardImageProps {
  src?: string;
  alt: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const sizeClasses = {
  small: 'w-8 h-10',
  medium: 'w-12 h-16',
  large: 'w-16 h-24'
};

export function CardImage({ src, alt, className = '', size = 'medium' }: CardImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src || '/placeholder-card.svg');
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (src && src !== imageSrc) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, imageSrc]);

  const handleError = () => {
    console.log(`Erreur de chargement d'image pour ${alt}, utilisation du placeholder`);
    setImageSrc('/placeholder-card.svg');
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover rounded transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleError}
        onLoad={handleLoad}
      />
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 rounded animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
} 