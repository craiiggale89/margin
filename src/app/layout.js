// Trigger Vercel Deployment Hook
import '@/styles/globals.css'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export const metadata = {
    title: 'Margin',
    description: 'A magazine about performance in sport',
    openGraph: {
        title: 'Margin',
        description: 'A magazine about performance in sport',
        type: 'website',
    },
}

import AuthProvider from '@/components/providers/AuthProvider'
import StyledJsxRegistry from './registry'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>
                <AuthProvider>
                    <StyledJsxRegistry>
                        <Navigation />
                        <main>
                            {children}
                        </main>
                        <Footer />
                    </StyledJsxRegistry>
                </AuthProvider>
            </body>
        </html>
    )
}
