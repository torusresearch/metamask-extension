import NewAccount from "./new-account.component";
import { connect } from "react-redux";
import { getOnboardingInitiator } from '../../../../selectors';
import {
  setCompletedOnboarding,
  setSeedPhraseBackedUp,
} from '../../../../store/actions';


const mapStateToProps = (state) => {
  return {
    onboardingInitiator: getOnboardingInitiator(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSeedPhraseBackedUp: (seedPhraseBackupState) =>
      dispatch(setSeedPhraseBackedUp(seedPhraseBackupState)),
    setCompletedOnboarding: () => dispatch(setCompletedOnboarding()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NewAccount);
