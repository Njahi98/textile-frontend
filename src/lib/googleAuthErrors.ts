export const getGoogleAuthErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  // Handle specific Google error types
  if (typeof error === 'string') {
    switch (error) {
      case 'popup_blocked_by_browser':
        return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
      case 'popup_closed_by_user':
        return 'Sign-in was cancelled.';
      case 'access_denied':
        return 'Access was denied. Please try again.';
      case 'immediate_failed':
        return 'Automatic sign-in failed. Please click the button to sign in manually.';
      default:
        return 'Google Sign-In failed. Please try again.';
    }
  }

  // Handle error objects
  if (error.error) {
    switch (error.error) {
      case 'popup_blocked_by_browser':
        return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
      case 'access_denied':
        return 'You denied access to your Google account. Please try again and allow access.';
      case 'invalid_client':
        return 'Google Sign-In is not properly configured. Please contact support.';
      default:
        return error.error_description || 'Google Sign-In failed. Please try again.';
    }
  }

  // Handle notification reasons from Google Identity Services
  if (error.getNotDisplayedReason) {
    const reason = error.getNotDisplayedReason();
    switch (reason) {
      case 'browser_not_supported':
        return 'Your browser does not support Google Sign-In. Please try a different browser.';
      case 'invalid_client':
        return 'Google Sign-In is not properly configured. Please contact support.';
      case 'missing_client_id':
        return 'Google Sign-In is not configured. Please contact support.';
      case 'opt_out_or_no_session':
        return 'You have opted out of Google Sign-In or are not signed into Google. Please enable Google Sign-In in your account settings or sign into Google first.';
      case 'secure_http_required':
        return 'Google Sign-In requires a secure connection. Please use HTTPS.';
      case 'suppressed_by_user':
        return 'Google Sign-In was dismissed.';
      case 'unregistered_origin':
        return 'This website is not authorized for Google Sign-In. Please contact support.';
      case 'unknown_reason':
        return 'Google Sign-In failed for an unknown reason. Please try again.';
      default:
        return 'Google Sign-In could not be displayed. Please try again.';
    }
  }

  // Fallback for other error types
  if (error.message) {
    return error.message;
  }

  return 'Google Sign-In failed. Please try again or use email login.';
};