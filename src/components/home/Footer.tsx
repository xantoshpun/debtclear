import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink px-6 py-12 dark:bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <span className="text-lg font-black tracking-tight text-white">
          DebtClear
        </span>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
          <a href="#how-it-works" className="hover:text-white">
            How it works
          </a>
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#household" className="hover:text-white">
            Track together
          </a>
          <Link href="/login" className="hover:text-white">
            Sign in
          </Link>
        </nav>
        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} DebtClear
        </p>
      </div>
    </footer>
  );
}
