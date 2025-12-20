'use client'

export default function AboutPage() {
    return (
        <div className="about-page">
            <div className="container-content">
                <header className="about-header">
                    <h1 className="about-title">About Margin</h1>
                </header>

                <div className="about-content article-body">
                    <p className="standfirst">
                        Margin is a magazine about performance in sport.
                    </p>

                    <p>
                        We publish writing on how performance is built, expressed, and sometimes undone.
                        Our focus is on preparation, decision-making, context, and time.
                    </p>

                    <p>
                        While our roots are in endurance sport, our interests extend more broadly.
                        We are drawn to the systems, habits, environments, and choices that shape
                        success long before results are visible.
                    </p>

                    <h2>What we cover</h2>

                    <p>Margin looks at performance across the full cycle.</p>

                    <p>
                        <strong>Preparation</strong><br />
                        Training philosophy, nutrition, recovery, equipment, culture, and the long-term
                        decisions that shape readiness for individuals and teams.
                    </p>

                    <p>
                        <strong>Expression</strong><br />
                        Competition, tactics, pacing, and performance under pressure. Why events unfold
                        the way they do.
                    </p>

                    <p>
                        <strong>Aftermath</strong><br />
                        Fatigue, adaptation, injury, confidence, decline, and what performance leaves
                        behind once competition is over.
                    </p>

                    <p>
                        Our work is grounded in real events, lived experience, and historical context.
                        We are as interested in how successful athletes and teams are built as we are
                        in how races are won. We also look back, examining past eras, equipment,
                        innovations, and ideas that continue to influence performance today.
                    </p>

                    <h2>How we work</h2>

                    <p>Margin is selective by design.</p>

                    <p>
                        All pieces begin as pitches. We publish fewer articles than most sports sites
                        and take time choosing what to run. Insight matters more than speed. Clarity
                        matters more than volume.
                    </p>

                    <p>
                        We treat performance as a system shaped by decisions, constraints, environments,
                        and time—not just talent or effort.
                    </p>

                    <h2>Who it's for</h2>

                    <p>
                        Margin is for readers who care deeply about sport and want to understand how
                        performance actually works.
                    </p>

                    <p>
                        If you are interested in preparation as much as outcomes, in what makes athletes
                        and teams successful over time, and in how small margins shape results across
                        eras, you are in the right place.
                    </p>
                </div>
            </div>

            <style jsx>{`
        .about-page {
          padding-top: var(--space-16);
          padding-bottom: var(--space-16);
        }
        
        .about-header {
          margin-bottom: var(--space-12);
        }
        
        .about-title {
          font-size: var(--text-5xl);
        }
        
        .about-content h2 {
          margin-top: var(--space-12);
          margin-bottom: var(--space-4);
        }
        
        .about-content .standfirst {
          margin-bottom: var(--space-8);
        }
      `}</style>
        </div>
    )
}
