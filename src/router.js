
import Links from './pages/Links.vue';
import AddLink from './pages/AddLink.vue';
import EditLink from './pages/EditLink.vue';

const routes = {
    routes: [
        { path: '/', component: Links },
        { path: '/links', component: Links },
        { path: '/addLink', component: AddLink },
        {
            path:       '/editLink',
            component:  EditLink,
            props:      (route) => ({...route.params }),
            meta:       { 
                            softLoad: true,
                        }, 
        },
        {
            path:       '/editLink/:id',
            component:  EditLink,
            props:      (route) => ({...route.params }),
            meta:       { 
                            softLoad: true,
                        }, 
        },
    ]
}

export default routes;