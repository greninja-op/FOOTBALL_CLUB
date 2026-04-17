const FloatingNotice = ({ message, type = 'success' }) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`floating-notice ${type === 'error' ? 'floating-notice-error' : 'floating-notice-success'}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default FloatingNotice;
