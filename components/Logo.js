import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/dashboard">
      <div className="flex items-center gap-2 cursor-pointer">
        <img src="/images/logo.svg" alt="SimpleBits Logo" className="h-7" />
        <span className="text-xl font-bold text-white tracking-wider">SimpleBits</span>
      </div>
    </Link>
  );
};

export default Logo;
