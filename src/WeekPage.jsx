import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import ApiContext from "./context/ApiContext";

export default function WeekPage() {
  const { id } = useParams();
  const { fetchWeekById } = useContext(ApiContext);

  const [week, setWeek] = useState(null);

  useEffect(() => {
    if (id) {
      // EDIT MODE
      loadExisting();
    } else {
      // CREATE MODE
      setWeek({
        weekStartDate: "",
        plans: {} 
      });
    }
  }, [id]);

  const loadExisting = async () => {
    const data = await fetchWeekById(id);
    setWeek(data);
  };

  if (!week) return <div>Loading...</div>;

  return (
    <WeekPlannerGrid 
      week={week}
      onAction={handleUpdate}
    />
  );
}
