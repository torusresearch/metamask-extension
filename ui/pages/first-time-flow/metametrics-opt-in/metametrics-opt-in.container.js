import { connect } from 'react-redux';
import { setParticipateInMetaMetrics } from '../../../store/actions';
import { getFirstTimeFlowTypeRoute } from '../../../selectors';
import MetaMetricsOptIn from './metametrics-opt-in.component';

const firstTimeFlowTypeNameMap = {
  create: 'Selected Create New Wallet',
  import: 'Selected Import Wallet',
};

const mapStateToProps = (state, {nextRoute}) => {
  const { firstTimeFlowType, participateInMetaMetrics } = state.metamask;

  return {
    nextRoute: nextRoute || getFirstTimeFlowTypeRoute(state),
    firstTimeSelectionMetaMetricsName:
      firstTimeFlowTypeNameMap[firstTimeFlowType],
    participateInMetaMetrics,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setParticipateInMetaMetrics: (val) =>
      dispatch(setParticipateInMetaMetrics(val)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MetaMetricsOptIn);
