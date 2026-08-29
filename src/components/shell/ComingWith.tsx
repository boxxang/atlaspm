'use client';

/**
 * A view the shell routes to but does not fill yet.
 *
 * The shell had to go up before the screens that live in it, so every nav entry
 * routes from the first phase. Rather than an empty page or a screen that looks
 * finished and is not, each says which phase brings it and what it will be —
 * the alternative is a demo that quietly implies more than has been built.
 */
export function ComingWith({
  title,
  phase,
  children,
}: {
  title: string;
  phase: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="pview-head">
        <h1 className="pview-title">{title}</h1>
      </header>
      <div className="pview-body">
        <p className="pview-todo">
          <span className="pview-phase">{phase}</span>
          {children}
        </p>
      </div>
    </>
  );
}
