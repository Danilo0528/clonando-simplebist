'use client';

import Link from 'next/link';
import { FaHome } from 'react-icons/fa';

const Breadcrumb = ({ items }) => {
    return (
        <nav className="flex items-center text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li className="inline-flex items-center">
                    <Link href="/" className="inline-flex items-center text-xs font-medium text-gray-400 hover:text-white">
                        <FaHome className="mr-2"/>
                        Dashboard
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <span className="mx-2 text-gray-500">/</span>
                            <span className={`text-xs font-medium ${index === items.length - 1 ? 'text-gray-200' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
