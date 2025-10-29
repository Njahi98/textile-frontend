import i18n from 'i18next';

export const getGoogleAuthErrorMessage = (error: any): string => {
  if (!error) return i18n.t('auth.googleAuth.errors.defaultError');

  // Handle specific Google error types
  if (typeof error === 'string') {
    switch (error) {
      case 'popup_blocked_by_browser':
        return i18n.t('auth.googleAuth.errors.popupBlocked');
      case 'popup_closed_by_user':
        return i18n.t('auth.googleAuth.errors.popupClosed');
      case 'access_denied':
        return i18n.t('auth.googleAuth.errors.accessDenied');
      case 'immediate_failed':
        return i18n.t('auth.googleAuth.errors.immediateFailed');
      default:
        return i18n.t('auth.googleAuth.errors.defaultError');
    }
  }

  // Handle error objects
  if (error.error) {
    switch (error.error) {
      case 'popup_blocked_by_browser':
        return i18n.t('auth.googleAuth.errors.popupBlocked');
      case 'access_denied':
        return i18n.t('auth.googleAuth.errors.accessDenied');
      case 'invalid_client':
        return i18n.t('auth.googleAuth.errors.invalidClient');
      default:
        return error.error_description ?? i18n.t('auth.googleAuth.errors.defaultError');
    }
  }

  // Handle notification reasons from Google Identity Services
  // Note: getNotDisplayedReason() is deprecated in FedCM migration
  // These methods are no longer available in the new API
  if (error.getNotDisplayedReason) {
    // Fallback for older implementations - this will likely not be called
    const reason = error.getNotDisplayedReason();
    switch (reason) {
      case 'browser_not_supported':
        return i18n.t('auth.googleAuth.errors.browserNotSupported');
      case 'invalid_client':
        return i18n.t('auth.googleAuth.errors.invalidClient');
      case 'missing_client_id':
        return i18n.t('auth.googleAuth.errors.missingClientId');
      case 'opt_out_or_no_session':
        return i18n.t('auth.googleAuth.errors.optOutOrNoSession');
      case 'secure_http_required':
        return i18n.t('auth.googleAuth.errors.secureHttpRequired');
      case 'suppressed_by_user':
        return i18n.t('auth.googleAuth.errors.suppressedByUser');
      case 'unregistered_origin':
        return i18n.t('auth.googleAuth.errors.unregisteredOrigin');
      case 'unknown_reason':
        return i18n.t('auth.googleAuth.errors.unknownReason');
      default:
        return i18n.t('auth.googleAuth.errors.notDisplayed');
    }
  }

  // Fallback for other error types
  if (error.message) {
    return error.message;
  }

  return i18n.t('auth.googleAuth.errors.defaultError');
};