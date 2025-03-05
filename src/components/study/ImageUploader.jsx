import { useState } from 'react';

const styles = {
  container: {
    width: '100%',
    height: '200px',
    border: '1px dashed #E5E5E5',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#666666',
    position: 'relative',
    overflow: 'hidden'
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  uploadIcon: {
    fontSize: '24px', 
    marginBottom: '8px'
  },
  uploadText: {
    fontSize: '14px', 
    textAlign: 'center'
  }
};

function ImageUploader({ previewUrl, onImageChange, onRemoveImage, fileInputRef }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  const handleImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageFile(file);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={styles.container}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {previewUrl ? (
        <div style={styles.previewContainer}>
          <img
            src={previewUrl}
            alt="Preview"
            style={styles.previewImage}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveImage();
            }}
            style={styles.removeButton}
          >
            ×
          </button>
        </div>
      ) : (
        <>
          <span style={styles.uploadIcon}>📷</span>
          <span style={styles.uploadText}>
            파일을 끌어서 놓거나<br/>
            클릭하여 추가하세요.
          </span>
        </>
      )}
    </div>
  );
}

export default ImageUploader; 