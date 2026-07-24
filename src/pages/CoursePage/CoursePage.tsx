import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { addCourse, getCourse } from "../../api/fitness";
import { getErrorMessage } from "../../api/client";
import type { Course } from "../../types";

import { Header } from "../../components/Header/Header";
import { Loader } from "../../components/Loader/Loader";
import { Modal } from "../../components/Modal/Modal";
import { AuthForm } from "../../components/AuthForm/AuthForm";

import { useAuth } from "../../context/AuthContext";

import runner from "../../assets/runner.png";
import runnerArc from "../../assets/runner-arc.svg";
import runnerGreen from "../../assets/green.svg";

import yogaBanner from "../../assets/banners/yoga-banner.png";
import stretchingBanner from "../../assets/banners/stretching-banner.png";
import fitnessBanner from "../../assets/banners/fitness-banner.png";
import stepBanner from "../../assets/banners/step-banner.png";
import bodyflexBanner from "../../assets/banners/bodyflex-banner.png";

import yogaCard from "../../assets/courses/yoga.png";
import stretchingCard from "../../assets/courses/stretching.png";
import fitnessCard from "../../assets/courses/fitness.png";
import stepCard from "../../assets/courses/step.png";
import bodyflexCard from "../../assets/courses/bodyflex.png";

type CourseImageKey =
  | "yoga"
  | "stretching"
  | "fitness"
  | "step"
  | "bodyflex";

const courseBanners: Record<CourseImageKey, string> = {
  yoga: yogaBanner,
  stretching: stretchingBanner,
  fitness: fitnessBanner,
  step: stepBanner,
  bodyflex: bodyflexBanner,
};

const courseMobileImages: Record<CourseImageKey, string> = {
  yoga: yogaCard,
  stretching: stretchingCard,
  fitness: fitnessCard,
  step: stepCard,
  bodyflex: bodyflexCard,
};

function getBannerKey(course: Course): CourseImageKey {
  const normalizedName = course.nameEN.trim().toLowerCase();

  if (normalizedName.includes("yoga")) {
    return "yoga";
  }

  if (normalizedName.includes("stretch")) {
    return "stretching";
  }

  if (normalizedName.includes("fitness")) {
    return "fitness";
  }

  if (normalizedName.includes("step")) {
    return "step";
  }

  if (normalizedName.includes("bodyflex")) {
    return "bodyflex";
  }

  return "yoga";
}

export function CoursePage() {
  const { courseId = "" } = useParams();

  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  const { user, refreshUser } = useAuth();

  useEffect(() => {
    let isActive = true;

    setError("");
    setCourse(null);
    setMessage("");

    getCourse(courseId)
      .then((loadedCourse) => {
        if (isActive) {
          setCourse(loadedCourse);
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setError(getErrorMessage(requestError));
        }
      });

    return () => {
      isActive = false;
    };
  }, [courseId]);

  const courseKey = useMemo<CourseImageKey>(() => {
    return course ? getBannerKey(course) : "yoga";
  }, [course]);

  const desktopBanner = courseBanners[courseKey];
  const mobileBanner = courseMobileImages[courseKey];

  const isCourseAdded = useMemo(() => {
    return user?.selectedCourses?.includes(courseId) ?? false;
  }, [courseId, user?.selectedCourses]);

  const handleAddCourse = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (!courseId || isCourseAdded || adding) {
      return;
    }

    setAdding(true);
    setMessage("");

    try {
      await addCourse(courseId);
      await refreshUser();
      setMessage("Курс добавлен в профиль");
    } catch (requestError: unknown) {
      setMessage(getErrorMessage(requestError));
    } finally {
      setAdding(false);
    }
  };

  if (!course) {
    return (
      <div className="page">
        <Header />

        <main>
          {error ? <p className="pageError">{error}</p> : <Loader />}
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main>
        <picture className="courseBanner">
          <source media="(max-width: 600px)" srcSet={mobileBanner} />

          <img
            src={desktopBanner}
            alt={`Курс «${course.nameRU}»`}
          />
        </picture>

        <section className="courseSection">
          <h2 className="sectionTitle">Подойдет для вас, если:</h2>

          <div className="fitGrid">
            {course.fitting.map((item, index) => (
              <article className="fitItem" key={`${item}-${index}`}>
                <b>{index + 1}</b>
                <span>{item}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="courseSection">
          <h2 className="sectionTitle">Направления</h2>

          <div className="directions">
            {course.directions.map((item, index) => (
              <span key={`${item}-${index}`}>✦ {item}</span>
            ))}
          </div>
        </section>

        <section className="courseCta">
          <div className="courseCtaContent">
            <h2>
              Начните путь
              <br />
              к новому телу
            </h2>

            <ul className="courseBenefits">
              {course.fitting.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>

            <button
              type="button"
              className="primaryButton courseCtaButton"
              onClick={handleAddCourse}
              disabled={adding || isCourseAdded}
            >
              {adding
                ? "Добавляем..."
                : isCourseAdded
                  ? "Курс уже в профиле"
                  : user
                    ? "Добавить курс"
                    : "Войдите, чтобы добавить курс"}
            </button>

            {message && (
              <p className="courseMessage" role="status">
                {message}
              </p>
            )}
          </div>

          <div className="courseCtaVisual" aria-hidden="true">
            <div className="courseCtaComposition">
              <img
                className="runnerGreen"
                src={runnerGreen}
                alt=""
              />

              <img
                className="runnerArc"
                src={runnerArc}
                alt=""
              />

              <img
                className="runnerImage"
                src={runner}
                alt=""
              />
            </div>
          </div>
        </section>
      </main>

      {authOpen && (
        <Modal onClose={() => setAuthOpen(false)}>
          <AuthForm
            onSuccess={() => {
              setAuthOpen(false);
              void handleAddCourse();
            }}
          />
        </Modal>
      )}
    </div>
  );
}