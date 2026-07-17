import { Link } from "react-router-dom";
import type { Course } from "../../types";
import { useAuth } from "../../context/AuthContext";

import yoga from "../../assets/courses/yoga.png";
import stretching from "../../assets/courses/stretching.png";
import fitness from "../../assets/courses/fitness.png";
import step from "../../assets/courses/step.png";
import bodyflex from "../../assets/courses/bodyflex.png";

import addIcon from "../../assets/Add-in-Circle.svg";
import removeIcon from "../../assets/Remove-in-Circle.svg";



const images: Record<string, string> = {
  Yoga: yoga,
  Stretching: stretching,
  Fitness: fitness,
  StepAirobic: step,
  BodyFlex: bodyflex,
};

interface CourseCardProps {
  course: Course;
  actionLabel?: string;
  onAction?: () => void;
  progress?: number;
}

export function getCourseImage(course: Course): string {
  return images[course.nameEN] ?? fitness;
}

export function CourseCard({
  course,
  actionLabel,
  onAction,
  progress,
}: CourseCardProps) {
  const { user } = useAuth();

const courseAdded =
  user?.selectedCourses?.includes(course._id) ?? false;
  return (
    <article className="courseCard">
      <Link to={`/course/${course._id}`} className="cardImageLink">
        <img src={getCourseImage(course)} alt={course.nameRU} />
       <img
  src={courseAdded ? removeIcon : addIcon}
  alt={courseAdded ? "Удалить курс" : "Добавить курс"}
  className="addIcon"
/>
      </Link>
      

      <div className="cardBody">
        <h2>{course.nameRU}</h2>

        <div className="courseMeta">
            <div className="courseMeta_calendar">
            <img src="src/assets/Calendar.svg" alt="Calendar" />
            <span>{course.durationInDays} дней</span>
            </div>
            <div className="courseMeta_time">
            <img src="src/assets/Time.svg" alt="Clock" />
            <span> 
            {course.dailyDurationInMinutes.from}-{course.dailyDurationInMinutes.to} мин/день
          </span>
            </div>
        </div>

        <div className="difficulty"> 
            <img src="src/assets/complexity.svg" alt="Level" />
            <span>{course.difficulty}</span>    
        </div>

        {typeof progress === "number" && (
          <>
            <p className="progressLabel">Прогресс {progress}%</p>
            <div className="progressTrack">
              <span style={{ width: `${progress}%` }} />
            </div>
          </>
        )}

        {actionLabel && (
          <button className="primaryButton cardAction" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
