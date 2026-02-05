'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const Breadcrumb = () => {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(i => i);

    // Do not show breadcrumbs on the main dashboard page
    if (pathSegments.length <= 1 && (pathSegments[0] === 'dashboard' || pathSegments[0] === '')) {
        return null;
    }

    return (
        <nav className="text-sm text-gray-400" aria-label="Breadcrumb">
            <ol className="list-none p-0 inline-flex">
                <li className="flex items-center">
                    <Link href="/" className="hover:text-white">Dashboard</Link>
                </li>
                {pathSegments.map((segment, index) => {
                    const href = '/' + pathSegments.slice(0, index + 1).join('/');
                    const isLast = index === pathSegments.length - 1;
                    const name = segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                        <li key={href} className="flex items-center">
                            <span className="mx-2">/</span>
                            {isLast ? (
                                <span className="text-white font-semibold">{name}</span>
                            ) : (
                                <Link href={href} className="hover:text-white">{name}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
