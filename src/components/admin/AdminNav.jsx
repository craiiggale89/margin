'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/pitches', label: 'Pitches' },
    { href: '/admin/drafts', label: 'Drafts' },
    { href: '/admin/articles', label: 'Articles' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/agents', label: 'Agents' },
]

export default function AdminNav() {
    const pathname = usePathname()

    const isActive = (item) => {
        if (item.exact) {
            return pathname === item.href
        }
        return pathname.startsWith(item.href)
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
