import { useEffect, useState } from "react";

function Studies() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        const response = await fetch("/studies");
        if (!response.ok) {
          throw new Error("Failed to fetch studies");
        }
        const data = await response.json();
        setStudies(data);
      } catch (error) {
        console.error("Error fetching studies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, []);

  if (loading) {
    return <div>Loading studies...</div>;
  }

  return (
    <>
      {error && <Error title="An error occurred" message={error} />}
      {!error && (
        <div className="studies-container">
          <h2>스터디 목록</h2>
          <div className="studies-list">
            {studies.map((study) => (
              <div key={study.id} className="study-item">
                <h3>{study.title}</h3>
                <p>참여 인원: {study.members}명</p>
                <p>상태: {study.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Studies;
