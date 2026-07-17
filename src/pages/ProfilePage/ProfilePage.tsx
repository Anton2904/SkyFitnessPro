import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  getCourseProgress,
  getCourses,
  getCourseWorkouts,
  removeCourse,
  resetCourse,
} from "../../api/fitness";
import { getErrorMessage } from "../../api/client";

import type {
  Course,
  CourseProgress,
  Workout,
  WorkoutProgress,
} from "../../types";

import { Header } from "../../components/Header/Header";
import { CourseCard } from "../../components/CourseCard/CourseCard";
import { Modal } from "../../components/Modal/Modal";
import { WorkoutPicker } from "../../components/WorkoutPicker/WorkoutPicker";

import { useAuth } from "../../context/AuthContext";
import profilePhoto from "../../assets/Profile-foto.svg";

interface WorkoutPickerState {
  courseId: string;
  workouts: Workout[];
}

export function ProfilePage() {
  const { user, loading, logout, refreshUser } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<
    Record<string, CourseProgress>
  >({});
  const [picker, setPicker] = useState<WorkoutPickerState | null>(null);

  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [openingCourseId, setOpeningCourseId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setProgress({});
      setPageLoading(false);
      return;
    }

    let isActive = true;

    const loadProfileCourses = async () => {
      setPageLoading(true);
      setError("");

      try {
        const allCourses = await getCourses();

        const selectedCourseIds = user.selectedCourses ?? [];

        const selectedCourses = allCourses.filter((course) =>
          selectedCourseIds.includes(course._id),
        );

        if (!isActive) {
          return;
        }

        setCourses(selectedCourses);

        const progressEntries = await Promise.all(
          selectedCourses.map(async (course) => {
            try {
              const courseProgress = await getCourseProgress(
                course._id,
              );

              return [course._id, courseProgress] as const;
            } catch {
              /*
               * Если прогресса по курсу ещё нет, сохраняем
               * безопасное начальное значение.
               */
              const emptyProgress: CourseProgress = {
                courseId: course._id,
                courseCompleted: false,
                workoutsProgress: [],
              };

              return [course._id, emptyProgress] as const;
            }
          }),
        );

        if (!isActive) {
          return;
        }

        setProgress(Object.fromEntries(progressEntries));
      } catch (requestError: unknown) {
        if (isActive) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isActive) {
          setPageLoading(false);
        }
      }
    };

    void loadProfileCourses();

    return () => {
      isActive = false;
    };
  }, [user]);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const getCourseProgressPercent = (course: Course): number => {
    const courseProgress = progress[course._id];

    const workoutsProgress =
      courseProgress?.workoutsProgress ?? [];

    if (workoutsProgress.length === 0) {
      return 0;
    }

    const completedWorkouts = workoutsProgress.filter(
      (workoutProgress) => workoutProgress.workoutCompleted,
    ).length;

    return Math.round(
      (completedWorkouts / workoutsProgress.length) * 100,
    );
  };

  const openWorkoutPicker = async (course: Course) => {
    if (openingCourseId) {
      return;
    }

    setOpeningCourseId(course._id);
    setError("");

    try {
      const workouts = await getCourseWorkouts(course._id);

      setPicker({
        courseId: course._id,
        workouts: workouts ?? [],
      });
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setOpeningCourseId(null);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    setError("");

    try {
      await removeCourse(courseId);
      await refreshUser();

      setCourses((currentCourses) =>
        currentCourses.filter(
          (course) => course._id !== courseId,
        ),
      );

      setProgress((currentProgress) => {
        const nextProgress = { ...currentProgress };
        delete nextProgress[courseId];
        return nextProgress;
      });
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    }
  };

  const handleResetCourse = async (courseId: string) => {
    setError("");

    try {
      await resetCourse(courseId);

      const updatedProgress = await getCourseProgress(courseId);

      setProgress((currentProgress) => ({
        ...currentProgress,
        [courseId]: {
          ...updatedProgress,
          workoutsProgress:
            updatedProgress.workoutsProgress ?? [],
        },
      }));
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    }
  };

  const selectedPickerProgress: WorkoutProgress[] =
    picker
      ? progress[picker.courseId]?.workoutsProgress ?? []
      : [];

  return (
    <div className="page">
      <Header />

      <main>
        <h1 className="profileTitle">Профиль</h1>

        <section className="profileCard">
          
               <img
                    src={profilePhoto}
                    alt="Профиль"
                    className="profileAvatar"
                />
          <div className="profileInfo">
            <h2>{user.email?.split("@")[0] || "Пользователь"}</h2>

            <p>Логин: {user.email}</p>

            <button
              type="button"
              className="secondaryButton compact"
              onClick={logout}
            >
              Выйти
            </button>
          </div>
        </section>

        <h2 className="sectionTitle">Мои курсы</h2>

        {error && <p className="pageError">{error}</p>}

        {pageLoading ? (
          <p>Загружаем курсы...</p>
        ) : (
          <>
            <section className="coursesGrid">
              {courses.map((course) => {
                const progressPercent =
                  getCourseProgressPercent(course);

                const isOpening =
                  openingCourseId === course._id;

                return (
                  <div
                    key={course._id}
                    className="profileCourse"
                  >
                    <CourseCard
                      course={course}
                      progress={progressPercent}
                      actionLabel={
                        isOpening
                          ? "Загрузка..."
                          : progressPercent > 0
                            ? "Продолжить"
                            : "Начать тренировку"
                      }
                      onAction={() => {
                        void openWorkoutPicker(course);
                      }}
                    />

                    <div className="courseTools">
                      <button
                        type="button"
                        onClick={() => {
                          void handleRemoveCourse(course._id);
                        }}
                      >
                        Удалить курс
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleResetCourse(course._id);
                        }}
                      >
                        Сбросить прогресс
                      </button>
                    </div>
                  </div>
                );
              })}
            </section>

            {courses.length === 0 && (
              <p>Вы еще не добавили курсы.</p>
            )}
          </>
        )}
      </main>

      {picker && (
        <Modal onClose={() => setPicker(null)}>
          <WorkoutPicker
            courseId={picker.courseId}
            workouts={picker.workouts}
            progress={selectedPickerProgress}
            onClose={() => setPicker(null)}
          />
        </Modal>
      )}
    </div>
  );
}