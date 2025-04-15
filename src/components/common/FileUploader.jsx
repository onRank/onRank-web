import React, { useState, useCallback, useRef } from 'react';
import { Box, Text, Flex, Button, Icon, useColorModeValue, VStack, HStack, IconButton, Tooltip, List, ListItem, Progress, useToast } from '@chakra-ui/react';
import { FiUpload, FiFile, FiX, FiDownload, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { formatFileSize, getFileIcon, getFileExtension } from '../../utils/fileUtils';

/**
 * 다목적 파일 업로드 컴포넌트
 * 
 * @param {Object} props
 * @param {Function} props.onFilesSelected - 파일 선택 시 호출될 콜백 함수(파일 배열을 인자로 받음)
 * @param {Array} props.acceptedTypes - 허용할 파일 타입 배열 (예: ['image/*', '.pdf', '.docx'])
 * @param {Array} props.existingFiles - 이미 업로드된 파일 목록 (선택적)
 * @param {Function} props.onFileRemove - 파일 제거 시 호출될 콜백 함수 (선택적)
 * @param {Function} props.onFileDownload - 파일 다운로드 시 호출될 콜백 함수 (선택적)
 * @param {number} props.maxFiles - 최대 파일 개수 (선택적)
 * @param {number} props.maxSizeInBytes - 최대 파일 크기(바이트) (선택적)
 * @param {boolean} props.multiple - 다중 파일 업로드 허용 여부 (선택적, 기본값: true)
 * @param {boolean} props.showFileList - 파일 목록 표시 여부 (선택적, 기본값: true)
 * @param {string} props.buttonText - 업로드 버튼 텍스트 (선택적)
 * @param {string} props.dropzoneText - 드롭존 텍스트 (선택적)
 * @param {boolean} props.isUploading - 업로드 중 여부
 * @param {number} props.uploadProgress - 업로드 진행률 (0-100)
 * @param {boolean} props.disabled - 비활성화 여부
 * @param {string} props.placeholder - 안내 텍스트
 */
const FileUploader = ({
  onFilesSelected,
  acceptedTypes = ['*'],
  existingFiles = [],
  onFileRemove,
  onFileDownload,
  maxFiles = 10,
  maxSizeInBytes = 10 * 1024 * 1024, // 기본 10MB
  multiple = true,
  showFileList = true,
  buttonText = '파일 선택',
  dropzoneText = '여기에 파일을 끌어다 놓거나 클릭하여 파일을 선택하세요',
  isUploading = false,
  uploadProgress = 0,
  disabled = false,
  placeholder = '파일을 여기에 끌어다 놓거나 클릭하여 선택하세요'
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const toast = useToast();
  
  // 색상 모드
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.600');
  const dragBgColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const errorColor = useColorModeValue('red.500', 'red.300');
  const progressColor = useColorModeValue('blue.500', 'blue.300');
  
  // 파일 형식 문자열 생성 (예: 'image/*, .pdf, .docx')
  const acceptString = acceptedTypes.join(', ');
  
  // 드래그 이벤트 핸들러
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      setIsDragging(true);
      setError(null);
    }
  }, [disabled]);
  
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragging(true);
    }
  }, [disabled]);
  
  // 파일 검증 함수
  const validateFiles = useCallback((fileList) => {
    const validatedFiles = [];
    const errors = [];
    
    Array.from(fileList).forEach(file => {
      // 최대 파일 개수 체크
      if (files.length + validatedFiles.length >= maxFiles) {
        errors.push(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        return false;
      }
      
      // 파일 크기 체크
      if (file.size > maxSizeInBytes) {
        errors.push(`${file.name}의 크기가 제한(${formatFileSize(maxSizeInBytes)})을 초과합니다.`);
        return false;
      }
      
      // 파일 타입 체크
      if (acceptedTypes.length > 0) {
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
        
        const isTypeAccepted = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            const category = type.slice(0, -2);
            return fileType.startsWith(category);
          }
          return type === fileType || type === fileExtension;
        });
        
        if (!isTypeAccepted) {
          errors.push(`${file.name}의 형식이 허용되지 않습니다.`);
          return false;
        }
      }
      
      validatedFiles.push(file);
    });
    
    if (errors.length > 0) {
      setError(errors[0]);
      return null;
    }
    
    setError(null);
    return validatedFiles;
  }, [files, maxFiles, maxSizeInBytes, acceptedTypes]);
  
  // 드롭 이벤트 핸들러
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled || isUploading) return;
    
    const droppedFiles = e.dataTransfer.files;
    
    const validFiles = validateFiles(droppedFiles);
    if (!validFiles) return;
    
    handleFileSelect(validFiles);
  }, [disabled, isUploading, validateFiles]);
  
  // 파일 선택 이벤트 핸들러
  const handleFileSelect = useCallback((newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    
    if (onFilesSelected) {
      onFilesSelected(newFiles, updatedFiles);
    }
  }, [files, onFilesSelected]);
  
  // 파일 입력 필드 변경 핸들러
  const handleFileInputChange = useCallback((e) => {
    const selectedFiles = e.target.files;
    
    const validFiles = validateFiles(selectedFiles);
    if (!validFiles) return;
    
    handleFileSelect(validFiles);
    
    // 파일 입력 리셋 (같은 파일 다시 선택 가능)
    e.target.value = '';
  }, [validateFiles, handleFileSelect]);
  
  // 파일 선택 버튼 클릭 핸들러
  const handleSelectClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };
  
  // 파일 제거 핸들러
  const handleFileRemove = useCallback((index) => {
    const updatedFiles = [...files];
    const removedFile = updatedFiles[index];
    updatedFiles.splice(index, 1);
    
    setFiles(updatedFiles);
    
    if (onFileRemove) {
      onFileRemove(removedFile, index, updatedFiles);
    }
  }, [files, onFileRemove]);
  
  // 파일 다운로드 핸들러
  const handleFileDownload = useCallback((file, index) => {
    if (onFileDownload) {
      onFileDownload(file, index);
    } else if (file.url) {
      // URL이 있는 경우 직접 다운로드
      window.open(file.url, '_blank');
    }
  }, [onFileDownload]);
  
  // 에러 제거 핸들러
  const handleClearError = () => {
    setError(null);
  };
  
  // 파일 목록 렌더링
  const renderFileList = useCallback(() => {
    if (!showFileList) return null;
    
    const allFiles = [
      ...existingFiles.map(file => ({ ...file, isExisting: true })),
      ...files.map(file => ({ file, isExisting: false }))
    ];
    
    if (allFiles.length === 0) return null;
    
    return (
      <Box mt={2}>
        <Text fontSize="sm" fontWeight="bold" mb={2}>
          선택된 파일 ({allFiles.length})
        </Text>
        <List spacing={2}>
          {allFiles.map((item, index) => {
            const file = item.isExisting ? item : item.file;
            const fileName = item.isExisting ? file.fileName : file.name;
            const fileSize = item.isExisting ? file.fileSize : file.size;
            
            return (
              <ListItem key={`${fileName}-${index}`}>
                <Flex
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius="md"
                  p={2}
                  alignItems="center"
                >
                  <Text fontSize="lg" mr={2}>
                    {getFileIcon(fileName)}
                  </Text>
                  <Box flex="1" overflow="hidden">
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {fileName}
                    </Text>
                    <Text fontSize="xs" color={textColor}>
                      {formatFileSize(fileSize)}
                    </Text>
                  </Box>
                  <Flex>
                    {(file.url || typeof onFileDownload === 'function') && (
                      <IconButton
                        icon={<FiDownload />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleFileDownload(file, index)}
                        aria-label="파일 다운로드"
                        mr={1}
                      />
                    )}
                    <IconButton
                      icon={<FiTrash2 />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleFileRemove(index - existingFiles.length)}
                      aria-label="파일 삭제"
                      isDisabled={isUploading}
                    />
                  </Flex>
                </Flex>
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  }, [
    showFileList, 
    existingFiles, 
    files, 
    borderColor, 
    textColor, 
    onFileDownload, 
    handleFileDownload, 
    handleFileRemove
  ]);
  
  return (
    <VStack width="100%" spacing={4} align="stretch">
      {/* 드롭존 */}
      <Box
        position="relative"
        borderWidth={2}
        borderStyle="dashed"
        borderColor={isDragging ? 'blue.400' : borderColor}
        borderRadius="md"
        bg={isDragging ? 'blue.50' : bgColor}
        p={6}
        textAlign="center"
        cursor={disabled ? 'not-allowed' : 'pointer'}
        opacity={disabled ? 0.6 : 1}
        _hover={{
          bg: !disabled ? 'blue.100' : undefined,
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
          accept={acceptString}
          multiple={multiple}
          disabled={disabled || isUploading}
        />
        
        <VStack spacing={3}>
          <Icon as={FiUpload} boxSize={10} color={isDragging ? 'blue.400' : 'gray.400'} />
          <Text>{placeholder}</Text>
          <Button 
            leftIcon={<FiPlus />} 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            isDisabled={disabled || isUploading}
          >
            {buttonText}
          </Button>
          
          {acceptedTypes[0] !== '*' && acceptedTypes[0] !== '*/*' && (
            <Text fontSize="sm" color={textColor}>
              허용 형식: {acceptString}
            </Text>
          )}
          
          <Text fontSize="sm" color={textColor}>
            최대 파일 크기: {formatFileSize(maxSizeInBytes)}
          </Text>
        </VStack>
        
        {isUploading && (
          <Box mt={4} width="100%">
            <Progress size="sm" value={uploadProgress} colorScheme="blue" />
            <Text mt={1} fontSize="sm" color="gray.500">
              업로드 중... {uploadProgress}%
            </Text>
          </Box>
        )}
      </Box>
      
      {/* 에러 메시지 */}
      {error && (
        <Flex 
          bg="red.50" 
          color={errorColor} 
          p={2} 
          borderRadius="md" 
          alignItems="center"
        >
          <Icon as={FiAlertCircle} mr={2} />
          <Text flex="1" fontSize="sm">{error}</Text>
          <IconButton
            icon={<FiX />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={handleClearError}
            aria-label="에러 닫기"
          />
        </Flex>
      )}
      
      {/* 파일 목록 */}
      {renderFileList()}
    </VStack>
  );
};

export default FileUploader; 