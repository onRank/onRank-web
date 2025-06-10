import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Button,
} from '@mui/material';
import {
    Help as HelpIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Remove as RemoveIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { attendanceService } from '../../services/attendanceService';

const AttendanceStatus = {
    UNKNOWN: <HelpIcon sx={{ color: '#9E9E9E' }} />,
    PRESENT: <CheckCircleIcon sx={{ color: '#4CAF50' }} />,
    ABSENT: <CancelIcon sx={{ color: '#F44336' }} />,
    LATE: <RemoveIcon sx={{ color: '#FFC107' }} />,
};

const AttendancePage = () => {
    const { studyId } = useParams();
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [attendanceRate, setAttendanceRate] = useState(85); // 예시 출석률

    useEffect(() => {
        fetchAttendances();
    }, [studyId]);

    const fetchAttendances = async () => {
        try {
            const data = await attendanceService.getAttendances(studyId);
            setAttendances(data);
            setLoading(false);
        } catch (error) {
            console.error('출석 데이터를 불러오는데 실패했습니다:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (attendanceId, newStatus) => {
        try {
            await attendanceService.updateAttendanceStatus(studyId, attendanceId, newStatus);
            fetchAttendances(); // 목록 새로고침
        } catch (error) {
            console.error('출석 상태 변경에 실패했습니다:', error);
        }
    };

    if (loading) {
        return <Typography>로딩 중...</Typography>;
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    출석
                </Typography>

                {/* 스터디 진행 상태 */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        스터디 진행 상태
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            2025.3.24 '일정' 오늘 진행됩니다
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            9:00 AM
                        </Typography>
                        <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                            2025.3.24 '일정'이 곧 시작합니다
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            9:30 AM
                        </Typography>
                    </Box>
                </Paper>

                {/* 출석 현황 */}
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            출석 현황
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h6" color="primary">
                                {attendanceRate}
                            </Typography>
                            <Button variant="outlined" startIcon={<EditIcon />}>
                                수정
                            </Button>
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>일정</TableCell>
                                    <TableCell align="right">출석 상태</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendances.map((attendance) => (
                                    <TableRow key={attendance.attendanceId}>
                                        <TableCell>
                                            {attendance.scheduleTitle}
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(attendance.scheduleStartingAt).toLocaleDateString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => {
                                                    const statuses = ['UNKNOWN', 'PRESENT', 'ABSENT', 'LATE'];
                                                    const currentIndex = statuses.indexOf(attendance.attendanceStatus);
                                                    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                                    handleStatusUpdate(attendance.attendanceId, nextStatus);
                                                }}
                                            >
                                                {AttendanceStatus[attendance.attendanceStatus]}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </Container>
    );
};

export default AttendancePage;
