/*   ______      __ ____  _______       _  ____  _   _ 
 *  |  ____|   / / __ \|__   __|/\   | |/ __ \| \ | |
 *  | |__   _ / / |  | |  | |  /  \  | | |  | |  \| |
 *  |  __| | v /| |  | |  | | / /\ \ | | |  | | . ` |
 *  | |____ \ / | |__| |  | |/ ____ \| | |__| | |\  |
 *  |______| \_/ \____/   |_/_/    \_\_|\____/|_| \_|
 *                                                      
 */

/**
 * SEOHead Component - Per-page canonical URL and meta description.
 * 
 * --------------------------------------------------------------------------
 *                                  Functions
 * --------------------------------------------------------------------------
 * SEOHead: Renders page-specific SEO metadata.
 * 
 * --------------------------------------------------------------------------
 *                            Variables and others
 * --------------------------------------------------------------------------
 * BASE_URL: Base URL for canonical links.
 * 
 * --------------------------------------------------------------------------
 *                                   imports
 * --------------------------------------------------------------------------
 * react-helmet-async: Helmet for managing document head.
 */

import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://www.typelo.tech'

interface SEOHeadProps {
    description?: string
    path?: string
    noIndex?: boolean
}

export default function SEOHead({
    description = 'Typelo is a real-time 1v1 competitive typing game. Battle opponents, climb ELO rankings, and prove your typing skills.',
    path = '/',
    noIndex = false
}: SEOHeadProps) {
    const canonicalUrl = `${BASE_URL}${path}`

    return (
        <Helmet>
            <link rel="canonical" href={canonicalUrl} />
            <meta name="description" content={description} />
            {noIndex && <meta name="robots" content="noindex, nofollow" />}
        </Helmet>
    )
}
