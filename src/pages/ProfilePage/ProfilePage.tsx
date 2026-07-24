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
import { calculateCourseProgress } from "../../utils/progress";

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

  const [workoutsByCourse, setWorkoutsByCourse] = useState<
    Record<string, Workout[]>
  >({});

  const [picker, setPicker] =
    useState<WorkoutPickerState | null>(null);

  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const [openingCourseId, setOpeningCourseId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setProgress({});
      setWorkoutsByCourse({});
      setPageLoading(false);
      return;
    }

    let isActive = true;

    const loadProfileCourses = async () => {
      setPageLoading(true);
      setError("");

      try {
        const allCourses = await getCourses();

        const selectedCourseIds =
          user.selectedCourses ?? [];

        const selectedCourses = allCourses.filter(
          (course) =>
            selectedCourseIds.includes(course._id),
        );

        if (!isActive) {
          return;
        }

        setCourses(selectedCourses);

        const courseDataEntries = await Promise.all(
          selectedCourses.map(async (course) => {
            const [courseProgress, workouts] = await Promise.all([
              getCourseProgress(course._id).catch(() => ({
                courseId: course._id,
                courseCompleted: false,
                workoutsProgress: [],
              } as CourseProgress)),
              getCourseWorkouts(course._id).catch(() => [] as Workout[]),
            ]);

            return {
              courseId: course._id,
              progress: {
                ...courseProgress,
                workoutsProgress: courseProgress?.workoutsProgress ?? [],
              },
              workouts,
            };
          }),
        );

        if (!isActive) {
          return;
        }

        setProgress(
          Object.fromEntries(
            courseDataEntries.map((entry) => [entry.courseId, entry.progress]),
          ),
        );
        setWorkoutsByCourse(
          Object.fromEntries(
            courseDataEntries.map((entry) => [entry.courseId, entry.workouts]),
          ),
        );
      } catch (requestError: unknown) {
        if (isActive) {
          setError(
            getErrorMessage(requestError),
          );
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
    return calculateCourseProgress(
      workoutsByCourse[course._id] ?? [],
      progress[course._id],
    );
  };

  const openWorkoutPicker = async (
    course: Course,
  ) => {
    if (openingCourseId) {
      return;
    }

    setOpeningCourseId(course._id);
    setError("");

    try {
      const [
        workouts,
        freshCourseProgress,
      ] = await Promise.all([
        getCourseWorkouts(course._id),
        getCourseProgress(course._id),
      ]);

      const normalizedProgress: CourseProgress = {
        ...freshCourseProgress,
        workoutsProgress:
          freshCourseProgress?.workoutsProgress ?? [],
      };

      setProgress((currentProgress) => ({
        ...currentProgress,
        [course._id]: normalizedProgress,
      }));

      setWorkoutsByCourse((current) => ({
        ...current,
        [course._id]: workouts ?? [],
      }));

      setPicker({
        courseId: course._id,
        workouts: workouts ?? [],
      });
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(requestError),
      );
    } finally {
      setOpeningCourseId(null);
    }
  };

  const handleRemoveCourse = async (
    courseId: string,
  ) => {
    setError("");

    try {
      await removeCourse(courseId);
      await refreshUser();

      setCourses((currentCourses) =>
        currentCourses.filter(
          (course) =>
            course._id !== courseId,
        ),
      );

      setProgress((currentProgress) => {
        const nextProgress = { ...currentProgress };
        delete nextProgress[courseId];
        return nextProgress;
      });

      setWorkoutsByCourse((current) => {
        const next = { ...current };
        delete next[courseId];
        return next;
      });

      if (picker?.courseId === courseId) {
        setPicker(null);
      }
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(requestError),
      );
    }
  };

  const handleResetCourse = async (
    courseId: string,
  ) => {
    setError("");

    try {
      await resetCourse(courseId);

      const updatedProgress =
        await getCourseProgress(courseId);

      setProgress((currentProgress) => ({
        ...currentProgress,
        [courseId]: {
          ...updatedProgress,
          workoutsProgress:
            updatedProgress?.workoutsProgress ?? [],
        },
      }));
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(requestError),
      );
    }
  };

  const selectedPickerProgress: WorkoutProgress[] =
    picker
      ? progress[picker.courseId]
          ?.workoutsProgress ?? []
      : [];

  return (
    <div className="page">
      <Header />

      <main>
        <h1 className="profileTitle">
          Профиль
        </h1>

        <section className="profileCard">
          <img
            src={profilePhoto}
            alt="Профиль"
            className="profileAvatar"
          />

          <div className="profileInfo">
            <h2>
              {user.email?.split("@")[0] ||
                "Пользователь"}
            </h2>

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

        <h2 className="sectionTitle">
          Мои курсы
        </h2>

        {error && (
          <p className="pageError">
            {error}
          </p>
        )}

        {pageLoading ? (
          <p>Загружаем курсы...</p>
        ) : (
          <>
            <section className="coursesGrid">
              {courses.map((course) => {
                const progressPercent =
                  getCourseProgressPercent(
                    course,
                  );

                const isOpening =
                  openingCourseId ===
                  course._id;

                return (
                  <div
                    key={course._id}
                    className="profileCourse"
                  >
                    <CourseCard
                      course={course}
                      progress={
                        progressPercent
                      }
                      actionLabel={
                        isOpening
                          ? "Загрузка..."
                          : progressPercent >
                              0
                            ? "Продолжить"
                            : "Начать тренировку"
                      }
                      onAction={() => {
                        void openWorkoutPicker(course);
                      }}
                      onCourseRemoved={(courseId) => {
                        setCourses((current) =>
                          current.filter((item) => item._id !== courseId),
                        );
                      }}
                    />

                    <div className="courseTools">
                      <button
                        type="button"
                        onClick={() => {
                          void handleRemoveCourse(
                            course._id,
                          );
                        }}
                      >
                        Удалить курс
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleResetCourse(
                            course._id,
                          );
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
              <p>
                Вы еще не добавили курсы.
              </p>
            )}
          </>
        )}
      </main>

      {picker && (
        <Modal
          onClose={() =>
            setPicker(null)
          }
        >
          <WorkoutPicker
            courseId={picker.courseId}
            workouts={picker.workouts}
            progress={
              selectedPickerProgress
            }
            onClose={() =>
              setPicker(null)
            }
          />
        </Modal>
      )}
    </div>
  );
}