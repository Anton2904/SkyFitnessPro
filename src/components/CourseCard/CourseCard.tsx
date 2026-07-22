import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { addCourse, removeCourse } from "../../api/fitness";
import { getErrorMessage } from "../../api/client";

import yoga from "../../assets/courses/yoga.png";
import stretching from "../../assets/courses/stretching.png";
import fitness from "../../assets/courses/fitness.png";
import step from "../../assets/courses/step.png";
import bodyflex from "../../assets/courses/bodyflex.png";

import addIcon from "../../assets/Add-in-Circle.svg";
import removeIcon from "../../assets/Remove-in-Circle.svg";
import calendarIcon from "../../assets/Calendar.svg";
import clockIcon from "../../assets/Time.svg";
import levelIcon from "../../assets/complexity.svg";

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
  onCourseRemoved?: (courseId: string) => void;
}

export function getCourseImage(course: Course): string {
  return images[course.nameEN] ?? fitness;
}

export function CourseCard({
  course,
  actionLabel,
  onAction,
  progress,
  onCourseRemoved,
}: CourseCardProps) {
  const { user, refreshUser } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState("");

  const courseAdded = user?.selectedCourses?.includes(course._id) ?? false;

  const handleCourseAction = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      window.alert("Войдите в аккаунт, чтобы добавить курс");
      return;
    }

    if (updating) return;

    setUpdating(true);
    setActionError("");

    try {
      if (courseAdded) {
        await removeCourse(course._id);
        onCourseRemoved?.(course._id);
      } else {
        await addCourse(course._id);
      }

      await refreshUser();
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <article className="courseCard">
      <div className="cardImageWrap">
        <Link to={`/course/${course._id}`} className="cardImageLink">
          <img src={getCourseImage(course)} alt={course.nameRU} />
        </Link>

        <button
          type="button"
          className="courseIconButton"
          onClick={handleCourseAction}
          disabled={updating}
          aria-label={courseAdded ? "Удалить курс" : "Добавить курс"}
        >
          <img
            src={courseAdded ? removeIcon : addIcon}
            alt=""
            className="addIcon"
          />
        </button>
      </div>

      <div className="cardBody">
        <h2>{course.nameRU}</h2>

        <div className="courseMeta">
          <div className="courseMeta_calendar">
            <img src={calendarIcon} alt="" />
            <span>{course.durationInDays} дней</span>
          </div>

          <div className="courseMeta_time">
            <img src={clockIcon} alt="" />
            <span>
              {course.dailyDurationInMinutes.from}-
              {course.dailyDurationInMinutes.to} мин/день
            </span>
          </div>

          <div className="difficulty">
            <img src={levelIcon} alt="" />
            <span>{course.difficulty}</span>
          </div>
        </div>

        {typeof progress === "number" && (
          <div className="courseProgress" aria-label={`Прогресс курса ${progress}%`}>
            <p className="progressLabel">Прогресс курса: {progress}%</p>
            <div className="progressTrack">
              <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
          </div>
        )}

        {actionError && <p className="cardError">{actionError}</p>}

        {actionLabel && (
          <button className="primaryButton cardAction" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
