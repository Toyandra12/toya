import { createApp, h } from 'vue'
import { createInertiaApp, Link } from '@inertiajs/vue3'
import { createPinia } from 'pinia'

import AppLayout from './Layouts/AppLayout.vue'

const appName = import.meta.env.VITE_APP_NAME || 'CINENOVA'

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),

    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.vue', { eager: false })
        const page = (await pages[`./Pages/${name}.vue`]()).default

        // Auto-apply AppLayout to every storefront page that doesn't already
        // declare a layout. Admin and Auth pages opt out by setting
        // `defineOptions({ layout: null })` or providing their own.
        if (page.layout === undefined && !name.startsWith('Admin/')) {
            page.layout = AppLayout
        }
        return page
    },

    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(createPinia())
            .component('Link', Link)

        app.mount(el)
    },

    progress: {
        color: '#ff1744',
        showSpinner: false,
    },
})
