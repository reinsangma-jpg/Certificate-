/**
 * ============================================================
 * CERTIFICATE CONFIGURATION
 * ============================================================
 *
 * Add future certificate templates here.
 *
 * 1. Upload the certificate image to:
 *    public/certificates/
 *
 * 2. Add an object below:
 *    {
 *      id: 'certificate-4',
 *      title: 'Your Certificate Title',
 *      template: '/certificates/certificate-4.svg'
 *    }
 *
 * 3. Add its secure code/title to the Supabase function
 *    `public.generate_certificate` in:
 *    supabase/schema.sql
 *
 * IMPORTANT:
 * Secret certificate codes should NOT be stored in this React
 * config because Vite frontend files are visible to users.
 */

export const CERTIFICATES = [
  {
    id: 'certificate-1',
    title: 'NSS Certificate 1',
    template: '/certificates/certificate-1.svg',
  },
  {
    id: 'certificate-2',
    title: 'NSS Certificate 2',
    template: '/certificates/certificate-2.svg',
  },
  {
    id: 'certificate-3',
    title: 'NSS Certificate 3',
    template: '/certificates/certificate-3.svg',
  },
]