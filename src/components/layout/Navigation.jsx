'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
    const pathname = usePathname()

    const isActive = (path) => {
        if (path === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(path)
    }

    return (
        <nav className="nav">
            <div className="container-wide nav-inner">
                <Link href="/" className="nav-logo">
                    Margin
                </Link>

                <ul className="nav-links">
                    <li>
                        <Link
                            href="/"
                            className={`nav-link ${isActive('/') && pathname === '/' ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/articles"
                            className={`nav-link ${isActive('/articles') ? 'active' : ''}`}
                        >
                            Articles
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/about"
                            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
                        >
                            About
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
