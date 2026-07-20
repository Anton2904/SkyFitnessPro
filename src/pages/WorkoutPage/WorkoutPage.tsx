import { useEffect, useState } from "react";
import {
  Navigate,
  useParams,
} from "react-router-dom";

import {
  getCourse,
  getWorkout,
  getWorkoutProgress,
  saveWorkoutProgress,
} from "../../api/fitness";
import { getErrorMessage } from "../../api/client";

import type {
  Course,
  Workout,
  WorkoutProgress,
} from "../../types";

import { Header } from "../../components/Header/Header";
import { Loader } from "../../components/Loader/Loader";
import { Modal } from "../../components/Modal/Modal";
import { ProgressForm } from "../../components/ProgressForm/ProgressForm";

import { useAuth } from "../../context/AuthContext";

export function WorkoutPage() {
  const { user, loading } = useAuth();

  const {
    courseId = "",
    workoutId = "",
  } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [progress, setProgress] =
    useState<WorkoutProgress | null>(null);

  const [progressModalOpen, setProgressModalOpen] =
    useState(false);

  const [successModalOpen, setSuccessModalOpen] =
    useState(false);

  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");

      const [courseData, workoutData, progressData] =
        await Promise.all([
          getCourse(courseId),
          getWorkout(workoutId),
          getWorkoutProgress(courseId, workoutId),
        ]);

      setCourse(courseData);
      setWorkout(workoutData);

      setProgress({
        ...progressData,
        progressData: progressData?.progressData ?? [],
      });
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    }
  };

  useEffect(() => {
    if (user) {
      void load();
    }
  }, [user, courseId, workoutId]);

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!workout || !course) {
    return (
      <div className="page">
        <Header />

        {error ? (
          <p className="pageError">{error}</p>
        ) : (
          <Loader />
        )}
      </div>
    );
  }

  const exercises = workout.exercises ?? [];
  const savedProgress = progress?.progressData ?? [];

  return (
    <div className="page">
      <Header />

      <main>
        <h1 className="workoutTitle">
          {course.nameRU}
        </h1>

        <div className="videoWrap">
          <iframe
            src={workout.video}
            title={workout.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <section className="exercisePanel">
          <h2>Упражнения тренировки</h2>

          <div className="exerciseGrid">
            {exercises.map((exercise, index) => {
              const value = savedProgress[index] ?? 0;
              const quantity = exercise.quantity ?? 0;

              const percent =
                quantity > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (value / quantity) * 100,
                      ),
                    )
                  : 0;

              return (
                <div key={exercise._id}>
                  <p>{exercise.name}</p>

                  <span>
                    {value} из {quantity}
                  </span>

                  <div className="progressTrack">
                    <span
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="primaryButton"
            onClick={() =>
              setProgressModalOpen(true)
            }
          >
            {savedProgress.some((value) => value > 0)
              ? "Обновить свой прогресс"
              : "Заполнить свой прогресс"}
          </button>
        </section>
      </main>

      {progressModalOpen && (
        <Modal
          onClose={() =>
            setProgressModalOpen(false)
          }
        >
          <ProgressForm
            workout={workout}
            initial={savedProgress}
            onSave={async (values) => {
              try {
                setError("");

                await saveWorkoutProgress(
                  courseId,
                  workoutId,
                  values,
                );

                await load();

                setProgressModalOpen(false);
                setSuccessModalOpen(true);
              } catch (requestError: unknown) {
                setError(
                  getErrorMessage(requestError),
                );
              }
            }}
          />
        </Modal>
      )}

      {successModalOpen && (
        <Modal
          onClose={() =>
            setSuccessModalOpen(false)
          }
        >
          <div className="progressSuccess">
            <h2 className="progressSuccessTitle">
              Ваш прогресс
              <br />
              засчитан!
            </h2>

            <div
              className="progressSuccessCheck"
              aria-hidden="true"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}