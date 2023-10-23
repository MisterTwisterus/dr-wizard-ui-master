import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from "rxjs";
import {TokenService} from "../services/token/token.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(public tokenService: TokenService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.tokenService.token}`
      }
    });

    return next.handle(request);
  }
}
