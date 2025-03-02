import { useState, useRef } from 'react';
import { studyService } from '../../services/api';

function CreateJoinPage() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [studies, setStudies] = useState([
    {
      id: 1,
      title: "알고리즘 스터디",
      description: "알고리즘 문제 풀이 및 코드 리뷰",
      currentMembers: 3,
      maxMembers: 6,
      status: "모집중"
    },
    {
      id: 2,
      title: "리액트 스터디",
      description: "리액트와 상태관리 라이브러리 학습",
      currentMembers: 4,
      maxMembers: 8,
      status: "모집중"
    },
  ]);

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
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
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

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStudyClick = (study) => {
    setSelectedStudy(study);
  };

  const handleBackToList = () => {
    setSelectedStudy(null);
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      {/* 탭 버튼 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => {
            setActiveTab('create');
            setSelectedStudy(null);
          }}
          style={{
            padding: '8px 24px',
            borderRadius: '4px',
            border: '1px solid #E5E5E5',
            backgroundColor: activeTab === 'create' ? '#FF0000' : '#FFFFFF',
            color: activeTab === 'create' ? '#FFFFFF' : '#000000',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          생성
        </button>
        <button
          onClick={() => {
            setActiveTab('join');
            setSelectedStudy(null);
          }}
          style={{
            padding: '8px 24px',
            borderRadius: '4px',
            border: '1px solid #E5E5E5',
            backgroundColor: activeTab === 'join' ? '#FF0000' : '#FFFFFF',
            color: activeTab === 'join' ? '#FFFFFF' : '#000000',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          참여
        </button>
      </div>

      {/* 스터디 생성 폼 */}
      {activeTab === 'create' && (
        <div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            스터디 정보를 입력해주세요.
          </h2>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '2rem',
            alignItems: 'center'
          }}>
            {/* 스터디 이름 */}
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '14px',
                color: '#666666',
                textAlign: 'center'
              }}>
                스터디 이름
              </label>
              <input
                type="text"
                placeholder="스터디 이름을 입력하세요."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
              />
            </div>

            {/* 구분선 */}
            <div style={{
              width: '1px',
              height: '80px',
              backgroundColor: '#FF0000'
            }} />

            {/* 스터디 소개 */}
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '14px',
                color: '#666666',
                textAlign: 'center'
              }}>
                스터디 소개
              </label>
              <textarea
                placeholder="스터디를 소개해주세요."
                style={{
                  width: '100%',
                  height: '200px',
                  padding: '12px',
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  resize: 'none',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
              />
            </div>

            {/* 구분선 */}
            <div style={{
              width: '1px',
              height: '80px',
              backgroundColor: '#FF0000'
            }} />

            {/* 이미지 업로드 */}
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '14px',
                color: '#666666',
                textAlign: 'center'
              }}>
                이미지
              </label>
              <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
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
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                {previewUrl ? (
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%'
                  }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      style={{
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
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: '24px', marginBottom: '8px' }}>📷</span>
                    <span style={{ fontSize: '14px', textAlign: 'center' }}>
                      파일을 끌어서 놓거나<br/>
                      클릭하여 추가하세요.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 구분선 */}
            <div style={{
              width: '1px',
              height: '80px',
              backgroundColor: '#FF0000'
            }} />

            {/* 구글 폼 링크 */}
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '14px',
                color: '#666666',
                textAlign: 'center'
              }}>
                구글폼링크(선택)
              </label>
              <input
                type="url"
                placeholder="구글 폼 링크를 입력하세요."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'center'
                }}
              />
            </div>

            {/* 생성하기 버튼 */}
            <button
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '12px',
                backgroundColor: '#FF0000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              생성하기
            </button>
          </div>
        </div>
      )}

      {/* 스터디 참여 폼 */}
      {activeTab === 'join' && !selectedStudy && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <input
              type="text"
              placeholder="원하시는 스터디를 검색해주세요."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            {studies.map((study) => (
              <div
                key={study.id}
                onClick={() => handleStudyClick(study)}
                style={{
                  border: '1px solid #E5E5E5',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  ':hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <h3 style={{ fontSize: '16px', marginBottom: '0.5rem' }}>
                  {study.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666666',
                  marginBottom: '1rem' 
                }}>
                  {study.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <span>멤버: {study.currentMembers}/{study.maxMembers}명</span>
                  <span style={{ color: '#FF0000' }}>{study.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 스터디 상세 정보 */}
      {activeTab === 'join' && selectedStudy && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <button
              onClick={handleBackToList}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginRight: '1rem',
                fontSize: '14px',
                color: '#666666'
              }}
            >
              ← 목록으로
            </button>
            <h2 style={{ margin: 0 }}>스터디 상세</h2>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            <div>
              <h3 style={{
                fontSize: '14px',
                color: '#666666',
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                스터디 이름
              </h3>
              <div style={{
                padding: '1rem',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                {selectedStudy.title}
              </div>
            </div>

            <div style={{
              width: '1px',
              height: '80px',
              backgroundColor: '#FF0000',
              margin: '0 auto'
            }} />

            <div>
              <h3 style={{
                fontSize: '14px',
                color: '#666666',
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                스터디 소개
              </h3>
              <div style={{
                padding: '1rem',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                minHeight: '200px',
                textAlign: 'center'
              }}>
                {selectedStudy.description}
              </div>
            </div>

            <div style={{
              width: '1px',
              height: '80px',
              backgroundColor: '#FF0000',
              margin: '0 auto'
            }} />

            <div>
              <h3 style={{
                fontSize: '14px',
                color: '#666666',
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                구글폼링크
              </h3>
              {selectedStudy.googleFormLink ? (
                <a
                  href={selectedStudy.googleFormLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '1rem',
                    border: '1px solid #E5E5E5',
                    borderRadius: '4px',
                    textAlign: 'center',
                    color: '#FF0000',
                    textDecoration: 'none'
                  }}
                >
                  구글폼 바로가기
                </a>
              ) : (
                <div style={{
                  padding: '1rem',
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  textAlign: 'center',
                  color: '#666666'
                }}>
                  구글폼 링크가 없습니다.
                </div>
              )}
            </div>

            <button
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#FF0000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              신청하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateJoinPage; 