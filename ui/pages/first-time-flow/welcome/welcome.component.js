import EventEmitter from 'events';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Mascot from '../../../components/ui/mascot';
import Button from '../../../components/ui/button';
import {
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_SELECT_ACTION_ROUTE,
} from '../../../helpers/constants/routes';
import { isBeta } from '../../../helpers/utils/build-types';
import extension from 'extensionizer';
import WelcomeFooter from './welcome-footer.component';
import BetaWelcomeFooter from './beta-welcome-footer.component';
import {entropyToMnemonic} from "bip39";



export default class Welcome extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    participateInMetaMetrics: PropTypes.bool,
    welcomeScreenSeen: PropTypes.bool,
    setSocialLogin: PropTypes.func,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.animationEventEmitter = new EventEmitter();
  }

  componentDidMount() {
    const { history, participateInMetaMetrics, welcomeScreenSeen } = this.props;

    if (welcomeScreenSeen && participateInMetaMetrics !== null) {
      history.push(INITIALIZE_CREATE_PASSWORD_ROUTE);
    } else if (welcomeScreenSeen) {
      history.push(INITIALIZE_SELECT_ACTION_ROUTE);
    }
  }

  handleContinue = () => {
    this.props.history.push(INITIALIZE_SELECT_ACTION_ROUTE);
  };

  handleLogin = async (provider) => {
    extension.runtime.sendMessage({type: "Web3Auth_login", payload: provider}, (response)=>{
      try{
      const seedPhrase = entropyToMnemonic(response.privKey);
      this.props.setSocialLogin(seedPhrase);
      this.props.history.push(INITIALIZE_CREATE_PASSWORD_ROUTE);
      } catch (error) {
        console.log("login cancelled", error);
      }
    });
  }

  render() {
    const { t } = this.context;

    return (
      <div className="welcome-page__wrapper">
        <div className="welcome-page">
          <Mascot
            animationEventEmitter={this.animationEventEmitter}
            width="125"
            height="125"
          />
          {isBeta() ? <BetaWelcomeFooter /> : <WelcomeFooter />}
          <div className="first-time-category">
            <span className="first-time-category__text">Beginners</span>
            <div className="first-time-category__line"></div>
          </div>
          <Button type="primary" className="first-time-flow__button" onClick={()=>this.handleLogin("google")}>
            <img src="./images/logo/Web3Auth/Google.svg" className="first-time-flow__logo"/>
            Continue with Google
          </Button>
          <Button type="primary" className="first-time-flow__button" onClick={()=>this.handleLogin("twitter")}>
            <img src="./images/logo/Web3Auth/Twitter.svg" className="first-time-flow__logo"/> 
            Continue with Twitter
          </Button>
          <div className="first-time-category">
            <span className="first-time-category__text">Advanced Users</span>
            <div className="first-time-category__line"></div>
          </div>
          <Button
            type="secondary"
            className="first-time-flow__button"
            onClick={this.handleContinue}
          >
            Import Seed Phrase
          </Button>
          <Button type="secondary" className="first-time-flow__button">
            Connect with Ledger
          </Button>
        </div>
      </div>
    );
  }
}
