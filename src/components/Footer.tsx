import { profile } from "../data";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>© {new Date().getFullYear()} Devtec · {profile.name}</p>
        <p>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          {" · "}
          <a href={`mailto:${profile.email}`}>E-mail</a>
        </p>
      </div>
    </footer>
  );
}
