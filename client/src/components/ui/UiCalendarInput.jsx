const UiCalendarInput = ({ type = 'date', className = '', ...props }) => (
  <input
    type={type}
    className={`ui-field ui-calendar-input ${className}`.trim()}
    {...props}
  />
);

export default UiCalendarInput;
