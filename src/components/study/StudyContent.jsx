import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { format } from 'date-fns';

function StudyContent({ activeTab, studyData }) {
  const [assignments, setAssignments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);
  const { studyId } = useParams();
  const [managementTab, setManagementTab] = useState('회원'); // 관리 탭 내부 탭 (회원, 스터디, 보증금)
  
  // 일정 추가 상태
  const [showAddSchedulePopup, setShowAddSchedulePopup] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleRound, setScheduleRound] = useState(1);

  useEffect(() => {
    if (activeTab === '과제') {
      // TODO: API 연동 후 과제 목록 불러오기
      setAssignments([
        {
          id: 1,
          title: '[기말 프로젝트]',
          dueDate: '2025.3.2',
          status: '진행중',
        },
        {
          id: 2,
          title: '[중간 프로젝트]',
          dueDate: '2025.2.1',
          status: '완료',
          score: '10/10',
        },
      ]);
    }
  }, [activeTab]);

  // 회원 목록 가져오기
  useEffect(() => {
    if (activeTab === '관리' && managementTab === '회원') {
      fetchMembers();
    }
  }, [activeTab, managementTab, studyId]);

  // 회원 목록 API 호출 함수
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/studies/${studyId}/management/member`);
      console.log('회원 목록 조회 결과:', response.data);
      setMembers(response.data || []);
    } catch (err) {
      console.error('회원 목록 조회 오류:', err);
      setError('회원 목록을 불러오는데 실패했습니다.');
      // 개발 중에는 임시 데이터 사용
      setMembers([
        { studentId: 1, studentName: '회원1', studentEmail: 'member1@example.com' },
        { studentId: 2, studentName: '회원2', studentEmail: 'member2@example.com' },
        { studentId: 3, studentName: '회원3', studentEmail: 'member3@example.com' },
        { studentId: 4, studentName: '회원4', studentEmail: 'member4@example.com' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 회원 추가 함수
  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberEmail.trim()) {
      setAddMemberError('이메일을 입력해주세요.');
      return;
    }
    
    if (!newMemberEmail.includes('@')) {
      setAddMemberError('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    
    setAddingMember(true);
    setAddMemberError(null);
    
    try {
      const response = await api.post(`/studies/${studyId}/management/member/add`, {
        studentEmail: newMemberEmail.trim()
      });
      
      console.log('회원 추가 결과:', response.data);
      
      // 회원 목록 새로고침
      fetchMembers();
      
      // 팝업 닫기
      setShowAddMemberPopup(false);
      setNewMemberEmail('');
    } catch (err) {
      console.error('회원 추가 오류:', err);
      setAddMemberError('회원 추가에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAddingMember(false);
    }
  };
  
  // 팝업 닫기 함수
  const handleClosePopup = () => {
    setShowAddMemberPopup(false);
    setNewMemberEmail('');
    setAddMemberError(null);
  };

  // 일정 추가 팝업 열기
  const handleOpenAddSchedulePopup = () => {
    setShowAddSchedulePopup(true);
    setScheduleRound(schedules.length > 0 ? schedules[schedules.length - 1].round + 1 : 1);
  };

  // 일정 추가 팝업 닫기
  const handleCloseAddSchedulePopup = () => {
    setShowAddSchedulePopup(false);
    setScheduleTitle('');
    setScheduleDescription('');
  };

  // 일정 추가 제출
  const handleSubmitSchedule = () => {
    // 새 일정 객체 생성
    const newSchedule = {
      id: schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) + 1 : 1,
      round: scheduleRound,
      date: format(new Date(), 'yyyy.MM.dd'),
      content: `${scheduleRound}회차 - ${scheduleTitle}\n${scheduleDescription}`
    };

    // 일정 목록에 추가
    setSchedules([...schedules, newSchedule]);
    
    // 팝업 닫기
    handleCloseAddSchedulePopup();
  };

  const renderScheduleContent = () => (
    <div style={{ width: '100%', position: 'relative', marginTop: '3rem' }}>
      {/* 일정 추가 버튼 */}
      <div style={{
        position: 'absolute',
        top: '-3rem',
        right: 0,
        zIndex: 1
      }}>
        <button
          onClick={handleOpenAddSchedulePopup}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#FF0000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          일정 추가
        </button>
      </div>
      
      {schedules.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#666666',
          border: '1px dashed #E5E5E5',
          borderRadius: '4px'
        }}>
          등록된 일정이 없습니다. 일정 추가 버튼을 눌러 새 일정을 추가해보세요.
        </div>
      ) : (
        <>
          {schedules.map((schedule) => (
            <div 
              key={schedule.id}
              style={{
                marginBottom: '2rem',
                width: '100%',
                border: '1px solid #E5E5E5',
                borderRadius: '4px',
                padding: '1.5rem'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '1px',
                  height: '16px',
                  backgroundColor: '#FF0000',
                  marginRight: '0.5rem'
                }} />
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {schedule.round}회차
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#666666',
                  marginLeft: '1rem'
                }}>
                  {schedule.date}
                </span>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#333333',
                whiteSpace: 'pre-line',
                lineHeight: '1.6'
              }}>
                {schedule.content}
              </div>
            </div>
          ))}
        </>
      )}
      
      {/* 일정 추가 모달 */}
      {showAddSchedulePopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '1.5rem',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              일정 추가
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                일정 제목
              </label>
              <input
                type="text"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="일정 제목을 입력하세요"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                일정 설명
              </label>
              <textarea
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
                placeholder="일정에 대한 설명을 입력하세요"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                날짜
              </label>
              <input
                type="text"
                value={format(new Date(), 'yyyy.MM.dd')}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                회차
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <button
                  onClick={() => setScheduleRound(Math.max(1, scheduleRound - 1))}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '120px'
                  }}
                >
                  - 이전 회차
                </button>
                <div style={{
                  padding: '0.75rem',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {scheduleRound} 회차
                </div>
                <button
                  onClick={() => setScheduleRound(scheduleRound + 1)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '120px'
                  }}
                >
                  다음 회차 +
                </button>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={handleCloseAddSchedulePopup}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                취소하기
              </button>
              <button
                onClick={handleSubmitSchedule}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#FF0000',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAssignmentContent = () => (
    <div style={{ width: '100%' }}>
      <div style={{
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold'
        }}>과제</h1>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {assignments.map((assignment) => (
          <div 
            key={assignment.id}
            style={{
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
          >
            <h2 style={{
              fontSize: '18px',
              marginBottom: '12px'
            }}>{assignment.title}</h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#666'
            }}>
              <span style={{ fontSize: '14px' }}>{assignment.dueDate}</span>
              <span style={{
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0'
              }}>{assignment.status}</span>
              {assignment.score && (
                <span style={{
                  fontSize: '14px',
                  color: '#000',
                  fontWeight: 'bold'
                }}>{assignment.score}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDefaultContent = () => (
    <>
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        border: '1px solid #E5E5E5',
        borderRadius: '4px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          스터디 소개
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#666666',
          whiteSpace: 'pre-line'
        }}>
          {studyData?.description || "스터디 소개가 없습니다."}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem'
      }}>
        <div style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#F8F9FA',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '1rem'
          }}>
            보증금
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>0원</span>
          </div>
        </div>

        <div style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: '#FFF9C4',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '16px',
            marginBottom: '1rem'
          }}>
            상금
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>0원</span>
          </div>
        </div>
      </div>
    </>
  );

  // 관리 탭 컨텐츠 렌더링 함수
  const renderManageContent = () => (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        marginBottom: '1.5rem',
        color: '#333'
      }}>
        스터디 소개
      </h2>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => setManagementTab('스터디')}
            style={{
              backgroundColor: managementTab === '스터디' ? '#000000' : '#FFFFFF',
              color: managementTab === '스터디' ? 'white' : '#000',
              border: managementTab === '스터디' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            스터디
          </button>
          <button 
            onClick={() => setManagementTab('회원')}
            style={{
              backgroundColor: managementTab === '회원' ? '#000000' : '#FFFFFF',
              color: managementTab === '회원' ? 'white' : '#000',
              border: managementTab === '회원' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            회원
          </button>
          <button 
            onClick={() => setManagementTab('보증금')}
            style={{
              backgroundColor: managementTab === '보증금' ? '#000000' : '#FFFFFF',
              color: managementTab === '보증금' ? 'white' : '#000',
              border: managementTab === '보증금' ? 'none' : '1px solid #ddd',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            보증금
          </button>
        </div>
      </div>
      
      {/* 회원 관리 컨텐츠 */}
      {managementTab === '회원' && (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>회원 목록을 불러오는 중...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button 
                  onClick={() => setShowAddMemberPopup(true)}
                  style={{
                    backgroundColor: '#000000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="white"/>
                  </svg>
                  회원 추가
                </button>
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.studentId} style={{ borderBottom: '1px solid #E5E5E5' }}>
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>{member.studentName}</div>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#5C6BC0"/>
                              </svg>
                            </button>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9H18V10.5H6V9ZM3.5 11.5L6 14L8.5 11.5H7V8H5V11.5H3.5ZM6 13.5H18V15H6V13.5Z" fill="#E53935"/>
                                <path d="M19 3L5 3C3.9 3 3 3.9 3 5L3 19C3 20.1 3.9 21 5 21L19 21C20.1 21 21 20.1 21 19L21 5C21 3.9 20.1 3 19 3ZM19 19L5 19L5 5L19 5L19 19Z" fill="#E53935"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* 회원 추가 팝업 */}
              {showAddMemberPopup && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '2rem',
                    width: '400px',
                    maxWidth: '90%',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>회원 추가</h3>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        이메일
                      </label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="추가할 회원의 이메일을 입력하세요"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '1rem'
                        }}
                      />
                      {addMemberError && (
                        <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                          {addMemberError}
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <button
                        onClick={handleClosePopup}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        취소하기
                      </button>
                      <button
                        onClick={handleAddMember}
                        disabled={addingMember}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: 'none',
                          borderRadius: '4px',
                          backgroundColor: '#000',
                          color: 'white',
                          cursor: addingMember ? 'not-allowed' : 'pointer',
                          opacity: addingMember ? 0.7 : 1
                        }}
                      >
                        {addingMember ? '추가 중...' : '추가하기'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {/* 스터디 관리 컨텐츠 */}
      {managementTab === '스터디' && (
        <div style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>스터디 정보 관리</h3>
          <div style={{ 
            border: '1px solid #E5E5E5', 
            borderRadius: '8px', 
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>스터디 이름</label>
              <input 
                type="text" 
                value={studyData.title} 
                readOnly
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }} 
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>스터디 설명</label>
              <textarea 
                value={studyData.description} 
                readOnly
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  minHeight: '100px'
                }} 
              />
            </div>
            <button style={{
              backgroundColor: '#4263eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              정보 수정
            </button>
          </div>
          
          <div style={{
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            padding: '1.5rem',
            backgroundColor: '#fff5f5',
            marginTop: '2rem'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#e03131'
            }}>
              위험 영역
            </h3>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              스터디를 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            <button style={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}>
              스터디 삭제
            </button>
          </div>
        </div>
      )}
      
      {/* 보증금 관리 컨텐츠 */}
      {managementTab === '보증금' && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ 
            flex: 1, 
            padding: '2rem', 
            backgroundColor: '#f5f9f9', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>보증금</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <span role="img" aria-label="money" style={{ fontSize: '1.5rem' }}>💰</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>0원</span>
            </div>
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '2rem', 
            backgroundColor: '#fffde7', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>상금</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <span role="img" aria-label="money" style={{ fontSize: '1.5rem' }}>💰</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>0원</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    console.log('StudyContent - activeTab:', activeTab);
    
    switch (activeTab) {
      case '일정':
        return renderScheduleContent();
      case '과제':
        return renderAssignmentContent();
      case '관리':
        console.log('Rendering management content');
        return renderManageContent();
      case '공지사항':
      case '게시판':
      case '출석':
      case '랭킹':
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666666' }}>
            {activeTab} 탭 컨텐츠가 준비중입니다.
          </div>
        );
      default:
        console.log('Rendering default content');
        return renderDefaultContent();
    }
  };

  return (
    <div style={{ 
      flex: 1,
      minWidth: 0,
      paddingRight: '1rem'
    }}>
      {renderContent()}
    </div>
  );
}

StudyContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
  studyData: PropTypes.shape({
    description: PropTypes.string,
  }),
};

export default StudyContent; 