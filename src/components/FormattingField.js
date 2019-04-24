import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'formik';

function FormattingField(props) {
  const fieldProps = Object.assign({}, props);
  const { setFieldValue } = props;
  delete fieldProps.setFieldValue;

  return (
    <Field
      {...fieldProps}
      onChange={e => {
        const { name, value } = e.target;
        setFieldValue(name, value.toTitleCase());
      }}
    />
  );
}

FormattingField.propTypes = {
  setFieldValue: PropTypes.func.isRequired,
};

export default FormattingField;
