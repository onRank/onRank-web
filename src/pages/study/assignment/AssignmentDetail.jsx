import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const AssignmentDetail = () => {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // TODO: API 연동 후 과제 상세 정보 불러오기
    const fetchAssignmentDetail = async () => {
      // Temporary mock data
      setAssignment({
        id: id,
        title: '[기말 프로젝트]',
        dueDate: '2025.3.2',
        status: '진행중',
        description: '지시사항을 잘 읽고 프로젝트를 제출하세요.',
        submittedFile: null,
      });
    };

    fetchAssignmentDetail();
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    // TODO: API 연동 후 과제 제출 처리
    try {
      // const formData = new FormData();
      // formData.append('file', file);
      // await submitAssignment(id, formData);
      alert('과제가 성공적으로 제출되었습니다.');
    } catch (error) {
      alert('과제 제출에 실패했습니다.');
    }
  };

  if (!assignment) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <Header>
        <Title>{assignment.title}</Title>
        <DueDate>제출기한: {assignment.dueDate}</DueDate>
      </Header>
      <Content>
        <Section>
          <SectionTitle>지시사항</SectionTitle>
          <Description>{assignment.description}</Description>
        </Section>
        <Section>
          <SectionTitle>제출물</SectionTitle>
          {assignment.submittedFile ? (
            <SubmittedFile>
              <FileName>{assignment.submittedFile}</FileName>
              <SubmitDate>제출일: {assignment.submitDate}</SubmitDate>
            </SubmittedFile>
          ) : (
            <SubmissionForm>
              <FileInput
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
              <SubmitButton onClick={handleSubmit}>제출하기</SubmitButton>
            </SubmissionForm>
          )}
        </Section>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const DueDate = styled.div`
  color: #666;
  font-size: 14px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Description = styled.p`
  white-space: pre-wrap;
  line-height: 1.6;
`;

const SubmissionForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FileInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #0056b3;
  }
`;

const SubmittedFile = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const FileName = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
`;

const SubmitDate = styled.div`
  color: #666;
  font-size: 14px;
`;

export default AssignmentDetail; 