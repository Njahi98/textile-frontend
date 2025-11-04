import i18n from 'i18next';

interface GoogleErrorObject {
  error?: string;
  error_description?: string;
  message?: string;
  getNotDisplayedReason?: () => string;
}

type GoogleAuthError = string | GoogleErrorObject | Error;

function isGoogleErrorObject(error: unknown): error is GoogleErrorObject {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('error' in error || 'error_description' in error || 'message' in error || 'getNotDisplayedReason' in error)
  );
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export const getGoogleAuthErrorMessage = (error: GoogleAuthError): string => {
  if (!error) return i18n.t('auth.googleAuth.errors.defaultError');

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

  if (isGoogleErrorObject(error) && error.error) {
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


  if (isGoogleErrorObject(error) && error.getNotDisplayedReason) {
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

  if (isError(error) && error.message) {
    return error.message;
  }

  if (isGoogleErrorObject(error) && error.message) {
    return error.message;
  }

  return i18n.t('auth.googleAuth.errors.defaultError');
};