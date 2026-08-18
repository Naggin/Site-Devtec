import { profile } from "../data";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>
          © {year} {profile.brand} · {profile.name}
        </p>
        <p>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          {" · "}
          <a href={`mailto:${profile.email}`}>E-mail</a>
        </p>
      </div>
    </footer>
  );
}
