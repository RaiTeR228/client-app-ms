/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/1index`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/JsonView`; params?: Router.UnknownInputParams; } | { pathname: `/main`; params?: Router.UnknownInputParams; } | { pathname: `/ScanQR`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/info/About`; params?: Router.UnknownInputParams; } | { pathname: `/info/Contacts`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/1index`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/JsonView`; params?: Router.UnknownOutputParams; } | { pathname: `/main`; params?: Router.UnknownOutputParams; } | { pathname: `/ScanQR`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/info/About`; params?: Router.UnknownOutputParams; } | { pathname: `/info/Contacts`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/1index${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/JsonView${`?${string}` | `#${string}` | ''}` | `/main${`?${string}` | `#${string}` | ''}` | `/ScanQR${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/info/About${`?${string}` | `#${string}` | ''}` | `/info/Contacts${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/1index`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/JsonView`; params?: Router.UnknownInputParams; } | { pathname: `/main`; params?: Router.UnknownInputParams; } | { pathname: `/ScanQR`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/info/About`; params?: Router.UnknownInputParams; } | { pathname: `/info/Contacts`; params?: Router.UnknownInputParams; };
    }
  }
}
