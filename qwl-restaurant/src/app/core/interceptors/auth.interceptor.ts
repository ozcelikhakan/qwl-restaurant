import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  /**
   * Skip authentication handling for login, register and refresh token endpoints.
   */
  const isAuthEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh');

  if (isAuthEndpoint) {
    return next(req);
  }

  /**
   * Get the current access token.
   */
  const token = authService.getAccessToken();

  /**
   * Attach the access token to the request if it exists.
   */
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      /**
       * If the access token is expired or invalid, try to refresh it.
       */
      if (error.status === 401 && authService.getRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap(res => {
            /**
             * Retry the original request with the new access token.
             */
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            /**
             * If token refresh fails, log the user out.
             */
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};