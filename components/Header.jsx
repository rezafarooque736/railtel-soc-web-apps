import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 px-6 py-2 border-b text-slate-800 bg-slate-100">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Image
            alt="railtel logo"
            src="/railtel-logo.png"
            width={50}
            height={75}
            className="cursor-pointer"
            priority
          />
        </Link>
        <nav className="flex items-center gap-10 uppercase"></nav>
      </div>
    </header>
  );
}
