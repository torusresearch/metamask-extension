import { EventEmitter } from 'events';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getCaretCoordinates from 'textarea-caret';
import Button from '../../components/ui/button';
import TextField from '../../components/ui/text-field';
import Mascot from '../../components/ui/mascot';
import { SUPPORT_LINK } from '../../helpers/constants/common';
import { DEFAULT_ROUTE } from '../../helpers/constants/routes';
import extension from "extensionizer";
import { entropyToMnemonic } from "bip39";

export default class UnlockPage extends Component {
  static contextTypes = {
    metricsEvent: PropTypes.func,
    t: PropTypes.func,
  };

  static propTypes = {
    /**
     * History router for redirect after action
     */
    history: PropTypes.object.isRequired,
    /**
     * If isUnlocked is true will redirect to most recent route in history
     */
    isUnlocked: PropTypes.bool,
    /**
     * onClick handler for "Forgot password?" link
     */
    onRestore: PropTypes.func,
    /**
     * onSumbit handler when form is submitted
     */
    onSubmit: PropTypes.func,
    /**
     * Force update metamask data state
     */
    forceUpdateMetamaskState: PropTypes.func,
    /**
     * Event handler to show metametrics modal
     */
    showOptInModal: PropTypes.func,
    loginWithSeedPhrase: PropTypes.func,
  };

  state = {
    password: '',
    error: null,
    lastLoginEmail: '',
    lastLoginProvider: '',
  };

  submitting = false;

  animationEventEmitter = new EventEmitter();

  UNSAFE_componentWillMount() {
    const { isUnlocked, history } = this.props;
    if (isUnlocked) {
      history.push(DEFAULT_ROUTE);
    }
    extension.storage.local.get((res)=>{
      if(res.openlogin_store)
        this.setState({lastLoginEmail : res.openlogin_store.email ?? "", lastLoginProvider: res.openlogin_store.typeOfLogin?? ""});
    })
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { password } = this.state;
    const { onSubmit, forceUpdateMetamaskState, showOptInModal } = this.props;

    if (password === '' || this.submitting) {
      return;
    }

    this.setState({ error: null });
    this.submitting = true;

    try {
      await onSubmit(password);
      const newState = await forceUpdateMetamaskState();
      this.context.metricsEvent({
        eventOpts: {
          category: 'Navigation',
          action: 'Unlock',
          name: 'Success',
        },
        isNewVisit: true,
      });

      if (
        newState.participateInMetaMetrics === null ||
        newState.participateInMetaMetrics === undefined
      ) {
        showOptInModal();
      }
    } catch ({ message }) {
      if (message === 'Incorrect password') {
        const newState = await forceUpdateMetamaskState();
        this.context.metricsEvent({
          eventOpts: {
            category: 'Navigation',
            action: 'Unlock',
            name: 'Incorrect Password',
          },
          customVariables: {
            numberOfTokens: newState.tokens.length,
            numberOfAccounts: Object.keys(newState.accounts).length,
          },
        });
      }

      this.setState({ error: message });
      this.submitting = false;
    }
  };

  handleInputChange({ target }) {
    this.setState({ password: target.value, error: null });

    // tell mascot to look at page action
    if (target.getBoundingClientRect) {
      const element = target;
      const boundingRect = element.getBoundingClientRect();
      const coordinates = getCaretCoordinates(element, element.selectionEnd);
      this.animationEventEmitter.emit('point', {
        x: boundingRect.left + coordinates.left - element.scrollLeft,
        y: boundingRect.top + coordinates.top - element.scrollTop,
      });
    }
  }

  unlockWithSocialLogin = (e) => {
    const {history} = this.props;
    e.preventDefault();
    e.stopPropagation();
    extension.runtime.sendMessage({type: "Web3Auth_login", payload: this.state.lastLoginProvider || undefined}, (response)=>{
      try {
      const seedPhrase =  entropyToMnemonic(response.privKey );
      this.props.loginWithSeedPhrase(seedPhrase).then(()=>history.push(DEFAULT_ROUTE));
      } catch (error) {
        console.log("login cancelled", error);
      }
    });
  }

  renderSubmitButton() {

    return (
      <Button
        type="submit"
        disabled={!this.state.password}
        variant="secondary"
        size="large"
        onClick={this.handleSubmit}
      >
        Unlock with Password
      </Button>
    );
  }

  render() {
    const { password, error, lastLoginEmail, lastLoginProvider } = this.state;
    const { t } = this.context;
    const { onRestore } = this.props;

    return (
      <div className="unlock-page__container">
        <div className="unlock-page">
          <div className="unlock-page__mascot-container">
            <Mascot
              animationEventEmitter={this.animationEventEmitter}
              width="120"
              height="120"
            />
          </div>
          <h1 className="unlock-page__title">{t('welcomeBack')}</h1>
          <div>{t('unlockMessage')}</div>
          <form className="unlock-page__form" onSubmit={this.handleSubmit}>
          <Button type="primary" className="unlock-page__button" onClick={this.unlockWithSocialLogin}>
            <img src={lastLoginProvider==="google"?"./images/logo/Web3Auth/Google.svg":"./images/logo/Web3Auth/Twitter.svg"} className="unlock-page__buttonLogo"/>
            { lastLoginEmail ? (<span style={{textAlign: "left"}}>Continue with existing <span style={{textTransform:'capitalize'}}>{lastLoginProvider}</span> <span style={{fontStyle: 'italic', fontWeight: 'bold'}}>{lastLoginEmail}</span></span>) : "Continue with Google" }
          </Button>
          <div className="unlock-page__divider">Or</div>
          <TextField
              id="password"
              label={t('password')}
              type="password"
              value={password}
              onChange={(event) => this.handleInputChange(event)}
              error={error}
              autoFocus
              autoComplete="current-password"
              theme="material"
              fullWidth
            />
          </form>
          {this.renderSubmitButton()}
          <div className="unlock-page__links">
            or <span
              className="unlock-page__link"
              onClick={() => onRestore()}
            >
              import using Secret Recovery Phrase
            </span>
          </div>
          <div className="unlock-page__support">
            Need help?
              <a
                href={SUPPORT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                key="need-help-link"
              >
                &nbsp;Contact Support
              </a>
          </div>
        </div>
      </div>
    );
  }
}
