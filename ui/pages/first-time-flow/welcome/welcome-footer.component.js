import React from 'react';
import { useI18nContext } from '../../../hooks/useI18nContext';

const WelcomeFooter = () => {
  const t = useI18nContext();

  return (
    <>
      <div className="welcome-page__header">{t('welcome')}</div>
      <div className="welcome-page__description">
        <p>Select how you would like to continue</p>
      </div>
    </>
  );
};

export default WelcomeFooter;
