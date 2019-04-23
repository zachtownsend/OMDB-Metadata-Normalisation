import React from 'react';
import PropTypes from 'prop-types';
import { Field, FieldArray } from 'formik';
import FormattingField from './FormattingField';

const FieldArrayWrapper = ({ name, values, addButtonText, setFieldValue }) => (
  <FieldArray
    name={name}
    render={arrayHelpers =>
      values && values.length > 0 ? (
        <table className="table">
          <tbody>
            {values.map((value, index) => (
              <tr key={index}>
                <td>
                  <div className="input-group">
                    {setFieldValue ? (
                      <FormattingField
                        setFieldValue={setFieldValue}
                        className="form-control"
                        name={`${name}.${index}`}
                      />
                    ) : (
                      <Field
                        className="form-control"
                        name={`${name}.${index}`}
                      />
                    )}
                    <div className="input-group-append">
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => arrayHelpers.remove(value)} // remove a friend from the list
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        disabled={value === ''}
                        onClick={() => arrayHelpers.insert(value, '')} // insert an empty string at a position
                      >
                        +
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="table">
          <tfoot>
            <tr>
              <td>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => arrayHelpers.push('')}
                >
                  {addButtonText}
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      )
    }
  />
);

FieldArrayWrapper.propTypes = {
  name: PropTypes.string.isRequired,
  values: PropTypes.array.isRequired,
  addButtonText: PropTypes.string,
};

FieldArrayWrapper.defaultProps = {
  addButtonText: 'Add',
};

export default FieldArrayWrapper;
