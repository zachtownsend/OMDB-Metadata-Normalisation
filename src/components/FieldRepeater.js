import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

export default class FieldRepeater extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    data: PropTypes.array,
    inputType: PropTypes.oneOf(['text', 'number']),
    pluralTitle: PropTypes.string,
    singluarTitle: PropTypes.string,
    onAddItem: PropTypes.func,
    onRemoveItem: PropTypes.func,
    schema: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.oneOf(['text', 'number']).isRequired,
        name: PropTypes.string.isRequired,
      })
    ),
  };

  static defaultProps = {
    inputType: 'text',
    data: [],
    pluralTitle: 'Values',
    singluarTitle: 'Value',
    onAddItem: null,
    onRemoveItem: null,
    schema: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: this.initialiseValue(),
      error: '',
    };
  }

  handleChange = e => {
    const { error } = this.state;
    const { schema } = this.props;
    const { name, value } = e.target;
    let newValue = value;

    if (schema) {
      const currentField = schema.find(element => element.name === name);
      newValue = this.state.value;
      newValue[currentField.name] = value;
    }

    this.setState(
      {
        value: newValue,
      },
      () => {
        if (error && !this.isDataDuplicate()) {
          this.setState({
            error: '',
          });
        }
      }
    );
  };

  handleAddItem = e => {
    e.preventDefault();
    const { onAddItem } = this.props;
    const { value } = this.state;

    if (this.isThereEmptyValues()) {
      this.setState({
        error: 'Data incomplete',
      });
    } else if (this.isDataDuplicate()) {
      this.setState({
        error: 'This has already been added',
      });
    } else if (typeof onAddItem === 'function') {
      onAddItem(value);
      this.setState({
        value: this.initialiseValue(),
      });
    }
  };

  handleRemoveItem = (value, e) => {
    e.preventDefault();
    const { onRemoveItem } = this.props;

    if (typeof onRemoveItem === 'function') {
      onRemoveItem(value);
    }
  };

  initialiseValue = () => {
    const { schema } = this.props;
    if (schema) {
      const initialValue = {};
      schema.forEach(schemaData => {
        initialValue[schemaData.name] = '';
      });

      return initialValue;
    }

    return '';
  };

  isDataDuplicate = () => {
    const { value } = this.state;
    const { data } = this.props;

    return data.findIndex(item => _.isEqual(item, value)) >= 0;
  };

  isThereEmptyValues = () => {
    const { schema } = this.props;
    const { value } = this.state;

    if (schema) {
      return Object.values(value).findIndex(value => value.trim() === '') >= 0;
    }

    return value.trim() === '';
  };

  render() {
    const { handleChange } = this;
    const { value, error } = this.state;
    const { data, singluarTitle, inputType, schema } = this.props;

    const dataRows = data.map(row => {
      if (schema) {
        const keys = Object.keys(row);
        const values = Object.values(row);
        return (
          <tr key={values.join('-')}>
            {values.map((columnValue, index) => (
              <td key={`${keys[index]}-${columnValue}`}>{columnValue}</td>
            ))}
            <td>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={e => this.handleRemoveItem(row, e)}
              >
                X
              </button>
            </td>
          </tr>
        );
      }

      return (
        <tr key={row}>
          <td>{row}</td>
          <td>
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={e => this.handleRemoveItem(row, e)}
            >
              X
            </button>
          </td>
        </tr>
      );
    });

    const disable = this.isThereEmptyValues();

    const controls = schema ? (
      <tr className="field-controls">
        {schema.map((input, index) => (
          <td key={input.name}>
            <input
              type={input.type}
              value={value[input.name]}
              name={input.name}
              onChange={handleChange}
            />
          </td>
        ))}
        <td>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={this.handleAddItem}
            disabled={disable}
          >
            Add {singluarTitle}
          </button>
        </td>
      </tr>
    ) : (
      <tr className="field-controls">
        <td>
          <input type={inputType} value={value} onChange={handleChange} />
        </td>
        <td>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={this.handleAddItem}
            disabled={disable}
          >
            Add {singluarTitle}
          </button>
        </td>
      </tr>
    );

    const errorDisplay = error ? (
      <tr data-testid="error-message">
        <td rowSpan={schema ? Object.keys(schema).length + 1 : 2}>{error}</td>
      </tr>
    ) : null;

    return (
      <div className="field-repeater">
        <table className="table field-data">
          {schema && (
            <thead data-testid="field-head">
              <tr>
                {schema.map(heading => (
                  <th key={heading.name}>{heading.name}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody data-testid="field-data">{dataRows}</tbody>
          <tfoot data-testid="field-controls">
            {controls}
            {errorDisplay}
          </tfoot>
        </table>
      </div>
    );
  }
}
