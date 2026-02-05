import Link from 'next/link';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/dashboard">
      <div className="flex items-center gap-2 cursor-pointer">
        <Image src="/images/logo.svg" alt="SimpleBits Logo" width={28} height={28} />
        <span className="text-xl font-bold text-white tracking-wider">SimpleBits</span>
      </div>
    </Link>
  );
};

export default Logo;
