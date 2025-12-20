'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

const filters = [
    { value: 'all', label: 'All' },
    { value: 'Cycling', label: 'Cycling' },
    { value: 'Running', label: 'Running' },
    { value: 'Multi', label: 'Multi / Endurance' },
]

export default function ArticleFilters({ activeFilter = 'all' }) {
    const router = useRouter()

    const handleFilter = (value) => {
        if (value === 'all') {
            router.push('/articles')
        } else {
            router.push(`/articles?filter=${value}`)
        }
    }

    return (
        <div className="filters">
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => handleFilter(filter.value)}
                    className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}
