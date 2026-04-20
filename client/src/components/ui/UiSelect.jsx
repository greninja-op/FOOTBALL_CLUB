import React from 'react';

const UiSelect = ({ className = '', children, ...props }) => (
  <select className={`ui-select ${className}`.trim()} {...props}>
    {children}
  </select>
);

export default UiSelect;
