'use client'

import Link from 'next/link'

export default function HomeContent({ featuredArticle, recentArticles }) {
    return (
        <div className="home-page">
            {/* Hero / Featured Article */}
            <section className="hero">
                <div className="container-content">
                    {featuredArticle ? (
                        <Link href={`/articles/${featuredArticle.slug}`} className="featured-article">
                            {featuredArticle.contextLabel && (
                                <span className="context-label">{featuredArticle.contextLabel}</span>
                            )}
                            <h1 className="featured-title">{featuredArticle.title}</h1>
                            <p className="featured-standfirst">{featuredArticle.standfirst}</p>
                            <div className="metadata">
                                <span>{featuredArticle.byline}</span>
                                <span className="metadata-separator"></span>
                                <span>{featuredArticle.readingTime} min read</span>
                            </div>
                        </Link>
                    ) : (
                        <div className="hero-empty">
                            <h1 className="hero-title">Margin</h1>
                            <p className="hero-tagline standfirst">
                                A magazine about performance in sport. We publish writing on how performance
                                is built, expressed, and sometimes undone.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Articles */}
            {recentArticles.length > 0 && (
                <section className="recent-section">
                    <div className="container-content">
                        <div className="article-list">
                            {recentArticles.map((article) => (
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
                                            <span>{article.readingTime} min read</span>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>

                        <div className="home-more">
                            <Link href="/articles" className="btn btn-secondary">
                                All articles
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <style jsx>{`
        .hero {
          padding-top: var(--space-20);
          padding-bottom: var(--space-16);
        }
        
        .featured-article {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        
        .featured-article:hover .featured-title {
          color: var(--color-accent);
        }
        
        .featured-title {
          font-size: clamp(var(--text-3xl), 6vw, var(--text-6xl));
          margin-top: var(--space-4);
          margin-bottom: var(--space-6);
          transition: color var(--transition-base);
        }
        
        .featured-standfirst {
          font-size: var(--text-xl);
          color: var(--color-text-secondary);
          line-height: var(--leading-normal);
          margin-bottom: var(--space-6);
        }
        
        .hero-empty {
          text-align: center;
          padding: var(--space-12) 0;
        }
        
        .hero-title {
          font-size: var(--text-6xl);
          margin-bottom: var(--space-6);
        }
        
        .hero-tagline {
          max-width: 540px;
          margin: 0 auto;
        }
        
        .recent-section {
          padding-bottom: var(--space-16);
        }
        
        .article-list-item {
          display: block;
          text-decoration: none;
          color: inherit;
        }
        
        .home-more {
          padding-top: var(--space-8);
          text-align: center;
        }
      `}</style>
        </div>
    )
}
