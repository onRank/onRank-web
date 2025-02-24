import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api';

function UserInfoForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    studentName: user?.name || '',
    studentSchool: '',
    studentDepartment: '',
    studentPhoneNumber: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    // Check for tokens in localStorage that might have been set during the callback
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.log('[UserInfoForm] Stored tokens:', {
      accessToken: accessToken ? 'exists' : 'not found',
      refreshToken: refreshToken ? 'exists' : 'not found'
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const studentId = await authService.addUserInfo(formData);
      console.log('등록된 학생 ID:', studentId);
      window.location.href = '/';
    } catch (error) {
      console.error('회원정보 등록 실패:', error);
      setError(error.response?.data?.message || '회원정보 등록에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2D2D2D] rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          회원정보입력
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-200 text-sm font-medium mb-2">
              이름
            </label>
            <input
              type="text"
              value={formData.studentName}
              disabled
              className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-gray-200 text-sm font-medium mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.studentPhoneNumber}
              onChange={(e) => setFormData({
                ...formData,
                studentPhoneNumber: e.target.value
              })}
              className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="01012345678"
              required
              pattern="[0-9]{3}[0-9]{4}[0-9]{4}"
            />
          </div>

          <div className="border-t border-[#404040] pt-6 mt-6">
            <h2 className="text-gray-200 text-lg font-medium mb-4">소속(선택)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-200 text-sm font-medium mb-2">
                  학교
                </label>
                <input
                  type="text"
                  value={formData.studentSchool}
                  onChange={(e) => setFormData({
                    ...formData,
                    studentSchool: e.target.value
                  })}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="학교명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-gray-200 text-sm font-medium mb-2">
                  학과
                </label>
                <input
                  type="text"
                  value={formData.studentDepartment}
                  onChange={(e) => setFormData({
                    ...formData,
                    studentDepartment: e.target.value
                  })}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#404040] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="학과명을 입력하세요"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-8 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#2D2D2D]"
          >
            완료
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserInfoForm; 