import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addCourse, getCourse } from "../../api/fitness";
import { getErrorMessage } from "../../api/client";
import type { Course } from "../../types";
import { Header } from "../../components/Header/Header";
import { Loader } from "../../components/Loader/Loader";
import { getCourseImage } from "../../components/CourseCard/CourseCard";
import { Modal } from "../../components/Modal/Modal";
import { AuthForm } from "../../components/AuthForm/AuthForm";
import { useAuth } from "../../context/AuthContext";
import runner from "../../assets/runner.png";

export function CoursePage() {
  const { courseId = "" } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    getCourse(courseId)
      .then(setCourse)
      .catch((e) => setError(getErrorMessage(e)));
  }, [courseId]);

  const add = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    try {
      await addCourse(courseId);
      await refreshUser();
      setMessage("Курс добавлен в профиль");
    } catch (e) {
      setMessage(getErrorMessage(e));
    }
  };

  if (!course) {
    return (
      <div className="page">
        <Header />
        {error ? <p className="pageError">{error}</p> : <Loader />}
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main>
        <section
          className="courseBanner"
          style={{
            backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.15),transparent),url(${getCourseImage(course)})`,
          }}
        >
          <h1>{course.nameRU}</h1>
        </section>

        <h2 className="sectionTitle">Подойдет для вас, если:</h2>
        <div className="fitGrid">
          {course.fitting.map((item, index) => (
            <div className="fitItem" key={item}>
              <b>{index + 1}</b>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <h2 className="sectionTitle">Направления</h2>
        <div className="directions">
          {course.directions.map((item) => (
            <span key={item}>＋ {item}</span>
          ))}
        </div>

        <section className="courseCta">
          <div>
            <h2>
              Начните путь
              <br />
              к новому телу
            </h2>
            <p>{course.description.slice(0, 220)}...</p>
            <button className="primaryButton" onClick={add}>
              {user?.selectedCourses.includes(courseId)
                ? "Курс уже в профиле"
                : "Добавить курс"}
            </button>
            {message && <p>{message}</p>}
          </div>

          <img src={runner} alt="Бегун" />
        </section>
      </main>

      {authOpen && (
        <Modal onClose={() => setAuthOpen(false)}>
          <AuthForm
            onSuccess={() => {
              setAuthOpen(false);
              add();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

