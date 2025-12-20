'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/agent', label: 'Dashboard', exact: true },
    { href: '/agent/pitches', label: 'My Pitches' },
    { href: '/agent/pitches/new', label: 'Submit Pitch' },
    { href: '/agent/drafts', label: 'My Drafts' },
]

export default function AgentNav() {
    const pathname = usePathname()

    const isActive = (item) => {
        if (item.exact) {
            return pathname === item.href
        }
        return pathname === item.href || pathname.startsWith(item.href + '/')
    }

    return (
        <nav>
            <ul className="admin-nav">
                {navItems.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={`admin-nav-item ${isActive(item) ? 'active' : ''}`}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
