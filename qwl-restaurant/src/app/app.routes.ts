import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

/**
 * Main application routes.
 * Uses lazy-loaded standalone components with loadComponent.
 */
export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },

  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu.component').then(m => m.MenuComponent)
  },

  
  {
    path: 'events',
    loadComponent: () => import('./features/events/event-list/event-list.component').then(m => m.EventListComponent)
  },
  
  {
    path: 'events/:id',
    loadComponent: () => import('./features/events/event-detail/event-detail.component').then(m => m.EventDetailComponent)
  },

  {
    path: 'blog',
    loadComponent: () => import('./features/blog/blog-list/blog-list.component').then(m => m.BlogListComponent)
  },
     
  {
    path: 'blog/:slug',
    loadComponent: () => import('./features/blog/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent)
  },
  
  {
    path: 'reservation',
    loadComponent: () => import('./features/reservation/reservation.component').then(m => m.ReservationComponent)
  },

  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },


   
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  
  {
    path: 'my-tickets',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-tickets/my-tickets.component').then(m => m.MyTicketsComponent)
  },
  
  {
    path: 'my-blogs',
    canActivate: [authGuard],
    loadComponent: () => import('./features/blog/my-blog/my-blog.component').then(m => m.MyBlogsComponent)
  },
  

  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      /**
       * Admin dashboard route.
       */
      
      {
        path: '',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
    
      
      {
        path: 'reservations',
        loadComponent: () => import('./admin/reservations/admin-reservations.component').then(m => m.AdminReservationsComponent)
      },
    
      {
        path: 'events',
        loadComponent: () => import('./admin/events/admin-events.component').then(m => m.AdminEventsComponent)
      },
      

      {
        path: 'menu',
        loadComponent: () => import('./admin/menu/admin-menu.component').then(m => m.AdminMenuComponent)
      },
      

      
      
      {
        path: 'blogs',
        loadComponent: () => import('./admin/blogs/admin-blogs.component').then(m => m.AdminBlogsComponent)
      },
      

     
      {
        path: 'messages',
        loadComponent: () => import('./admin/messages/admin-messages.component').then(m => m.AdminMessagesComponent)
      },
      

      {
        path: 'profile',
        loadComponent: () => import('./admin/profile/admin-profile.component').then(m => m.AdminProfileComponent)
      }
    ]
  },

  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
    
];
