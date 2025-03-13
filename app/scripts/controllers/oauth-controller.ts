import {
  BaseController,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
  RestrictedMessenger,
} from '@metamask/base-controller';

// Unique name for the controller
const controllerName = 'OAuthController';

/**
 * The state of the {@link OAuthController}
 */
export type OAuthControllerState = {};

/**
 * Function to get default state of the {@link OAuthController}.
 */
export const getDefaultOAuthControllerState = (): OAuthControllerState => ({});

export type OAuthControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  OAuthControllerState
>;

export type OAuthControllerActions = OAuthControllerGetStateAction;

export type OAuthControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  OAuthControllerState
>;

export type OAuthControllerControllerEvents = OAuthControllerStateChangeEvent;

/**
 * Actions that this controller is allowed to call.
 */
export type AllowedActions = never;

/**
 * Events that this controller is allowed to subscribe.
 */
export type AllowedEvents = never;

export type OAuthControllerMessenger = RestrictedMessenger<
  typeof controllerName,
  OAuthControllerActions | AllowedActions,
  OAuthControllerControllerEvents | AllowedEvents,
  AllowedActions['type'],
  AllowedEvents['type']
>;

export type OAuthProvider = 'google' | 'apple';

const defaultProviderScopes = {
  google: ['openid', 'email', 'profile'],
  apple: ['name', 'email'],
};

export type OAuthProviderConfig = {
  clientId: string;
  redirectUri?: string;
  authUri: string;
  scopes?: string[];
};

export type LoginProviderConfig = {
  google: OAuthProviderConfig;
  apple: OAuthProviderConfig;
};

export type OAuthControllerOptions = {
  state: Partial<OAuthControllerState>;
  messenger: OAuthControllerMessenger;
  loginProviderConfig: LoginProviderConfig;
};

/**
 * {@link OAuthController}'s metadata.
 *
 * This allows us to choose if fields of the state should be persisted or not
 * using the `persist` flag; and if they can be sent to Sentry or not, using
 * the `anonymous` flag.
 */
const controllerMetadata = {};

/**
 * Controller responsible for maintaining
 * state related to OAuth
 */
export default class OAuthController extends BaseController<
  typeof controllerName,
  OAuthControllerState,
  OAuthControllerMessenger
> {
  #loginProviderConfig: LoginProviderConfig;

  constructor({
    state,
    messenger,
    loginProviderConfig,
  }: OAuthControllerOptions) {
    super({
      messenger,
      metadata: controllerMetadata,
      name: controllerName,
      state: {
        ...getDefaultOAuthControllerState(),
        ...state,
      },
    });

    Object.entries(loginProviderConfig).forEach(([provider, config]) => {
      if (!config.scopes) {
        config.scopes = defaultProviderScopes[provider as OAuthProvider];
      }
      if (!config.redirectUri) {
        config.redirectUri = chrome.identity.getRedirectURL();
      }
    });
    this.#loginProviderConfig = loginProviderConfig;
  }

  async startOAuthLogin(provider: OAuthProvider): Promise<string> {
    const authUrl = this.constructAuthUrl(provider);
    const redirectUrl = await chrome.identity.launchWebAuthFlow({
      interactive: true,
      url: authUrl,
    });
    console.log('[identity auth redirectUrl]', redirectUrl);
    if (!redirectUrl) {
      console.error('[identity auth redirectUrl is null]');
      throw new Error('No redirect URL found');
    }
    if (provider === 'google') {
      return this.handleGoogleAuthResponse(redirectUrl);
    } else {
      return this.handleAppleAuthResponse(redirectUrl);
    }
  }

  private async handleGoogleAuthResponse(redirectUrl: string): Promise<string> {
    // TODO: handle google auth response and get id token
    // const accessToken = extractAccessToken(redirectUrl)
    // console.log('[identity auth accessToken]', accessToken)
    // const response = await fetch(`${GG_VALIDATION_BASE_URL}?access_token=${accessToken}`)
    // const data = await response.json()
    // console.log('[identity auth data]', data)
    return '';
  }

  private async handleAppleAuthResponse(redirectUrl: string): Promise<string> {
    // TODO: handle apple auth response and get id token
    return '';
  }

  private constructAuthUrl(provider: OAuthProvider): string {
    const oAuthProviderConfig = this.#loginProviderConfig[provider];
    let authURL = oAuthProviderConfig.authUri;
    authURL += `?client_id=${oAuthProviderConfig.clientId}`;
    authURL += `&response_type=${encodeURIComponent(
      provider === 'google' ? 'token' : 'code',
    )}`;
    authURL += `&redirect_uri=${encodeURIComponent(
      oAuthProviderConfig.redirectUri || '',
    )}`;
    authURL += `&scope=${encodeURIComponent(
      oAuthProviderConfig.scopes?.join(' ') || '',
    )}`;

    if (provider === 'apple') {
      authURL += `&response_mode=form_post`;
      const state = Math.random().toString(36).substring(2, 15);
      authURL += `&state=${state}`;
    }

    return authURL;
  }
}
