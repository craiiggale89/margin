'use client'

import Link from 'next/link'

export default function ArticleDetail({ article, relatedArticles }) {
    return (
        <article className="article-page">
            {/* Article Header */}
            <header className="article-header">
                <div className="container-content">
                    {article.contextLabel && (
                        <span className="context-label">{article.contextLabel}</span>
                    )}

                    <h1 className="article-title">{article.title}</h1>

                    <p className="article-standfirst">{article.standfirst}</p>

                    <div className="article-meta metadata">
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
                </div>
            </header>

            {/* Article Image (optional, max one) */}
            {article.imageUrl && (
                <figure className="article-image">
                    <div className="container-content">
                        <img src={article.imageUrl} alt="" />
                    </div>
                </figure>
            )}

            {/* Article Body */}
            <div className="article-content">
                <div className="container-content">
                    <div
                        className="article-body"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </div>
            </div>

            {/* More from Margin */}
            {relatedArticles.length > 0 && (
                <section className="more-from-margin">
                    <div className="container-content">
                        <h2 className="more-from-margin-title">More from Margin</h2>

                        <div className="related-articles">
                            {relatedArticles.map((related) => (
                                <Link
                                    key={related.id}
                                    href={`/articles/${related.slug}`}
                                    className="related-article"
                                >
                                    <article>
                                        {related.contextLabel && (
                                            <span className="context-label">{related.contextLabel}</span>
                                        )}
                                        <h3 className="related-title">{related.title}</h3>
                                        <p className="related-standfirst">{related.standfirst}</p>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <style jsx>{`
        .article-page {
          padding-bottom: var(--space-16);
        }
        
        .article-image {
          margin-bottom: var(--space-12);
        }
        
        .article-image img {
          width: 100%;
          height: auto;
        }
        
        .article-content {
          padding-bottom: var(--space-12);
        }
        
        .related-articles {
          display: grid;
          gap: var(--space-8);
        }
        
        .related-article {
          display: block;
          text-decoration: none;
          color: inherit;
          padding: var(--space-6);
          margin: 0 calc(-1 * var(--space-6));
          border-radius: 4px;
          transition: background-color var(--transition-fast);
        }
        
        .related-article:hover {
          background-color: var(--color-bg-alt);
        }
        
        .related-title {
          font-size: var(--text-xl);
          margin-top: var(--space-2);
          margin-bottom: var(--space-2);
          transition: color var(--transition-fast);
        }
        
        .related-article:hover .related-title {
          color: var(--color-accent);
        }
        
        .related-standfirst {
          font-size: var(--text-base);
          color: var(--color-text-secondary);
          line-height: var(--leading-normal);
          margin: 0;
        }
      `}</style>
        </article>
    )
}
