import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPencilAlt } from 'react-icons/fa';

function MyPage() {
  const [activeTab, setActiveTab] = useState('수정');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    school: user?.school || '',
    department: user?.department || ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // TODO: Implement profile update logic
    console.log('Update profile:', formData);
  };

  const handleDelete = () => {
    // TODO: Implement account deletion logic
    console.log('Delete account');
  };

  const InputWithPencil = ({ label, name, value, type = "text", placeholder }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '14px',
        color: '#000000'
      }}>
        {label}
      </label>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '12px',
            paddingRight: '40px',
            border: '1px solid #E5E5E5',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <FaPencilAlt 
          style={{
            position: 'absolute',
            right: '12px',
            color: '#666666',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setActiveTab('수정')}
            style={{
              padding: '8px 24px',
              backgroundColor: activeTab === '수정' ? '#FF0000' : '#EEEEEE',
              color: activeTab === '수정' ? '#FFFFFF' : '#000000',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            수정
          </button>
          <button
            onClick={() => setActiveTab('탈퇴')}
            style={{
              padding: '8px 24px',
              backgroundColor: activeTab === '탈퇴' ? '#FF0000' : '#EEEEEE',
              color: activeTab === '탈퇴' ? '#FFFFFF' : '#000000',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              borderRadius: '20px',
              outline: 'none'
            }}
          >
            탈퇴
          </button>
        </div>
        {activeTab === '수정' && (
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 24px',
              borderRadius: '4px',
              border: '1px solid #E5E5E5',
              backgroundColor: '#FF0000',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            저장하기
          </button>
        )}
      </div>

      {activeTab === '수정' ? (
        <div>
          <div style={{
            display: 'flex',
            gap: '3rem',
            marginBottom: '2rem'
          }}>
            <div style={{ flex: 1 }}>
              <InputWithPencil
                label="이름"
                name="name"
                value={formData.name}
              />
              <InputWithPencil
                label="전화번호"
                name="phoneNumber"
                value={formData.phoneNumber}
                type="tel"
              />
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '14px',
                  color: '#000000'
                }}>
                  소속(선택)
                </label>
                <InputWithPencil
                  name="school"
                  value={formData.school}
                  placeholder="학교"
                />
                <InputWithPencil
                  name="department"
                  value={formData.department}
                  placeholder="학과"
                />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '14px',
                color: '#000000'
              }}>
                프로필 사진
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  border: '1px solid #E5E5E5',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF'
                }}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#666666' }}>
                    <span style={{ fontSize: '24px', marginBottom: '8px', display: 'block' }}>🖼️</span>
                    <span style={{ fontSize: '14px' }}>
                      파일을 끌어서 놓거나<br/>
                      클릭하여 추가하세요.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          marginTop: '4rem'
        }}>
          <p style={{
            marginBottom: '2rem',
            color: '#666666'
          }}>
            정말로 탈퇴하시겠습니까?
          </p>
          <button
            onClick={handleDelete}
            style={{
              padding: '12px 24px',
              backgroundColor: '#FF0000',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            탈퇴하기
          </button>
        </div>
      )}
    </div>
  );
}

export default MyPage; 