import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import MetaFoxLogo from '../../../components/ui/metafox-logo';
import {
  INITIALIZE_CREATE_PASSWORD_ROUTE,
  INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE,
  INITIALIZE_SEED_PHRASE_INTRO_ROUTE,
} from '../../../helpers/constants/routes';
import NewAccount from './new-account';
import ImportWithSeedPhrase from './import-with-seed-phrase';

export default class CreatePassword extends PureComponent {
  static propTypes = {
    history: PropTypes.object,
    isInitialized: PropTypes.bool,
    onCreateNewAccount: PropTypes.func,
    onCreateNewAccountFromSeed: PropTypes.func,
    seedPhrase: PropTypes.string,
  };

  componentDidMount() {
    const { isInitialized, history } = this.props;

    if (isInitialized) {
      history.push(INITIALIZE_SEED_PHRASE_INTRO_ROUTE);
    }
  }

  handleNewAccount=(password)=>{
    if (this.props.seedPhrase) {
      return this.props.onCreateNewAccountFromSeed(password, this.props.seedPhrase);
    }
    else return this.props.onCreateNewAccount(password);
  }

  render() {
    const { onCreateNewAccountFromSeed } = this.props;

    return (
      <div className="first-time-flow__wrapper">
        <MetaFoxLogo />
        <Switch>
          <Route
            exact
            path={INITIALIZE_IMPORT_WITH_SEED_PHRASE_ROUTE}
            render={(routeProps) => (
              <ImportWithSeedPhrase
                {...routeProps}
                onSubmit={onCreateNewAccountFromSeed}
              />
            )}
          />
          <Route
            exact
            path={INITIALIZE_CREATE_PASSWORD_ROUTE}
            render={(routeProps) => (
              <NewAccount {...routeProps} socialLogin={!!this.props.seedPhrase} onSubmit={this.handleNewAccount} />
            )}
          />
        </Switch>
      </div>
    );
  }
}
