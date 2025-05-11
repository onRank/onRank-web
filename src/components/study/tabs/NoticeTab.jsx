import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import NoticeList from '../notice/NoticeList';

function NoticeTab({ userRole = "MEMBER" }) {
  const { studyId } = useParams();
  
  return (
    <>
      <h1 className="page-title">공지사항</h1>
      <NoticeList studyId={studyId} userRole={userRole} />
    </>
  );
}

NoticeTab.propTypes = {
  userRole: PropTypes.string
};

export default NoticeTab; 