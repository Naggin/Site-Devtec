import { profile } from "../data";
import { useLanguage } from "../i18n/useLanguage";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>© {new Date().getFullYear()} Devtec · {profile.name}</p>
        <p>
          <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
          {" · "}
          <a href={`mailto:${profile.email}`}>{t.footer.email}</a>
        </p>
      </div>
    </footer>
  );
}
