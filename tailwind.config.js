/** @type {import('tailwindcss').Config} */
//
// CINENOVA design tokens for GAMING NP storefront.
// All values mirror docs/ui-guidelines.md — do not introduce new raw values
// here without updating the guidelines first.
//
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.vue',
        './resources/js/**/*.js',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // ── Typography ──────────────────────────────────────────────────
            fontFamily: {
                sans: ['Poppins', 'system-ui', 'sans-serif'],
                primary: ['Poppins', 'sans-serif'],
            },
            fontSize: {
                // Token-driven sizes (override Tailwind defaults for these keys
                // intentionally so storefront copy uses the canonical scale).
                xs:   ['13.6px',  { lineHeight: '1.6' }],
                sm:   ['14.4px',  { lineHeight: '1.6' }],
                md:   ['15.2px',  { lineHeight: '1.6' }],
                lg:   ['15.68px', { lineHeight: '1.6' }],
                xl:   ['16px',    { lineHeight: '25.6px' }],
                '2xl':['17.6px',  { lineHeight: '1.5' }],
                '3xl':['20px',    { lineHeight: '1.4' }],
                '4xl':['20.8px',  { lineHeight: '1.4' }],
            },

            // ── Color tokens (semantic) ─────────────────────────────────────
            colors: {
                fg: {
                    primary:   '#ffffff',
                    secondary: '#f5f5f5',
                    tertiary:  '#ff1744',
                    inverse:   '#b0b0b0',
                },
                surface: {
                    base:   '#000000',
                    muted:  '#1e293b',
                    raised: '#2a2a2a',
                    strong: '#0a0a0a',
                },
                brand: {
                    DEFAULT: '#ff1744',
                    accent:  '#dc143c',
                },
            },

            // ── Spacing tokens (additive — kept off the default scale to
            //    avoid breaking layout utilities like p-4, gap-8, etc.) ────
            spacing: {
                t1: '1px',
                t2: '4px',
                t3: '5px',
                t4: '6px',
                t5: '8px',
                t6: '10px',
                t7: '12px',
                t8: '12.8px',
            },

            // ── Radius tokens ───────────────────────────────────────────────
            borderRadius: {
                xs: '10px',
                sm: '12px',
                md: '16px',
                lg: '30px',
                xl: '50px',
            },

            // ── Shadow tokens ───────────────────────────────────────────────
            boxShadow: {
                't1': 'rgba(220, 20, 60, 0.25) 0px 12px 30px 0px',
                't2': 'rgba(220, 20, 60, 0.4) 0px 0px 20px 0px',
                't3': 'rgba(243, 156, 18, 0.3) 0px 4px 10px 0px',
                't4': 'rgba(0, 0, 0, 0.15) 0px 4px 20px 0px',
                'focus': '0 0 0 2px #000000, 0 0 0 4px #ff1744',
            },

            // ── Motion ──────────────────────────────────────────────────────
            transitionDuration: {
                fast: '80ms',
                base: '150ms',
            },
            transitionTimingFunction: {
                base: 'cubic-bezier(0.16, 1, 0.3, 1)',
            },

            // ── Container ───────────────────────────────────────────────────
            maxWidth: {
                'site': '1200px',
            },
        },
    },
    plugins: [],
}
