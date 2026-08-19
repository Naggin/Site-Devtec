import { navItems } from "../data";

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a className="brand" href="#topo">
          Dev<em>tec</em>
          <span className="brand-dot" aria-hidden />
        </a>
        <nav className="nav" aria-label="Principal">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.href === "#contato" ? "nav-cta" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
