import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import NoticeList from '../notice/NoticeList';

function NoticeTab({ userRole = "MEMBER" }) {
  const { studyId } = useParams();
  
  return <NoticeList studyId={studyId} userRole={userRole} />;
}

NoticeTab.propTypes = {
  userRole: PropTypes.string
};

export default NoticeTab; 