import { useEffect, useState } from "react";
import { getCourses } from "../../api/fitness";
import { getErrorMessage } from "../../api/client";
import type { Course } from "../../types";
import { Header } from "../../components/Header/Header";
import { CourseCard } from "../../components/CourseCard/CourseCard";
import { Loader } from "../../components/Loader/Loader";

export function MainPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  return (
    <div className="page">
      <Header />

      <main>
        <section className="hero">
          <h1 className="heroTitle">
            <span>Начните заниматься спортом </span>
            <span>и улучшите качество жизни</span>
          </h1>
          <div className="heroSticker">
            <p>Измени свое
            
            тело за полгода!</p>
            < img className="heroArrow" src="src/assets/hero-arrow.svg" alt="Arrow" />
          </div>
          
        </section>

        {error && <p className="pageError">{error}</p>}

        {!error && courses.length === 0 ? (
          <Loader />
        ) : (
          <section className="coursesGrid">
            {courses
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
          </section>
        )}

        <button
          className="toTop"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Наверх ↑
        </button>
      </main>
    </div>
  );
}
