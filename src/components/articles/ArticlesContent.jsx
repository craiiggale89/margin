'use client'

import Link from 'next/link'
import ArticleFilters from '@/components/articles/ArticleFilters'

export default function ArticlesContent({ articles, filter }) {
    return (
        <div className="articles-page">
            <div className="container-content">
                <header className="page-header">
                    <h1 className="page-title">Articles</h1>
                </header>

                <ArticleFilters activeFilter={filter} />

                {articles.length > 0 ? (
                    <div className="article-list">
                        {articles.map((article) => (
                            <Link
                                key={article.id}
                                href={`/articles/${article.slug}`}
                                className="article-list-item"
                            >
                                <article>
                                    {article.contextLabel && (
                                        <span className="context-label">{article.contextLabel}</span>
                                    )}
                                    <h2 className="article-list-title">{article.title}</h2>
                                    <p className="article-list-standfirst">{article.standfirst}</p>
                                    <div className="article-list-meta">
                                        <span>{article.byline}</span>
                                        <span className="metadata-separator"></span>
                                        <span>{article.readingTime} min read</span>
                                        {article.publishedAt && (
                                            <>
                                                <span className="metadata-separator"></span>
                                                <span className="text-subtle">
                                                    {new Date(article.publishedAt).toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p className="text-muted">No articles published yet.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
        .articles-page {
          padding-top: var(--space-12);
          padding-bottom: var(--space-16);
        }
        
        .page-header {
          margin-bottom: var(--space-6);
        }
        
        .page-title {
          font-size: var(--text-4xl);
        }
        
        .article-list-item {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        
        .empty-state {
          padding: var(--space-16) 0;
          text-align: center;
        }
      `}</style>
        </div>
    )
}
